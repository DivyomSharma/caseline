import { getCaseById, getCurrentUser, getOfficers, getPoliceStations, getCaseSections, getLegalSections, getCourtCaseByCase, getCaseStatements } from '@/lib/supabase/db';
import { notFound } from 'next/navigation';
import CaseDetailClient from './case-detail-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const caseObj = await getCaseById(id);
  const user = await getCurrentUser();
  const officers = await getOfficers();
  const stations = await getPoliceStations();
  const linkedSections = await getCaseSections(id);
  const allSections = await getLegalSections();
  const courtCase = await getCourtCaseByCase(id);
  const statements = await getCaseStatements(id);

  if (!caseObj) {
    notFound();
  }

  return (
    <CaseDetailClient
      c={caseObj}
      currentUser={user}
      officers={officers}
      stations={stations}
      linkedSections={linkedSections}
      allSections={allSections}
      courtCase={courtCase}
      statements={statements}
    />
  );
}
