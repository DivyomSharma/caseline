'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, Satellite, Wind, Lock } from 'lucide-react';
import ProvenanceBadge from '@/components/shared/ProvenanceBadge';
import { groupByRangeAndDistrict } from '@/lib/delhi-org';

export default function MapClient({ cases, stations }: { cases: any[]; stations: any[] }) {
  const [layers, setLayers] = useState({ stations: true, cases: true, bhuvan: false, cpcb: false });

  const districtCaseCounts = useMemo(() => {
    const stationToDistrict = new Map(stations.map((s: any) => [s.id, s.district]));
    const counts = new Map<string, number>();
    for (const c of cases) {
      const district = stationToDistrict.get(c.station_id);
      if (!district) continue;
      counts.set(district, (counts.get(district) || 0) + 1);
    }
    return counts;
  }, [cases, stations]);

  const hierarchy = useMemo(() => groupByRangeAndDistrict(stations), [stations]);
  const maxCount = Math.max(1, ...Array.from(districtCaseCounts.values()));

  const heatClass = (count: number) => {
    const intensity = count / maxCount;
    if (intensity === 0) return 'bg-[var(--color-lavender)] text-[var(--color-ink-soft)] border-[var(--color-lavender-border)]';
    if (intensity < 0.34) return 'bg-[var(--color-saffron)]/10 text-[var(--color-saffron)] border-[var(--color-saffron)]/30';
    if (intensity < 0.67) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">Delhi Crime Map</h1>
          <ProvenanceBadge variant="government" source="Delhi Police districts" />
        </div>
        <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
          District cartogram — tile intensity reflects registered case count per district (demo case data on real district boundaries).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layers panel */}
        <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl p-4 space-y-3 h-fit">
          <h3 className="text-[10px] font-extrabold text-[var(--color-ink-soft)] uppercase tracking-wider">Layers</h3>
          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)]">
            <input type="checkbox" checked={layers.stations} onChange={(e) => setLayers({ ...layers, stations: e.target.checked })} className="accent-[var(--color-primary)]" />
            <MapPin className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" /> Police Stations
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)]">
            <input type="checkbox" checked={layers.cases} onChange={(e) => setLayers({ ...layers, cases: e.target.checked })} className="accent-[var(--color-primary)]" />
            <MapPin className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" /> Case Density
          </label>
          <div className="border-t border-[var(--color-lavender-border)] pt-3 space-y-2">
            <p className="text-[9px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wide">Government layers (not configured)</p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-soft)]" title="Requires ISRO Bhuvan API credentials — not configured in this deployment">
              <Lock className="w-3 h-3" /> <Satellite className="w-3.5 h-3.5" /> Bhuvan Satellite
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-soft)]" title="Requires CPCB / data.gov.in API key — not configured in this deployment">
              <Lock className="w-3 h-3" /> <Wind className="w-3.5 h-3.5" /> CPCB Air Quality
            </div>
          </div>
        </div>

        {/* Cartogram */}
        <div className="lg:col-span-3 space-y-4">
          {hierarchy.map(({ range, districts }) => (
            <div key={range} className="bg-white border border-[var(--color-lavender-border)] rounded-2xl p-4">
              <h4 className="text-[10px] font-extrabold text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">{range}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {districts.map(({ district }) => {
                  const count = districtCaseCounts.get(district) || 0;
                  const stationCount = stations.filter((s: any) => s.district === district).length;
                  return (
                    <div key={district} className={`border rounded-lg p-3 space-y-1 ${heatClass(layers.cases ? count : 0)}`}>
                      <p className="text-[10px] font-extrabold uppercase tracking-wide">{district}</p>
                      {layers.cases && <p className="text-lg font-extrabold">{count}</p>}
                      {layers.stations && <p className="text-[9px] font-bold opacity-70">{stationCount} station{stationCount !== 1 ? 's' : ''}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {hierarchy.length === 0 && (
            <div className="text-center py-12 text-xs text-[var(--color-ink-soft)] font-medium bg-white border border-[var(--color-lavender-border)] rounded-2xl p-8">
              No stations registered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
