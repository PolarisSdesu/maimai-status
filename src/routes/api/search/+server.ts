import { json } from '@sveltejs/kit';
import { searchLocations } from '$lib/server/db';

export const GET = ({ url }: { url: URL }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 1) {
    return json({ results: [] });
  }

  try {
    const results = searchLocations(q);
    return json({ results });
  } catch (err) {
    console.error('[search] 搜索失败:', err instanceof Error ? err.message : err);
    return json({ error: '搜索失败' }, { status: 500 });
  }
};
