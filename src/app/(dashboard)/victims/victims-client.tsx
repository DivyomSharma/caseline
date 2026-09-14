'use client';

import React, { useState } from 'react';
import { Search, Phone, MapPin, Calendar, Lock, PlusCircle } from 'lucide-react';
import CreateVictimModal from '@/components/shared/CreateVictimModal';

export default function VictimsClient({ victims, search, user }: { victims: any[]; search: string; user: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isViewer = user?.role === 'viewer';
  const canWrite = user?.role === 'admin' || user?.role === 'officer';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Complainants & Victims Registry</h1>
          <p className="text-stone-500 text-[11px] mt-0.5">
            General index of complainants, reporters, and victims registered across active dockets.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Complainant</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex items-center">
        <form className="relative flex-1" method="GET" action="/victims">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by full name, registration location..."
            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-stone-855 placeholder:text-stone-400 focus:outline-none focus:border-amber-500"
          />
        </form>
      </div>

      {/* Table grid directory */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Residential Address</th>
                <th className="py-3 px-4">Date Registered</th>
                <th className="py-3 px-4">File Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {victims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400 font-medium">
                    No victim records found. Register complainants via this directory or register new FIRs.
                  </td>
                </tr>
              ) : (
                victims.map((v: any) => (
                  <tr key={v.id} className="hover:bg-stone-50/60 transition-all">
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      {v.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-semibold font-mono">
                      {isViewer ? (
                        <span className="inline-flex items-center space-x-1 text-stone-400 font-normal italic">
                          <Lock className="w-3 h-3 text-stone-300 shrink-0" />
                          <span>Masked (Viewer Mode)</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{v.contact || 'No contact'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-550 font-medium">
                      {isViewer ? (
                        <span className="inline-flex items-center space-x-1 text-stone-400 font-normal italic">
                          <Lock className="w-3 h-3 text-stone-300 shrink-0" />
                          <span>Masked (Viewer Mode)</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{v.address || 'No address'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate font-medium">
                      {v.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <CreateVictimModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}
