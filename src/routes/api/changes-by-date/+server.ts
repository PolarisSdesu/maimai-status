import { json } from '@sveltejs/kit';
import { getChangedMachinesByDate } from '$lib/server/db';
import type { ChangesByDateResponse } from '$lib/server/types';

export const GET = ({ url }: { url: URL }) => {
  const date = url.searchParams.get('date') || '';
  const province = url.searchParams.get('province') || '甘肃';
  if (!date) return json({ error: 'Missing date parameter' }, { status: 400 });
  const changes = getChangedMachinesByDate(date, province);
  return json({ date, ...changes } satisfies ChangesByDateResponse);
};
