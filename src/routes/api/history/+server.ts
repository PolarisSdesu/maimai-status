import { json } from '@sveltejs/kit';
import { getSnapshots } from '$lib/server/db';

export const GET = () => {
  return json({ snapshots: getSnapshots(30) });
};
