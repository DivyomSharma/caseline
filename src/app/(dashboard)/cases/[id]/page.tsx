import { getCaseById, getCurrentUser } from '@/lib/supabase/db';
import { notFound } from 'next/navigation';
import CaseDetailClient from './case-detail-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const caseObj = await getCaseById(id);
  const user = await getCurrentUser();

  if (!caseObj) {
    notFound();
  }

  return (
    <CaseDetailClient 
      c={caseObj} 
      currentUser={user} 
    />
  );
}
