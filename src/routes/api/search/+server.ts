import { json } from '@sveltejs/kit';
import { searchLocations } from '$lib/server/db';

export const GET = ({ url }: { url: URL }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 1) {
    return json({ results: [] });
  }

  const results = searchLocations(q);
  return json({ results });
};
