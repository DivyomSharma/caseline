import { getCases, getPoliceStations, getOfficers } from '@/lib/supabase/db';
import ReportsClient from './reports-client';

export default async function ReportsPage() {
  const cases = await getCases();
  const stations = await getPoliceStations();
  const officers = await getOfficers();

  return <ReportsClient cases={cases} stations={stations} officers={officers} />;
}
