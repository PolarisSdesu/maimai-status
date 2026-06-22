import { json } from '@sveltejs/kit';
import { getAllProvinces } from '$lib/server/db';

export const GET = () => {
  return json({ provinces: getAllProvinces() });
};
