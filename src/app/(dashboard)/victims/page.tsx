import { getVictims, getCurrentUser } from '@/lib/supabase/db';
import { Users, Search, Phone, MapPin, Calendar, Lock } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function VictimsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const victims = await getVictims(search);
  const currentUser = await getCurrentUser();

  const isViewer = currentUser?.role === 'viewer';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Complainants & Victims Registry</h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          General index of complainants, reporters, and victims registered across active dockets.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center">
        <form className="relative flex-1" method="GET" action="/victims">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by full name, registration location..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Table grid directory */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Residential Address</th>
                <th className="py-3 px-4">Date Registered</th>
                <th className="py-3 px-4">File Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {victims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No victim records found.
                  </td>
                </tr>
              ) : (
                victims.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {v.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold font-mono">
                      {isViewer ? (
                        <span className="inline-flex items-center space-x-1 text-slate-400 font-normal italic">
                          <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                          <span>Masked (Viewer Mode)</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{v.contact || 'No contact'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-550 font-medium">
                      {isViewer ? (
                        <span className="inline-flex items-center space-x-1 text-slate-400 font-normal italic">
                          <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                          <span>Masked (Viewer Mode)</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{v.address || 'No address'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate font-medium">
                      {v.notes}
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
