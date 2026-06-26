'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderOpen,
  ClipboardList,
  Brain,
  FileText,
  Handshake,
  MessageCircle,
  Settings,
  History,
  Users,
  Receipt,
  Mail,
  ChevronDown,
  LogOut,
  Shield,
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
  canSwitchRoles?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Super Admin
  { label: 'Tableau de bord', href: '/dashboard/admin', icon: <LayoutDashboard size={18} />, roles: ['super_admin'] },
  { label: 'Clients', href: '/dashboard/admin/clients', icon: <Users size={18} />, roles: ['super_admin'] },
  { label: 'Dossiers', href: '/dashboard/admin/dossiers', icon: <FolderOpen size={18} />, roles: ['super_admin'] },
  { label: 'Négociateurs', href: '/dashboard/admin/negociateurs', icon: <Handshake size={18} />, roles: ['super_admin'] },
  { label: 'Paiements', href: '/dashboard/admin/paiements', icon: <Receipt size={18} />, roles: ['super_admin'] },
  { label: 'Messages', href: '/dashboard/admin/messages', icon: <MessageCircle size={18} />, roles: ['super_admin'] },
  { label: 'Emails', href: '/dashboard/admin/emails', icon: <Mail size={18} />, roles: ['super_admin'] },
  { label: 'Paramètres', href: '/dashboard/admin/settings', icon: <Settings size={18} />, roles: ['super_admin'] },

  // Négociateur
  { label: 'Tableau de bord', href: '/dashboard/negotiator', icon: <LayoutDashboard size={18} />, roles: ['negotiator'] },
  { label: 'Historique', href: '/dashboard/negotiator/historique', icon: <History size={18} />, roles: ['negotiator'] },
  { label: 'Messages', href: '/dashboard/negotiator/messages', icon: <MessageCircle size={18} />, roles: ['negotiator'] },
  { label: 'Paramètres', href: '/dashboard/negotiator/parametres', icon: <Settings size={18} />, roles: ['negotiator'] },

  // Client
  { label: 'Tableau de bord', href: '/dashboard/client', icon: <LayoutDashboard size={18} />, roles: ['client'] },
  { label: 'Mon dossier', href: '/dashboard/client/dossier', icon: <FolderOpen size={18} />, roles: ['client'] },
  { label: 'Formulaire', href: '/dashboard/client/formulaire', icon: <ClipboardList size={18} />, roles: ['client'] },
  { label: 'Analyse en cours', href: '/dashboard/client/analyse', icon: <Brain size={18} />, roles: ['client'] },
  { label: 'Mon rapport', href: '/dashboard/client/rapport', icon: <FileText size={18} />, roles: ['client'] },
  { label: 'Négociateur', href: '/dashboard/client/negociateur', icon: <Handshake size={18} />, roles: ['client'] },
  { label: 'Messages / Suivi', href: '/dashboard/client/suivi', icon: <MessageCircle size={18} />, roles: ['client'] },
  { label: 'Paramètres', href: '/dashboard/client/parametres', icon: <Settings size={18} />, roles: ['client'] },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super admin',
  negotiator: 'Négociateur',
  client: 'Client',
};

const roleDashboardPaths: Record<UserRole, string> = {
  super_admin: '/dashboard/admin',
  negotiator: '/dashboard/negotiator',
  client: '/dashboard/client',
};

const switchableRoles: UserRole[] = ['super_admin', 'negotiator', 'client'];

export default function Sidebar({ role, canSwitchRoles = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filteredItems = navItems.filter((item) => item.roles.includes(role));
  const scenario = searchParams.get('scenario');

  const withScenario = (href: string) => {
    if (!scenario || !href.startsWith('/dashboard')) {
      return href;
    }

    const url = new URL(href, 'http://preview.local');
    url.searchParams.set('scenario', scenario);
    return `${url.pathname}?${url.searchParams.toString()}`;
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRole = event.target.value as UserRole;

    if (nextRole === role) {
      return;
    }

    router.push(withScenario(roleDashboardPaths[nextRole]));
  };

  return (
    <aside className="w-66 min-h-screen bg-white border-r border-slate-100 flex flex-col px-4 py-6">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex justify-center mb-2">
          <Link href="/">
            <img src="/logo-expertise.png" alt="DroitHabitat" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4" />

        {canSwitchRoles ? (
          <div className="relative mt-2">
            <select
              aria-label="Changer de role"
              className="w-full appearance-none rounded-2xl bg-slate-50 border border-slate-100 px-4 py-2.5 pr-10 text-xs font-bold uppercase tracking-wider text-slate-600 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-100"
              value={role}
              onChange={handleRoleChange}
            >
              {switchableRoles.map((switchableRole) => (
                <option key={switchableRole} value={switchableRole}>
                  {roleLabels[switchableRole]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            {roleLabels[role]}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={withScenario(item.href)}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-wider',
                isActive
                  ? 'bg-white text-slate-800 shadow-sm shadow-slate-200/60 border border-slate-100/50'
                  : 'text-slate-400 hover:bg-slate-50/50 hover:text-slate-600'
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-xl transition-all',
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                    : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100'
                )}
              >
                {item.icon}
              </div>
              <span className="text-[11px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Need Help Card */}
      <div className="px-2 mt-auto mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-900 p-5 text-white shadow-xl shadow-primary-900/10">
          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md mb-3.5">
              <Shield size={16} />
            </div>
            <h4 className="text-xs font-bold tracking-wide uppercase">Besoin d&apos;aide ?</h4>
            <p className="mt-1 text-[10px] text-primary-200 font-medium leading-relaxed">
              Consultez notre guide de la plateforme en local.
            </p>
            <a
              href="/doc"
              className="mt-4 block w-full rounded-2xl bg-white py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-md transition-all hover:bg-slate-50 hover:scale-[1.02]"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 border-t border-slate-100 pt-4">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
