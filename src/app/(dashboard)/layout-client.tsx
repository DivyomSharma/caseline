'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import AIChatWidget from '@/components/shared/AIChatWidget';
import { X, Shield } from 'lucide-react';
import Link from 'next/link';

interface LayoutClientProps {
  children: React.ReactNode;
  user: {
    full_name: string;
    email: string;
    role: 'admin' | 'officer' | 'viewer';
    avatar_url: string;
  } | null;
}

export default function LayoutClient({ children, user }: LayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer Content */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform md:hidden transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-xs tracking-widest font-mono">
                  CASELINE
                </span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Sidebar nav inside drawer */}
            <div className="py-2" onClick={() => setMobileMenuOpen(false)}>
              <Sidebar user={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader user={user} onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        
        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <AIChatWidget />

    </div>
  );
}
