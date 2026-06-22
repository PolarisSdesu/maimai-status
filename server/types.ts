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

// API 返回
export interface StatusResponse {
  ok: boolean;
  gansuCount: number;
  totalCount: number;
  machines: LocationRecord[];
  lastUpdated: string;
  todayChanges: {
    added: number;
    removed: number;
  };
}

export interface HistoryResponse {
  snapshots: SnapshotRecord[];
}
