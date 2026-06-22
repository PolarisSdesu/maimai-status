import {
  updateLocations,
  recordSnapshot,
} from "./db";
import type { Location } from "./types";

const SEGA_API = "https://sega-register.wahlap.net/api/sega/maidx/rest/location";
const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 分钟

let timer: ReturnType<typeof setInterval> | null = null;

async function pollOnce(): Promise<void> {
  try {
    const resp = await fetch(SEGA_API);
    if (!resp.ok) {
      console.error(`[poller] HTTP ${resp.status}`);
      return;
    }
    const data: Location[] = await resp.json();
    if (!Array.isArray(data)) {
      console.error("[poller] 数据格式异常");
      return;
    }

    const { added, removed } = updateLocations(data);
    recordSnapshot(data, added, removed);

    const provinces = new Set(data.map((d) => d.province));
    console.log(
      `[poller] OK | 全国 ${data.length} 台 | ${provinces.size} 个省份 | +${added} -${removed}`,
    );
  } catch (err) {
    console.error("[poller] 请求失败:", err instanceof Error ? err.message : err);
  }
}

export function startPolling(): void {
  console.log(`[poller] 启动，间隔 ${POLL_INTERVAL_MS / 1000}s`);
  // 立即执行一次
  pollOnce();
  timer = setInterval(pollOnce, POLL_INTERVAL_MS);
}

export function stopPolling(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
