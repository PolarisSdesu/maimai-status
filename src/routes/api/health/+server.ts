import { json } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';

export const GET = () => {
  try {
    // 验证数据库连接
    const db = getDB();
    const row = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
    return json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      machineCount: row.count,
    });
  } catch (err) {
    return json(
      { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
};
