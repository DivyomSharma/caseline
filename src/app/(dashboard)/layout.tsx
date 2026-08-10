import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/db';
import LayoutClient from './layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <LayoutClient user={user}>{children}</LayoutClient>;
}
