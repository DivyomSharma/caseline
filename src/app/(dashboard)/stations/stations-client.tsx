'use client';

import React, { useState } from 'react';
import { Building2, Phone, MapPin, Users, PlusCircle, ChevronDown, ChevronRight } from 'lucide-react';
import CreateStationModal from '@/components/shared/CreateStationModal';
import ProvenanceBadge from '@/components/shared/ProvenanceBadge';
import { groupByRangeAndDistrict } from '@/lib/delhi-org';

function StationCard({ st, officerCount }: { st: any; officerCount: number }) {
  return (
    <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden">
      <img
        src={`/stations/${st.station_code}.jpg`}
        alt={st.name}
        className="w-full h-28 object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] bg-[var(--color-primary)] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
              {st.station_code}
            </span>
            <div className="w-8 h-8 bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[var(--color-ink-soft)]" />
            </div>
          </div>
          <h3 className="text-xs font-bold text-[var(--color-ink)] leading-4">{st.name}</h3>
          <p className="text-[10px] text-[var(--color-ink-soft)]/70 font-bold uppercase tracking-wider mt-0.5">{st.district}</p>
        </div>

        <div className="space-y-2.5 text-xs border-t border-[var(--color-lavender-border)] pt-3">
          <div className="flex items-start space-x-2 text-[var(--color-ink-soft)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--color-ink-soft)]/70 shrink-0 mt-0.5" />
            <span className="font-semibold leading-4">{st.address}</span>
          </div>
          <div className="flex items-center space-x-2 text-[var(--color-ink-soft)]">
            <Phone className="w-3.5 h-3.5 text-[var(--color-ink-soft)]/70 shrink-0" />
            <span className="font-semibold font-mono">{st.contact}</span>
          </div>
        </div>

        <div className="border-t border-[var(--color-lavender-border)] pt-3 flex justify-between items-center text-[10px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wide">
          <div className="flex items-center space-x-1">
            <Users className="w-4.5 h-4.5 text-[var(--color-ink-soft)]/70" />
            <span>Officers count</span>
          </div>
          <span className="text-[var(--color-ink)] text-xs font-extrabold">{officerCount} staff</span>
        </div>
      </div>
    </div>
  );
}

export default function StationsClient({ stations, officers, user }: { stations: any[]; officers: any[]; user: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsedRanges, setCollapsedRanges] = useState<Set<string>>(new Set());
  const isAdmin = user?.role === 'admin';

  const hierarchy = groupByRangeAndDistrict(stations);

  const toggleRange = (range: string) => {
    setCollapsedRanges((prev) => {
      const next = new Set(prev);
      if (next.has(range)) next.delete(range);
      else next.add(range);
      return next;
    });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">Police Station Precincts</h1>
            <ProvenanceBadge variant="government" source="Delhi Police organisational structure" />
          </div>
          <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
            Range → District → Precinct hierarchy. Organisational structure is real; individual precinct records are demo data.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Station</span>
          </button>
        )}
      </div>

      {stations.length === 0 ? (
        <div className="col-span-full text-center py-12 text-xs text-[var(--color-ink-soft)]/70 font-medium bg-white border border-[var(--color-lavender-border)] rounded-2xl p-8">
          No station precincts registered yet. Log in as Administrator (Divyom/Samar) to register the first precinct.
        </div>
      ) : (
        <div className="space-y-4">
          {hierarchy.map(({ range, districts }) => {
            const collapsed = collapsedRanges.has(range);
            const totalStations = districts.reduce((sum, d) => sum + d.items.length, 0);
            return (
              <div key={range} className="bg-white border border-[var(--color-lavender-border)] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleRange(range)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-lavender)] hover:bg-[var(--color-lavender)]/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {collapsed ? <ChevronRight className="w-4 h-4 text-[var(--color-ink-soft)]/70" /> : <ChevronDown className="w-4 h-4 text-[var(--color-ink-soft)]/70" />}
                    <span className="text-xs font-extrabold text-[var(--color-ink)] uppercase tracking-wide">{range}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-ink-soft)]">{districts.length} district{districts.length !== 1 ? 's' : ''} · {totalStations} station{totalStations !== 1 ? 's' : ''}</span>
                </button>
                {!collapsed && (
                  <div className="p-4 space-y-5">
                    {districts.map(({ district, items }) => (
                      <div key={district}>
                        <h4 className="text-[10px] font-extrabold text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">{district}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {items.map((st: any) => (
                            <StationCard key={st.id} st={st} officerCount={officers.filter((o: any) => o.station_id === st.id).length} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <CreateStationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}
