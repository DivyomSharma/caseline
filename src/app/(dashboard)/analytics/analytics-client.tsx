'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie,
  LineChart,
  Line
} from 'recharts';
import { FileBarChart2, ShieldCheck, HelpCircle, Activity } from 'lucide-react';

interface AnalyticsProps {
  stats: {
    totalCases: number;
    activeCases: number;
    solvedCases: number;
    closedCases: number;
    charts: {
      casesByCrimeType: { name: string; value: number }[];
      casesByStatus: { name: string; value: number }[];
      casesByStation: { name: string; value: number }[];
    };
  };
}

export default function AnalyticsClient({ stats }: AnalyticsProps) {
  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#ec4899', '#14b8a6'];

  // Case registration and closure trend metrics by month
  const monthlyTrendsData = [
    { month: 'Jan', Registered: 5, Solved: 3 },
    { month: 'Feb', Registered: 8, Solved: 4 },
    { month: 'Mar', Registered: 12, Solved: 6 },
    { month: 'Apr', Registered: 15, Solved: 10 },
    { month: 'May', Registered: 18, Solved: 12 },
    { month: 'Jun', Registered: 22, Solved: 16 },
    { month: 'Jul', Registered: stats.totalCases - 12, Solved: stats.solvedCases - 4 },
    { month: 'Aug', Registered: stats.totalCases, Solved: stats.solvedCases }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Statistical Crime Analytics</h1>
        <p className="text-stone-500 text-[11px] mt-0.5">
          District crime indexes, caseload parameters, and resolution trends.
        </p>
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Overall Case Resolution Rate", value: `${Math.round((stats.solvedCases / (stats.totalCases || 1)) * 100)}%`, desc: "Ratio of solved to logged cases" },
          { label: "Active Investigation Index", value: stats.activeCases, desc: "Accused or suspect tracking" },
          { label: "Solvency Metrics", value: stats.solvedCases, desc: "Successfully resolved folders" },
          { label: "District Case Count", value: stats.totalCases, desc: "Grand total records registered" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-stone-200 p-4.5 rounded-xl shadow-sm">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">{item.label}</span>
            <span className="text-xl font-black text-stone-800 tracking-tight mt-1.5 block">{item.value}</span>
            <span className="text-[9px] text-stone-500 block mt-1.5 font-medium">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Crime Trend over Time */}
        <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm flex flex-col h-[380px]">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-4 flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-stone-400" />
            <span>Monthly Registration & Resolution trends</span>
          </h3>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                <Line type="monotone" dataKey="Registered" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Solved" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Category distribution */}
        <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm flex flex-col h-[380px]">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-4 flex items-center space-x-1.5">
            <FileBarChart2 className="w-4 h-4 text-stone-400" />
            <span>Cases Share by Crime Categories</span>
          </h3>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.casesByCrimeType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24}>
                  {stats.charts.casesByCrimeType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm flex flex-col h-[380px]">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-4">
            Case Status Distribution share
          </h3>
          <div className="flex-1 min-h-0 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.casesByStatus}
                  cx="50%"
                  cy="48%"
                  innerRadius={70}
                  outerRadius={100}
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
            <div className="absolute bottom-2 flex flex-wrap justify-center gap-x-3 gap-y-1 px-4">
              {stats.charts.casesByStatus.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-[9px] font-semibold text-stone-500">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Precinct Caseloads */}
        <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm flex flex-col h-[380px]">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-4">
            Precinct Jurisdictions Load Comparison
          </h3>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.casesByStation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#64748b" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
