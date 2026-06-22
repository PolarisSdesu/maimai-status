import {
  initDB,
  getDB,
  getActiveLocationsByProvince,
  getLatestSnapshot,
  getSnapshots,
  getTotalLocationCount,
  updateLocations,
  recordSnapshot,
} from "./db";
import { startPolling } from "./poller";
import type { StatusResponse, HistoryResponse } from "./types";

const PROVINCE = "甘肃";
const PORT = 3001;

initDB();
startPolling();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    // GET /api/status — 当前甘肃机台状态
    if (path === "/api/status") {
      const machines = getActiveLocationsByProvince(PROVINCE);
      const snapshot = getLatestSnapshot();

      const res: StatusResponse = {
        ok: machines.length > 0,
        gansuCount: machines.length,
        totalCount: getTotalLocationCount(),
        machines,
        lastUpdated: snapshot?.fetched_at ?? new Date().toISOString(),
        todayChanges: {
          added: snapshot?.added_count ?? 0,
          removed: snapshot?.removed_count ?? 0,
        },
      };

      return json(res);
    }

    // GET /api/history — 快照历史
    if (path === "/api/history") {
      return json({ snapshots: getSnapshots(30) } satisfies HistoryResponse);
    }

    // GET /api/history-calendar?year=2026&month=6 — 日历热力图数据
    if (path === "/api/history-calendar") {
      const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()));
      const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1));

      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const endMonth = month === 12 ? 1 : month + 1;
      const endYear = month === 12 ? year + 1 : year;
      const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

      const db = getDB();
      const rows = db
        .query(
          `SELECT DATE(fetched_at) as date,
                  SUM(added_count) as added,
                  SUM(removed_count) as removed
           FROM snapshots
           WHERE fetched_at >= ? AND fetched_at < ?
           GROUP BY DATE(fetched_at)
           ORDER BY date`,
        )
        .all(start, end) as { date: string; added: number; removed: number }[];

      return json(rows);
    }

    // POST /api/trigger-poll — 手动触发抓取
    if (path === "/api/trigger-poll" && req.method === "POST") {
      try {
        const resp = await fetch("https://sega-register.wahlap.net/api/sega/maidx/rest/location");
        const data = await resp.json();
        if (!Array.isArray(data)) throw new Error("Invalid data");
        const { added, removed } = updateLocations(data);
        recordSnapshot(data, added, removed);
        const gansu = data.filter((d: any) => d.province === PROVINCE);
        return json({ ok: true, added, removed, total: data.length, gansu: gansu.length });
      } catch (err) {
        return json({ ok: false, error: String(err) }, 500);
      }
    }

    return json({ error: "Not Found" }, 404);
  },
});

console.log(`\n  🖥️   Server  http://localhost:${PORT}`);
console.log(`  📡  Status  http://localhost:${PORT}/api/status`);
console.log(`  📜  History http://localhost:${PORT}/api/history\n`);
