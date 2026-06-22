import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import type { Location, LocationRecord, SnapshotRecord, ProvinceInfo } from "./types";

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

  const activeRows = db
    .query("SELECT id FROM locations WHERE is_active = 1")
    .all() as { id: string }[];

  const activeIds = new Set(activeRows.map((r) => r.id));
  const incomingIds = new Set(data.map((d) => d.id));

  const isInit = activeIds.size === 0;
  const toDeactivate = isInit ? [] : [...activeIds].filter((id) => !incomingIds.has(id));
  const deactivateStmt = db.prepare(
    "UPDATE locations SET is_active = 0, last_seen_at = ? WHERE id = ?",
  );
  for (const id of toDeactivate) deactivateStmt.run(now, id);

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

// ── Province-aware queries ──

/** 所有有活跃机台的省份及其数量，按数量降序 */
export function getAllProvinces(): ProvinceInfo[] {
  const db = getDB();
  return db
    .query(
      "SELECT province, COUNT(*) as count FROM locations WHERE is_active = 1 GROUP BY province ORDER BY count DESC",
    )
    .all() as ProvinceInfo[];
}

/** 按省份获取活跃机台，"全国" 返回全部 */
export function getActiveLocationsByProvince(province: string): LocationRecord[] {
  const db = getDB();
  if (province === "全国") {
    return db
      .query("SELECT * FROM locations WHERE is_active = 1 ORDER BY province, arcade_name")
      .all() as LocationRecord[];
  }
  return db
    .query("SELECT * FROM locations WHERE is_active = 1 AND province = ? ORDER BY arcade_name")
    .all(province) as LocationRecord[];
}

/** 今天某省份的新增/移除数（从 locations 表推导） */
export function getTodayChangesByProvince(province: string): { added: number; removed: number } {
  const db = getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const provinceFilter = province === "全国" ? "1=1" : "province = ?";
  const params = province === "全国" ? [] : [province];

  const addedRow = db
    .query(
      `SELECT COUNT(*) as count FROM locations WHERE is_active = 1 AND first_seen_at >= ? AND ${provinceFilter}`,
    )
    .get(todayISO, ...params) as { count: number };

  const removedRow = db
    .query(
      `SELECT COUNT(*) as count FROM locations WHERE is_active = 0 AND last_seen_at >= ? AND ${provinceFilter}`,
    )
    .get(todayISO, ...params) as { count: number };

  return { added: addedRow.count, removed: removedRow.count };
}

export function getActiveLocations(): LocationRecord[] {
  return getActiveLocationsByProvince("全国");
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

/** 汇总今天所有快照的变更数 */
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

/** 今天变更的机台名称（新增 + 移除），包含省份信息 */
export function getTodayChangedMachines(province: string): {
  added: { province: string; arcade_name: string }[];
  removed: { province: string; arcade_name: string }[];
} {
  const db = getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  const provFilter = province === "全国" ? "1=1" : "province = ?";
  const params = province === "全国" ? [] : [province];

  const added = db
    .query(
      `SELECT province, arcade_name FROM locations WHERE is_active = 1 AND first_seen_at >= ? AND ${provFilter} ORDER BY first_seen_at DESC LIMIT 20`,
    )
    .all(todayISO, ...params) as { province: string; arcade_name: string }[];

  const removed = db
    .query(
      `SELECT province, arcade_name FROM locations WHERE is_active = 0 AND last_seen_at >= ? AND ${provFilter} ORDER BY last_seen_at DESC LIMIT 20`,
    )
    .all(todayISO, ...params) as { province: string; arcade_name: string }[];

  return { added, removed };
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

/** 日历热力图：某月每天的新增/移除数（从 locations 表按省份过滤） */
export function getCalendarByProvince(
  year: number,
  month: number,
  province: string,
): { date: string; added: number; removed: number }[] {
  const db = getDB();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const provFilter = province === "全国" ? "1=1" : "province = ?";

  // UNION: additions by first_seen_at + removals by last_seen_at (inactive only)
  const rows = db
    .query(
      `SELECT d, COALESCE(SUM(a), 0) as added, COALESCE(SUM(r), 0) as removed FROM (
         SELECT DATE(first_seen_at) as d, 1 as a, 0 as r
         FROM locations
         WHERE first_seen_at >= ? AND first_seen_at < ? AND ${provFilter}
         UNION ALL
         SELECT DATE(last_seen_at) as d, 0 as a, 1 as r
         FROM locations
         WHERE is_active = 0 AND last_seen_at >= ? AND last_seen_at < ? AND ${provFilter}
       ) GROUP BY d ORDER BY d`,
    )
    .all(
      start, end,
      ...(province === "全国" ? [] : [province]),
      start, end,
      ...(province === "全国" ? [] : [province]),
    ) as { d: string; added: number; removed: number }[];

  return rows.map((r) => ({ date: r.d, added: r.added, removed: r.removed }));
}

/** 获取指定日期某省份的机台变更列表（含完整记录） */
export function getChangedMachinesByDate(
  dateStr: string,
  province: string,
): {
  added: LocationRecord[];
  removed: LocationRecord[];
  isInit: boolean;
} {
  const db = getDB();
  const provFilter = province === "全国" ? "1=1" : "province = ?";

  // Check if this is the first day with data (init day)
  const earliest = db
    .query("SELECT DATE(MIN(first_seen_at)) as d FROM locations")
    .get() as { d: string } | null;
  const isInit = earliest?.d === dateStr;

  const added = db
    .query(
      `SELECT * FROM locations WHERE DATE(first_seen_at) = ? AND ${provFilter} ORDER BY arcade_name LIMIT 200`,
    )
    .all(dateStr, ...(province === "全国" ? [] : [province])) as LocationRecord[];

  const removed = db
    .query(
      `SELECT * FROM locations WHERE is_active = 0 AND DATE(last_seen_at) = ? AND ${provFilter} ORDER BY arcade_name LIMIT 200`,
    )
    .all(dateStr, ...(province === "全国" ? [] : [province])) as LocationRecord[];

  return { added, removed, isInit };
}
