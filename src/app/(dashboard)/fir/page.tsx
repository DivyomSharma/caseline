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
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">FIR Registers</h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Complete database of First Information Reports logged in all precincts.
          </p>
        </div>
        <Link
          href="/fir/new"
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New FIR</span>
        </Link>
      </div>

      {/* Directory Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">FIR Number</th>
                <th className="py-3 px-4">Case Link</th>
                <th className="py-3 px-4">Complainant</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Complaint Date</th>
                <th className="py-3 px-4">Narrative Excerpt</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {firs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No FIR records found.
                  </td>
                </tr>
              ) : (
                firs.map((f: any) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-800 font-mono tracking-tight">
                      {f.fir_number}
                    </td>
                    <td className="py-3.5 px-4">
                      {f.cases ? (
                        <Link href={`/cases/${f.cases.id}`} className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline font-mono">
                          {f.cases.case_number}
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic">No case linked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      {f.victims?.full_name || 'Anonymous'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-bold uppercase">
                      {f.cases?.police_stations?.station_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(f.complaint_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {f.complaint_description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {f.cases ? (
                        <Link
                          href={`/cases/${f.cases.id}`}
                          className="inline-flex items-center space-x-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                        >
                          <span>View Case File</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
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
