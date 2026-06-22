import { json } from '@sveltejs/kit';
import { updateLocations, recordSnapshot } from '$lib/server/db';
import type { Location } from '$lib/server/types';

const SEGA_API = 'https://sega-register.wahlap.net/api/sega/maidx/rest/location';
const FETCH_TIMEOUT_MS = 30_000;

// ── 简易速率限制 ──
const RATE_LIMIT_WINDOW = 60_000; // 1 分钟窗口
const RATE_LIMIT_MAX = 3; // 每窗口最多 3 次请求
const requestTimestamps: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  // 清理过期的记录
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }
  requestTimestamps.push(now);
  return false;
}

export const POST = async () => {
  if (isRateLimited()) {
    return json({ ok: false, error: '请求过于频繁，请稍后再试' }, { status: 429 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const resp = await fetch(SEGA_API, { signal: controller.signal });
    clearTimeout(timeout);

    const data: Location[] = await resp.json();
    if (!Array.isArray(data)) throw new Error('Invalid data');
    const { added, removed } = updateLocations(data);
    recordSnapshot(data, added, removed);

    const provinces = new Set(data.map((d) => d.province));
    const gansu = data.filter((d) => d.province === '甘肃');
    return json({
      ok: true,
      added,
      removed,
      total: data.length,
      gansu: gansu.length,
      provinceCount: provinces.size,
    });
  } catch (err) {
    console.error('[trigger-poll] 失败:', err instanceof Error ? err.message : err);
    return json({ ok: false, error: String(err) }, { status: 500 });
  }
};
