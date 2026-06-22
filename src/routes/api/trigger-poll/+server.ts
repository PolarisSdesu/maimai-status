import { json } from '@sveltejs/kit';
import { updateLocations, recordSnapshot } from '$lib/server/db';
import type { Location } from '$lib/server/types';

const SEGA_API = 'https://sega-register.wahlap.net/api/sega/maidx/rest/location';

export const POST = async () => {
  try {
    const resp = await fetch(SEGA_API);
    const data: Location[] = await resp.json();
    if (!Array.isArray(data)) throw new Error('Invalid data');
    const { added, removed } = updateLocations(data);
    recordSnapshot(data, added, removed);

    const provinces = new Set(data.map((d) => d.province));
    const gansu = data.filter((d) => d.province === '甘肃');
    return json({
      ok: true,
      added,
      removed,
      total: data.length,
      gansu: gansu.length,
      provinceCount: provinces.size,
    });
  } catch (err) {
    return json({ ok: false, error: String(err) }, { status: 500 });
  }
};
