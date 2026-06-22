export type Machine = {
  id: string;
  province: string;
  arcade_name: string;
  address: string;
  place_id: string;
  first_seen_at: string;
  last_seen_at: string;
  is_active: number;
};

export type StatusData = {
  ok: boolean;
  province: string;
  provinceCount: number;
  totalCount: number;
  machines: Machine[];
  lastUpdated: string;
  todayChanges: { added: number; removed: number };
  recentChanges?: {
    added: { province: string; arcade_name: string }[];
    removed: { province: string; arcade_name: string }[];
  };
};

export type ProvinceInfo = { province: string; count: number };

export type CalendarDay = { date: string; added: number; removed: number };

export type CalendarCell = {
  day: number;
  dateStr: string;
  added: number;
  removed: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export type ChangesByDateResponse = {
  date: string;
  added: Machine[];
  removed: Machine[];
  isInit: boolean;
};
