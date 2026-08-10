import { getCriminals } from '@/lib/supabase/db';
import Link from 'next/link';
import { ShieldAlert, Search, Eye, AlertTriangle } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function CriminalsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const criminals = await getCriminals(search);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Criminal Records Index</h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Fictional offender database including aliases, statuses, and identifiers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center">
        <form className="relative flex-1" method="GET" action="/criminals">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by full name, alias, booking details..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criminals.length === 0 ? (
          <div className="col-span-full text-center py-8 text-xs text-slate-400 font-medium">
            No criminal records matched the search term.
          </div>
        ) : (
          criminals.map((c: any) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case 'wanted': return 'bg-red-50 text-red-700 border-red-200';
                case 'convicted': return 'bg-slate-900 text-white border-slate-950';
                case 'accused': return 'bg-amber-50 text-amber-700 border-amber-200';
                default: return 'bg-slate-50 text-slate-700 border-slate-200';
              }
            };
            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">{c.full_name}</h3>
                    {c.alias && (
                      <span className="text-[10px] font-semibold text-slate-400 italic">Alias: "{c.alias}"</span>
                    )}
                  </div>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 font-semibold space-y-1">
                  <div>Date of Birth: {new Date(c.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div className="truncate">Identifiers: {c.identification_details || 'None logged'}</div>
                </div>

                <Link
                  href={`/criminals/${c.id}`}
                  className="w-full text-center inline-flex items-center justify-center space-x-1.5 border border-slate-200 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs shadow-sm transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Booking Sheet</span>
                </Link>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
