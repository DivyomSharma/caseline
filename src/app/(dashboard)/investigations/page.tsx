import { getAllInvestigations } from '@/lib/supabase/db';
import Link from 'next/link';
import { Activity, Calendar, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function InvestigationsListPage() {
  const logs = await getAllInvestigations();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Investigation Action Journal</h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Chronological master register of detective updates and action statements logged across all active cases.
        </p>
      </div>

      {/* Action logs feed */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-5 space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            No investigation logs have been recorded in the database.
          </div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-3 flex flex-col justify-between hover:border-slate-200 transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    {log.update_type}
                  </span>
                  <span className="text-slate-450 text-[10px]">•</span>
                  <span className="text-xs font-bold text-slate-800">Case:</span>
                  {log.cases ? (
                    <Link href={`/cases/${log.cases.id}`} className="font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline font-mono text-xs">
                      {log.cases.case_number}
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Deleted Case</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-semibold font-mono">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-3.5 shrink-0" />
                    <span>{new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-3.5 shrink-0" />
                    <span>{log.officers?.rank} {log.officers?.profiles?.full_name || 'Staff'}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-5 border-t border-slate-100 pt-2.5">
                {log.notes}
              </p>

              {log.next_action && (
                <div className="text-[9px] bg-indigo-50/50 text-indigo-700 font-bold p-2 rounded border border-indigo-100/30 w-fit">
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
