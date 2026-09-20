'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Server, Database, Check, RefreshCw } from 'lucide-react';
import { toggleDatabaseSlateAction, getDatabaseSlateModeAction, getCurrentUserAction } from '@/app/(auth)/login/actions';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dbSlate, setDbSlate] = useState<'seeded' | 'empty'>('seeded');
  const [isSupabase, setIsSupabase] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dynamic config checks
    setIsSupabase(!!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
    
    // Load active profile and slate
    async function loadData() {
      const u = await getCurrentUserAction();
      setUser(u);
      
      const mode = await getDatabaseSlateModeAction();
      setDbSlate(mode);
    }
    loadData();
  }, []);

  const handleSlateToggle = async (mode: 'seeded' | 'empty') => {
    setLoading(true);
    await toggleDatabaseSlateAction(mode);
    setDbSlate(mode);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[var(--color-ink)] tracking-tight">System Settings</h1>
        <p className="text-[var(--color-ink-soft)] text-[11px] mt-0.5">
          Verify configuration credentials, auth parameters, and database adapters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm space-y-4 h-fit">
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest border-b border-[var(--color-lavender-border)] pb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[var(--color-ink-soft)]" />
            <span>Profile settings</span>
          </h3>

          {user ? (
            <div className="space-y-3.5 text-xs font-semibold">
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase font-bold">Log Account Owner</span>
                <span className="text-[var(--color-ink)] font-extrabold">{user.full_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase font-bold">Registrar Email</span>
                <span className="text-[var(--color-ink)]">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-ink-soft)]/70 block uppercase font-bold">Active Authorization role</span>
                <span className="text-[var(--color-primary)] font-black uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[var(--color-ink-soft)]/70">Loading user profile...</div>
          )}
        </div>

        {/* Database Adapter Configuration */}
        <div className="bg-white border border-[var(--color-lavender-border)] p-5 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-widest border-b border-[var(--color-lavender-border)] pb-3 flex items-center space-x-2">
            <Server className="w-4 h-4 text-[var(--color-ink-soft)]" />
            <span>Database Adapter & Slate Engine</span>
          </h3>

          <div className="space-y-4">

            {/* Slate Toggle Card */}
            <div className="p-4 rounded-2xl border border-[var(--color-lavender-border)] bg-[var(--color-lavender)]/50 space-y-3">
              <div className="text-xs font-bold text-[var(--color-ink)]">Database Configuration</div>
              <p className="text-[11px] text-[var(--color-ink-soft)] leading-relaxed font-medium">
                Toggling to <b>Blank Database</b> will clear the local database cache (except for Divyom and Samar's administrator accounts) to reset the system for verification.
              </p>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => handleSlateToggle('seeded')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    dbSlate === 'seeded'
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : 'bg-white border-[var(--color-lavender-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-lavender)]'
                  }`}
                >
                  Standard Database
                </button>
                <button
                  onClick={() => handleSlateToggle('empty')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    dbSlate === 'empty'
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : 'bg-white border-[var(--color-lavender-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-lavender)]'
                  }`}
                >
                  Blank Database
                </button>
              </div>
            </div>

            {/* Mode Banner */}
            <div className={`p-4 rounded-lg border text-xs ${
              isSupabase
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-[var(--color-saffron)]/10 border-[var(--color-saffron)]/30 text-[var(--color-saffron)]'
            }`}>
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm">
                    {isSupabase ? 'Supabase Live Connection Active' : 'Local Database Engine Active (SQLite/In-Memory)'}
                  </div>
                  <p className="mt-1 leading-5 font-medium text-[var(--color-ink-soft)]">
                    {isSupabase
                      ? 'The application is reading and writing records in real-time from the Supabase PostgreSQL cluster.'
                      : `Supabase environment configurations are not set. Running in local fallback database mode with ${dbSlate === 'seeded' ? 'Standard Seed Data' : 'Blank Database configuration'}.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Env Table */}
            <div className="border border-[var(--color-lavender-border)] rounded-lg overflow-hidden text-xs">
              <div className="bg-[var(--color-lavender)] border-b border-[var(--color-lavender-border)] py-2 px-3 font-bold text-[10px] text-[var(--color-ink-soft)]/70 uppercase tracking-wider">
                System Credentials Check
              </div>
              <div className="divide-y divide-[var(--color-lavender-border)] p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--color-ink-soft)] font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
                  {isSupabase ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Configured</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-[var(--color-lavender)] text-[var(--color-ink-soft)] px-2 py-0.5 rounded-full font-bold">Unset (Local DB)</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-[var(--color-ink-soft)] font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  {isSupabase ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Configured</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-[var(--color-lavender)] text-[var(--color-ink-soft)] px-2 py-0.5 rounded-full font-bold">Unset (Local DB)</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
