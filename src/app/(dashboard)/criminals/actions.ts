'use server';

import { createCriminal, updateCriminal } from '@/lib/supabase/db';
import { revalidatePath } from 'next/cache';

export async function createCriminalAction(data: any) {
  try {
    const res = await createCriminal(data);
    revalidatePath('/criminals');
    return { success: true, id: res.id };
  } catch (error: any) {
    console.error('Failed to create criminal:', error);
    return { success: false, error: error?.message || 'Failed to create criminal' };
  }
}

export async function updateCriminalAction(id: string, data: any) {
  try {
    await updateCriminal(id, data);
    revalidatePath('/criminals');
    revalidatePath(`/criminals/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update criminal:', error);
    return { success: false, error: error?.message || 'Failed to update criminal' };
  }
}
