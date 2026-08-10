'use client';

import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import { createVictimAction } from '@/app/(dashboard)/victims/actions';

export default function CreateVictimModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createVictimAction({
      full_name: fullName,
      contact,
      address,
      notes
    });

    if (res.success) {
      onClose();
      window.location.reload();
    } else {
      setError(res.error || 'Failed to create victim record');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Register Complainant / Victim</h3>
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
            <label className="block text-[10px] text-slate-400 uppercase font-bold">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amit Sen"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 uppercase font-bold">Contact Phone</label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. +91-9876501234"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 uppercase font-bold">Residential Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Flat 402, Sector-6, Dwarka, New Delhi"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 uppercase font-bold">Case Log Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key incident reporting details or specific notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 h-20 resize-none"
            />
          </div>

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
              disabled={loading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
