import { json } from '@sveltejs/kit';
import { getCalendarByProvince } from '$lib/server/db';
import { DEFAULT_PROVINCE } from '$lib/constants';

export const GET = ({ url }: { url: URL }) => {
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') || String(new Date().getMonth() + 1));
  const province = url.searchParams.get('province') || DEFAULT_PROVINCE;
  return json(getCalendarByProvince(year, month, province));
};
