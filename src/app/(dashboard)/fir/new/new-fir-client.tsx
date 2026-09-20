'use client';

import React, { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createFIRAction } from '../actions';
import { FileText, User, Shield, Clock, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface NewFirClientProps {
  stations: any[];
  officers: any[];
}

export default function NewFirClient({ stations, officers }: NewFirClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate a random suggestion for FIR number
  const [firNumber, setFirNumber] = useState(() => {
    return `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('fir_number', firNumber); // Make sure generated code is passed

    try {
      const res = await createFIRAction(null, formData);
      if (res && !res.success) {
        setError(res.error || 'Failed to register FIR.');
        setLoading(false);
      } else if (res && res.success && res.caseId) {
        // Redirect to case details
        router.push(`/cases/${res.caseId}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">FIR Registry</h1>
        <p className="text-[var(--color-ink-soft)]/80 text-[11px] mt-0.5">
          First Information Report logging wizard. Generates case files & initiates investigative logs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start space-x-3 text-xs font-semibold">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Incident Details & Narrative */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section A: FIR Identification */}
            <div className="bg-white border border-[var(--color-lavender-border)] rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest flex items-center space-x-2 border-b border-[var(--color-lavender-border)] pb-3">
                <FileText className="w-4 h-4 text-[var(--color-ink-soft)]/60" />
                <span>1. Incident Classification & ID</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    FIR Registry ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={firNumber}
                    onChange={(e) => setFirNumber(e.target.value)}
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <span className="text-[9px] text-[var(--color-ink-soft)]/60 mt-1 block">Autocreated code template. Override if manual docket matches.</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Crime Category *
                  </label>
                  <select
                    name="crime_type"
                    required
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select Category</option>
                    <option value="Theft">Theft</option>
                    <option value="Burglary">Burglary</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Cyber Crime">Cyber Crime</option>
                    <option value="Assault">Assault</option>
                    <option value="Missing Person">Missing Person</option>
                    <option value="Property Dispute">Property Dispute</option>
                    <option value="Vehicle Theft">Vehicle Theft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Date of Occurrence *
                  </label>
                  <input
                    type="date"
                    name="incident_date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Time of Occurrence *
                  </label>
                  <input
                    type="time"
                    name="incident_time"
                    required
                    defaultValue="12:00"
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Occurrence Coordinates / Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. Sector 18 Market area"
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Complaint narrative */}
            <div className="bg-white border border-[var(--color-lavender-border)] rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest flex items-center space-x-2 border-b border-[var(--color-lavender-border)] pb-3">
                <Clock className="w-4 h-4 text-[var(--color-ink-soft)]/60" />
                <span>2. Statement & Narrative details</span>
              </h3>
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                  Verbatim Complaint Description *
                </label>
                <textarea
                  name="complaint_description"
                  required
                  rows={6}
                  placeholder="Record the official description of the incident, specifying dates, names, property details, and chronology..."
                  className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2.5 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-ink-soft)]/60"
                />
              </div>
            </div>

          </div>

          {/* Column 3: Complainant Info & Investigation Assignment */}
          <div className="space-y-6">
            
            {/* Section C: Complainant Details */}
            <div className="bg-white border border-[var(--color-lavender-border)] rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest flex items-center space-x-2 border-b border-[var(--color-lavender-border)] pb-3">
                <User className="w-4 h-4 text-[var(--color-ink-soft)]/60" />
                <span>3. Complainant Profile</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="complainant_name"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    name="complainant_contact"
                    required
                    placeholder="e.g. +91-9988776655"
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Residential Address *
                  </label>
                  <textarea
                    name="complainant_address"
                    required
                    rows={3}
                    placeholder="Residential address details..."
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Section D: Assignment & Station */}
            <div className="bg-white border border-[var(--color-lavender-border)] rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest flex items-center space-x-2 border-b border-[var(--color-lavender-border)] pb-3">
                <Shield className="w-4 h-4 text-[var(--color-ink-soft)]/60" />
                <span>4. Case Routing & Priority</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Police Station Precinct *
                  </label>
                  <select
                    name="station_id"
                    required
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select Station</option>
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.station_code} - {st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Assigned Officer *
                  </label>
                  <select
                    name="assigned_officer_id"
                    required
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select Officer</option>
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>{o.rank} {o.profiles?.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">
                    Case Threat Priority *
                  </label>
                  <select
                    name="priority"
                    required
                    className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submission buttons */}
            <div className="flex space-x-3">
              <Link
                href="/cases"
                className="w-1/3 flex justify-center items-center py-2.5 px-4 border border-[var(--color-lavender-border)] rounded-full text-xs font-bold text-[var(--color-ink-soft)]/80 hover:bg-[var(--color-lavender)] bg-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Registering...' : (
                  <div className="flex items-center space-x-2">
                    <span>Register Case</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>

          </div>

        </div>
      </form>

    </div>
  );
}
