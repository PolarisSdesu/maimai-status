import {
  initDB,
  getDB,
  getActiveLocationsByProvince,
  getAllProvinces,
  getLatestSnapshot,
  getSnapshots,
  getTotalLocationCount,
  getTodayChangesByProvince,
  getTodayChangedMachines,
  getCalendarByProvince,
  getChangedMachinesByDate,
  updateLocations,
  recordSnapshot,
} from "./db";
import { startPolling } from "./poller";
import type { StatusResponse, ProvincesResponse, HistoryResponse, ChangesByDateResponse } from "./types";

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

    // GET /api/provinces — 所有省份及机台数
    if (path === "/api/provinces") {
      const provinces = getAllProvinces();
      return json({ provinces } satisfies ProvincesResponse);
    }

    // GET /api/status?province=xxx — 某省或全国机台状态
    if (path === "/api/status") {
      const province = url.searchParams.get("province") || "甘肃";
      const machines = getActiveLocationsByProvince(province);
      const snapshot = getLatestSnapshot();
      const todayChanges = getTodayChangesByProvince(province);
      const recentChanges = getTodayChangedMachines(province);

      const res: StatusResponse = {
        ok: machines.length > 0,
        province,
        provinceCount: machines.length,
        totalCount: getTotalLocationCount(),
        machines,
        lastUpdated: snapshot?.fetched_at ?? new Date().toISOString(),
        todayChanges,
        recentChanges,
      };

      return json(res);
    }

    // GET /api/history — 快照历史
    if (path === "/api/history") {
      return json({ snapshots: getSnapshots(30) } satisfies HistoryResponse);
    }

    // GET /api/history-calendar?year=&month=&province= — 日历热力图
    if (path === "/api/history-calendar") {
      const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()));
      const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1));
      const province = url.searchParams.get("province") || "甘肃";

      const rows = getCalendarByProvince(year, month, province);
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

        const provinces = new Set(data.map((d: any) => d.province));
        const gansu = data.filter((d: any) => d.province === "甘肃");
        return json({
          ok: true,
          added,
          removed,
          total: data.length,
          gansu: gansu.length,
          provinceCount: provinces.size,
        });
      } catch (err) {
        return json({ ok: false, error: String(err) }, 500);
      }
    }

    // GET /api/changes-by-date?date=2026-06-22&province=甘肃 — 指定日期的机台变更
    if (path === "/api/changes-by-date") {
      const date = url.searchParams.get("date") || "";
      const province = url.searchParams.get("province") || "甘肃";
      if (!date) return json({ error: "Missing date parameter" }, 400);
      const changes = getChangedMachinesByDate(date, province);
      return json({ date, ...changes } satisfies ChangesByDateResponse);
    }

    return json({ error: "Not Found" }, 404);
  },
});

console.log(`\n  🖥️   Server  http://localhost:${PORT}`);
console.log(`  📡  Status  http://localhost:${PORT}/api/status?province=甘肃`);
console.log(`  🗺️   Provinces http://localhost:${PORT}/api/provinces`);
console.log(`  📜  History http://localhost:${PORT}/api/history\n`);
