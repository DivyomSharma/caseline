'use client';

import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { createOfficerAction } from '@/app/(dashboard)/officers/actions';

export default function CreateOfficerModal({ isOpen, onClose, stations }: { isOpen: boolean; onClose: () => void; stations: any[] }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [badge, setBadge] = useState('');
  const [rank, setRank] = useState('Sub-Inspector');
  const [stationId, setStationId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (stations.length > 0 && !stationId) {
      setStationId(stations[0].id);
    }
  }, [stations, stationId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createOfficerAction({
      full_name: fullName,
      email,
      badge_number: badge.toUpperCase(),
      rank,
      station_id: stationId,
      phone
    });

    if (res.success) {
      onClose();
      window.location.reload();
    } else {
      setError(res.error || 'Failed to create officer');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Enroll Officer Account</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-650">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 uppercase">Officer Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sub-Inspector Rohit Sharma"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rohit.sharma@caseline.gov"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 uppercase">Badge Number</label>
              <input
                type="text"
                required
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. PS-INS-205"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 uppercase">Rank Designation</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="Inspector">Inspector</option>
                <option value="Sub-Inspector">Sub-Inspector</option>
                <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                <option value="Head Constable">Head Constable</option>
                <option value="Constable">Constable</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 uppercase">Assigned Precinct</label>
              {stations.length === 0 ? (
                <div className="py-2 text-[11px] text-amber-600 italic">Please create a station first!</div>
              ) : (
                <select
                  required
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>{s.station_code} - {s.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 uppercase">Contact Phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91-9988776655"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
            />
          </div>

          <p className="text-[10px] text-slate-400 italic">
            Note: Enrolling an officer automatically grants login access with password <b>password123</b>.
          </p>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || stations.length === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? 'Enrolling...' : 'Enroll Officer'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
