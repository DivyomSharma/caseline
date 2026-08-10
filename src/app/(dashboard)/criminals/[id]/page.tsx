import { getCriminalById, getCurrentUser } from '@/lib/supabase/db';
import { notFound } from 'next/navigation';
import CriminalProfileClient from './criminal-profile-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CriminalProfilePage({ params }: PageProps) {
  const { id } = await params;
  const criminal = await getCriminalById(id);
  const user = await getCurrentUser();

  if (!criminal) {
    notFound();
  }

  return <CriminalProfileClient criminal={criminal} user={user} />;
}
