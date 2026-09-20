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
      case 'convicted': return 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]';
      case 'accused': return 'bg-[var(--color-saffron)]/10 text-[var(--color-saffron)] border-[var(--color-saffron)]/30';
      default: return 'bg-[var(--color-lavender)] text-[var(--color-ink-soft)] border-[var(--color-lavender-border)]';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">Criminal Records Index</h1>
          <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
            Master index of registered offender profiles, aliases, physical markers, and legal statuses.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Criminal</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl p-4 shadow-sm flex items-center">
        <form className="relative flex-1" method="GET" action="/criminals">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-ink-soft)]/60" />
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by full name, alias, booking details..."
            className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-full pl-9 pr-4 py-2.5 text-xs text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]/50 focus:outline-none focus:border-[var(--color-primary)]"
          />
        </form>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criminals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-[var(--color-ink-soft)]/60 font-medium bg-white border border-[var(--color-lavender-border)] rounded-2xl p-8">
            No criminal records found. Register criminals via this index page or link suspects to case folders.
          </div>
        ) : (
          criminals.map((c: any) => (
            <div key={c.id} className="bg-white border border-[var(--color-lavender-border)] rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start space-x-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-lavender)]">
                  {c.photograph_url && (
                    <img src={c.photograph_url} alt={c.full_name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-extrabold text-[var(--color-ink)]">{c.full_name}</h3>
                  {c.alias && (
                    <span className="text-[10px] font-semibold text-[var(--color-ink-soft)]/70 italic">Alias: "{c.alias}"</span>
                  )}
                </div>
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
              </div>

              <div className="text-[10px] text-[var(--color-ink-soft)] font-semibold space-y-1">
                <div>Date of Birth: {new Date(c.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="truncate">Identifiers: {c.identification_details || 'None logged'}</div>
              </div>

              <Link
                href={`/criminals/${c.id}`}
                className="w-full text-center inline-flex items-center justify-center space-x-1.5 border border-[var(--color-lavender-border)] hover:border-[var(--color-primary)] bg-[var(--color-lavender)]/20 hover:bg-[var(--color-lavender)] text-[var(--color-ink-soft)] font-bold px-3 py-2 rounded-full text-xs shadow-sm transition-all"
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
