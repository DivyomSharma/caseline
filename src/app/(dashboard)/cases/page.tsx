import { getCases, getPoliceStations, getOfficers } from '@/lib/supabase/db';
import CasesClient from './cases-client';

export default async function CasesPage() {
  // Fetch cases, stations, and officers on the server side
  const initialCases = await getCases();
  const stations = await getPoliceStations();
  const officers = await getOfficers();

  return (
    <CasesClient 
      initialCases={initialCases} 
      stations={stations} 
      officers={officers} 
    />
  );
}
