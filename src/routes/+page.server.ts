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
import type { CalendarDay } from '$lib/types';
import { DEFAULT_PROVINCE } from '$lib/constants';

/**
 * SSR 时加载全部机台数据（全国），
 * 日历始终显示全国，省份切换仅获取高亮数据。
 */
export const load: PageServerLoad = ({ url }) => {
  const province = url.searchParams.get('province') || DEFAULT_PROVINCE;

  const allMachines = getActiveLocationsByProvince('全国');
  const snapshot = getLatestSnapshot();

  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth() + 1;

  // 日历始终用全国数据
  const calDays = getCalendarByProvince(calYear, calMonth, '全国');

  // 当前选中省份的日历高亮（非全国时）
  let provinceHighlightDates: CalendarDay[] = [];
  if (province !== '全国') {
    provinceHighlightDates = getCalendarByProvince(calYear, calMonth, province);
  }

  return {
    ok: allMachines.length > 0,
    province,
    allMachines,
    totalCount: getTotalLocationCount(),
    lastUpdated: snapshot?.fetched_at ?? now.toISOString(),
    todayChanges: getTodayChangesByProvince(province),
    recentChanges: getTodayChangedMachines(province),
    provinces: getAllProvinces(),
    calYear,
    calMonth,
    calDays,
    provinceHighlightDates,
  };
};
