'use client';

import React from 'react';
import Link from 'next/link';
import { Gavel, Calendar } from 'lucide-react';
import ProvenanceBadge from '@/components/shared/ProvenanceBadge';

export default function CourtsClient({ courtCases }: { courtCases: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Court Tracker</h1>
          <ProvenanceBadge variant="court" source="Delhi District Courts complexes" />
        </div>
        <p className="text-stone-500 text-[11px] mt-0.5">
          Cases sent for trial, grouped by hearing date. Court complex names are real Delhi District Courts; case linkage is demo data.
        </p>
      </div>

      {courtCases.length === 0 ? (
        <div className="text-center py-12 text-xs text-stone-400 font-medium bg-white border border-stone-200 rounded-xl p-8">
          No cases registered with a court yet. Register one from a case&rsquo;s Court tab.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courtCases.map((cc: any) => (
            <Link
              key={cc.id}
              href={`/cases/${cc.case_id}`}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center">
                    <Gavel className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-800">{cc.cases?.case_number || 'Unlinked case'}</h3>
                    <p className="text-[10px] text-stone-400 font-semibold uppercase">{cc.court_complex}</p>
                  </div>
                </div>
                <span className="text-[9px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {cc.case_status?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold">Next hearing: {cc.next_hearing_date || 'Not scheduled'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
