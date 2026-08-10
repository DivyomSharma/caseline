'use server';

import { createOfficer } from '@/lib/supabase/db';
import { revalidatePath } from 'next/cache';

export async function createOfficerAction(data: {
  full_name: string;
  email: string;
  badge_number: string;
  rank: string;
  station_id: string;
  phone: string;
}) {
  try {
    await createOfficer(data);
    revalidatePath('/officers');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create officer:', error);
    return { success: false, error: error?.message || 'Failed to create officer' };
  }
}
