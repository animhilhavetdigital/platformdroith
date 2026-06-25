import { isDevAccessEnabled } from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function POST() {
  if (isDevAccessEnabled()) {
    redirect('/auth/login');
  }

  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
