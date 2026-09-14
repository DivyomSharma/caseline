// Real Delhi Police organisational structure (ranges -> districts), used to
// give the seeded/demo police stations a genuine hierarchy instead of a flat
// list. Station-level data in seedData.ts remains fictional/demo; this
// structure itself is sourced from Delhi Police's public organisational
// material (RTI manual, official district/range listings).
//
// Kept as a lightweight constants module rather than new DB tables so the
// existing `police_stations.district` text field needs no migration — the
// lookup below maps that free-text district name to its real range.

export type DelhiRange =
  | 'Eastern Range'
  | 'Northern Range'
  | 'Central Range'
  | 'Southern Range'
  | 'Western Range'
  | 'New Delhi Range'
  | 'Special Units';

export interface DelhiDistrict {
  name: string;
  range: DelhiRange;
}

export const DELHI_RANGES: DelhiRange[] = [
  'Eastern Range',
  'Northern Range',
  'Central Range',
  'Southern Range',
  'Western Range',
  'New Delhi Range',
  'Special Units',
];

// The 15 territorial districts (grouped by range) plus specialised units,
// per Delhi Police's public organisational structure.
export const DELHI_DISTRICTS: DelhiDistrict[] = [
  { name: 'East District', range: 'Eastern Range' },
  { name: 'North-East District', range: 'Eastern Range' },
  { name: 'Shahdara District', range: 'Eastern Range' },

  { name: 'North District', range: 'Northern Range' },
  { name: 'North-West District', range: 'Northern Range' },
  { name: 'Rohini District', range: 'Northern Range' },
  { name: 'Outer North District', range: 'Northern Range' },

  { name: 'Central District', range: 'Central Range' },

  { name: 'South District', range: 'Southern Range' },
  { name: 'South-East District', range: 'Southern Range' },

  { name: 'West District', range: 'Western Range' },
  { name: 'Dwarka District', range: 'Western Range' },
  { name: 'Outer District', range: 'Western Range' },

  { name: 'New Delhi District', range: 'New Delhi Range' },
  { name: 'South-West District', range: 'New Delhi Range' },

  { name: 'Special Cell', range: 'Special Units' },
  { name: 'Cyber Cell', range: 'Special Units' },
  { name: 'Railway District', range: 'Special Units' },
];

// Real Delhi District Courts complexes (public official structure).
export const DELHI_COURT_COMPLEXES = [
  'Tis Hazari Courts',
  'Patiala House Courts',
  'Karkardooma Courts',
  'Rohini Courts',
  'Dwarka Courts',
  'Saket Courts',
];

const DISTRICT_LOOKUP = new Map(DELHI_DISTRICTS.map((d) => [d.name, d]));

export function getDistrictInfo(districtName: string): DelhiDistrict {
  return DISTRICT_LOOKUP.get(districtName) ?? { name: districtName, range: 'Special Units' };
}

export function getRangeForDistrict(districtName: string): DelhiRange {
  return getDistrictInfo(districtName).range;
}

/** Groups a flat list of items with a `district` field into Range -> District -> items. */
export function groupByRangeAndDistrict<T extends { district: string }>(items: T[]) {
  const byRange = new Map<DelhiRange, Map<string, T[]>>();
  for (const range of DELHI_RANGES) byRange.set(range, new Map());

  for (const item of items) {
    const { range, name: district } = getDistrictInfo(item.district);
    const districtMap = byRange.get(range)!;
    if (!districtMap.has(district)) districtMap.set(district, []);
    districtMap.get(district)!.push(item);
  }

  return DELHI_RANGES.map((range) => ({
    range,
    districts: Array.from(byRange.get(range)!.entries())
      .filter(([, items]) => items.length > 0)
      .map(([district, items]) => ({ district, items })),
  })).filter((r) => r.districts.length > 0);
}
