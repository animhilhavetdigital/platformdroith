import { isDevAccessEnabled } from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Shield, ArrowRight, User, Users, Crown, FilePlus, Home, UserPlus, Key, Info } from 'lucide-react';

const previewLinks = [
  { href: '/dashboard/admin', label: 'Admin', icon: <Crown size={22} />, color: 'text-purple-600 bg-purple-50 hover:border-purple-200' },
  { href: '/dashboard/negotiator', label: 'Négociateur', icon: <Users size={22} />, color: 'text-amber-600 bg-amber-50 hover:border-amber-200' },
  { href: '/dashboard/client', label: 'Client avancé', icon: <User size={22} />, color: 'text-primary-600 bg-primary-50 hover:border-primary-200' },
  { href: '/dashboard/client?scenario=new', label: 'Nouveau client', icon: <FilePlus size={22} />, color: 'text-slate-600 bg-slate-50 hover:border-slate-300' },
];

export default async function LoginPage() {
  const isDemoMode = isDevAccessEnabled();

  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && !isDemoMode) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role === 'super_admin') redirect('/dashboard/admin');
    if (profile?.role === 'negotiator') redirect('/dashboard/negotiator');
    redirect('/dashboard/client');
  }

  async function handleLogin(formData: FormData) {
    'use server';

    const supabase = createServerSupabaseClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect('/auth/login?error=' + encodeURIComponent(error.message));
    }

    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role === 'super_admin') redirect('/dashboard/admin');
      if (profile?.role === 'negotiator') redirect('/dashboard/negotiator');
      redirect('/dashboard/client');
    }
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="flex lg:flex-row flex-col min-h-screen">
        {/* Left Panel: Form or Dev Menu */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            {isDemoMode ? (
              // Mode Démo Local
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">Mode Démo Actif</h2>
                  <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Choisissez un espace pour visualiser la plateforme</p>
                </div>

                <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-[10px] font-bold text-amber-800 flex items-center gap-2.5">
                  <Info size={14} className="text-amber-500 shrink-0" />
                  <span>L&apos;authentification est contournée. Choisissez un rôle ci-dessous.</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {previewLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex flex-col items-center gap-4 rounded-3xl border border-slate-100 bg-white px-5 py-7 text-center font-bold text-slate-800 shadow-sm shadow-slate-100/50 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${link.color}`}>
                        {link.icon}
                      </div>
                      <span className="text-xs uppercase tracking-wider">{link.label}</span>
                      <ArrowRight size={14} className="text-slate-300 transition-colors group-hover:text-slate-500" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              // Mode Authentification Supabase Standard
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">Welcome Back</h2>
                  <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Entrez vos identifiants pour vous connecter</p>
                </div>

                <form action={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="block w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none shadow-sm shadow-slate-100/40 transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder-slate-300"
                      placeholder="Votre adresse email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      required
                      className="block w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none shadow-sm shadow-slate-100/40 transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder-slate-300"
                      placeholder="Votre mot de passe"
                    />
                  </div>

                  <div className="flex items-center py-1">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" id="remember-me" name="remember" />
                      <div className="relative w-9 h-5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                      <span className="ml-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Se souvenir de moi</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary-500/10 transition-all hover:scale-[1.01] hover:bg-primary-700 hover:shadow-lg"
                  >
                    Se connecter
                    <ArrowRight size={14} />
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pas encore de compte ?{' '}
                    <Link href="/auth/register" className="text-primary-500 hover:text-primary-600 font-extrabold ml-1">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Decorative Blue Side with user logo */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 justify-center items-center rounded-bl-[5rem]">
          {/* Abstract background graphics (circular wave rings) */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.06),transparent)]" />
          
          <svg className="absolute inset-0 w-full h-full text-white/10 pointer-events-none select-none z-0" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="20%" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="50%" cy="50%" r="30%" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" fill="none" />
            <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="50%" cy="50%" r="55%" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>

          {/* Logo container instead of Droit Habitat text */}
          <div className="relative z-10 text-center flex flex-col items-center max-w-sm px-6">
            <div className="flex h-20 w-52 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md px-6 py-4 shadow-lg shadow-white/5 border border-white/10">
              <img src="/logo-expertise.png" alt="DroitHabitat Logo" className="h-12 w-auto filter brightness-100" />
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-primary-200 leading-relaxed">
              Cabinet d&apos;expertise et d&apos;accompagnement juridique en conformité de crédits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
