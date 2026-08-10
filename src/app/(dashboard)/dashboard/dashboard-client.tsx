'use client';

import React from 'react';
import { 
  Briefcase, 
  Activity, 
  CheckCircle, 
  Archive, 
  ShieldAlert, 
  UserCheck, 
  PlusCircle, 
  FileText, 
  Upload, 
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { STATIONS } from '@/lib/supabase/seedData';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie 
} from 'recharts';

interface DashboardClientProps {
  stats: {
    totalCases: number;
    activeCases: number;
    solvedCases: number;
    closedCases: number;
    totalCriminals: number;
    activeOfficers: number;
    charts: {
      casesByCrimeType: { name: string; value: number }[];
      casesByStatus: { name: string; value: number }[];
      casesByStation: { name: string; value: number }[];
    };
    recentActivity: {
      id: string;
      title: string;
      description: string;
      created_at: string;
      full_name: string;
      case_number: string;
      case_id: string;
    }[];
  };
}

export default function DashboardClient({ stats }: DashboardClientProps) {
  const kpis = [
    { label: "Total Cases", value: stats.totalCases, icon: Briefcase, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Active Cases", value: stats.activeCases, icon: Activity, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Solved Cases", value: stats.solvedCases, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Closed Cases", value: stats.closedCases, icon: Archive, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { label: "Total Criminals", value: stats.totalCriminals, icon: ShieldAlert, color: "text-red-600 bg-red-50 border-red-100" },
    { label: "Active Officers", value: stats.activeOfficers, icon: UserCheck, color: "text-slate-700 bg-slate-100 border-slate-200" }
  ];

  // Colors for charts
  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#ec4899', '#14b8a6'];

  const quickActions = [
    { label: "Register FIR", desc: "Log a new complaint & init case", href: "/fir/new", icon: FileText, color: "hover:border-indigo-200 hover:bg-indigo-50/20" },
    { label: "View Cases", desc: "Directory of active investigations", href: "/cases", icon: Briefcase, color: "hover:border-blue-200 hover:bg-blue-50/20" },
    { label: "Criminal Profiles", desc: "Offender booking index", href: "/criminals", icon: ShieldAlert, color: "hover:border-red-200 hover:bg-red-50/20" },
    { label: "Evidence Vault", desc: "Multi-media chain of custody", href: "/evidence", icon: Upload, color: "hover:border-emerald-200 hover:bg-emerald-50/20" },
    { label: "Generate Report", desc: "Pre-formatted printable sheets", href: "/reports", icon: TrendingUp, color: "hover:border-amber-200 hover:bg-amber-50/20" }
  ];

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Command Center</h1>
        <p className="text-slate-500 text-xs mt-1">
          Caseline digital case ledger system - District Jurisdictions Summary
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpi.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">
          Quick Actions Panel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link 
                key={act.label} 
                href={act.href}
                className={`border border-slate-100 p-3.5 rounded-lg flex flex-col items-start transition-all cursor-pointer ${act.color}`}
              >
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mb-2.5">
                  <Icon className="w-4.5 h-4.5 text-slate-800" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-4">{act.label}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-3">{act.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Crime Type Chart */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col h-[350px]">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">
            Cases by Crime Category
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.casesByCrimeType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {stats.charts.casesByCrimeType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col h-[350px]">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">
            Case Status Distribution
          </h3>
          <div className="flex-1 min-h-0 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.casesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.charts.casesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend overlays */}
            <div className="absolute bottom-2 flex flex-wrap justify-center gap-x-3 gap-y-1 px-4">
              {stats.charts.casesByStatus.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-[9px] font-semibold text-slate-500">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Station-wise cases */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col h-[350px]">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">
            Jurisdiction Caseload (Precincts)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.casesByStation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} tickLine={false} width={70} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#64748b" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Activity List & Quick Stats summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Stream */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>Recent Activity Audit Trail</span>
            <span className="text-[10px] text-slate-400 normal-case font-medium">Real-time status updates</span>
          </h3>
          
          <div className="flow-root">
            <ul className="-mb-8">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  No activity logged in the system.
                </div>
              ) : (
                stats.recentActivity.map((activity, actIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {actIdx !== stats.recentActivity.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-slate-400" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-slate-800 font-semibold">
                              {activity.title} <span className="font-normal text-slate-500">for</span>{' '}
                              <Link href={`/cases/${activity.case_id}`} className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                                {activity.case_number}
                              </Link>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-3">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-medium">
                            <time dateTime={activity.created_at}>{formatTimeAgo(activity.created_at)}</time>
                            <div className="text-[8px] font-bold text-slate-500 mt-1">{activity.full_name}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Station Contact directory summary */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm h-fit">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">
            Precinct Directory Contacts
          </h3>
          <div className="space-y-3">
            {stats.charts.casesByStation.map((st: any) => {
              const fullStation = STATIONS.find(s => s.station_code === st.name);
              if (!fullStation) return null;
              return (
                <div key={fullStation.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/30 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <MapPin className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{fullStation.name}</div>
                    <div className="text-[9px] text-slate-500 font-semibold">{fullStation.contact}</div>
                    <div className="text-[8px] font-bold text-slate-400 mt-0.5 truncate uppercase">
                      Code: {fullStation.station_code} | District: {fullStation.district}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
