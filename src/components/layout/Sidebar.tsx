'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  UserCheck, 
  Activity, 
  Building2, 
  FileBarChart2, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  FolderLock,
  Scale,
  Gavel,
  Map as MapIcon
} from 'lucide-react';
import { logoutAction } from '@/app/(auth)/login/actions';

interface SidebarProps {
  user: {
    full_name: string;
    email: string;
    role: 'admin' | 'officer' | 'viewer';
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navGroups = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "Records",
      items: [
        { label: "Cases", href: "/cases", icon: Briefcase },
        { label: "FIRs", href: "/fir", icon: FileText },
        { label: "Criminals", href: "/criminals", icon: ShieldAlert },
        { label: "Victims", href: "/victims", icon: Users }
      ]
    },
    {
      title: "Investigation",
      items: [
        { label: "Investigations", href: "/investigations", icon: Activity },
        { label: "Evidence", href: "/evidence", icon: FolderLock },
        { label: "Courts", href: "/courts", icon: Gavel },
        { label: "Crime Map", href: "/map", icon: MapIcon }
      ]
    },
    {
      title: "Organization",
      items: [
        { label: "Officers", href: "/officers", icon: UserCheck },
        { label: "Police Stations", href: "/stations", icon: Building2 },
        { label: "Laws", href: "/laws", icon: Scale }
      ]
    },
    {
      title: "Insights",
      items: [
        { label: "Reports", href: "/reports", icon: FileText },
        { label: "Analytics", href: "/analytics", icon: FileBarChart2 }
      ]
    },
    {
      title: "System",
      items: [
        { label: "Settings", href: "/settings", icon: Settings }
      ]
    }
  ];

  // Helper to check active state
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'officer': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <aside className={`bg-white border-r border-stone-200 flex flex-col justify-between transition-all duration-300 h-screen sticky top-0 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Top Brand / Logo */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-stone-800 text-sm tracking-widest font-mono">
              CASELINE
            </span>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg p-1.5 hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {group.title}
              </h4>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                        active 
                          ? 'bg-stone-100 text-stone-950 shadow-sm border-l-4 border-stone-950 pl-2' 
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-stone-950' : 'text-stone-400'}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Profile & Logout */}
      <div className="p-3 border-t border-stone-200 bg-stone-50/50">
        {!collapsed && user && (
          <div className="mb-3 px-2 flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0 flex items-center justify-center font-bold text-stone-700 text-xs">
              {user.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-800 truncate">{user.full_name}</div>
              <div className="text-[9px] font-medium text-stone-500 truncate">{user.email}</div>
              <div className={`mt-0.5 inline-block text-[8px] font-bold uppercase px-1.5 py-0.2 border rounded ${getRoleColor(user.role)}`}>
                {user.role}
              </div>
            </div>
          </div>
        )}
        
        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </form>
      </div>

    </aside>
  );
}
// Add styling reference for ShieldAlert missing in lucide-react imports:
const ShieldAlert = Shield;
