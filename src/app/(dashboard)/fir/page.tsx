import { getFIRs } from '@/lib/supabase/db';
import Link from 'next/link';
import { FileText, Calendar, PlusCircle, ArrowRight, Shield } from 'lucide-react';

export default async function FirListPage() {
  const firs = await getFIRs();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">FIR Registers</h1>
          <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
            Complete database of First Information Reports logged in all precincts.
          </p>
        </div>
        <Link
          href="/fir/new"
          className="inline-flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New FIR</span>
        </Link>
      </div>

      {/* Directory Grid */}
      <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-lavender)]/70 border-b border-[var(--color-lavender-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">
                <th className="py-3 px-4">FIR Number</th>
                <th className="py-3 px-4">Case Link</th>
                <th className="py-3 px-4">Complainant</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Complaint Date</th>
                <th className="py-3 px-4">Narrative Excerpt</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-lavender-border)] text-xs">
              {firs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-ink-soft)] font-medium">
                    No FIR records found.
                  </td>
                </tr>
              ) : (
                firs.map((f: any) => (
                  <tr key={f.id} className="hover:bg-[var(--color-lavender)]/60 transition-all">
                    <td className="py-3.5 px-4 font-bold text-[var(--color-ink)] font-mono tracking-tight">
                      {f.fir_number}
                    </td>
                    <td className="py-3.5 px-4">
                      {f.cases ? (
                        <Link href={`/cases/${f.cases.id}`} className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline font-mono">
                          {f.cases.case_number}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-ink-soft)] italic">No case linked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-ink)] font-semibold">
                      {f.victims?.full_name || 'Anonymous'}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-ink-soft)] font-bold uppercase">
                      {f.cases?.police_stations?.station_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-ink-soft)] font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
                      <span>{new Date(f.complaint_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-ink-soft)] max-w-xs truncate">
                      {f.complaint_description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {f.cases ? (
                        <Link
                          href={`/cases/${f.cases.id}`}
                          className="inline-flex items-center space-x-1 border border-[var(--color-lavender-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-lavender)] text-[var(--color-ink)] font-bold px-2.5 py-1.5 rounded-full shadow-sm transition-all"
                        >
                          <span>View Case File</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-[var(--color-ink-soft)]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
