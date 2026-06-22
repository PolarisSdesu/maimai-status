import { initDB } from '$lib/server/db';
import { startPolling } from '$lib/server/poller';

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
