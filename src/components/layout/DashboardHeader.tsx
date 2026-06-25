'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, Settings, User } from 'lucide-react';
import Link from 'next/link';

const segmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  admin: 'Admin',
  negotiator: 'Négociateur',
  client: 'Client',
  dossiers: 'Dossiers',
  users: 'Utilisateurs',
  stats: 'Statistiques',
  settings: 'Paramètres',
  mediations: 'Médiations',
  rapports: 'Rapports',
  analyse: 'Analyse',
  documents: 'Documents',
  rapport: 'Rapport',
  orientation: 'Orientation',
  feedback: 'Feedback',
  contact: 'Contact',
  formulaire: 'Formulaire'
};

export default function DashboardHeader() {
  const pathname = usePathname();
  
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => {
    const label = segmentLabels[seg] || (seg.charAt(0).toUpperCase() + seg.slice(1));
    const href = '/' + segments.slice(0, idx + 1).join('/');
    return { label, href };
  });

  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 py-2 px-0 bg-transparent border-0 shadow-none">
      {/* Left: Breadcrumbs & Page title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span className="hover:text-slate-500 cursor-pointer">Pages</span>
          {breadcrumbs.map((bc, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <span>/</span>
              <span className={idx === breadcrumbs.length - 1 ? "text-slate-700" : "hover:text-slate-500"}>
                {bc.label}
              </span>
            </span>
          ))}
        </div>
        <h1 className="text-sm font-bold text-slate-800 mt-1">{currentPage}</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Type here..."
            className="rounded-2xl border border-slate-100 bg-white pl-9 pr-4 py-2 text-[11px] font-bold text-slate-700 placeholder-slate-400 outline-none shadow-sm shadow-slate-100/50 transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Profile / Actions */}
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider">
          <User size={14} className="text-slate-500" />
          <span className="hidden sm:inline">Sign In</span>
        </button>

        <button className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Settings">
          <Settings size={14} />
        </button>

        <button className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Notifications">
          <Bell size={14} />
        </button>
      </div>
    </header>
  );
}
