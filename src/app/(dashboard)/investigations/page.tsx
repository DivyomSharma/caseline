import { getAllInvestigations } from '@/lib/supabase/db';
import Link from 'next/link';
import { Activity, Calendar, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function InvestigationsListPage() {
  const logs = await getAllInvestigations();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">Investigation Action Journal</h1>
        <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
          Chronological master register of detective updates and action statements logged across all active cases.
        </p>
      </div>

      {/* Action logs feed */}
      <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--color-ink-soft)] font-medium">
            No investigation logs have been recorded in the database.
          </div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="p-4 rounded-xl border border-[var(--color-lavender-border)] bg-[var(--color-lavender)]/40 space-y-3 flex flex-col justify-between hover:border-[var(--color-primary)]/30 transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-[var(--color-ink)] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    {log.update_type}
                  </span>
                  <span className="text-[var(--color-ink-soft)] text-[10px]">•</span>
                  <span className="text-xs font-bold text-[var(--color-ink)]">Case:</span>
                  {log.cases ? (
                    <Link href={`/cases/${log.cases.id}`} className="font-extrabold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline font-mono text-xs">
                      {log.cases.case_number}
                    </Link>
                  ) : (
                    <span className="text-[var(--color-ink-soft)] italic text-xs">Deleted Case</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-[10px] text-[var(--color-ink-soft)] font-semibold font-mono">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-ink-soft)] shrink-0" />
                    <span>{new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-ink-soft)] shrink-0" />
                    <span>{log.officers?.rank} {log.officers?.profiles?.full_name || 'Staff'}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--color-ink-soft)] font-medium leading-5 border-t border-[var(--color-lavender-border)] pt-2.5">
                {log.notes}
              </p>

              {log.next_action && (
                <div className="text-[9px] bg-[var(--color-saffron)]/10 text-[var(--color-saffron)] font-bold p-2 rounded-full border border-[var(--color-saffron)]/20 w-fit">
                  Next Action: {log.next_action}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
