import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import type { Location, LocationRecord, SnapshotRecord } from "./types";

const DB_PATH = import.meta.dirname + "/../data/maimai.db";

let db: Database;

export function initDB(): Database {
  mkdirSync(import.meta.dirname + "/../data", { recursive: true });

  db = new Database(DB_PATH, { create: true });
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA busy_timeout = 5000");

  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      province TEXT NOT NULL,
      arcade_name TEXT NOT NULL,
      address TEXT NOT NULL,
      place_id TEXT DEFAULT '',
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fetched_at TEXT NOT NULL,
      total_count INTEGER NOT NULL,
      gansu_count INTEGER NOT NULL,
      added_count INTEGER DEFAULT 0,
      removed_count INTEGER DEFAULT 0,
      details TEXT NOT NULL DEFAULT '{}'
    )
  `);

  return db;
}

export function getDB(): Database {
  if (!db) return initDB();
  return db;
}

/** 检查是否尚未有任何数据（首次初始化） */
export function isEmpty(): boolean {
  const db = getDB();
  const row = db.query("SELECT COUNT(*) as count FROM locations").get() as { count: number };
  return row.count === 0;
}

/** 用 SEGA API 数据更新本地库，返回本次变更数 */
export function updateLocations(
  data: Location[],
): { added: number; removed: number } {
  const db = getDB();
  const now = new Date().toISOString();

  // 当前活跃 ID
  const activeRows = db
    .query("SELECT id FROM locations WHERE is_active = 1")
    .all() as { id: string }[];

  const activeIds = new Set(activeRows.map((r) => r.id));
  const incomingIds = new Set(data.map((d) => d.id));

  // 消失的机台（仅在非首次运行时计数）
  const isInit = activeIds.size === 0;
  const toDeactivate = isInit ? [] : [...activeIds].filter((id) => !incomingIds.has(id));
  const deactivateStmt = db.prepare(
    "UPDATE locations SET is_active = 0, last_seen_at = ? WHERE id = ?",
  );
  for (const id of toDeactivate) deactivateStmt.run(now, id);

  // 新增或更新
  let added = 0;
  const upsertStmt = db.prepare(`
    INSERT INTO locations (id, province, arcade_name, address, place_id, first_seen_at, last_seen_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      province       = excluded.province,
      arcade_name    = excluded.arcade_name,
      address        = excluded.address,
      place_id       = excluded.place_id,
      last_seen_at   = excluded.last_seen_at,
      is_active      = 1
  `);

  for (const loc of data) {
    const existing = db
      .query("SELECT first_seen_at FROM locations WHERE id = ?")
      .get(loc.id) as { first_seen_at: string } | null;

    const firstSeen = existing ? existing.first_seen_at : now;
    // 首次初始化时不计数为"新增"
    if (!existing && !isInit) added++;

    upsertStmt.run(
      loc.id,
      loc.province,
      loc.arcadeName,
      loc.address,
      loc.placeId,
      firstSeen,
      now,
    );
  }

  return { added, removed: toDeactivate.length };
}

/** 记录一次快照 */
export function recordSnapshot(
  allData: Location[],
  addedCount: number,
  removedCount: number,
): void {
  const db = getDB();
  const gansuData = allData.filter((d) => d.province === "甘肃");
  const details = JSON.stringify(gansuData);

  db.run(
    `INSERT INTO snapshots (fetched_at, total_count, gansu_count, added_count, removed_count, details)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [new Date().toISOString(), allData.length, gansuData.length, addedCount, removedCount, details],
  );
}

export function getActiveLocations(): LocationRecord[] {
  const db = getDB();
  return db
    .query("SELECT * FROM locations WHERE is_active = 1 ORDER BY province, arcade_name")
    .all() as LocationRecord[];
}

export function getActiveLocationsByProvince(province: string): LocationRecord[] {
  const db = getDB();
  return db
    .query("SELECT * FROM locations WHERE is_active = 1 AND province = ? ORDER BY arcade_name")
    .all(province) as LocationRecord[];
}

/** 今天新增的机台（first_seen_at 在今天） */
export function getTodayNewLocations(): LocationRecord[] {
  const db = getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return db
    .query(
      "SELECT * FROM locations WHERE is_active = 1 AND first_seen_at >= ? ORDER BY first_seen_at DESC",
    )
    .all(today.toISOString()) as LocationRecord[];
}

/** 汇总今天所有快照的变更数（added + removed 分别求和） */
export function getTodayChanges(): { added: number; removed: number } {
  const db = getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = db
    .query(
      `SELECT COALESCE(SUM(added_count), 0) as added, COALESCE(SUM(removed_count), 0) as removed
       FROM snapshots WHERE fetched_at >= ?`,
    )
    .all(today.toISOString()) as { added: number; removed: number }[];
  return rows[0] ?? { added: 0, removed: 0 };
}

export function getLatestSnapshot(): SnapshotRecord | null {
  const db = getDB();
  return db
    .query("SELECT * FROM snapshots ORDER BY fetched_at DESC LIMIT 1")
    .get() as SnapshotRecord | null;
}

export function getTotalLocationCount(): number {
  const db = getDB();
  const row = db.query("SELECT COUNT(*) as count FROM locations WHERE is_active = 1").get() as any;
  return row?.count ?? 0;
}

export function getSnapshots(limit = 30): SnapshotRecord[] {
  const db = getDB();
  return db
    .query("SELECT * FROM snapshots ORDER BY fetched_at DESC LIMIT ?")
    .all(limit) as SnapshotRecord[];
}
