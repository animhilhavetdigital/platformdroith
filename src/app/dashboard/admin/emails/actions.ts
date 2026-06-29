'use server';

import { revalidatePath } from 'next/cache';

export async function resendEmail(formData: FormData) {
  revalidatePath('/dashboard/admin/emails');
}
