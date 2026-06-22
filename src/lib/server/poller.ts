import { updateLocations, recordSnapshot } from "./db";
import type { Location } from "./types";

const SEGA_API = "https://sega-register.wahlap.net/api/sega/maidx/rest/location";
const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 分钟
const FETCH_TIMEOUT_MS = 30_000; // 30 秒超时
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000; // 重试间隔 5 秒

let timer: ReturnType<typeof setInterval> | null = null;
let consecutiveFailures = 0;

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timeout);
  }
}

async function pollOnce(): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await fetchWithTimeout(SEGA_API, FETCH_TIMEOUT_MS);
      if (!resp.ok) {
        const msg = `[poller] HTTP ${resp.status} (尝试 ${attempt}/${MAX_RETRIES})`;
        console.error(msg);
        lastError = new Error(msg);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt); // 指数退避
        }
        continue;
      }
      const data: Location[] = await resp.json();
      if (!Array.isArray(data)) {
        console.error("[poller] 数据格式异常");
        return; // 格式错误不重试
      }

      const { added, removed } = updateLocations(data);
      recordSnapshot(data, added, removed);

      const provinces = new Set(data.map((d) => d.province));
      console.log(
        `[poller] OK | 全国 ${data.length} 台 | ${provinces.size} 个省份 | +${added} -${removed}`,
      );

      consecutiveFailures = 0;
      return; // 成功，退出
    } catch (err) {
      lastError = err;
      if (err instanceof DOMException && err.name === "AbortError") {
        console.error(`[poller] 请求超时 (尝试 ${attempt}/${MAX_RETRIES})`);
      } else {
        console.error(
          `[poller] 请求失败 (尝试 ${attempt}/${MAX_RETRIES}):`,
          err instanceof Error ? err.message : err,
        );
      }
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  consecutiveFailures++;
  console.error(`[poller] 全部 ${MAX_RETRIES} 次重试失败，连续失败: ${consecutiveFailures}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function startPolling(): void {
  console.log(`[poller] 启动，间隔 ${POLL_INTERVAL_MS / 1000}s，超时 ${FETCH_TIMEOUT_MS / 1000}s`);
  // 立即执行一次
  pollOnce();
  timer = setInterval(pollOnce, POLL_INTERVAL_MS);
}

export function stopPolling(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log("[poller] 已停止");
  }
}
