import { getLegalSections } from '@/lib/supabase/db';
import LawsClient from './laws-client';

export default async function LawsPage() {
  const sections = await getLegalSections();
  return <LawsClient sections={sections} />;
}
