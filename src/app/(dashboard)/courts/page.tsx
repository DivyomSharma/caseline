import { getAllCourtCases } from '@/lib/supabase/db';
import CourtsClient from './courts-client';

export default async function CourtsPage() {
  const courtCases = await getAllCourtCases();
  return <CourtsClient courtCases={courtCases} />;
}
