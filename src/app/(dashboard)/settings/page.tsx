import { getCurrentUser } from '@/lib/supabase/db';
import { Settings, Shield, Server, Database, Check } from 'lucide-react';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const isSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Profile settings</span>
          </h3>

          {user && (
            <div className="space-y-3.5 text-xs font-semibold">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Log Account Owner</span>
                <span className="text-slate-800 font-extrabold">{user.full_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Registrar Email</span>
                <span className="text-slate-800">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Active Authorization role</span>
                <span className="text-indigo-600 font-black uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          )}
        </div>

        {/* Database Adapter Configuration */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Server className="w-4 h-4 text-slate-400" />
            <span>Database Adapter & Credentials</span>
          </h3>

          <div className="space-y-4">
            
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
                    {isSupabase ? 'Supabase Live Connection Active' : 'Offline Mockup Fallback Engine Active'}
                  </div>
                  <p className="mt-1 leading-5">
                    {isSupabase 
                      ? 'The application is reading and writing records in real-time from the Supabase PostgreSQL cluster.' 
                      : 'NEXT_PUBLIC_SUPABASE_URL is not set. The database layer has loaded the comprehensive fictional seed dataset in-memory with write persistence.'
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
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Unset (Mock fallbacked)</span>
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
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Unset (Mock fallbacked)</span>
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
