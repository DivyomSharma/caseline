'use server';

import { createFIR } from '@/lib/supabase/db';
import { z } from 'zod';

const firSchema = z.object({
  fir_number: z.string().min(4, 'FIR number is required'),
  complaint_description: z.string().min(10, 'Description must be at least 10 characters'),
  complainant_name: z.string().min(3, 'Complainant name must be at least 3 characters'),
  complainant_contact: z.string().min(10, 'Contact number must be at least 10 digits'),
  complainant_address: z.string().min(5, 'Address is required'),
  crime_type: z.string().min(2, 'Select a crime category'),
  incident_date: z.string().min(10, 'Incident date is required'),
  incident_time: z.string().min(5, 'Incident time is required'),
  location: z.string().min(5, 'Incident location details are required'),
  station_id: z.string().min(2, 'Select a police station'),
  assigned_officer_id: z.string().min(2, 'Select an assigned officer'),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
});

export async function createFIRAction(prevState: any, formData: FormData) {
  const data = {
    fir_number: formData.get('fir_number') as string,
    complaint_description: formData.get('complaint_description') as string,
    complainant_name: formData.get('complainant_name') as string,
    complainant_contact: formData.get('complainant_contact') as string,
    complainant_address: formData.get('complainant_address') as string,
    crime_type: formData.get('crime_type') as string,
    incident_date: formData.get('incident_date') as string,
    incident_time: formData.get('incident_time') as string,
    location: formData.get('location') as string,
    station_id: formData.get('station_id') as string,
    assigned_officer_id: formData.get('assigned_officer_id') as string,
    priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'critical'
  };

  const parsed = firSchema.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors as Record<string, any>;
    // Return first validation error for display
    const firstKey = Object.keys(errorMap)[0];
    const message = errorMap[firstKey]?.[0] || 'Validation failed';
    return { success: false, error: message };
  }

  try {
    const res = await createFIR(parsed.data);
    return { success: true, caseId: res.case.id };
  } catch (error: any) {
    console.error('FIR creation failed:', error);
    return { success: false, error: error?.message || 'Database error occurred during registration.' };
  }
}
