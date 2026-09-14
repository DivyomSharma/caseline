'use client';

import React, { useState } from 'react';
import { Scale, Search, ExternalLink } from 'lucide-react';
import ProvenanceBadge from '@/components/shared/ProvenanceBadge';
import type { LegalSection } from '@/lib/legal-sections';

export default function LawsClient({ sections }: { sections: LegalSection[] }) {
  const [query, setQuery] = useState('');

  const filtered = sections.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.sectionNumber.includes(q) ||
      s.oldLawSection.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Legal Intelligence</h1>
            <ProvenanceBadge variant="government" source="India Code — BNS, 2023" />
          </div>
          <p className="text-stone-500 text-[11px] mt-0.5">
            Bharatiya Nyaya Sanhita sections cited across cases, with the IPC section each replaced.
            Verify exact statutory text against India Code before citing in official documents.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, section number, or IPC equivalent..."
          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4 text-stone-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-800">{s.act} § {s.sectionNumber}</h3>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">{s.title}</p>
                </div>
              </div>
              <span className="text-[9px] bg-stone-100 text-stone-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                {s.oldLawAct} § {s.oldLawSection}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-5">{s.summary}</p>
            <a
              href={s.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-stone-800"
            >
              View official text on India Code <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-xs text-stone-400 font-medium bg-white border border-stone-200 rounded-xl p-8">
            No sections match &ldquo;{query}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}
