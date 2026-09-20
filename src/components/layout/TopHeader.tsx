'use client';

import React from 'react';
import { Menu, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface TopHeaderProps {
  user: {
    full_name: string;
    email: string;
    role: 'admin' | 'officer' | 'viewer';
    avatar_url?: string;
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
    <header className="bg-white sticky top-0 z-30">
      <div className="h-16 px-4 flex items-center justify-between">

        {/* Left side: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMobileMenuToggle}
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg hover:bg-[var(--color-lavender)] md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--color-ink-soft)]">
            <Link href="/dashboard" className="hover:text-[var(--color-ink)]">
              Caseline
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-bold">Workspace</span>
          </div>
        </div>

        {/* Right side: Date and User badge */}
        <div className="flex items-center space-x-4">

          {/* Date Display */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[var(--color-ink-soft)] font-medium bg-[var(--color-lavender)] rounded-full py-1.5 px-3.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate || 'Loading date...'}</span>
          </div>

          {/* User profile dropdown badge */}
          {user && (
            <div className="flex items-center space-x-2.5">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-[var(--color-ink)] leading-3">{user.full_name}</div>
                <span className="text-[9px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">
                  {user.role} Account
                </span>
              </div>
              <div className="w-8.5 h-8.5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  user.full_name.charAt(0)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="tricolor-hairline" />
    </header>
  );
}
