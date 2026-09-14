'use server';

import { addInvestigationLog, addEvidence, getCurrentUser, updateCaseDetails, linkCaseSection, createCourtCase, addHearing, addStatement } from '@/lib/supabase/db';
import { revalidatePath } from 'next/cache';

export async function logInvestigationAction(prevState: any, formData: FormData) {
  const caseId = formData.get('case_id') as string;
  const officerId = formData.get('officer_id') as string;
  const updateType = formData.get('update_type') as string;
  const notes = formData.get('notes') as string;
  const nextAction = formData.get('next_action') as string;
  const caseStatus = formData.get('case_status') as string;

  if (!caseId || !updateType || !notes) {
    return { success: false, error: 'Update type and detailed notes are required.' };
  }

  try {
    await addInvestigationLog({
      case_id: caseId,
      officer_id: officerId || 'officer-001', // fallback
      update_type: updateType,
      notes,
      next_action: nextAction || '',
      case_status: caseStatus || undefined
    });
    
    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to log investigation:', error);
    return { success: false, error: error?.message || 'Database error occurred.' };
  }
}

export async function addEvidenceAction(prevState: any, formData: FormData) {
  const caseId = formData.get('case_id') as string;
  const evidenceType = formData.get('evidence_type') as any;
  const description = formData.get('description') as string;
  const collectedDate = formData.get('collected_date') as string;
  const collectedBy = formData.get('collected_by') as string;
  const storageLocation = formData.get('storage_location') as string;
  const fileUrl = formData.get('file_url') as string;

  if (!caseId || !evidenceType || !description) {
    return { success: false, error: 'Evidence type and description are required.' };
  }

  try {
    await addEvidence({
      case_id: caseId,
      evidence_type: evidenceType,
      description,
      collected_date: collectedDate || new Date().toISOString().split('T')[0],
      collected_by: collectedBy || 'officer-001',
      storage_location: storageLocation || 'Precinct Locker Vault',
      file_url: fileUrl || '/demo-evidence/placeholder.jpg',
      status: 'collected'
    });

    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to add evidence:', error);
    return { success: false, error: error?.message || 'Database error occurred.' };
  }
}

export async function linkCaseSectionAction(caseId: string, sectionId: string) {
  try {
    await linkCaseSection(caseId, sectionId);
    revalidatePath(`/cases/${caseId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to link legal section:', error);
    return { success: false, error: error?.message || 'Database error occurred.' };
  }
}

export async function createCourtCaseAction(data: { case_id: string; court_complex: string; cnr_number: string; judge_name: string; next_hearing_date: string; case_status: string }) {
  try {
    await createCourtCase(data);
    revalidatePath(`/cases/${data.case_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create court case:', error);
    return { success: false, error: error?.message || 'Database error occurred.' };
  }
}

export async function addHearingAction(data: { court_case_id: string; case_id: string; hearing_date: string; purpose: string; order_summary: string; next_hearing_date?: string }) {
  try {
    const { case_id, ...hearingData } = data;
    await addHearing(hearingData);
    revalidatePath(`/cases/${case_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to log hearing:', error);
    return { success: false, error: error?.message || 'Database error occurred.' };
  }
}

export async function addStatementAction(data: { case_id: string; witness_name: string; statement_text: string; recorded_date: string }) {
  try {
    await addStatement(data);
    revalidatePath(`/cases/${data.case_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to add statement:', error);
    return { success: false, error: error?.message || 'Database error occurred.' };
  }
}

export async function updateCaseDetailsAction(
  caseId: string,
  data: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    description: string;
    location: string;
    assigned_officer_id: string;
  }
) {
  try {
    await updateCaseDetails(caseId, data);
    revalidatePath(`/cases/${caseId}`);
    revalidatePath('/cases');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update case details:', error);
    return { success: false, error: error?.message || 'Database error occurred.' };
  }
}
