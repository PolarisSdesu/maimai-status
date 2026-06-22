// 机台位置数据
export interface Location {
  id: string;
  province: string;
  arcadeName: string;
  address: string;
  placeId: string;
}

// 数据库中的机台记录
export interface LocationRecord {
  id: string;
  province: string;
  arcade_name: string;
  address: string;
  place_id: string;
  first_seen_at: string;
  last_seen_at: string;
  is_active: number;
}

// 快照记录
export interface SnapshotRecord {
  id: number;
  fetched_at: string;
  total_count: number;
  gansu_count: number;
  added_count: number;
  removed_count: number;
  details: string; // JSON
}

// 省份信息
export interface ProvinceInfo {
  province: string;
  count: number;
}

// API 返回
export interface StatusResponse {
  ok: boolean;
  province: string;
  provinceCount: number;
  totalCount: number;
  machines: LocationRecord[];
  lastUpdated: string;
  todayChanges: {
    added: number;
    removed: number;
  };
  recentChanges: {
    added: { province: string; arcade_name: string }[];
    removed: { province: string; arcade_name: string }[];
  };
}

export interface ProvincesResponse {
  provinces: ProvinceInfo[];
}

export interface HistoryResponse {
  snapshots: SnapshotRecord[];
}

export interface ChangesByDateResponse {
  date: string;
  added: LocationRecord[];
  removed: LocationRecord[];
  isInit: boolean;
}
