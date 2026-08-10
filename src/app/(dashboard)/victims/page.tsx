import { getVictims, getCurrentUser } from '@/lib/supabase/db';
import VictimsClient from './victims-client';

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function VictimsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const victims = await getVictims(search);
  const user = await getCurrentUser();

  return <VictimsClient victims={victims} search={search || ''} user={user} />;
}
