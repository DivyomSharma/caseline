'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldAlert, Phone, ShieldCheck, Mail, Calendar, PlusCircle } from 'lucide-react';
import CreateOfficerModal from '@/components/shared/CreateOfficerModal';

export default function OfficersClient({ officers, stations, user }: { officers: any[]; stations: any[]; user: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">On Duty</span>;
      case 'on_leave':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--color-saffron)]/10 text-[var(--color-saffron)] border border-[var(--color-saffron)]/30">On Leave</span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-100">Suspended</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--color-lavender)] text-[var(--color-ink-soft)] border border-[var(--color-lavender-border)]">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">Active Officers Register</h1>
          <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
            Directory of precinct investigators, commanding officers, and active staff.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enroll Officer</span>
          </button>
        )}
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-lavender)]/70 border-b border-[var(--color-lavender-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]/70">
                <th className="py-3 px-4">Officer badge</th>
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Rank Designation</th>
                <th className="py-3 px-4">Precinct station</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-lavender-border)] text-xs">
              {officers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-ink-soft)]/70 font-medium">
                    No officers registered in system. Log in as Administrator (Divyom/Samar) to enroll the first officer.
                  </td>
                </tr>
              ) : (
                officers.map((o: any) => (
                  <tr key={o.id} className="hover:bg-[var(--color-lavender)]/60 transition-all">
                    <td className="py-3.5 px-4 font-bold text-[var(--color-ink)] font-mono tracking-tight">
                      {o.badge_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[var(--color-ink)]">
                      {o.profiles?.full_name || 'Staff User'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--color-ink-soft)] flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-ink-soft)]/70 shrink-0" />
                      <span>{o.rank}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-ink-soft)] font-bold uppercase">
                      {o.police_stations?.station_code || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-ink-soft)] font-medium">
                      <div className="flex flex-col space-y-0.5">
                        <span className="flex items-center space-x-1 text-[var(--color-ink-soft)] font-semibold font-mono">
                          <Phone className="w-3.5 h-3.5 text-[var(--color-ink-soft)]/70 shrink-0" />
                          <span>{o.phone || 'No phone'}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-[10px] text-[var(--color-ink-soft)]/70 font-semibold font-mono">
                          <Mail className="w-3 h-3 text-[var(--color-ink-soft)]/60 shrink-0" />
                          <span>{o.profiles?.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-ink-soft)] font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-ink-soft)]/70" />
                        <span>{new Date(o.joining_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(o.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <CreateOfficerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stations={stations} />

    </div>
  );
}
