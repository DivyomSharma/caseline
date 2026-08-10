import { getOfficers, getPoliceStations, getCurrentUser } from '@/lib/supabase/db';
import OfficersClient from './officers-client';

export default async function OfficersPage() {
  const officers = await getOfficers();
  const stations = await getPoliceStations();
  const user = await getCurrentUser();

  return <OfficersClient officers={officers} stations={stations} user={user} />;
}
