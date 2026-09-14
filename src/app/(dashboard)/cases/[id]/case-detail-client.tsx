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
  Phone,
  Scale,
  ExternalLink,
  Gavel,
  MessageSquareWarning,
  Network
} from 'lucide-react';
import Link from 'next/link';
import { logInvestigationAction, addEvidenceAction, updateCaseDetailsAction, linkCaseSectionAction, createCourtCaseAction, addHearingAction, addStatementAction } from './actions';
import type { LegalSection } from '@/lib/legal-sections';
import { DELHI_COURT_COMPLEXES } from '@/lib/delhi-org';
import { findStatementDiscrepancies } from '@/lib/statement-intel';
import CaseNetworkGraph from './CaseNetworkGraph';

interface CaseDetailProps {
  c: any; // case details joined
  currentUser: any;
  officers: any[];
  stations: any[];
  linkedSections?: LegalSection[];
  allSections?: LegalSection[];
  courtCase?: any;
  statements?: any[];
}

export default function CaseDetailClient({ c, currentUser, officers = [], stations = [], linkedSections = [], allSections = [], courtCase = null, statements = [] }: CaseDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'people' | 'investigations' | 'evidence' | 'sections' | 'court' | 'statements' | 'network' | 'timeline'>('overview');
  const [sectionToLink, setSectionToLink] = useState('');
  const [linkingSection, setLinkingSection] = useState(false);

  const [courtModalOpen, setCourtModalOpen] = useState(false);
  const [hearingModalOpen, setHearingModalOpen] = useState(false);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [courtForm, setCourtForm] = useState({ court_complex: DELHI_COURT_COMPLEXES[0], cnr_number: '', judge_name: '', next_hearing_date: '', case_status: 'pending' });
  const [hearingForm, setHearingForm] = useState({ hearing_date: '', purpose: '', order_summary: '', next_hearing_date: '' });
  const [statementForm, setStatementForm] = useState({ witness_name: '', statement_text: '', recorded_date: new Date().toISOString().split('T')[0] });
  const [savingCourt, setSavingCourt] = useState(false);

  const discrepancies = findStatementDiscrepancies(statements);
  
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">{label}</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-stone-50 text-stone-600 border border-stone-100">Low Priority</span>;
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
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-extrabold uppercase tracking-widest font-mono">
              <span>{c.crime_type}</span>
              <span>•</span>
              <span className="text-stone-500">Linked: {c.firs?.[0]?.fir_number || 'No FIR'}</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight font-mono mt-1">
              {c.case_number}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getPriorityBadge(c.priority)}
            {getStatusBadge(c.status)}
            {!isViewer && (
              <button
                onClick={() => setLogModalOpen(true)}
                className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Update / Change Status</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tabs Switcher */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-6 -mb-px">
          {[
            { id: 'overview', label: 'Case Overview', icon: Briefcase },
            { id: 'people', label: 'Involved Persons', icon: User },
            { id: 'investigations', label: 'Investigation Logs', icon: Activity },
            { id: 'evidence', label: 'Evidence Chest', icon: FolderLock },
            { id: 'sections', label: 'Legal Sections', icon: Scale },
            { id: 'court', label: 'Court', icon: Gavel },
            { id: 'statements', label: 'Statements', icon: MessageSquareWarning },
            { id: 'network', label: 'Network', icon: Network },
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
                    ? 'border-stone-900 text-stone-900 font-extrabold' 
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
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
              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
                    Incident Narrative Details
                  </h3>
                  {canWrite && (
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="text-amber-600 hover:text-amber-800 text-[10px] font-bold uppercase tracking-wider hover:underline"
                    >
                      Edit Case Details
                    </button>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-6 whitespace-pre-line font-medium">
                  {c.description || 'No descriptive statement has been logged for this case register.'}
                </p>
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-3">
                  Location & Time Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Incident Location</div>
                    <div className="text-stone-800 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{c.location}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Incident Occurrence Date</div>
                    <div className="text-stone-800 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{new Date(c.incident_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Incident Time Frame</div>
                    <div className="text-stone-800 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{c.incident_time || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Command Info Card */}
            <div className="space-y-6">
              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-3">
                  Precinct Assignment
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Precinct Station</span>
                    <span className="font-extrabold text-stone-800">{c.police_stations?.name || 'Unassigned Precinct'}</span>
                    <span className="text-[10px] font-bold text-stone-400 block mt-0.5 uppercase">Code: {c.police_stations?.station_code || 'N/A'}</span>
                  </div>
                  <div className="border-t border-stone-100 pt-3">
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Investigating Officer</span>
                    {c.officers ? (
                      <div>
                        <span className="font-extrabold text-stone-800">{c.officers.rank} {c.officers.profiles?.full_name}</span>
                        <span className="text-[10px] font-bold text-stone-400 block mt-0.5">Badge ID: {c.officers.badge_number}</span>
                      </div>
                    ) : (
                      <span className="text-stone-400 italic">No assigned officer</span>
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
            <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-3">
                Complainants / Victims Directory
              </h3>
              
              <div className="space-y-3">
                {c.case_victims?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-stone-400 font-medium">
                    No victim records registered.
                  </div>
                ) : (
                  c.case_victims.map((item: any, idx: number) => {
                    const vic = item.victims;
                    if (!vic) return null;
                    return (
                      <div key={vic.id || idx} className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-stone-800 text-xs">{vic.full_name}</span>
                          <span className="text-[8px] bg-stone-150 text-stone-600 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Victim</span>
                        </div>
                        <div className="text-[10px] font-semibold text-stone-500 flex flex-col space-y-1">
                          <span className="flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{isViewer ? 'Obfuscated (Viewer Mode)' : vic.contact || 'No contact'}</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
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
            <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-3">
                Accused / Suspects Directory
              </h3>
              
              <div className="space-y-3">
                {c.case_criminals?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-stone-400 font-medium">
                    No suspects identified or linked to this case file yet.
                  </div>
                ) : (
                  c.case_criminals.map((crim: any, idx: number) => (
                    <div key={crim.id || idx} className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/criminals/${crim.id}`} className="font-extrabold text-amber-600 hover:text-amber-800 hover:underline text-xs">
                            {crim.full_name}
                          </Link>
                          {crim.alias && (
                            <span className="text-[9px] font-medium text-stone-400 italic">({crim.alias})</span>
                          )}
                        </div>
                        <p className="text-[10px] font-semibold text-stone-500 mt-1">
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
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
                Investigator Action Logs
              </h3>
              {!isViewer && (
                <button
                  onClick={() => setLogModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Investigation Log</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {c.investigations?.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 font-medium">
                  No active logs entered by the investigator yet.
                </div>
              ) : (
                c.investigations.map((inv: any) => (
                  <div key={inv.id} className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Update Log Type</span>
                        <div className="text-xs font-extrabold text-stone-800 mt-0.5">{inv.update_type}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-stone-400 block uppercase">Logged On</span>
                        <span className="text-[10px] font-semibold text-stone-600 block">{new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 font-medium leading-5 border-t border-stone-100/50 pt-2">
                      {inv.notes}
                    </p>
                    {inv.next_action && (
                      <div className="text-[10px] bg-amber-55/10 text-amber-700 font-semibold p-2 rounded-lg border border-amber-100/20">
                        <span className="font-extrabold">Next Action Planned:</span> {inv.next_action}
                      </div>
                    )}
                    <div className="text-[9px] text-stone-400 font-bold text-right">
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
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
                Evidence Repository chest
              </h3>
              {!isViewer && (
                <button
                  onClick={() => setEvidenceModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit Evidence</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {c.evidence?.length === 0 ? (
                <div className="col-span-full text-center py-8 text-xs text-stone-400 font-medium">
                  No evidence deposits logged to this Case file database yet.
                </div>
              ) : (
                c.evidence.map((ev: any) => (
                  <div key={ev.id} className="border border-stone-150 rounded-xl p-4 bg-stone-50/20 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-stone-100 border border-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                    
                    <p className="text-xs text-stone-600 font-bold truncate">{ev.description}</p>
                    
                    <div className="text-[10px] text-stone-400 space-y-1 font-semibold border-t border-stone-100 pt-2">
                      <div>Locker Location: {ev.storage_location}</div>
                      <div>Depository: {new Date(ev.collected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>

                    <div className="bg-stone-100 hover:bg-stone-200 cursor-pointer p-2 rounded text-[10px] text-center text-amber-600 font-extrabold tracking-wide border border-stone-200">
                      Download Deposit File ({ev.file_url.split('/').pop()})
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Legal Sections Tab */}
        {activeTab === 'sections' && (
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
                BNS Sections Cited
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={sectionToLink}
                  onChange={(e) => setSectionToLink(e.target.value)}
                  className="text-[10px] font-semibold border border-stone-200 rounded-lg px-2 py-1.5"
                >
                  <option value="">Link a section...</option>
                  {allSections
                    .filter((s) => !linkedSections.some((ls) => ls.id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.act} § {s.sectionNumber} — {s.title}
                      </option>
                    ))}
                </select>
                <button
                  disabled={!sectionToLink || linkingSection}
                  onClick={async () => {
                    if (!sectionToLink) return;
                    setLinkingSection(true);
                    await linkCaseSectionAction(c.id, sectionToLink);
                    setSectionToLink('');
                    setLinkingSection(false);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg text-[10px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Link
                </button>
              </div>
            </div>

            {linkedSections.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs">
                No legal sections linked to this case yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {linkedSections.map((s) => (
                  <div key={s.id} className="border border-stone-100 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">{s.act} § {s.sectionNumber}</span>
                      <span className="text-[9px] bg-stone-100 text-stone-500 font-bold px-1.5 py-0.5 rounded uppercase">
                        {s.oldLawAct} § {s.oldLawSection}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">{s.title}</p>
                    <p className="text-xs text-stone-600 leading-4">{s.summary}</p>
                    <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-stone-500 hover:text-stone-800">
                      Verify on India Code <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Court Tab */}
        {activeTab === 'court' && (
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">Court Tracker</h3>
              {courtCase ? (
                <button
                  onClick={() => setHearingModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Hearing
                </button>
              ) : (
                <button
                  onClick={() => setCourtModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Court Case
                </button>
              )}
            </div>

            {!courtCase ? (
              <div className="text-center py-6 text-stone-400 text-xs">
                No court case registered yet. This case has not been sent for trial.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-[9px] font-bold text-stone-400 uppercase">Court Complex</p><p className="font-bold text-stone-800">{courtCase.court_complex}</p></div>
                  <div><p className="text-[9px] font-bold text-stone-400 uppercase">CNR Number</p><p className="font-bold text-stone-800 font-mono">{courtCase.cnr_number || '—'}</p></div>
                  <div><p className="text-[9px] font-bold text-stone-400 uppercase">Judge</p><p className="font-bold text-stone-800">{courtCase.judge_name || '—'}</p></div>
                  <div><p className="text-[9px] font-bold text-stone-400 uppercase">Next Hearing</p><p className="font-bold text-stone-800">{courtCase.next_hearing_date || '—'}</p></div>
                </div>
                <div>
                  <h4 className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider mb-2">Hearing History</h4>
                  {courtCase.hearings?.length === 0 ? (
                    <p className="text-xs text-stone-400">No hearings logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {courtCase.hearings.map((h: any) => (
                        <div key={h.id} className="border border-stone-100 rounded-lg p-3 text-xs">
                          <div className="flex justify-between">
                            <span className="font-bold text-stone-800">{h.hearing_date}</span>
                            <span className="text-stone-400 font-semibold">{h.purpose}</span>
                          </div>
                          {h.order_summary && <p className="text-stone-500 mt-1">{h.order_summary}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statements Tab */}
        {activeTab === 'statements' && (
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">Statement Intelligence</h3>
              <button
                onClick={() => setStatementModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Statement
              </button>
            </div>

            {discrepancies.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wide">
                  {discrepancies.length} potential discrepanc{discrepancies.length === 1 ? 'y' : 'ies'} detected
                </p>
                {discrepancies.map((d, i) => (
                  <p key={i} className="text-xs text-amber-800">
                    {d.type === 'time' ? 'Timeline conflict' : 'Vehicle mismatch'}: <strong>{d.witnessA}</strong> said &ldquo;{d.valueA}&rdquo; vs <strong>{d.witnessB}</strong> said &ldquo;{d.valueB}&rdquo;
                  </p>
                ))}
              </div>
            )}

            {statements.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs">No statements recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {statements.map((s: any) => (
                  <div key={s.id} className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-stone-800">{s.witness_name}</span>
                      <span className="text-[9px] text-stone-400 font-bold uppercase">{s.recorded_date}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-5">{s.statement_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-3 mb-4">
              Entity Relationship Graph
            </h3>
            <CaseNetworkGraph
              caseLabel={c.case_number}
              officer={c.officers ? { id: c.officers.id, label: c.officers.profiles?.full_name || 'Officer', type: 'officer' } : null}
              criminals={(c.case_criminals || []).map((cr: any) => ({ id: cr.id, label: cr.full_name, type: 'criminal', href: `/criminals/${cr.id}` }))}
              victims={(c.case_victims || []).map((cv: any) => ({ id: cv.victims?.id, label: cv.victims?.full_name || 'Victim', type: 'victim' }))}
              evidence={(c.evidence || []).map((e: any) => ({ id: e.id, label: e.evidence_type, type: 'evidence' }))}
            />
          </div>
        )}

        {/* E. Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-3">
              Case State Audit timeline
            </h3>

            <div className="relative border-l border-stone-100 ml-3.5 pl-6 space-y-6">
              {c.case_updates?.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs">
                  No automated timeline entries.
                </div>
              ) : (
                c.case_updates.map((up: any) => (
                  <div key={up.id} className="relative">
                    <div className="absolute -left-10 top-0.5 bg-stone-900 border border-stone-800 w-3 h-3 rounded-full flex items-center justify-center ring-4 ring-white" />
                    <div>
                      <div className="text-xs font-extrabold text-stone-800">{up.title}</div>
                      <p className="text-[10px] text-stone-400 mt-0.5">{up.description}</p>
                      <span className="text-[8px] font-bold text-stone-400 block mt-1 uppercase">
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
        <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
                Log Investigation Update
              </h3>
              <button onClick={() => setLogModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleLogSubmit} className="p-5 space-y-4">
              {error && <div className="text-xs bg-red-50 text-red-700 p-2 rounded font-bold border border-red-200">{error}</div>}
              
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
                  Investigation Log Type *
                </label>
                <select
                  name="update_type"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
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
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
                  Change Case status
                </label>
                <select
                  name="case_status"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500 font-semibold"
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
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
                  Investigation update narrative *
                </label>
                <textarea
                  name="notes"
                  required
                  rows={4}
                  placeholder="Explain details of witness interviews, suspect alibis, or coordinates surveyed..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
                  Next Action Planned
                </label>
                <input
                  type="text"
                  name="next_action"
                  placeholder="e.g. Schedule forensic sweep of the vehicle"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-stone-200 rounded-lg text-xs font-bold text-stone-500 hover:bg-stone-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-all"
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
        <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
                Deposit Evidence Material
              </h3>
              <button onClick={() => setEvidenceModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleEvidenceSubmit} className="p-5 space-y-4">
              {error && <div className="text-xs bg-red-50 text-red-700 p-2 rounded font-bold border border-red-200">{error}</div>}
              
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
                  Evidence Type *
                </label>
                <select
                  name="evidence_type"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
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
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
                  Evidence Label / Description *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. CCTV Camera backup file from entry locker"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
                  Storage Vault Location Locker *
                </label>
                <input
                  type="text"
                  name="storage_location"
                  required
                  placeholder="e.g. Precinct Locker Vault Room C, Shelf 4"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="border border-dashed border-stone-200 p-4 rounded-lg flex flex-col items-center justify-center bg-stone-50">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Secure File Attachment</span>
                <span className="text-[9px] text-stone-500 mt-1 font-semibold">Virtual Attachment Path: /demo-evidence/{evidenceFile}</span>
                
                <div className="mt-3 flex space-x-2 w-full">
                  <input
                    type="text"
                    value={evidenceFile}
                    onChange={(e) => setEvidenceFile(e.target.value)}
                    className="flex-1 bg-white border border-stone-250 rounded px-2.5 py-1 text-[11px] font-mono"
                  />
                  <span className="text-[10px] bg-stone-200 hover:bg-stone-350 cursor-pointer font-bold px-3 py-1.5 rounded shrink-0 self-center">Browse</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEvidenceModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-stone-200 rounded-lg text-xs font-bold text-stone-500 hover:bg-stone-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-all"
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
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-stone-555" />
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Modify Case Details</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-stone-655">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs font-semibold text-stone-705 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-stone-400 uppercase font-bold">Case Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-stone-400 uppercase font-bold">Case Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:border-amber-600 cursor-pointer"
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
                <label className="block text-[10px] text-stone-400 uppercase font-bold">Incident Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 uppercase font-bold">Assigned Investigator</label>
                <select
                  value={assignedOfficerId}
                  onChange={(e) => setAssignedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg focus:outline-none focus:border-amber-600 cursor-pointer"
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
                <label className="block text-[10px] text-stone-400 uppercase font-bold">Incident Description Narrative</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 h-28 resize-none font-sans font-medium"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-stone-200 rounded-lg text-xs font-bold text-stone-550 hover:bg-stone-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Court Case Modal */}
      {courtModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">Register Court Case</h3>
              <button onClick={() => setCourtModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingCourt(true);
                await createCourtCaseAction({ case_id: c.id, ...courtForm });
                setSavingCourt(false);
                setCourtModalOpen(false);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Court Complex</label>
                <select
                  value={courtForm.court_complex}
                  onChange={(e) => setCourtForm({ ...courtForm, court_complex: e.target.value })}
                  className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2"
                >
                  {DELHI_COURT_COMPLEXES.map((cc) => (
                    <option key={cc} value={cc}>{cc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">CNR Number</label>
                <input
                  value={courtForm.cnr_number}
                  onChange={(e) => setCourtForm({ ...courtForm, cnr_number: e.target.value })}
                  className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2"
                  placeholder="DLXX01-000000-2026"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Judge</label>
                <input
                  value={courtForm.judge_name}
                  onChange={(e) => setCourtForm({ ...courtForm, judge_name: e.target.value })}
                  className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Next Hearing Date</label>
                <input
                  type="date"
                  value={courtForm.next_hearing_date}
                  onChange={(e) => setCourtForm({ ...courtForm, next_hearing_date: e.target.value })}
                  className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setCourtModalOpen(false)} className="w-1/2 py-2 px-4 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50">
                  Cancel
                </button>
                <button type="submit" disabled={savingCourt} className="w-1/2 py-2 px-4 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50">
                  {savingCourt ? 'Saving...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Hearing Modal */}
      {hearingModalOpen && courtCase && (
        <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">Log Hearing</h3>
              <button onClick={() => setHearingModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingCourt(true);
                await addHearingAction({ court_case_id: courtCase.id, case_id: c.id, ...hearingForm });
                setSavingCourt(false);
                setHearingModalOpen(false);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Hearing Date</label>
                <input type="date" required value={hearingForm.hearing_date} onChange={(e) => setHearingForm({ ...hearingForm, hearing_date: e.target.value })} className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Purpose</label>
                <input required value={hearingForm.purpose} onChange={(e) => setHearingForm({ ...hearingForm, purpose: e.target.value })} className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2" placeholder="Framing of charges" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Order Summary</label>
                <textarea value={hearingForm.order_summary} onChange={(e) => setHearingForm({ ...hearingForm, order_summary: e.target.value })} className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Next Hearing Date</label>
                <input type="date" value={hearingForm.next_hearing_date} onChange={(e) => setHearingForm({ ...hearingForm, next_hearing_date: e.target.value })} className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setHearingModalOpen(false)} className="w-1/2 py-2 px-4 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50">
                  Cancel
                </button>
                <button type="submit" disabled={savingCourt} className="w-1/2 py-2 px-4 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50">
                  {savingCourt ? 'Saving...' : 'Log Hearing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Statement Modal */}
      {statementModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest">Add Statement</h3>
              <button onClick={() => setStatementModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingCourt(true);
                await addStatementAction({ case_id: c.id, ...statementForm });
                setSavingCourt(false);
                setStatementModalOpen(false);
                setStatementForm({ witness_name: '', statement_text: '', recorded_date: new Date().toISOString().split('T')[0] });
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Witness Name</label>
                <input required value={statementForm.witness_name} onChange={(e) => setStatementForm({ ...statementForm, witness_name: e.target.value })} className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Statement</label>
                <textarea required rows={5} value={statementForm.statement_text} onChange={(e) => setStatementForm({ ...statementForm, statement_text: e.target.value })} className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Recorded Date</label>
                <input type="date" required value={statementForm.recorded_date} onChange={(e) => setStatementForm({ ...statementForm, recorded_date: e.target.value })} className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setStatementModalOpen(false)} className="w-1/2 py-2 px-4 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50">
                  Cancel
                </button>
                <button type="submit" disabled={savingCourt} className="w-1/2 py-2 px-4 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50">
                  {savingCourt ? 'Saving...' : 'Add Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
