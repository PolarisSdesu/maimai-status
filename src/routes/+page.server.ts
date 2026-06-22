import type { PageServerLoad } from './$types';
import {
  getActiveLocationsByProvince,
  getAllProvinces,
  getLatestSnapshot,
  getTotalLocationCount,
  getTodayChangesByProvince,
  getTodayChangedMachines,
  getCalendarByProvince,
} from '$lib/server/db';

export const load: PageServerLoad = ({ url }) => {
  const province = url.searchParams.get('province') || '全国';
  const machines = getActiveLocationsByProvince(province);
  const snapshot = getLatestSnapshot();

  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth() + 1;
  const calDays = getCalendarByProvince(calYear, calMonth, '全国');

  return {
    ok: machines.length > 0,
    province,
    provinceCount: machines.length,
    totalCount: getTotalLocationCount(),
    machines,
    lastUpdated: snapshot?.fetched_at ?? now.toISOString(),
    todayChanges: getTodayChangesByProvince(province),
    recentChanges: getTodayChangedMachines(province),
    provinces: getAllProvinces(),
    calYear,
    calMonth,
    calDays,
  };
};
