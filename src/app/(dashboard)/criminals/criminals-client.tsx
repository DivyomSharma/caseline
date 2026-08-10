'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Search, Eye, PlusCircle } from 'lucide-react';
import CreateCriminalModal from '@/components/shared/CreateCriminalModal';

export default function CriminalsClient({ criminals, search, user }: { criminals: any[]; search: string; user: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canWrite = user?.role === 'admin' || user?.role === 'officer';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'wanted': return 'bg-red-50 text-red-700 border-red-200';
      case 'convicted': return 'bg-slate-900 text-white border-slate-950';
      case 'accused': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Criminal Records Index</h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Fictional offender database including aliases, statuses, and identifiers.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Criminal</span>
          </button>
        )}
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
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-850 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criminals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-slate-400 font-medium bg-white border border-slate-200 rounded-xl p-8">
            No criminal records found. Register criminals via this index page or link suspects to case folders.
          </div>
        ) : (
          criminals.map((c: any) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800">{c.full_name}</h3>
                  {c.alias && (
                    <span className="text-[10px] font-semibold text-slate-450 italic">Alias: "{c.alias}"</span>
                  )}
                </div>
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
              </div>

              <div className="text-[10px] text-slate-555 font-semibold space-y-1">
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
          ))
        )}
      </div>

      {/* Creation Modal */}
      <CreateCriminalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}
