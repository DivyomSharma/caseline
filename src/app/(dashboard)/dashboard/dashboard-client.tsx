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
    { label: "Total Cases", value: stats.totalCases, icon: Briefcase, color: "text-[var(--color-primary)] bg-[var(--color-lavender)] border-[var(--color-lavender-border)]" },
    { label: "Active Cases", value: stats.activeCases, icon: Activity, color: "text-orange-800 bg-orange-50 border-orange-100" },
    { label: "Solved Cases", value: stats.solvedCases, icon: CheckCircle, color: "text-green-800 bg-green-50 border-green-100" },
    { label: "Closed Cases", value: stats.closedCases, icon: Archive, color: "text-[var(--color-primary)] bg-[var(--color-lavender)] border-[var(--color-lavender-border)]" },
    { label: "Total Criminals", value: stats.totalCriminals, icon: ShieldAlert, color: "text-red-700 bg-red-50 border-red-100" },
    { label: "Active Officers", value: stats.activeOfficers, icon: UserCheck, color: "text-[var(--color-ink-soft)] bg-[var(--color-lavender)] border-[var(--color-lavender-border)]" }
  ];

  // Colors for charts — civic palette (navy, saffron, green) plus supporting hues
  const CHART_COLORS = ['#241f52', '#ff9933', '#138808', '#8b7fd4', '#c2410c', '#64748b', '#ec4899', '#14b8a6'];

  const quickActions = [
    { label: "Register FIR", desc: "Log a new complaint & init case", href: "/fir/new", icon: FileText, color: "hover:border-orange-200 hover:bg-orange-50/30" },
    { label: "View Cases", desc: "Directory of active investigations", href: "/cases", icon: Briefcase, color: "hover:border-[var(--color-lavender-border)] hover:bg-[var(--color-lavender)]/50" },
    { label: "Criminal Profiles", desc: "Offender booking index", href: "/criminals", icon: ShieldAlert, color: "hover:border-red-200 hover:bg-red-50/30" },
    { label: "Evidence Vault", desc: "Multi-media chain of custody", href: "/evidence", icon: Upload, color: "hover:border-green-200 hover:bg-green-50/30" },
    { label: "Generate Report", desc: "Pre-formatted printable sheets", href: "/reports", icon: TrendingUp, color: "hover:border-orange-200 hover:bg-orange-50/30" }
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
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)] tracking-tight">Command Center</h1>
        <p className="text-[var(--color-ink-soft)] text-xs mt-1.5">
          Caseline digital case ledger system - District Jurisdictions Summary
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-[var(--color-lavender-border)] p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]/70">
                  {kpi.label}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display text-2xl font-semibold text-[var(--color-ink)] tracking-tight">
                  {kpi.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm">
        <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest mb-4">
          Quick Actions Panel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.label}
                href={act.href}
                className={`border border-[var(--color-lavender-border)] p-3.5 rounded-xl flex flex-col items-start transition-all cursor-pointer ${act.color}`}
              >
                <div className="w-8 h-8 bg-[var(--color-lavender)] rounded-full flex items-center justify-center mb-2.5">
                  <Icon className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                </div>
                <div className="text-xs font-bold text-[var(--color-ink)] leading-4">{act.label}</div>
                <div className="text-[9px] text-[var(--color-ink-soft)]/80 mt-0.5 leading-3">{act.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Crime Type Chart */}
        <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm flex flex-col h-[350px]">
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest mb-4">
            Cases by Crime Category
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.casesByCrimeType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eeecf9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#241f52" radius={[4, 4, 0, 0]}>
                  {stats.charts.casesByCrimeType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm flex flex-col h-[350px]">
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest mb-4">
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
                  <span className="text-[9px] font-semibold text-[var(--color-ink-soft)]">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Station-wise cases */}
        <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm flex flex-col h-[350px]">
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest mb-4">
            Jurisdiction Caseload (Precincts)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.casesByStation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eeecf9" />
                <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} tickLine={false} width={70} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#241f52" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Activity List & Quick Stats summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Stream */}
        <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>Recent Activity Audit Trail</span>
            <span className="text-[10px] text-[var(--color-ink-soft)]/70 normal-case font-medium">Real-time status updates</span>
          </h3>
          
          <div className="flow-root">
            <ul className="-mb-8">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--color-ink-soft)]/70 font-medium">
                  No activity logged in the system.
                </div>
              ) : (
                stats.recentActivity.map((activity, actIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {actIdx !== stats.recentActivity.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-[var(--color-lavender)]" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-[var(--color-lavender)] flex items-center justify-center">
                            <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-[var(--color-ink)] font-semibold">
                              {activity.title} <span className="font-normal text-[var(--color-ink-soft)]">for</span>{' '}
                              <Link href={`/cases/${activity.case_id}`} className="font-bold text-orange-700 hover:text-orange-900 hover:underline">
                                {activity.case_number}
                              </Link>
                            </p>
                            <p className="text-[10px] text-[var(--color-ink-soft)]/80 mt-0.5 leading-3">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-[var(--color-ink-soft)]/70 font-medium">
                            <time dateTime={activity.created_at}>{formatTimeAgo(activity.created_at)}</time>
                            <div className="text-[8px] font-bold text-[var(--color-ink-soft)] mt-1">{activity.full_name}</div>
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
        <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm h-fit">
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest mb-4">
            Precinct Directory Contacts
          </h3>
          <div className="space-y-3">
            {stats.charts.casesByStation.map((st: any) => {
              const fullStation = STATIONS.find(s => s.station_code === st.name);
              if (!fullStation) return null;
              return (
                <div key={fullStation.id} className="p-3 rounded-xl border border-[var(--color-lavender-border)] bg-[var(--color-lavender)]/30 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-lavender)] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--color-ink)] truncate">{fullStation.name}</div>
                    <div className="text-[9px] text-[var(--color-ink-soft)] font-semibold">{fullStation.contact}</div>
                    <div className="text-[8px] font-bold text-[var(--color-ink-soft)]/70 mt-0.5 truncate uppercase">
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
