'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { createCriminalAction, updateCriminalAction } from '@/app/(dashboard)/criminals/actions';

export default function CreateCriminalModal({ 
  isOpen, 
  onClose, 
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  initialData?: any;
}) {
  const [fullName, setFullName] = useState('');
  const [alias, setAlias] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('1990-01-01');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('suspect');
  const [identifiers, setIdentifiers] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setAlias(initialData.alias || '');
      setGender(initialData.gender || 'male');
      
      if (initialData.date_of_birth) {
        setDob(new Date(initialData.date_of_birth).toISOString().split('T')[0]);
      }
      
      setAddress(initialData.address || '');
      setStatus(initialData.status || 'suspect');
      setIdentifiers(initialData.identification_details || '');
      setNotes(initialData.notes || '');
    } else {
      setFullName('');
      setAlias('');
      setGender('male');
      setDob('1990-01-01');
      setAddress('');
      setStatus('suspect');
      setIdentifiers('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      full_name: fullName,
      alias,
      gender,
      date_of_birth: dob,
      address,
      status,
      identification_details: identifiers,
      notes
    };

    let res;
    if (initialData?.id) {
      res = await updateCriminalAction(initialData.id, payload);
    } else {
      res = await createCriminalAction(payload);
    }

    if (res.success) {
      onClose();
      window.location.reload();
    } else {
      setError(res.error || 'Failed to save criminal profile');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-stone-500" />
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              {initialData ? 'Update Criminal Profile' : 'Create Criminal Profile'}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-stone-700 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-stone-400 uppercase font-bold">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-stone-400 uppercase font-bold">Alias / Moniker</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g. Chhotu"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-stone-400 uppercase font-bold">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-stone-400 uppercase font-bold">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-stone-400 uppercase font-bold">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:border-amber-600 cursor-pointer"
            >
              <option value="suspect">Suspect</option>
              <option value="accused">Accused</option>
              <option value="wanted">Wanted / Fugitive</option>
              <option value="convicted">Convicted</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-stone-400 uppercase font-bold">Last Known Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Block C, Sector-12, Noida, UP"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-stone-400 uppercase font-bold">Identification Details</label>
            <input
              type="text"
              value={identifiers}
              onChange={(e) => setIdentifiers(e.target.value)}
              placeholder="e.g. Burn scar on left forearm, height 5ft 9in"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-stone-400 uppercase font-bold">Narrative Profile Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key notes or case histories..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 h-20 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
