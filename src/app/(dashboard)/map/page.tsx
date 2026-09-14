import { getCases, getPoliceStations } from '@/lib/supabase/db';
import MapClient from './map-client';

export default async function MapPage() {
  const cases = await getCases();
  const stations = await getPoliceStations();
  return <MapClient cases={cases} stations={stations} />;
}
