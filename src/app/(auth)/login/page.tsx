'use client';

import React, { useState, useEffect } from 'react';
import { loginAction, toggleDatabaseSlateAction, getDatabaseSlateModeAction } from './actions';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dbSlate, setDbSlate] = useState<'seeded' | 'empty'>('seeded');

  useEffect(() => {
    async function loadSlate() {
      const mode = await getDatabaseSlateModeAction();
      setDbSlate(mode);
    }
    loadSlate();
  }, []);

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

  const handleSlateToggle = async (mode: 'seeded' | 'empty') => {
    setDbSlate(mode);
    await toggleDatabaseSlateAction(mode);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img src="/hero/login-hero.jpg" alt="" className="w-20 h-20 rounded-full shadow-md object-cover" />
        <h2 className="mt-6 text-center font-display text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          CaseLine
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-ink-soft)]">
          Delhi Police Case Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[var(--color-lavender-border)] shadow-sm sm:rounded-2xl sm:px-10 space-y-6">

          {/* Database slate switcher */}
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]/70">
              Database Configuration
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleSlateToggle('seeded')}
                className={`py-2 px-3 border rounded-full text-xs font-extrabold transition-all text-center ${
                  dbSlate === 'seeded'
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-[var(--color-lavender)] border-[var(--color-lavender-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-lavender)]/70'
                }`}
              >
                Standard Database
              </button>
              <button
                type="button"
                onClick={() => handleSlateToggle('empty')}
                className={`py-2 px-3 border rounded-full text-xs font-extrabold transition-all text-center ${
                  dbSlate === 'empty'
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-[var(--color-lavender)] border-[var(--color-lavender-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-lavender)]/70'
                }`}
              >
                Blank Database
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-red-800 font-medium">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
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
                  className="block w-full rounded-lg border border-[var(--color-lavender-border)] px-4 py-2.5 text-[var(--color-ink)] shadow-sm placeholder:text-[var(--color-ink-soft)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none sm:text-sm"
                  placeholder="name@caseline.gov"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
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
                  className="block w-full rounded-lg border border-[var(--color-lavender-border)] px-4 py-2.5 text-[var(--color-ink)] shadow-sm placeholder:text-[var(--color-ink-soft)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[var(--color-ink-soft)]/60 hover:text-[var(--color-ink-soft)]"
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
                  className="h-4 w-4 rounded border-[var(--color-lavender-border)] text-[var(--color-primary)] accent-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-ink-soft)] cursor-pointer select-none">
                  Remember session
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
