'use client';

import React, { useState } from 'react';
import { Printer, Download, FileText, Filter, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface ReportsProps {
  cases: any[];
  stations: any[];
  officers: any[];
}

export default function ReportsClient({ cases, stations, officers }: ReportsProps) {
  const [reportType, setReportType] = useState<'cases' | 'officers' | 'stations'>('cases');
  
  // Filter parameters
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [stationId, setStationId] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Compiled results
  const compiledData = React.useMemo(() => {
    if (reportType === 'cases') {
      let filtered = [...cases];
      if (status) filtered = filtered.filter(c => c.status === status);
      if (priority) filtered = filtered.filter(c => c.priority === priority);
      if (stationId) filtered = filtered.filter(c => c.station_id === stationId);
      if (officerId) filtered = filtered.filter(c => c.assigned_officer_id === officerId);
      if (startDate) filtered = filtered.filter(c => new Date(c.incident_date) >= new Date(startDate));
      if (endDate) filtered = filtered.filter(c => new Date(c.incident_date) <= new Date(endDate));
      return {
        cases: filtered,
        stats: {
          total: filtered.length,
          active: filtered.filter(c => ['registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed'].includes(c.status)).length,
          solved: filtered.filter(c => c.status === 'solved').length,
          closed: filtered.filter(c => c.status === 'closed').length
        }
      };
    } else if (reportType === 'officers') {
      // Officer workload analysis
      const list = officers.map(o => {
        const officerCases = cases.filter(c => c.assigned_officer_id === o.id);
        return {
          badge: o.badge_number,
          name: o.profiles?.full_name || 'Staff',
          rank: o.rank,
          station: o.police_stations?.station_code || 'N/A',
          total: officerCases.length,
          active: officerCases.filter(c => ['registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed'].includes(c.status)).length,
          solved: officerCases.filter(c => c.status === 'solved').length
        };
      });
      return { list };
    } else {
      // Station workload analysis
      const list = stations.map(s => {
        const stationCases = cases.filter(c => c.station_id === s.id);
        const stationOfficers = officers.filter(o => o.station_id === s.id);
        return {
          code: s.station_code,
          name: s.name,
          district: s.district,
          officerCount: stationOfficers.length,
          totalCases: stationCases.length,
          activeCases: stationCases.filter(c => ['registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed'].includes(c.status)).length,
          solvedCases: stationCases.filter(c => c.status === 'solved').length
        };
      });
      return { list };
    }
  }, [reportType, cases, stations, officers, status, priority, stationId, officerId, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compiledData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `caseline_report_${reportType}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const { cases: reportCases = [], stats: reportStats = { total: 0, active: 0, solved: 0, closed: 0 }, list: reportList = [] } = compiledData as any;

  return (
    <div className="space-y-6">
      
      {/* Header (Hidden in Print) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">Reports Generation Engine</h1>
          <p className="text-[var(--color-ink-soft)]/80 text-[11px] mt-0.5">
            Compile customized case logs, officer workload sheets, or precinct summaries.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center space-x-1.5 border border-[var(--color-lavender-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-lavender)] text-[var(--color-ink-soft)] font-bold text-xs px-3.5 py-2.5 rounded-full shadow-sm bg-white transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filters Form Card (Hidden in Print) */}
      <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl p-5 shadow-sm space-y-5 print:hidden">
        
        {/* Report Type Selector */}
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-2">
            Select Report Template
          </label>
          <div className="flex space-x-2">
            {[
              { id: 'cases', label: 'Cases Listing Register' },
              { id: 'officers', label: 'Officers Workload Audit' },
              { id: 'stations', label: 'Precinct Jurisdictions Load' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setReportType(t.id as any)}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                  reportType === t.id 
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm' 
                    : 'bg-white border-[var(--color-lavender-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-lavender)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Filters depending on Report Type */}
        {reportType === 'cases' && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
            <div>
              <label className="block text-[9px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink-soft)] focus:outline-none">
                <option value="">All Statuses</option>
                <option value="registered">Registered</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="suspect_identified">Suspect Identified</option>
                <option value="chargesheet_filed">Chargesheet Filed</option>
                <option value="solved">Solved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink-soft)] focus:outline-none">
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">Station</label>
              <select value={stationId} onChange={e => setStationId(e.target.value)} className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink-soft)] focus:outline-none">
                <option value="">All Stations</option>
                {stations.map(st => (
                  <option key={st.id} value={st.id}>{st.station_code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">Officer</label>
              <select value={officerId} onChange={e => setOfficerId(e.target.value)} className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink-soft)] focus:outline-none">
                <option value="">All Officers</option>
                {officers.map(o => (
                  <option key={o.id} value={o.id}>{o.profiles?.full_name.split(' ').pop()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink-soft)] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-[var(--color-ink-soft)]/60 uppercase tracking-wide mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[var(--color-lavender)] border border-[var(--color-lavender-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-ink-soft)] focus:outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* PRINT SHEET SHEET CARD (Visible in print) */}
      <div className="bg-white border border-[var(--color-lavender-border)] rounded-2xl p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Official Letterhead Header */}
        <div className="text-center pb-6 border-b border-[var(--color-lavender-border)]">
          <div className="flex justify-center items-center space-x-2">
            <span className="font-extrabold text-[var(--color-ink)] text-lg tracking-widest font-mono">CASELINE CRMS NETWORK</span>
          </div>
          <p className="text-[10px] text-[var(--color-ink-soft)]/60 uppercase tracking-wider font-extrabold mt-1">
            Official Case Registry Compiled File System • Confidential Report
          </p>
          <div className="text-[9px] text-[var(--color-ink-soft)]/60 font-bold mt-2">
            Generated: {new Date().toLocaleString()} | Operator: Caseline Network
          </div>
        </div>

        {/* Case Listing Report */}
        {reportType === 'cases' && (
          <div className="space-y-6">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 text-center py-3 bg-[var(--color-lavender)]/50 border border-[var(--color-lavender-border)] rounded-lg text-xs font-bold text-[var(--color-ink-soft)]/80">
              <div>
                <span className="text-[9px] text-[var(--color-ink-soft)]/60 uppercase block tracking-wider">Total Records</span>
                <span className="text-[var(--color-ink)] font-extrabold text-base mt-0.5 block">{reportStats.total}</span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--color-ink-soft)]/60 uppercase block tracking-wider">Active</span>
                <span className="text-[var(--color-primary)] font-extrabold text-base mt-0.5 block">{reportStats.active}</span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--color-ink-soft)]/60 uppercase block tracking-wider">Solved</span>
                <span className="text-emerald-700 font-extrabold text-base mt-0.5 block">{reportStats.solved}</span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--color-ink-soft)]/60 uppercase block tracking-wider">Closed</span>
                <span className="text-purple-700 font-extrabold text-base mt-0.5 block">{reportStats.closed}</span>
              </div>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-lavender-border)] font-extrabold text-[var(--color-ink)] bg-[var(--color-lavender)]/70 text-[9px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Crime Category</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Incident Location</th>
                    <th className="py-2.5 px-3">Officer</th>
                    <th className="py-2.5 px-3">Precinct</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-lavender-border)]">
                  {reportCases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-[var(--color-ink-soft)]/60 font-medium">No records match criteria.</td>
                    </tr>
                  ) : (
                    reportCases.map((c: any) => (
                      <tr key={c.id} className="hover:bg-[var(--color-lavender)]/20">
                        <td className="py-2 px-3 font-bold text-[var(--color-ink)] font-mono">{c.case_number}</td>
                        <td className="py-2 px-3 font-bold text-[var(--color-ink)]">{c.crime_type}</td>
                        <td className="py-2 px-3 text-[var(--color-ink-soft)]/80 font-medium">{new Date(c.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-2 px-3 text-[var(--color-ink-soft)] font-medium">{c.location}</td>
                        <td className="py-2 px-3 text-[var(--color-ink-soft)] font-semibold">{c.officers?.profiles?.full_name || 'Unassigned'}</td>
                        <td className="py-2 px-3 text-[var(--color-ink-soft)]/80 font-bold uppercase">{c.police_stations?.station_code || 'N/A'}</td>
                        <td className="py-2 px-3 font-bold uppercase text-[9px]">{c.status.replace(/_/g, ' ')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Officers Workload Report */}
        {reportType === 'officers' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-lavender-border)] font-extrabold text-[var(--color-ink)] bg-[var(--color-lavender)]/70 text-[9px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Badge ID</th>
                    <th className="py-2.5 px-3">Officer Name</th>
                    <th className="py-2.5 px-3">Rank Designation</th>
                    <th className="py-2.5 px-3">Precinct Code</th>
                    <th className="py-2.5 px-3 text-center">Total Cases</th>
                    <th className="py-2.5 px-3 text-center">Active Cases</th>
                    <th className="py-2.5 px-3 text-center">Solved Cases</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-lavender-border)]">
                  {reportList.map((o: any, idx: number) => (
                    <tr key={o.badge || idx} className="hover:bg-[var(--color-lavender)]/20">
                      <td className="py-2 px-3 font-bold text-[var(--color-ink)] font-mono">{o.badge}</td>
                      <td className="py-2 px-3 font-bold text-[var(--color-ink)]">{o.name}</td>
                      <td className="py-2 px-3 font-semibold text-[var(--color-ink-soft)]">{o.rank}</td>
                      <td className="py-2 px-3 text-[var(--color-ink-soft)]/80 font-bold uppercase">{o.station}</td>
                      <td className="py-2 px-3 text-center font-bold text-[var(--color-ink)]">{o.total}</td>
                      <td className="py-2 px-3 text-center font-bold text-[var(--color-primary)]">{o.active}</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-700">{o.solved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stations Workload Report */}
        {reportType === 'stations' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-lavender-border)] font-extrabold text-[var(--color-ink)] bg-[var(--color-lavender)]/70 text-[9px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Precinct Code</th>
                    <th className="py-2.5 px-3">Precinct name</th>
                    <th className="py-2.5 px-3">District Region</th>
                    <th className="py-2.5 px-3 text-center">Staff Count</th>
                    <th className="py-2.5 px-3 text-center">Total cases</th>
                    <th className="py-2.5 px-3 text-center">Active cases</th>
                    <th className="py-2.5 px-3 text-center">Solved cases</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-lavender-border)]">
                  {reportList.map((s: any, idx: number) => (
                    <tr key={s.code || idx} className="hover:bg-[var(--color-lavender)]/20">
                      <td className="py-2 px-3 font-bold text-[var(--color-ink)] font-mono">{s.code}</td>
                      <td className="py-2 px-3 font-bold text-[var(--color-ink)]">{s.name}</td>
                      <td className="py-2 px-3 font-semibold text-[var(--color-ink-soft)]">{s.district}</td>
                      <td className="py-2 px-3 text-center font-bold text-[var(--color-ink-soft)]">{s.officerCount}</td>
                      <td className="py-2 px-3 text-center font-bold text-[var(--color-ink)]">{s.totalCases}</td>
                      <td className="py-2 px-3 text-center font-bold text-[var(--color-primary)]">{s.activeCases}</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-700">{s.solvedCases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
