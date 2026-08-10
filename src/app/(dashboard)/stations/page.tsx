import { getPoliceStations, getOfficers, getCurrentUser } from '@/lib/supabase/db';
import StationsClient from './stations-client';

export default async function PoliceStationsPage() {
  const stations = await getPoliceStations();
  const officers = await getOfficers();
  const user = await getCurrentUser();

  return <StationsClient stations={stations} officers={officers} user={user} />;
}
