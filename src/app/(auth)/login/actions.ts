'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PROFILES } from '@/lib/supabase/seedData';
import { getCurrentUser } from '@/lib/supabase/db';
import { signSession } from '@/lib/supabase/session';

// Demo-only shared password for the offline mock-auth mode. Never used when
// Supabase env vars are configured (real Supabase Auth handles passwords then).
const OFFLINE_DEMO_PASSWORD = 'password123';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Offline mock mode
    const matchedProfile = PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!matchedProfile || password !== OFFLINE_DEMO_PASSWORD) {
      return { error: 'Invalid email or password. Please check your credentials or select an account from the Authorized Access list.' };
    }

    const cookieStore = await cookies();
    cookieStore.set('caseline_session', await signSession(matchedProfile.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    redirect('/dashboard');
    return {};
  }

  // Real Supabase Auth mode
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    console.error('Real auth error:', err);
    return { error: 'Authentication failed. Please verify your connection.' };
  }

  redirect('/dashboard');
  return {};
}

export async function logoutAction() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const cookieStore = await cookies();

  if (!supabaseUrl || !supabaseAnonKey) {
    // Offline mock mode
    cookieStore.delete('caseline_session');
    redirect('/login');
    return;
  }

  // Real Supabase Auth mode
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Real signout error:', err);
  }

  redirect('/login');
}

export async function getCurrentUserAction() {
  return await getCurrentUser();
}
