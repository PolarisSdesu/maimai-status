import { json } from '@sveltejs/kit';
import { getCalendarByProvince } from '$lib/server/db';

export const GET = ({ url }: { url: URL }) => {
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') || String(new Date().getMonth() + 1));
  const province = url.searchParams.get('province') || '甘肃';
  return json(getCalendarByProvince(year, month, province));
};
