'use server';

import { createVictim } from '@/lib/supabase/db';
import { revalidatePath } from 'next/cache';

export async function createVictimAction(data: { full_name: string; contact: string; address: string; notes: string }) {
  try {
    await createVictim(data);
    revalidatePath('/victims');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create victim:', error);
    return { success: false, error: error?.message || 'Failed to create victim record' };
  }
}
