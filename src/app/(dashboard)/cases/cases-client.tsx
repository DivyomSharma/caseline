'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  PlusCircle, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';

interface CaseListProps {
  initialCases: any[];
  stations: any[];
  officers: any[];
}

export default function CasesClient({ initialCases, stations, officers }: CaseListProps) {
  const [cases, setCases] = useState(initialCases);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [stationId, setStationId] = useState('');
  const [officerId, setOfficerId] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('incident_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Apply filters on client-side dynamically
  const filteredCases = React.useMemo(() => {
    let result = [...cases];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c => 
        c.case_number.toLowerCase().includes(s) ||
        c.crime_type.toLowerCase().includes(s) ||
        c.location.toLowerCase().includes(s) ||
        (c.officers?.profiles?.full_name || '').toLowerCase().includes(s) ||
        (c.firs?.[0]?.fir_number || '').toLowerCase().includes(s)
      );
    }

    if (status) {
      result = result.filter(c => c.status === status);
    }

    if (priority) {
      result = result.filter(c => c.priority === priority);
    }

    if (stationId) {
      result = result.filter(c => c.station_id === stationId);
    }

    if (officerId) {
      result = result.filter(c => c.assigned_officer_id === officerId);
    }

    // Apply Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested values
      if (sortField === 'officer') {
        aVal = a.officers?.profiles?.full_name || '';
        bVal = b.officers?.profiles?.full_name || '';
      } else if (sortField === 'station') {
        aVal = a.police_stations?.name || '';
        bVal = b.police_stations?.name || '';
      } else if (sortField === 'fir') {
        aVal = a.firs?.[0]?.fir_number || '';
        bVal = b.firs?.[0]?.fir_number || '';
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [cases, search, status, priority, stationId, officerId, sortField, sortDirection]);

  // Paginated cases
  const paginatedCases = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCases, currentPage]);

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setStationId('');
    setOfficerId('');
    setCurrentPage(1);
  };

  const getStatusBadge = (s: string) => {
    const label = s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    switch (s) {
      case 'registered':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">{label}</span>;
      case 'under_investigation':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">{label}</span>;
      case 'suspect_identified':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">{label}</span>;
      case 'chargesheet_filed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">{label}</span>;
      case 'solved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{label}</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">{label}</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'low':
        return <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-50 text-stone-600 border border-stone-100">Low</span>;
      case 'medium':
        return <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Med</span>;
      case 'high':
        return <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-50 text-orange-600 border border-orange-100">High</span>;
      default:
        return <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-100">Crit</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Cases Directory</h1>
          <p className="text-stone-500 text-[11px] mt-0.5">
            Overview of active, pending, and closed criminal case registers.
          </p>
        </div>
        <Link
          href="/fir/new"
          className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm self-start transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Case/FIR</span>
        </Link>
      </div>

      {/* Filter Box */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm space-y-4">
        
        {/* Row 1: Search & Reset */}
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by case #, FIR #, crime type, officer name..."
              className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          {(search || status || priority || stationId || officerId) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-500 hover:text-stone-800 font-bold px-3 py-2 border border-stone-200 rounded-lg hover:bg-stone-50"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Status filter */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide mb-1">
              Case Status
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="suspect_identified">Suspect Identified</option>
              <option value="chargesheet_filed">Chargesheet Filed</option>
              <option value="solved">Solved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Station Filter */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide mb-1">
              Police Station
            </label>
            <select
              value={stationId}
              onChange={(e) => { setStationId(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Stations</option>
              {stations.map(st => (
                <option key={st.id} value={st.id}>{st.station_code} - {st.name}</option>
              ))}
            </select>
          </div>

          {/* Assigned Officer Filter */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide mb-1">
              Assigned Investigator
            </label>
            <select
              value={officerId}
              onChange={(e) => { setOfficerId(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs text-stone-700 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Officers</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>{o.rank} {o.profiles?.full_name}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Cases Table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <th className="py-3 px-4 cursor-pointer hover:bg-stone-100" onClick={() => handleSort('case_number')}>
                  <div className="flex items-center space-x-1">
                    <span>Case #</span>
                    {sortField === 'case_number' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-stone-100" onClick={() => handleSort('fir')}>
                  <div className="flex items-center space-x-1">
                    <span>Linked FIR #</span>
                    {sortField === 'fir' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-stone-100" onClick={() => handleSort('crime_type')}>
                  <div className="flex items-center space-x-1">
                    <span>Crime Category</span>
                    {sortField === 'crime_type' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-stone-100" onClick={() => handleSort('incident_date')}>
                  <div className="flex items-center space-x-1">
                    <span>Incident Date</span>
                    {sortField === 'incident_date' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-stone-100" onClick={() => handleSort('station')}>
                  <div className="flex items-center space-x-1">
                    <span>Precinct Code</span>
                    {sortField === 'station' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-stone-100" onClick={() => handleSort('officer')}>
                  <div className="flex items-center space-x-1">
                    <span>Assigned Officer</span>
                    {sortField === 'officer' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('priority')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Priority</span>
                    {sortField === 'priority' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-stone-100" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Case Status</span>
                    {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-6 h-6 text-stone-300" />
                      <span>No cases matched the search parameters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition-all">
                    <td className="py-3.5 px-4 font-bold text-stone-800 tracking-tight font-mono">
                      {c.case_number}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-semibold font-mono">
                      {c.firs?.[0]?.fir_number || 'Awaiting FIR'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      {c.crime_type}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{new Date(c.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-bold uppercase">
                      {c.police_stations?.station_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-semibold">
                      {c.officers?.profiles?.full_name ? (
                        <span>{c.officers.rank} {c.officers.profiles.full_name.split(' ').slice(1).join(' ')}</span>
                      ) : (
                        <span className="text-stone-400 italic font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getPriorityBadge(c.priority)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/cases/${c.id}`}
                        className="inline-flex items-center space-x-1 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Open File</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {filteredCases.length > 0 && (
          <div className="bg-stone-50/50 border-t border-stone-100 p-4 flex items-center justify-between">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Showing {Math.min(filteredCases.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredCases.length, currentPage * itemsPerPage)} of {filteredCases.length} cases
            </span>
            <div className="flex space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 text-[10px] font-bold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 text-[10px] font-bold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
