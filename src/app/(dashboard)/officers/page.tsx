import { getOfficers } from '@/lib/supabase/db';
import { UserCheck, ShieldAlert, Phone, ShieldCheck, Mail, Calendar } from 'lucide-react';

export default async function OfficersPage() {
  const officers = await getOfficers();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Officers Register</h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Directory of precinct investigators, commanding officers, and active staff.
        </p>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Officer badge</th>
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Rank Designation</th>
                <th className="py-3 px-4">Precinct station</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {officers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No officers registered in system.
                  </td>
                </tr>
              ) : (
                officers.map((o: any) => {
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'active':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">On Duty</span>;
                      case 'on_leave':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">On Leave</span>;
                      case 'suspended':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-100">Suspended</span>;
                      default:
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-250">Inactive</span>;
                    }
                  };
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-800 font-mono tracking-tight">
                        {o.badge_number}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {o.profiles?.full_name || 'Staff User'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-650 flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                        <span>{o.rank}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-bold uppercase">
                        {o.police_stations?.station_code || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        <div className="flex flex-col space-y-0.5">
                          <span className="flex items-center space-x-1 text-slate-600 font-semibold font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{o.phone || 'No phone'}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold font-mono">
                            <Mail className="w-3 h-3 text-slate-350 shrink-0" />
                            <span>{o.profiles?.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(o.joining_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(o.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
