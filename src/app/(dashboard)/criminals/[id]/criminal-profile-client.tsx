'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Edit3 } from 'lucide-react';
import CreateCriminalModal from '@/components/shared/CreateCriminalModal';

export default function CriminalProfileClient({ criminal, user }: { criminal: any; user: any }) {
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

      {/* Back & Edit row */}
      <div className="flex justify-between items-center">
        <Link
          href="/criminals"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Criminal Index</span>
        </Link>
        {canWrite && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-[var(--color-lavender-border)] bg-white hover:bg-[var(--color-lavender)] text-[var(--color-ink)] rounded-full text-xs font-bold shadow-sm transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Grid Profile sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: Booking Photo & Personal info */}
        <div className="space-y-6">
          <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm text-center space-y-4">
            <div className="w-32 h-32 rounded-xl bg-[var(--color-lavender)] mx-auto flex items-center justify-center border border-[var(--color-lavender-border)] overflow-hidden relative">
              {criminal.photograph_url ? (
                <img src={criminal.photograph_url} alt={criminal.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-[var(--color-ink-soft)]/40" />
              )}
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-[var(--color-ink)]">{criminal.full_name}</h2>
              {criminal.alias && (
                <p className="text-xs font-semibold text-[var(--color-ink-soft)]/70 italic">Alias: {criminal.alias}</p>
              )}
            </div>

            <span className={`inline-block text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${getStatusColor(criminal.status)}`}>
              Status: {criminal.status}
            </span>
          </div>

          <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest border-b border-[var(--color-lavender-border)] pb-2">
              Personal Information
            </h3>
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase">Gender</span>
                <span className="text-[var(--color-ink)] capitalize">{criminal.gender}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase">Date of Birth</span>
                <span className="text-[var(--color-ink)]">{new Date(criminal.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase">Last Known Residential Address</span>
                <span className="text-[var(--color-ink)] leading-5">{criminal.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Case list history & Identifiers */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest border-b border-[var(--color-lavender-border)] pb-3">
              Identification Marks & Priors
            </h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase font-bold tracking-wider mb-0.5">Physical Identifiers</span>
                <p className="text-[var(--color-ink-soft)] font-medium leading-5">{criminal.identification_details || 'No specific physical identification marks logged.'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase font-bold tracking-wider mb-0.5">Case History Notes</span>
                <p className="text-[var(--color-ink-soft)] font-medium leading-5">{criminal.notes || 'No general notes compiled.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest border-b border-[var(--color-lavender-border)] pb-3">
              Linked Case History Files
            </h3>

            <div className="space-y-3">
              {criminal.cases?.length === 0 ? (
                <div className="text-center py-6 text-[var(--color-ink-soft)]/60 text-xs font-medium">
                  No cases linked to this criminal in the registry database.
                </div>
              ) : (
                criminal.cases.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-[var(--color-lavender-border)] bg-[var(--color-lavender)]/50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/cases/${c.id}`} className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline text-xs font-mono">
                          {c.case_number}
                        </Link>
                        <span className="text-[var(--color-ink-soft)]/60 text-[10px]">•</span>
                        <span className="text-xs font-bold text-[var(--color-ink-soft)]">{c.crime_type}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--color-ink-soft)]/70 mt-1 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Incident: {new Date(c.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border rounded-full ${
                        c.relationship_status === 'convicted' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[var(--color-saffron)]/10 text-[var(--color-saffron)] border-[var(--color-saffron)]/30'
                      }`}>
                        Charged: {c.relationship_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Modal */}
      <CreateCriminalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={criminal} />

    </div>
  );
}
