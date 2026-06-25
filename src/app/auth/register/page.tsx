import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Shield, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';

export default async function RegisterPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect('/dashboard/client');

  async function handleRegister(formData: FormData) {
    'use server';
    const supabase = createServerSupabaseClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const nom = formData.get('nom') as string;
    const prenom = formData.get('prenom') as string;
    const téléphone = formData.get('téléphone') as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom,
          prenom,
          téléphone,
          role: 'client',
        },
      },
    });

    if (error) {
      redirect('/auth/register?error=' + encodeURIComponent(error.message));
    }

    redirect('/auth/login?message=' + encodeURIComponent('Compte cree ! Verifiez votre email.'));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 shadow-sm">
            <Shield size={32} />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Droit Habitat</h1>
          <p className="mt-2 text-gray-500">Créez votre compte client sécurisé</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/30">
          <form action={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User size={14} className="text-gray-400" />
                  Prénom
                </label>
                <input type="text" name="prenom" id="prenom" required className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="Jean" />
              </div>
              <div>
                <label htmlFor="nom" className="mb-2 block text-sm font-semibold text-gray-700">Nom</label>
                <input type="text" name="nom" id="nom" required className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="Dupont" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail size={14} className="text-gray-400" />
                Email
              </label>
              <input type="email" name="email" id="email" required className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="vous@exemple.fr" />
            </div>

            <div>
              <label htmlFor="téléphone" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Phone size={14} className="text-gray-400" />
                Téléphone
              </label>
              <input type="tel" name="téléphone" id="téléphone" className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="+33 6 12 34 56 78" />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Lock size={14} className="text-gray-400" />
                Mot de passe
              </label>
              <input type="password" name="password" id="password" required minLength={8} className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="8 caractères minimum" />
            </div>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02]">
              Créer mon compte
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="font-bold text-primary-600 hover:text-primary-700">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
