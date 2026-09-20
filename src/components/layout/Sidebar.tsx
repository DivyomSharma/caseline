'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  ShieldAlert,
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
    avatar_url?: string;
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
      case 'admin': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'officer': return 'bg-green-50 text-green-800 border-green-200';
      default: return 'bg-[var(--color-lavender)] text-[var(--color-ink-soft)] border-[var(--color-lavender-border)]';
    }
  };

  return (
    <aside className={`bg-white border-r border-[var(--color-lavender-border)] flex flex-col justify-between transition-all duration-300 h-screen sticky top-0 ${collapsed ? 'w-20' : 'w-64'}`}>

      {/* Top Brand / Logo */}
      <div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display font-semibold text-[var(--color-ink)] text-base tracking-tight">
                CaseLine
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-lavender)] rounded-lg p-1.5 hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <div className="tricolor-hairline" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]/60">
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
                      className={`flex items-center space-x-3 px-3 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                        active
                          ? 'bg-[var(--color-lavender)] text-[var(--color-primary)] shadow-sm'
                          : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-lavender)]/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-soft)]/70'}`} />
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
      <div className="p-3 border-t border-[var(--color-lavender-border)] bg-[var(--color-lavender)]/40">
        {!collapsed && user && (
          <div className="mb-3 px-2 flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[var(--color-lavender)] shrink-0 flex items-center justify-center font-bold text-[var(--color-primary)] text-xs overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                user.full_name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[var(--color-ink)] truncate">{user.full_name}</div>
              <div className="text-[9px] font-medium text-[var(--color-ink-soft)] truncate">{user.email}</div>
              <div className={`mt-0.5 inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 border rounded-full ${getRoleColor(user.role)}`}>
                {user.role}
              </div>
            </div>
          </div>
        )}

        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className="flex items-center space-x-3 w-full px-3 py-2 rounded-full text-xs font-semibold text-red-700 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </form>
      </div>

    </aside>
  );
}
