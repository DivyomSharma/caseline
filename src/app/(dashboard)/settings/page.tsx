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
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Verify configuration credentials, auth parameters, and database adapters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Profile settings</span>
          </h3>

          {user ? (
            <div className="space-y-3.5 text-xs font-semibold">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Log Account Owner</span>
                <span className="text-slate-850 font-extrabold">{user.full_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Registrar Email</span>
                <span className="text-slate-800">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Authorization role</span>
                <span className="text-indigo-650 font-black uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Loading user profile...</div>
          )}
        </div>

        {/* Database Adapter Configuration */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Server className="w-4 h-4 text-slate-400" />
            <span>Database Adapter & Slate Engine</span>
          </h3>

          <div className="space-y-4">
            
            {/* Slate Toggle Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="text-xs font-bold text-slate-700">Database Configuration</div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Toggling to <b>Blank Database</b> will clear the local database cache (except for Divyom and Samar's administrator accounts) to reset the system for verification.
              </p>
              
              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => handleSlateToggle('seeded')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    dbSlate === 'seeded'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Standard Database
                </button>
                <button
                  onClick={() => handleSlateToggle('empty')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    dbSlate === 'empty'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
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
                : 'bg-indigo-50 border-indigo-200 text-indigo-850'
            }`}>
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm">
                    {isSupabase ? 'Supabase Live Connection Active' : 'Local Database Engine Active (SQLite/In-Memory)'}
                  </div>
                  <p className="mt-1 leading-5 font-medium text-slate-600">
                    {isSupabase 
                      ? 'The application is reading and writing records in real-time from the Supabase PostgreSQL cluster.' 
                      : `Supabase environment configurations are not set. Running in local fallback database mode with ${dbSlate === 'seeded' ? 'Standard Seed Data' : 'Blank Database configuration'}.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Env Table */}
            <div className="border border-slate-150 rounded-lg overflow-hidden text-xs">
              <div className="bg-slate-50 border-b border-slate-200 py-2 px-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                System Credentials Check
              </div>
              <div className="divide-y divide-slate-100 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600 font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
                  {isSupabase ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Configured</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Unset (Local DB)</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-slate-600 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  {isSupabase ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Configured</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Unset (Local DB)</span>
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
