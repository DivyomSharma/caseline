import { getCriminals, getCurrentUser } from '@/lib/supabase/db';
import CriminalsClient from './criminals-client';

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function CriminalsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const criminals = await getCriminals(search);
  const user = await getCurrentUser();

  return <CriminalsClient criminals={criminals} search={search || ''} user={user} />;
}
