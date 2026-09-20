import { getAllEvidence } from '@/lib/supabase/db';
import Link from 'next/link';
import { FolderLock, Calendar, MapPin, Eye, FileSearch } from 'lucide-react';

export default async function EvidenceListPage() {
  const evidenceItems = await getAllEvidence();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">Evidence depository Vault</h1>
        <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
          Registry of files, digital elements, and physical exhibits logged under department custody.
        </p>
      </div>

      {/* Grid depository list */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {evidenceItems.length === 0 ? (
          <div className="col-span-full text-center py-8 text-xs text-[var(--color-ink-soft)] font-medium">
            No evidence items have been logged in the depository.
          </div>
        ) : (
          evidenceItems.map((ev: any) => (
            <div key={ev.id} className="bg-white border border-[var(--color-lavender-border)] rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-4 hover:border-[var(--color-primary)]/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[9px] bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] text-[var(--color-ink)] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {ev.evidence_type}
                </span>
                <span className={`text-[9px] font-bold uppercase px-1.5 rounded-full ${
                  ev.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--color-saffron)]/10 text-[var(--color-saffron)]'
                }`}>
                  {ev.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[var(--color-ink)] leading-4 line-clamp-2">{ev.description}</h4>
                <div className="text-[10px] text-[var(--color-ink-soft)] font-bold uppercase mt-1 leading-3">
                  Case: {ev.cases ? (
                    <Link href={`/cases/${ev.cases.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline font-mono">
                      {ev.cases.case_number}
                    </Link>
                  ) : (
                    <span className="italic">Deleted Case</span>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-[var(--color-ink-soft)] font-semibold space-y-1 border-t border-[var(--color-lavender-border)] pt-2.5">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-ink-soft)] shrink-0" />
                  <span className="truncate">Locker: {ev.storage_location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-ink-soft)] shrink-0" />
                  <span>Collected: {new Date(ev.collected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="bg-[var(--color-lavender)] hover:bg-[var(--color-lavender)]/70 cursor-pointer p-2 rounded-full text-[10px] text-center text-[var(--color-ink)] font-bold tracking-wide border border-[var(--color-lavender-border)]">
                Download File ({ev.file_url.split('/').pop()})
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
