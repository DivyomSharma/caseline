'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  FileText, 
  User, 
  Activity, 
  FolderLock, 
  Clock, 
  MapPin, 
  AlertCircle, 
  PlusCircle, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  X,
  FileCheck2,
  FileQuestion,
  UserX,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { logInvestigationAction, addEvidenceAction, updateCaseDetailsAction } from './actions';

interface CaseDetailProps {
  c: any; // case details joined
  currentUser: any;
  officers: any[];
  stations: any[];
}

export default function CaseDetailClient({ c, currentUser, officers = [], stations = [] }: CaseDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'people' | 'investigations' | 'evidence' | 'timeline'>('overview');
  
  // Modals state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [priority, setPriority] = useState(c.priority);
  const [status, setStatus] = useState(c.status);
  const [description, setDescription] = useState(c.description || '');
  const [location, setLocation] = useState(c.location || '');
  const [assignedOfficerId, setAssignedOfficerId] = useState(c.assigned_officer_id || '');

  const canWrite = currentUser?.role === 'admin' || currentUser?.role === 'officer';

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await updateCaseDetailsAction(c.id, {
      priority,
      status,
      description,
      location,
      assigned_officer_id: assignedOfficerId
    });

    if (res.success) {
      setEditModalOpen(false);
      setLoading(false);
      window.location.reload();
    } else {
      setError(res.error || 'Failed to update case details');
      setLoading(false);
    }
  };

  // Auto file suggestion for mock evidence
  const [evidenceFile, setEvidenceFile] = useState('doc_report_copy.pdf');

  const handleLogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('case_id', c.id);
    formData.set('officer_id', c.assigned_officer_id || '');

    try {
      const res = await logInvestigationAction(null, formData);
      if (res && !res.success) {
        setError(res.error || 'Failed to submit log.');
        setLoading(false);
      } else {
        setLogModalOpen(false);
        setLoading(false);
        // Refresh page natively or via state
        window.location.reload();
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred.');
      setLoading(false);
    }
  };

  const handleEvidenceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('case_id', c.id);
    formData.set('collected_by', c.assigned_officer_id || '');
    formData.set('file_url', `/demo-evidence/${evidenceFile}`);

    try {
      const res = await addEvidenceAction(null, formData);
      if (res && !res.success) {
        setError(res.error || 'Failed to upload evidence.');
        setLoading(false);
      } else {
        setEvidenceModalOpen(false);
        setLoading(false);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred.');
      setLoading(false);
    }
  };

  const getStatusBadge = (s: string) => {
    const label = s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    switch (s) {
      case 'registered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">{label}</span>;
      case 'under_investigation':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">{label}</span>;
      case 'suspect_identified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">{label}</span>;
      case 'chargesheet_filed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">{label}</span>;
      case 'solved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{label}</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{label}</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">Low Priority</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">Medium Priority</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">High Priority</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 border border-red-100">Critical Priority</span>;
    }
  };

  const isViewer = currentUser?.role === 'viewer';

  return (
    <div className="space-y-6">
      
      {/* 1. Header Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
              <span>{c.crime_type}</span>
              <span>•</span>
              <span className="text-slate-500">Linked: {c.firs?.[0]?.fir_number || 'No FIR'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono mt-1">
              {c.case_number}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getPriorityBadge(c.priority)}
            {getStatusBadge(c.status)}
            {!isViewer && (
              <button
                onClick={() => setLogModalOpen(true)}
                className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Update / Change Status</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tabs Switcher */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 -mb-px">
          {[
            { id: 'overview', label: 'Case Overview', icon: Briefcase },
            { id: 'people', label: 'Involved Persons', icon: User },
            { id: 'investigations', label: 'Investigation Logs', icon: Activity },
            { id: 'evidence', label: 'Evidence Chest', icon: FolderLock },
            { id: 'timeline', label: 'Audit History', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-semibold text-xs tracking-wider uppercase transition-all ${
                  active 
                    ? 'border-slate-900 text-slate-900 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Tab Contents */}
      <div className="space-y-6">
        
        {/* A. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Case Narrative Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Incident Narrative Details
                  </h3>
                  {canWrite && (
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="text-indigo-650 hover:text-indigo-850 text-[10px] font-bold uppercase tracking-wider hover:underline"
                    >
                      Edit Case Details
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-6 whitespace-pre-line font-medium">
                  {c.description || 'No descriptive statement has been logged for this case register.'}
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
                  Location & Time Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Incident Location</div>
                    <div className="text-slate-800 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.location}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Incident Occurrence Date</div>
                    <div className="text-slate-800 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(c.incident_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Incident Time Frame</div>
                    <div className="text-slate-800 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.incident_time || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Command Info Card */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
                  Precinct Assignment
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Precinct Station</span>
                    <span className="font-extrabold text-slate-800">{c.police_stations?.name || 'Unassigned Precinct'}</span>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5 uppercase">Code: {c.police_stations?.station_code || 'N/A'}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Investigating Officer</span>
                    {c.officers ? (
                      <div>
                        <span className="font-extrabold text-slate-800">{c.officers.rank} {c.officers.profiles?.full_name}</span>
                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Badge ID: {c.officers.badge_number}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No assigned officer</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* B. People Tab */}
        {activeTab === 'people' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Complainants / Victims list */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
                Complainants / Victims Directory
              </h3>
              
              <div className="space-y-3">
                {c.case_victims?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-medium">
                    No victim records registered.
                  </div>
                ) : (
                  c.case_victims.map((item: any, idx: number) => {
                    const vic = item.victims;
                    if (!vic) return null;
                    return (
                      <div key={vic.id || idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-800 text-xs">{vic.full_name}</span>
                          <span className="text-[8px] bg-slate-150 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Victim</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 flex flex-col space-y-1">
                          <span className="flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{isViewer ? 'Obfuscated (Viewer Mode)' : vic.contact || 'No contact'}</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{isViewer ? 'Obfuscated (Viewer Mode)' : vic.address || 'No address'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Suspects / Criminals list */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
                Accused / Suspects Directory
              </h3>
              
              <div className="space-y-3">
                {c.case_criminals?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-medium">
                    No suspects identified or linked to this case file yet.
                  </div>
                ) : (
                  c.case_criminals.map((crim: any, idx: number) => (
                    <div key={crim.id || idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/criminals/${crim.id}`} className="font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline text-xs">
                            {crim.full_name}
                          </Link>
                          {crim.alias && (
                            <span className="text-[9px] font-medium text-slate-400 italic">({crim.alias})</span>
                          )}
                        </div>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1">
                          Status: {crim.status} | Marks: {crim.identification_details || 'None'}
                        </p>
                      </div>
                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        crim.relationship_status === 'convicted' 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {crim.relationship_status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* C. Investigations Tab */}
        {activeTab === 'investigations' && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Investigator Action Logs
              </h3>
              {!isViewer && (
                <button
                  onClick={() => setLogModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Investigation Log</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {c.investigations?.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  No active logs entered by the investigator yet.
                </div>
              ) : (
                c.investigations.map((inv: any) => (
                  <div key={inv.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Log Type</span>
                        <div className="text-xs font-extrabold text-slate-800 mt-0.5">{inv.update_type}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Logged On</span>
                        <span className="text-[10px] font-semibold text-slate-600 block">{new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-5 border-t border-slate-100/50 pt-2">
                      {inv.notes}
                    </p>
                    {inv.next_action && (
                      <div className="text-[10px] bg-indigo-55/10 text-indigo-700 font-semibold p-2 rounded-lg border border-indigo-100/20">
                        <span className="font-extrabold">Next Action Planned:</span> {inv.next_action}
                      </div>
                    )}
                    <div className="text-[9px] text-slate-400 font-bold text-right">
                      Reporter: {inv.officers?.rank || 'Inspector'} {inv.officers?.profiles?.full_name || 'Staff'}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* D. Evidence Chest Tab */}
        {activeTab === 'evidence' && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Evidence Repository chest
              </h3>
              {!isViewer && (
                <button
                  onClick={() => setEvidenceModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit Evidence</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {c.evidence?.length === 0 ? (
                <div className="col-span-full text-center py-8 text-xs text-slate-400 font-medium">
                  No evidence deposits logged to this Case file database yet.
                </div>
              ) : (
                c.evidence.map((ev: any) => (
                  <div key={ev.id} className="border border-slate-150 rounded-xl p-4 bg-slate-50/20 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {ev.evidence_type}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${
                        ev.status === 'verified' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ev.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 font-bold truncate">{ev.description}</p>
                    
                    <div className="text-[10px] text-slate-400 space-y-1 font-semibold border-t border-slate-100 pt-2">
                      <div>Locker Location: {ev.storage_location}</div>
                      <div>Depository: {new Date(ev.collected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>

                    <div className="bg-slate-100 hover:bg-slate-200 cursor-pointer p-2 rounded text-[10px] text-center text-indigo-600 font-extrabold tracking-wide border border-slate-200">
                      Download Deposit File ({ev.file_url.split('/').pop()})
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* E. Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
              Case State Audit timeline
            </h3>

            <div className="relative border-l border-slate-100 ml-3.5 pl-6 space-y-6">
              {c.case_updates?.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No automated timeline entries.
                </div>
              ) : (
                c.case_updates.map((up: any) => (
                  <div key={up.id} className="relative">
                    <div className="absolute -left-10 top-0.5 bg-slate-900 border border-slate-800 w-3 h-3 rounded-full flex items-center justify-center ring-4 ring-white" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">{up.title}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{up.description}</p>
                      <span className="text-[8px] font-bold text-slate-400 block mt-1 uppercase">
                        Audited on {new Date(up.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} by {up.profiles?.full_name || 'Staff'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

      {/* 4. MODALS */}

      {/* A. LOG UPDATE MODAL */}
      {logModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Log Investigation Update
              </h3>
              <button onClick={() => setLogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleLogSubmit} className="p-5 space-y-4">
              {error && <div className="text-xs bg-red-50 text-red-700 p-2 rounded font-bold border border-red-200">{error}</div>}
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Investigation Log Type *
                </label>
                <select
                  name="update_type"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Initial Investigation">Initial Investigation</option>
                  <option value="Witness Interview">Witness Interview</option>
                  <option value="Evidence Collection">Evidence Collection</option>
                  <option value="Suspect Identification">Suspect Identification</option>
                  <option value="Interrogation">Interrogation</option>
                  <option value="Document Verification">Document Verification</option>
                  <option value="Field Investigation">Field Investigation</option>
                  <option value="Final Review">Final Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Change Case status
                </label>
                <select
                  name="case_status"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="">Keep current ({c.status})</option>
                  <option value="under_investigation">Under Investigation</option>
                  <option value="suspect_identified">Suspect Identified</option>
                  <option value="chargesheet_filed">Chargesheet Filed</option>
                  <option value="solved">Solved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Investigation update narrative *
                </label>
                <textarea
                  name="notes"
                  required
                  rows={4}
                  placeholder="Explain details of witness interviews, suspect alibis, or coordinates surveyed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Next Action Planned
                </label>
                <input
                  type="text"
                  name="next_action"
                  placeholder="e.g. Schedule forensic sweep of the vehicle"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Saving...' : 'Save Log'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* B. ADD EVIDENCE MODAL */}
      {evidenceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Deposit Evidence Material
              </h3>
              <button onClick={() => setEvidenceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleEvidenceSubmit} className="p-5 space-y-4">
              {error && <div className="text-xs bg-red-50 text-red-700 p-2 rounded font-bold border border-red-200">{error}</div>}
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Evidence Type *
                </label>
                <select
                  name="evidence_type"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Document">Document</option>
                  <option value="Photograph">Photograph</option>
                  <option value="Video">Video</option>
                  <option value="Physical Evidence">Physical Evidence</option>
                  <option value="Digital Evidence">Digital Evidence</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Evidence Label / Description *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. CCTV Camera backup file from entry locker"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Storage Vault Location Locker *
                </label>
                <input
                  type="text"
                  name="storage_location"
                  required
                  placeholder="e.g. Precinct Locker Vault Room C, Shelf 4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="border border-dashed border-slate-200 p-4 rounded-lg flex flex-col items-center justify-center bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Secure File Attachment</span>
                <span className="text-[9px] text-slate-500 mt-1 font-semibold">Virtual Attachment Path: /demo-evidence/{evidenceFile}</span>
                
                <div className="mt-3 flex space-x-2 w-full">
                  <input
                    type="text"
                    value={evidenceFile}
                    onChange={(e) => setEvidenceFile(e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded px-2.5 py-1 text-[11px] font-mono"
                  />
                  <span className="text-[10px] bg-slate-200 hover:bg-slate-350 cursor-pointer font-bold px-3 py-1.5 rounded shrink-0 self-center">Browse</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEvidenceModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Uploading...' : 'Link Evidence'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Case Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-slate-555" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Modify Case Details</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-655">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-705 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold">Case Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold">Case Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="registered">Registered</option>
                    <option value="under_investigation">Under Investigation</option>
                    <option value="suspect_identified">Suspect Identified</option>
                    <option value="chargesheet_filed">Chargesheet Filed</option>
                    <option value="solved">Solved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">Incident Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">Assigned Investigator</label>
                <select
                  value={assignedOfficerId}
                  onChange={(e) => setAssignedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {officers.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.profiles?.full_name} ({o.badge_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">Incident Description Narrative</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 h-28 resize-none font-sans font-medium"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-slate-200 rounded-lg text-xs font-bold text-slate-550 hover:bg-slate-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
