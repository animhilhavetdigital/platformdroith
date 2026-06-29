import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import EmailsList from './EmailsList';

export default async function AdminEmailsPage() {
  const isPreview = isDevAccessEnabled();
  let emails: any[] = [];

  if (isPreview) {
    emails = devStore.emails || [];
  } else {
    // If no emails table exists in SQL, we fallback to a mock/simulation in production too
    emails = devStore.emails || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">E-mails envoyés</h1>
          <p className="mt-1 text-gray-500">Journal d&apos;activité des invitations, notifications et réinitialisations d&apos;accès</p>
        </div>

        <EmailsList emails={emails} />
      </div>
    </DashboardLayout>
  );
}
