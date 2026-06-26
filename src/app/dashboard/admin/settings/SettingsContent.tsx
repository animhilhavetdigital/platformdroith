'use client';

import { useState } from 'react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import {
  ArrowRight,
  AtSign,
  Bell,
  CreditCard,
  Globe,
  Link2,
  Mail,
  MessageSquare,
  Shield,
  Sliders,
  Users,
  Zap,
} from 'lucide-react';

interface SettingsContentProps {
  data: any;
}

export default function SettingsContent({ data }: SettingsContentProps) {
  const settings = data?.settings as Record<string, string> | undefined;

  const [activeTab, setActiveTab] = useState<'apercu' | 'equipe' | 'projets'>('apercu');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    supportEmail: true,
    stripeMode: settings?.stripeMode === 'Test',
    autoAssign: settings?.autoAssign === 'Actif',
    reminders: true,
    webhook: settings?.webhook === 'Sain',
    newsletter: false,
  });

  const toggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 pb-20 shadow-lg sm:p-8 sm:pb-24">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/5 [mask-image:linear-gradient(to_top,white,transparent)]" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-200">Configuration</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Parametres</h1>
          <p className="mt-1 text-sm text-primary-100">Configuration de la plateforme Droit Habitat</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="relative -mt-14 px-4 sm:-mt-16 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-100/50 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-bold text-white shadow-lg shadow-primary-600/30">
                  AD
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold text-gray-900">Administrateur Droit Habitat</h2>
                <p className="text-sm text-gray-500">{settings?.supportEmail || 'ops@droithabitat.fr'}</p>
                <span className="mt-2 inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700">
                  Super Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tab active={activeTab === 'apercu'} onClick={() => setActiveTab('apercu')}>
                Apercu
              </Tab>
              <Tab active={activeTab === 'equipe'} onClick={() => setActiveTab('equipe')}>
                Equipe
              </Tab>
              <Tab active={activeTab === 'projets'} onClick={() => setActiveTab('projets')}>
                Projets
              </Tab>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'apercu' && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Platform Settings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Platform Settings</h3>
              <p className="text-xs text-gray-400">Parametres operationnels</p>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Compte</p>
                  <div className="mt-3 space-y-3">
                    <SettingRow
                      icon={<Mail size={16} />}
                      label="Email support"
                      value={settings?.supportEmail || '-'}
                      active={toggles.supportEmail}
                      onToggle={() => toggle('supportEmail')}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Application</p>
                  <div className="mt-3 space-y-3">
                    <SettingRow
                      icon={<CreditCard size={16} />}
                      label="Mode Stripe"
                      value={settings?.stripeMode || '-'}
                      active={toggles.stripeMode}
                      onToggle={() => toggle('stripeMode')}
                    />
                    <SettingRow
                      icon={<Sliders size={16} />}
                      label="Attribution auto"
                      value={settings?.autoAssign || '-'}
                      active={toggles.autoAssign}
                      onToggle={() => toggle('autoAssign')}
                    />
                    <SettingRow
                      icon={<Bell size={16} />}
                      label="Relances"
                      value={settings?.reminders || '-'}
                      active={toggles.reminders}
                      onToggle={() => toggle('reminders')}
                    />
                    <SettingRow
                      icon={<Link2 size={16} />}
                      label="Webhook"
                      value={settings?.webhook || '-'}
                      active={toggles.webhook}
                      onToggle={() => toggle('webhook')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Info */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Informations</h3>
              <p className="text-xs text-gray-400">Details de la plateforme</p>

              <div className="mt-6 space-y-4">
                <InfoRow icon={<Globe size={18} />} label="Nom" value="Droit Habitat" />
                <InfoRow icon={<Shield size={18} />} label="Role admin" value="Super Admin" />
                <InfoRow icon={<AtSign size={18} />} label="Contact" value={settings?.supportEmail || 'ops@droithabitat.fr'} />
                <InfoRow icon={<Zap size={18} />} label="Statut" value="Actif" />
                <InfoRow icon={<MessageSquare size={18} />} label="Support" value="Email & chat" />
              </div>

              <div className="mt-6 rounded-xl bg-primary-50 p-4">
                <p className="text-sm font-semibold text-primary-900">Besoin d&apos;aide ?</p>
                <p className="mt-1 text-xs leading-relaxed text-primary-700">
                  Consultez la documentation ou contactez l&apos;equipe technique pour configurer la plateforme.
                </p>
                <button
                  onClick={() => alert('Documentation (demo)')}
                  className="mt-3 w-full rounded-xl bg-primary-600 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-primary-700"
                >
                  Documentation
                </button>
              </div>
            </div>

            {/* Team */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Equipe</h3>
                  <p className="text-xs text-gray-400">Utilisateurs actifs</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Users size={16} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {data.users.map((user: any) => {
                  const initials = user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase();
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-primary-600 shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.role}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(user.status)}`}
                      >
                        {getStatusLabel(user.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent dossiers */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dossiers recents</h3>
                <p className="text-xs text-gray-400">Derniers dossiers actifs sur la plateforme</p>
              </div>
              <a
                href="/dashboard/admin/dossiers"
                className="group flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
              >
                Voir tout
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentDossiers.slice(0, 3).map((dossier: any) => {
                const clientName = `${dossier.client?.prenom || ''} ${dossier.client?.nom || ''}`.trim() || 'Client demo';
                return (
                  <div
                    key={dossier.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-500">{dossier.reference}</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dossier.statut)}`}
                      >
                        {getStatusLabel(dossier.statut)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-gray-900">{clientName}</p>
                    <p className="text-xs text-gray-400">
                      {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Mediation' : 'Accompagnement complet'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {['bg-primary-200', 'bg-primary-300', 'bg-primary-400'].map((color, i) => (
                          <div
                            key={i}
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ${color} text-[10px] font-bold text-white`}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <a
                        href="/dashboard/admin/dossiers"
                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:border-primary-200 hover:text-primary-700"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'equipe' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <Users size={40} className="mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-bold text-gray-900">Equipe</h3>
          <p className="text-sm text-gray-500">Gestion avancee de l&apos;equipe disponible prochainement.</p>
        </div>
      )}

      {activeTab === 'projets' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <Shield size={40} className="mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-bold text-gray-900">Projets</h3>
          <p className="text-sm text-gray-500">Vue projets disponible prochainement.</p>
        </div>
      )}
    </>
  );
}

function Tab({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
        active ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function SettingRow({
  icon,
  label,
  value,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{value}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-5 w-9 rounded-full transition-colors ${active ? 'bg-primary-500' : 'bg-gray-200'}`}
        aria-label={active ? 'Desactiver' : 'Activer'}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            active ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
