import { getDashboardStats } from '@/lib/supabase/db';
import AnalyticsClient from './analytics-client';

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  return <AnalyticsClient stats={stats} />;
}
