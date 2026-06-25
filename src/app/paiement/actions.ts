'use server';

import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateTempPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateReference() {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `DH-${year}-${random}`;
}

export async function processInitialPayment(formData: FormData) {
  const offreId = (formData.get('offre') as string) || '2';
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const prenom = (formData.get('prenom') as string)?.trim();
  const nom = (formData.get('nom') as string)?.trim();
  const telephone = (formData.get('telephone') as string)?.trim();

  if (!email || !prenom || !nom) {
    return { error: 'Veuillez renseigner votre email, prénom et nom.' };
  }

  const password = generateTempPassword();

  try {
    const serviceRole = createServiceRoleClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let userId: string | null = null;

    if (serviceKey && serviceKey !== 'your-service-role-key') {
      const { data, error } = await serviceRole.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nom, prenom, telephone, role: 'client' },
      });

      if (error) {
        console.error('Erreur création utilisateur (service role):', error);
        return { error: error.message };
      }
      userId = data.user?.id || null;
    } else {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nom, prenom, telephone, role: 'client' },
        },
      });

      if (error) {
        console.error('Erreur inscription (signUp):', error);
        return { error: error.message };
      }
      userId = data.user?.id || null;
    }

    if (!userId) {
      return { error: 'Impossible de créer le compte utilisateur.' };
    }

    const serverClient = createServerSupabaseClient();
    const prix = offreId === '1' ? 99 : offreId === '3' ? 399 : 199;
    const reference = generateReference();

    const { error: dossierError } = await serverClient.from('dossiers').insert({
      client_id: userId,
      offre: offreId as '1' | '2' | '3',
      montant_paye: prix,
      date_paiement: new Date().toISOString(),
      statut: 'onboarding',
      reference,
    });

    if (dossierError) {
      console.error('Erreur création dossier:', dossierError);
      return { error: 'Compte créé mais erreur lors de la création du dossier.' };
    }

    // Simuler envoi email/SMS (log console)
    console.log('=== CREDENTIALS CLIENT ===');
    console.log('Email:', email);
    console.log('Mot de passe temporaire:', password);
    console.log('Téléphone:', telephone || 'Non renseigné');
    console.log('Référence dossier:', reference);
    console.log('==========================');

    revalidatePath('/dashboard/admin/users');
    redirect(`/onboarding/success?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&reference=${encodeURIComponent(reference)}`);
  } catch (err: any) {
    console.error('Erreur processInitialPayment:', err);
    return { error: err.message || 'Une erreur est survenue.' };
  }
}
