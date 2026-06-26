import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Shield, 
  ArrowRight, 
  AlertCircle, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Layers,
  Banknote,
  Search,
  Building
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams?: { scenario?: string; message?: string };
}

export default async function ClientDashboard({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);
  
  let dossiers: any[] = [];

  if (isPreview) {
    // In preview mode, read Nadia Alaoui's dossiers (preview-client)
    dossiers = devStore.dossiers.filter((d) => d.client_id === 'preview-client');
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data } = await supabase
        .from('dossiers')
        .select('*, documents(*), mediation_etapes(*)')
        .eq('client_id', session.user.id)
        .order('date_creation', { ascending: false });

      dossiers = data || [];
    }
  }

  // Calculate statistics
  const totalCount = dossiers.length;
  const incompleteCount = dossiers.filter((d) => !d.date_formulaire_complete).length;
  const analysisCount = dossiers.filter((d) => d.statut === 'analyse_en_cours').length;
  const reportCount = dossiers.filter((d) => d.statut === 'rapport_genere' || d.statut === 'livre').length;
  const mediationCount = dossiers.filter((d) => d.statut === 'mediation_en_cours').length;
  const closedCount = dossiers.filter((d) => ['cloture', 'autonomie', 'mediation_terminee'].includes(d.statut)).length;

  // Determine "Ajouter formulaire" redirect URL
  const incompleteDossier = dossiers.find((d) => !d.date_formulaire_complete);
  let buttonHref = '/dashboard/client/formulaire';
  
  if (incompleteDossier) {
    buttonHref = `/dashboard/client/formulaire?id=${incompleteDossier.id}`;
  } else if (totalCount > 0) {
    buttonHref = '/dashboard/client/paiement-dossier';
  }

  // Helper function to get redirection for a specific dossier card
  const getDossierHref = (d: any) => {
    const base = `/dashboard/client`;
    if (!d.date_formulaire_complete) {
      return `${base}/formulaire?id=${d.id}`;
    }
    if (d.statut === 'analyse_en_cours') {
      return `${base}/analyse?id=${d.id}`;
    }
    if (['rapport_genere', 'livre'].includes(d.statut)) {
      return `${base}/rapport?id=${d.id}`;
    }
    if (['mediation_en_cours', 'negociation_payment_pending', 'negociation_paid', 'negociation_en_attente_assignation', 'negociation_en_cours'].includes(d.statut)) {
      return `${base}/negociateur?id=${d.id}`;
    }
    // Closed, autonomy, etc.
    return `${base}/negociateur?id=${d.id}`;
  };

  const getDossierStageLabel = (d: any) => {
    if (!d.date_formulaire_complete) return 'Formulaire à compléter';
    if (d.statut === 'analyse_en_cours') return 'Analyse par l\'IA en cours';
    if (['rapport_genere', 'livre'].includes(d.statut)) return 'Mémoire d\'expertise disponible';
    if (['mediation_en_cours', 'negociation_payment_pending', 'negociation_paid', 'negociation_en_attente_assignation', 'negociation_en_cours'].includes(d.statut)) return 'Conciliation / Médiation en cours';
    return 'Dossier clôturé';
  };

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="space-y-8">
        {isPreview && (
          <PreviewScenarioNav currentPath="/dashboard/client" currentScenario={previewScenario} />
        )}

        {searchParams?.message && (
          <div className="rounded-2xl border border-success-200 bg-success-50 p-4 text-sm font-bold text-success-800 flex items-center gap-2">
            <CheckCircle size={16} />
            {searchParams.message}
          </div>
        )}

        {/* Header Block with button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Tableau de bord</h1>
            <p className="mt-1 text-gray-500">Gérez et suivez l&apos;intégralité de vos dossiers d&apos;expertise juridique</p>
          </div>

          <Link
            href={buttonHref}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary-500/10 transition-all hover:scale-[1.01] hover:bg-primary-700 hover:shadow-lg w-full sm:w-auto"
          >
            <Plus size={16} />
            Nouveau dossier
          </Link>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
              <Briefcase size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Dossiers</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{totalCount}</p>
            </div>
          </div>

          {/* Card 2: En attente */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">En attente / Remplissage</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{incompleteCount}</p>
            </div>
          </div>

          {/* Card 3: Analyse */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Analyse IA</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{analysisCount}</p>
            </div>
          </div>

          {/* Card 4: Rapports & Mediation */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Livrés / En médiation</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{reportCount + mediationCount + closedCount}</p>
            </div>
          </div>
        </div>

        {/* Detailed Dossiers List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Vos dossiers d&apos;expertise</h2>

          {dossiers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300 mb-4">
                <FileText size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Aucun dossier actif</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Vous n&apos;avez pas encore de dossier. Cliquez sur le bouton ci-dessus pour compléter votre premier formulaire d&apos;éligibilité.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {dossiers.map((d) => {
                const creditDetails = d.formulaire_data?.organisme 
                  ? `${d.formulaire_data.organisme} (${d.formulaire_data.type_credit || 'Crédit'})`
                  : 'Détails non renseignés';
                const createdDate = new Date(d.date_creation).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div 
                    key={d.id}
                    className="relative group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top row */}
                      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Référence</p>
                          <p className="text-sm font-bold text-gray-900 font-mono mt-0.5">{d.reference}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusColor(d.statut)}`}>
                          {getStatusLabel(d.statut)}
                        </span>
                      </div>

                      {/* Content row */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                          <Building size={14} className="text-gray-400" />
                          <span className="truncate">{creditDetails}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                          <Clock size={14} className="text-gray-400" />
                          <span>Créé le {createdDate}</span>
                        </div>
                        {d.formulaire_data?.montant_crédit && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <Banknote size={14} className="text-gray-400" />
                            <span>Montant : {d.formulaire_data.montant_crédit} €</span>
                          </div>
                        )}
                      </div>

                      {/* Timeline current step hint */}
                      <div className="rounded-xl bg-gray-50 p-3 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse shrink-0" />
                        <span className="text-[11px] font-bold text-gray-600 truncate">{getDossierStageLabel(d)}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                      <Link
                        href={getDossierHref(d)}
                        className="flex-1 text-center rounded-xl bg-primary-50 hover:bg-primary-100 text-xs font-bold text-primary-700 py-3 transition-colors font-sans"
                      >
                        Consulter l&apos;étape
                      </Link>
                      <Link
                        href={getDossierHref(d)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Détails"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
