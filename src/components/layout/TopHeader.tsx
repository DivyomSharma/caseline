'use client';

import React from 'react';
import { Menu, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface TopHeaderProps {
  user: {
    full_name: string;
    email: string;
    role: 'admin' | 'officer' | 'viewer';
  } | null;
  onMobileMenuToggle: () => void;
}

export default function TopHeader({ user, onMobileMenuToggle }: TopHeaderProps) {
  // Safe static date display (avoiding hydration errors)
  const [formattedDate, setFormattedDate] = React.useState('');

  React.useEffect(() => {
    const today = new Date();
    setFormattedDate(
      today.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-800">
            Caseline
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Workspace</span>
        </div>
      </div>

      {/* Right side: Date and User badge */}
      <div className="flex items-center space-x-4">
        
        {/* Date Display */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-medium bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate || 'Loading date...'}</span>
        </div>

        {/* User profile dropdown badge */}
        {user && (
          <div className="flex items-center space-x-2.5">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-3">{user.full_name}</div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {user.role} Account
              </span>
            </div>
            <div className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-bold text-xs">
              {user.full_name.charAt(0)}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
