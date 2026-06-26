import { getPreviewRole, isDevAccessEnabled } from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { UserRole } from '@/types';
import { redirect } from 'next/navigation';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import RightSidebar from './RightSidebar';
import { Suspense } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default async function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  if (isDevAccessEnabled()) {
    const previewRole = getPreviewRole(allowedRoles);

    return (
      <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
        <Suspense fallback={<div className="hidden lg:block w-66 min-h-screen bg-white border-r border-slate-100" />}>
          <Sidebar role={previewRole} canSwitchRoles />
        </Suspense>
        <div className="flex flex-1 overflow-hidden min-h-0">
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 min-h-0">
            <div className="w-full">
              <DashboardHeader />
              {children}
            </div>
          </main>
          <RightSidebar role={previewRole} />
        </div>
      </div>
    );
  }

  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <Suspense fallback={<div className="hidden lg:block w-66 min-h-screen bg-white border-r border-slate-100" />}>
        <Sidebar role={profile.role as UserRole} />
      </Suspense>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 min-h-0">
          <div className="w-full">
            <DashboardHeader />
            {children}
          </div>
        </main>
        <RightSidebar role={profile.role as UserRole} />
      </div>
    </div>
  );
}
