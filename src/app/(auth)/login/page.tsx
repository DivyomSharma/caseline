'use client';

import React, { useState } from 'react';
import { loginAction } from './actions';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await loginAction(formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 font-sans">
          CASELINE
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Crime & Case Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-sm sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="name@caseline.gov"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                  Remember session
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Fictional Demo Accounts info */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Fictional Demo Profiles
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSelectDemoUser('admin@caseline.gov')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all flex justify-between items-center group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-900">ADMIN ROLE</div>
                  <div className="text-xs text-slate-500">ACP Sunita Deshmukh</div>
                </div>
                <div className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  admin@caseline.gov
                </div>
              </button>

              <button
                onClick={() => handleSelectDemoUser('arjun.mehta@caseline.gov')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all flex justify-between items-center group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-900">OFFICER ROLE</div>
                  <div className="text-xs text-slate-500">Inspector Arjun Mehta</div>
                </div>
                <div className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  arjun.mehta@caseline.gov
                </div>
              </button>

              <button
                onClick={() => handleSelectDemoUser('viewer@caseline.gov')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all flex justify-between items-center group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-900">VIEWER ROLE</div>
                  <div className="text-xs text-slate-500">DG R. K. Sen</div>
                </div>
                <div className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full">
                  viewer@caseline.gov
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
