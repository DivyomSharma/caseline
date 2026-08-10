import { getPoliceStations, getOfficers } from '@/lib/supabase/db';
import NewFirClient from './new-fir-client';

export default async function NewFirPage() {
  const stations = await getPoliceStations();
  const officers = await getOfficers();

  return <NewFirClient stations={stations} officers={officers} />;
}
