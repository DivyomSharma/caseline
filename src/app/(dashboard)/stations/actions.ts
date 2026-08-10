'use server';

import { createPoliceStation } from '@/lib/supabase/db';
import { revalidatePath } from 'next/cache';

export async function createStationAction(data: { name: string; station_code: string; district: string; address: string; contact: string }) {
  try {
    await createPoliceStation(data);
    revalidatePath('/stations');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create station:', error);
    return { success: false, error: error?.message || 'Failed to create station' };
  }
}
