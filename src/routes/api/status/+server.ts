import { json } from '@sveltejs/kit';
import {
  getActiveLocationsByProvince,
  getLatestSnapshot,
  getTotalLocationCount,
  getTodayChangesByProvince,
  getTodayChangedMachines,
} from '$lib/server/db';
import { DEFAULT_PROVINCE } from '$lib/constants';

export const GET = ({ url }: { url: URL }) => {
  const province = url.searchParams.get('province') || DEFAULT_PROVINCE;
  const machines = getActiveLocationsByProvince(province);
  const snapshot = getLatestSnapshot();

  return json({
    ok: machines.length > 0,
    province,
    provinceCount: machines.length,
    totalCount: getTotalLocationCount(),
    machines,
    lastUpdated: snapshot?.fetched_at ?? new Date().toISOString(),
    todayChanges: getTodayChangesByProvince(province),
    recentChanges: getTodayChangedMachines(province),
  });
};
