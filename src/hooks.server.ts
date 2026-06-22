import { initDB } from '$lib/server/db';
import { startPolling, stopPolling } from '$lib/server/poller';

let initialized = false;

function ensureInit() {
  if (!initialized) {
    initDB();
    startPolling();
    initialized = true;
  }
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  ensureInit();
  return resolve(event);
}

// ── 优雅关闭 ──
function gracefulShutdown(signal: string) {
  console.log(`[server] 收到 ${signal}，正在关闭...`);
  stopPolling();
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
