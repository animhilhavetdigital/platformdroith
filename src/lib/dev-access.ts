import { Dossier, Document, MediationEtape, Profile, UserRole } from '@/types';
import { devStore } from '@/lib/dev-store';

type PreviewProfile = Profile & {
  email?: string;
};

export type PreviewClientScenario =
  | 'new'
  | 'form'
  | 'documents'
  | 'analysis'
  | 'report'
  | 'orientation'
  | 'mediation'
  | 'autonomy'
  | 'closed';

export type PreviewAdminScenario = 'overview' | 'backlog' | 'growth';

export type PreviewNegotiatorScenario = 'active' | 'urgent' | 'closed';

const DEFAULT_PREVIEW_CLIENT_SCENARIO: PreviewClientScenario = 'mediation';
const DEFAULT_PREVIEW_ADMIN_SCENARIO: PreviewAdminScenario = 'overview';
const DEFAULT_PREVIEW_NEGOTIATOR_SCENARIO: PreviewNegotiatorScenario = 'active';

const ALL_PREVIEW_CLIENT_SCENARIOS: PreviewClientScenario[] = [
  'new', 'form', 'documents', 'analysis', 'report', 'orientation', 'mediation', 'autonomy', 'closed',
];

export const PREVIEW_CLIENT_SCENARIOS: Array<{
  id: PreviewClientScenario;
  label: string;
  description: string;
}> = [
  { id: 'new', label: 'Nouveau', description: 'Dossier cree, aucune information encore saisie.' },
  { id: 'form', label: 'Formulaire & Documents', description: 'Le client renseigne son dossier et depose ses pieces.' },
  { id: 'analysis', label: 'Analyse', description: 'Pieces deposees, analyse IA en cours.' },
  { id: 'report', label: 'Rapport', description: 'Rapport pret et consultable.' },
  { id: 'orientation', label: 'Orientation', description: 'Le client choisit la suite a donner.' },
  { id: 'mediation', label: 'Negociateur', description: 'Conciliation amiable deja engagee.' },
  { id: 'autonomy', label: 'Autonomie', description: 'Le client repart avec son dossier complet.' },
  { id: 'closed', label: 'Cloture', description: 'Parcours termine, retour qualite affiche.' },
];

export const PREVIEW_ADMIN_SCENARIOS: Array<{
  id: PreviewAdminScenario;
  label: string;
  description: string;
}> = [
  { id: 'overview', label: 'Overview', description: 'Pilotage normal de la plateforme avec activite stable.' },
  { id: 'backlog', label: 'Backlog', description: 'Pic d activite avec accumulation de dossiers en attente.' },
  { id: 'growth', label: 'Croissance', description: 'Hausse du volume, plus d utilisateurs et de livraisons.' },
];

export const PREVIEW_NEGOTIATOR_SCENARIOS: Array<{
  id: PreviewNegotiatorScenario;
  label: string;
  description: string;
}> = [
  { id: 'active', label: 'Actif', description: 'Portefeuille courant avec mediations en cours.' },
  { id: 'urgent', label: 'Urgent', description: 'Dossiers sensibles a relancer rapidement.' },
  { id: 'closed', label: 'Cloture', description: 'Portefeuille surtout finalise, focus reporting.' },
];

const DEMO_FORM_DATA: Record<string, string> = {
  'type_problème': 'Fraude / Demarchage abusif',
  'montant_crédit': '18900',
  organisme: 'Finacredit Habitat',
  date_survenance: '2026-03-14',
  'numéro_dossier': 'CR-784512',
  description:
    'Le contrat a ete signe a domicile apres un demarchage insistant. Les informations precontractuelles paraissent incompletes et la solvabilite n a pas ete verifiee serieusement.',
};

const DEMO_FORM_DRAFT: Record<string, string> = {
  'type_problème': 'Fraude / Demarchage abusif',
  'montant_crédit': '18900',
  organisme: 'Finacredit Habitat',
};

const DEMO_REPORT_DATA = {
  title: 'Memoire juridique de contestation',
  verdict: 'Fort potentiel de contestation',
  summary:
    'Le dossier presente plusieurs irregularites exploitables : demarchage contestable, information precontractuelle incomplete et verification de solvabilite insuffisante.',
  irregularities: [
    'Verification de solvabilite incomplete avant signature.',
    'Informations contractuelles insuffisamment explicites sur le cout total.',
    'Signature recueillie a domicile dans un contexte de pression commerciale.',
  ],
  recommendations: [
    'Conserver tous les echanges et justificatifs deja reunis.',
    'Envoyer une mise en demeure structuree avec les pieces du dossier.',
    'Preparer une voie amiable en priorite avant transmission contentieuse.',
  ],
  generated_at: daysAgo(1),
};

const BASE_DOCUMENTS: Array<Omit<Document, 'id' | 'dossier_id'>> = [
  {
    type: 'contrat_credit',
    nom_fichier: 'contrat-credit.pdf',
    storage_path: 'preview/contrat-credit.pdf',
    ocr_text: null,
    ocr_confidence: null,
    taille_octets: 245760,
    mime_type: 'application/pdf',
    created_at: daysAgo(6),
  },
  {
    type: 'releve_bancaire',
    nom_fichier: 'releve-bancaire.pdf',
    storage_path: 'preview/releve-bancaire.pdf',
    ocr_text: null,
    ocr_confidence: null,
    taille_octets: 194560,
    mime_type: 'application/pdf',
    created_at: daysAgo(4),
  },
  {
    type: 'mise_en_demeure',
    nom_fichier: 'mise-en-demeure.docx',
    storage_path: 'preview/mise-en-demeure.docx',
    ocr_text: null,
    ocr_confidence: null,
    taille_octets: 168220,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: daysAgo(2),
  },
];

export function isDevAccessEnabled() {
  return (
    process.env.DEV_FORCE_ACCESS === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')
  );
}

export function getPreviewRole(allowedRoles: UserRole[]): UserRole {
  return allowedRoles[0] ?? 'client';
}

export function getPreviewRoleFromPath(pathname: string): UserRole {
  if (pathname.startsWith('/dashboard/super-admin') || pathname.startsWith('/dashboard/admin')) {
    return 'super_admin';
  }

  if (pathname.startsWith('/dashboard/negociateur') || pathname.startsWith('/dashboard/negotiator')) {
    return 'negotiator';
  }

  return 'client';
}

export function normalizePreviewClientScenario(scenario?: string): PreviewClientScenario {
  const match = ALL_PREVIEW_CLIENT_SCENARIOS.find((id) => id === scenario);
  return match ?? DEFAULT_PREVIEW_CLIENT_SCENARIO;
}

export function normalizePreviewAdminScenario(scenario?: string): PreviewAdminScenario {
  const match = PREVIEW_ADMIN_SCENARIOS.find((item) => item.id === scenario);
  return match?.id ?? DEFAULT_PREVIEW_ADMIN_SCENARIO;
}

export function normalizePreviewNegotiatorScenario(
  scenario?: string
): PreviewNegotiatorScenario {
  const match = PREVIEW_NEGOTIATOR_SCENARIOS.find((item) => item.id === scenario);
  return match?.id ?? DEFAULT_PREVIEW_NEGOTIATOR_SCENARIO;
}

export function buildPreviewHref(path: string, scenario?: string) {
  if (!scenario) {
    return path;
  }

  const url = new URL(path, 'http://preview.local');
  url.searchParams.set('scenario', scenario);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

export function getPreviewProfile(role: UserRole): PreviewProfile {
  const profiles: Record<UserRole, PreviewProfile> = {
    super_admin: {
      id: 'preview-admin',
      role: 'super_admin',
      nom: 'Admin',
      prenom: 'Demo',
      téléphone: '+33 6 11 22 33 44',
      avatar_url: undefined,
      email: 'admin@preview.local',
      created_at: daysAgo(90),
      updated_at: daysAgo(1),
    },
    negotiator: {
      id: 'preview-negotiator',
      role: 'negotiator',
      nom: 'Bennani',
      prenom: 'Samir',
      téléphone: '+33 6 55 44 33 22',
      avatar_url: undefined,
      email: 'negotiator@preview.local',
      created_at: daysAgo(120),
      updated_at: daysAgo(1),
    },
    client: {
      id: 'preview-client',
      role: 'client',
      nom: 'Alaoui',
      prenom: 'Nadia',
      téléphone: '+33 6 77 88 99 11',
      avatar_url: undefined,
      email: 'client@preview.local',
      created_at: daysAgo(20),
      updated_at: daysAgo(1),
    },
  };

  return profiles[role];
}

export function getPreviewAdminData(
  scenario: PreviewAdminScenario = DEFAULT_PREVIEW_ADMIN_SCENARIO
) {
  const dossiers = buildAdminDossiers(scenario);
  const totals = {
    overview: { totalDossiers: 18, totalClients: 11, totalNegotiators: 3 },
    backlog: { totalDossiers: 26, totalClients: 17, totalNegotiators: 4 },
    growth: { totalDossiers: 39, totalClients: 28, totalNegotiators: 6 },
  }[scenario];

  const users = {
    overview: [
      { id: 'usr-1', name: 'Nadia Alaoui', role: 'Client', email: 'nadia.alaoui@example.com', status: 'Actif', assigned: 1, lastActive: 'Il y a 2 h' },
      { id: 'usr-2', name: 'Samir Bennani', role: 'Negociateur', email: 'samir.bennani@example.com', status: 'Actif', assigned: 6, lastActive: 'Il y a 10 min' },
      { id: 'usr-3', name: 'Meriem Tazi', role: 'Client', email: 'meriem.tazi@example.com', status: 'Livre', assigned: 0, lastActive: 'Aujourd hui' },
    ],
    backlog: [
      { id: 'usr-4', name: 'Nora Mekki', role: 'Client', email: 'nora.mekki@example.com', status: 'Pieces attendues', assigned: 0, lastActive: 'Il y a 30 min' },
      { id: 'usr-5', name: 'Rida Kabbaj', role: 'Client', email: 'rida.kabbaj@example.com', status: 'Pieces attendues', assigned: 0, lastActive: 'Il y a 1 h' },
      { id: 'usr-6', name: 'Samir Bennani', role: 'Negociateur', email: 'samir.bennani@example.com', status: 'Sature', assigned: 9, lastActive: 'Il y a 5 min' },
      { id: 'usr-7', name: 'Leila Karti', role: 'Negociateur', email: 'leila.karti@example.com', status: 'Actif', assigned: 8, lastActive: 'Il y a 18 min' },
    ],
    growth: [
      { id: 'usr-8', name: 'Kenza Daoudi', role: 'Client', email: 'kenza.daoudi@example.com', status: 'Livre', assigned: 0, lastActive: 'Aujourd hui' },
      { id: 'usr-9', name: 'Nabil Chami', role: 'Client', email: 'nabil.chami@example.com', status: 'Mediation', assigned: 0, lastActive: 'Il y a 45 min' },
      { id: 'usr-10', name: 'Mona Ait Lahcen', role: 'Client', email: 'mona.aitlahcen@example.com', status: 'Analyse', assigned: 0, lastActive: 'Il y a 2 h' },
      { id: 'usr-11', name: 'Leila Karti', role: 'Negociateur', email: 'leila.karti@example.com', status: 'Actif', assigned: 7, lastActive: 'Il y a 8 min' },
    ],
  }[scenario];

  const stats = {
    overview: {
      conversionRate: '41%',
      avgAnalysisHours: '38h',
      satisfaction: '4.6/5',
      recoveredAmount: '126 kEUR',
      monthlyVolumes: [8, 11, 13, 15, 18, 17],
    },
    backlog: {
      conversionRate: '34%',
      avgAnalysisHours: '52h',
      satisfaction: '4.2/5',
      recoveredAmount: '118 kEUR',
      monthlyVolumes: [12, 14, 16, 18, 23, 27],
    },
    growth: {
      conversionRate: '47%',
      avgAnalysisHours: '29h',
      satisfaction: '4.8/5',
      recoveredAmount: '168 kEUR',
      monthlyVolumes: [10, 12, 16, 21, 24, 29],
    },
  }[scenario];

  const settings = {
    overview: { stripeMode: 'Test', autoAssign: 'Actif', reminders: '24h', webhook: 'Sain', supportEmail: 'ops@droithabitat.fr' },
    backlog: { stripeMode: 'Test', autoAssign: 'Actif', reminders: '12h', webhook: 'A surveiller', supportEmail: 'priorite@droithabitat.fr' },
    growth: { stripeMode: 'Test', autoAssign: 'Actif', reminders: '24h', webhook: 'Renforce', supportEmail: 'scale@droithabitat.fr' },
  }[scenario];

  return {
    ...totals,
    dossiers,
    recentDossiers: dossiers.slice(0, 4),
    users,
    settings,
    stats: {
      ...stats,
      statusBreakdown: buildStatusBreakdown(dossiers),
    },
  };
}

export function getPreviewClientData(
  scenario: PreviewClientScenario = DEFAULT_PREVIEW_CLIENT_SCENARIO
) {
  const client = getPreviewProfile('client');
  const targetId = scenario === 'mediation' ? 'dos-client-1' : `dos-client-${scenario === 'documents' ? 'docs' : scenario}`;

  const existing = devStore.dossiers.find((d) => d.id === targetId);
  if (existing) {
    return { dossier: existing };
  }

  let dossier: Dossier;
  switch (scenario) {
    case 'new':
      dossier = buildPreviewDossier({
        id: 'dos-client-new',
        reference: 'DH-2026-CL-099',
        statut: 'nouveau',
        offre: '2',
        client,
        date_creation: daysAgo(1),
      });
      break;

    case 'form':
      dossier = buildPreviewDossier({
        id: 'dos-client-form',
        reference: 'DH-2026-CL-078',
        statut: 'formulaire_en_cours',
        offre: '2',
        client,
        date_creation: daysAgo(3),
        formulaire_data: DEMO_FORM_DRAFT,
      });
      break;

    case 'documents':
      dossier = buildPreviewDossier({
        id: 'dos-client-docs',
        reference: 'DH-2026-CL-051',
        statut: 'pieces_attendues',
        offre: '2',
        client,
        date_creation: daysAgo(8),
        date_formulaire_complete: daysAgo(7),
        formulaire_data: DEMO_FORM_DATA,
      });
      break;

    case 'analysis':
      dossier = buildPreviewDossier({
        id: 'dos-client-analysis',
        reference: 'DH-2026-CL-032',
        statut: 'analyse_en_cours',
        offre: '2',
        client,
        date_creation: daysAgo(10),
        date_formulaire_complete: daysAgo(9),
        date_upload_complete: daysAgo(6),
        date_analyse_debut: daysAgo(2),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-client-analysis'),
      });
      break;

    case 'report':
      dossier = buildPreviewDossier({
        id: 'dos-client-report',
        reference: 'DH-2026-CL-021',
        statut: 'livre',
        offre: '2',
        client,
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(12),
        date_formulaire_complete: daysAgo(11),
        date_upload_complete: daysAgo(8),
        date_analyse_debut: daysAgo(6),
        date_livraison: daysAgo(1),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-client-report'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      });
      break;

    case 'orientation':
      dossier = buildPreviewDossier({
        id: 'dos-client-orientation',
        reference: 'DH-2026-CL-019',
        statut: 'orientation_en_cours',
        offre: '2',
        client,
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(13),
        date_formulaire_complete: daysAgo(12),
        date_upload_complete: daysAgo(9),
        date_analyse_debut: daysAgo(7),
        date_livraison: daysAgo(2),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-client-orientation'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      });
      break;

    case 'autonomy':
      dossier = buildPreviewDossier({
        id: 'dos-client-autonomy',
        reference: 'DH-2026-CL-017',
        statut: 'autonomie',
        offre: '1',
        client,
        date_creation: daysAgo(14),
        date_formulaire_complete: daysAgo(13),
        date_upload_complete: daysAgo(10),
        date_analyse_debut: daysAgo(8),
        date_livraison: daysAgo(3),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-client-autonomy'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 7,
      });
      break;

    case 'closed':
      dossier = buildPreviewDossier({
        id: 'dos-client-closed',
        reference: 'DH-2026-CL-014',
        statut: 'cloture',
        offre: '2',
        client,
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(18),
        date_formulaire_complete: daysAgo(17),
        date_upload_complete: daysAgo(14),
        date_analyse_debut: daysAgo(12),
        date_livraison: daysAgo(8),
        date_cloture: daysAgo(1),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-client-closed'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      });
      dossier.mediation_etapes = buildPreviewMediationEtapes(dossier.id, 5);
      break;

    case 'mediation':
    default:
      dossier = buildPreviewDossier({
        id: 'dos-client-1',
        reference: 'DH-2026-CL-014',
        statut: 'mediation_en_cours',
        offre: '2',
        client,
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(10),
        date_formulaire_complete: daysAgo(9),
        date_upload_complete: daysAgo(6),
        date_analyse_debut: daysAgo(4),
        date_livraison: daysAgo(2),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-client-1'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      });
      dossier.mediation_etapes = buildPreviewMediationEtapes(dossier.id, 2);
      break;
  }

  devStore.dossiers.push(dossier);
  return { dossier };
}

export function getPreviewNewClientData() {
  return getPreviewClientData('new');
}

export function getPreviewNegotiatorData(
  scenario: PreviewNegotiatorScenario = DEFAULT_PREVIEW_NEGOTIATOR_SCENARIO
) {
  const mesDossiers = buildNegotiatorDossiers(scenario);

  mesDossiers.forEach((dossier) => {
    const completedCount =
      dossier.statut === 'cloture' ? 5 : dossier.statut === 'rapport_genere' ? 3 : 2;
    dossier.mediation_etapes = buildPreviewMediationEtapes(dossier.id, completedCount);
  });

  return {
    mesDossiers,
    count: mesDossiers.length,
    mediationQueue: mesDossiers.map((dossier, index) => ({
      id: dossier.id,
      reference: dossier.reference,
      clientName: `${(dossier.client as PreviewProfile)?.prenom} ${(dossier.client as PreviewProfile)?.nom}`,
      priority:
        scenario === 'urgent' && index === 0 ? 'Haute' : index === 0 ? 'Normale' : 'Suivi',
      nextAction:
        dossier.statut === 'rapport_genere' ? 'Appeler le client' : 'Relancer la partie prenante',
      dueIn: index === 0 ? 'Aujourd hui' : index === 1 ? '24h' : '48h',
    })),
    reportQueue: mesDossiers
      .filter(
        (dossier) =>
          dossier.rapport_url ||
          dossier.statut === 'rapport_genere' ||
          dossier.statut === 'livre'
      )
      .map((dossier) => ({
        id: dossier.id,
        reference: dossier.reference,
        clientName: `${(dossier.client as PreviewProfile)?.prenom} ${(dossier.client as PreviewProfile)?.nom}`,
        status: dossier.statut,
        updatedAt: dossier.updated_at,
      })),
  };
}

export function getPreviewNegotiatorDossierById(
  dossierId: string,
  scenario: PreviewNegotiatorScenario = DEFAULT_PREVIEW_NEGOTIATOR_SCENARIO
) {
  const currentScenarioMatch = getPreviewNegotiatorData(scenario).mesDossiers.find(
    (dossier) => dossier.id === dossierId
  );

  if (currentScenarioMatch) {
    return currentScenarioMatch;
  }

  const scenarios: PreviewNegotiatorScenario[] = ['active', 'urgent', 'closed'];
  for (const candidate of scenarios) {
    const match = getPreviewNegotiatorData(candidate).mesDossiers.find(
      (dossier) => dossier.id === dossierId
    );
    if (match) {
      return match;
    }
  }

  return null;
}

function buildAdminDossiers(scenario: PreviewAdminScenario): Dossier[] {
  const client = getPreviewProfile('client');

  if (scenario === 'backlog') {
    return [
      buildPreviewDossier({
        id: 'dos-admin-backlog-1',
        reference: 'DH-2026-031',
        statut: 'pieces_attendues',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Mekki', prenom: 'Nora', email: 'nora.mekki@example.com' }),
        date_creation: daysAgo(1),
        date_formulaire_complete: daysAgo(1),
        formulaire_data: DEMO_FORM_DATA,
      }),
      buildPreviewDossier({
        id: 'dos-admin-backlog-2',
        reference: 'DH-2026-032',
        statut: 'pieces_attendues',
        offre: '1',
        client: clientProfile({ ...client, nom: 'Kabbaj', prenom: 'Rida', email: 'rida.kabbaj@example.com' }),
        date_creation: daysAgo(2),
        date_formulaire_complete: daysAgo(2),
        formulaire_data: DEMO_FORM_DATA,
      }),
      buildPreviewDossier({
        id: 'dos-admin-backlog-3',
        reference: 'DH-2026-033',
        statut: 'analyse_en_cours',
        offre: '3',
        client: clientProfile({ ...client, nom: 'Lahlou', prenom: 'Anis', email: 'anis.lahlou@example.com' }),
        date_creation: daysAgo(3),
        date_formulaire_complete: daysAgo(3),
        date_upload_complete: daysAgo(2),
        date_analyse_debut: daysAgo(1),
        documents: cloneDocumentsForDossier('dos-admin-backlog-3'),
        formulaire_data: DEMO_FORM_DATA,
      }),
      buildPreviewDossier({
        id: 'dos-admin-backlog-4',
        reference: 'DH-2026-034',
        statut: 'analyse_en_cours',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Bouziane', prenom: 'Ines', email: 'ines.bouziane@example.com' }),
        date_creation: daysAgo(4),
        date_formulaire_complete: daysAgo(3),
        date_upload_complete: daysAgo(2),
        date_analyse_debut: daysAgo(1),
        documents: cloneDocumentsForDossier('dos-admin-backlog-4', 2),
        formulaire_data: DEMO_FORM_DATA,
      }),
      buildPreviewDossier({
        id: 'dos-admin-backlog-5',
        reference: 'DH-2026-035',
        statut: 'rapport_genere',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Rahmani', prenom: 'Samya', email: 'samya.rahmani@example.com' }),
        date_creation: daysAgo(5),
        date_formulaire_complete: daysAgo(4),
        date_upload_complete: daysAgo(3),
        date_analyse_debut: daysAgo(2),
        date_livraison: daysAgo(1),
        documents: cloneDocumentsForDossier('dos-admin-backlog-5'),
        formulaire_data: DEMO_FORM_DATA,
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 7,
      }),
    ];
  }

  if (scenario === 'growth') {
    return [
      buildPreviewDossier({
        id: 'dos-admin-growth-1',
        reference: 'DH-2026-061',
        statut: 'livre',
        offre: '1',
        client: clientProfile({ ...client, nom: 'Daoudi', prenom: 'Kenza', email: 'kenza.daoudi@example.com' }),
        date_creation: daysAgo(6),
        date_formulaire_complete: daysAgo(5),
        date_upload_complete: daysAgo(4),
        date_analyse_debut: daysAgo(3),
        date_livraison: daysAgo(1),
        documents: cloneDocumentsForDossier('dos-admin-growth-1'),
        formulaire_data: DEMO_FORM_DATA,
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      }),
      buildPreviewDossier({
        id: 'dos-admin-growth-2',
        reference: 'DH-2026-062',
        statut: 'orientation_en_cours',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Tlemcani', prenom: 'Salma', email: 'salma.tlemcani@example.com' }),
        date_creation: daysAgo(7),
        date_formulaire_complete: daysAgo(6),
        date_upload_complete: daysAgo(5),
        date_analyse_debut: daysAgo(4),
        date_livraison: daysAgo(2),
        documents: cloneDocumentsForDossier('dos-admin-growth-2'),
        formulaire_data: DEMO_FORM_DATA,
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 9,
      }),
      buildPreviewDossier({
        id: 'dos-admin-growth-3',
        reference: 'DH-2026-063',
        statut: 'mediation_en_cours',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Chami', prenom: 'Nabil', email: 'nabil.chami@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(4),
        date_formulaire_complete: daysAgo(4),
        date_upload_complete: daysAgo(3),
        date_analyse_debut: daysAgo(2),
        date_livraison: daysAgo(1),
        documents: cloneDocumentsForDossier('dos-admin-growth-3'),
        formulaire_data: DEMO_FORM_DATA,
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      }),
      buildPreviewDossier({
        id: 'dos-admin-growth-4',
        reference: 'DH-2026-064',
        statut: 'analyse_en_cours',
        offre: '3',
        client: clientProfile({ ...client, nom: 'Ait Lahcen', prenom: 'Mona', email: 'mona.aitlahcen@example.com' }),
        date_creation: daysAgo(2),
        date_formulaire_complete: daysAgo(2),
        date_upload_complete: daysAgo(1),
        date_analyse_debut: daysAgo(1),
        documents: cloneDocumentsForDossier('dos-admin-growth-4', 2),
        formulaire_data: DEMO_FORM_DATA,
      }),
      buildPreviewDossier({
        id: 'dos-admin-growth-5',
        reference: 'DH-2026-065',
        statut: 'cloture',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Belkadi', prenom: 'Imane', email: 'imane.belkadi@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(12),
        date_formulaire_complete: daysAgo(11),
        date_upload_complete: daysAgo(9),
        date_analyse_debut: daysAgo(7),
        date_livraison: daysAgo(5),
        date_cloture: daysAgo(1),
        documents: cloneDocumentsForDossier('dos-admin-growth-5'),
        formulaire_data: DEMO_FORM_DATA,
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      }),
    ];
  }

  return [
    buildPreviewDossier({
      id: 'dos-admin-overview-1',
      reference: 'DH-2026-001',
      statut: 'pieces_attendues',
      offre: '2',
      client: clientProfile({ ...client, nom: 'Benjelloun', prenom: 'Sara', email: 'sara.benjelloun@example.com' }),
      date_creation: daysAgo(2),
      date_formulaire_complete: daysAgo(2),
      formulaire_data: DEMO_FORM_DATA,
    }),
    buildPreviewDossier({
      id: 'dos-admin-overview-2',
      reference: 'DH-2026-002',
      statut: 'analyse_en_cours',
      offre: '3',
      client: clientProfile({ ...client, nom: 'Haddad', prenom: 'Youssef', email: 'youssef.haddad@example.com' }),
      date_creation: daysAgo(4),
      date_formulaire_complete: daysAgo(3),
      date_upload_complete: daysAgo(2),
      date_analyse_debut: daysAgo(1),
      documents: cloneDocumentsForDossier('dos-admin-overview-2'),
      formulaire_data: DEMO_FORM_DATA,
    }),
    buildPreviewDossier({
      id: 'dos-admin-overview-3',
      reference: 'DH-2026-003',
      statut: 'livre',
      offre: '1',
      client: clientProfile({ ...client, nom: 'Tazi', prenom: 'Meriem', email: 'meriem.tazi@example.com' }),
      date_creation: daysAgo(8),
      date_formulaire_complete: daysAgo(7),
      date_upload_complete: daysAgo(6),
      date_analyse_debut: daysAgo(5),
      date_livraison: daysAgo(1),
      documents: cloneDocumentsForDossier('dos-admin-overview-3'),
      formulaire_data: DEMO_FORM_DATA,
      rapport_url: '/demo/rapport.pdf',
      rapport_data: DEMO_REPORT_DATA,
      scoring_verdict: 'OUI',
      scoring_confiance: 9,
    }),
    buildPreviewDossier({
      id: 'dos-admin-overview-4',
      reference: 'DH-2026-004',
      statut: 'mediation_en_cours',
      offre: '2',
      client: clientProfile({ ...client, nom: 'Azzam', prenom: 'Loubna', email: 'loubna.azzam@example.com' }),
      negotiator_id: 'preview-negotiator',
      date_creation: daysAgo(6),
      date_formulaire_complete: daysAgo(5),
      date_upload_complete: daysAgo(4),
      date_analyse_debut: daysAgo(3),
      date_livraison: daysAgo(2),
      documents: cloneDocumentsForDossier('dos-admin-overview-4'),
      formulaire_data: DEMO_FORM_DATA,
      rapport_url: '/demo/rapport.pdf',
      rapport_data: DEMO_REPORT_DATA,
      scoring_verdict: 'OUI',
      scoring_confiance: 8,
    }),
  ];
}

function buildNegotiatorDossiers(
  scenario: PreviewNegotiatorScenario
): Dossier[] {
  const client = getPreviewProfile('client');

  if (scenario === 'urgent') {
    return [
      buildPreviewDossier({
        id: 'dos-neg-urgent-1',
        reference: 'DH-2026-NG-041',
        statut: 'mediation_en_cours',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Barka', prenom: 'Ilyas', email: 'ilyas.barka@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(9),
        date_formulaire_complete: daysAgo(8),
        date_upload_complete: daysAgo(6),
        date_analyse_debut: daysAgo(4),
        date_livraison: daysAgo(2),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-neg-urgent-1'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 9,
      }),
      buildPreviewDossier({
        id: 'dos-neg-urgent-2',
        reference: 'DH-2026-NG-042',
        statut: 'livre',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Slaoui', prenom: 'Myriam', email: 'myriam.slaoui@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(6),
        date_formulaire_complete: daysAgo(5),
        date_upload_complete: daysAgo(4),
        date_analyse_debut: daysAgo(3),
        date_livraison: daysAgo(1),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-neg-urgent-2'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      }),
      buildPreviewDossier({
        id: 'dos-neg-urgent-3',
        reference: 'DH-2026-NG-043',
        statut: 'mediation_en_cours',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Khoury', prenom: 'Nada', email: 'nada.khoury@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(11),
        date_formulaire_complete: daysAgo(10),
        date_upload_complete: daysAgo(8),
        date_analyse_debut: daysAgo(6),
        date_livraison: daysAgo(3),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-neg-urgent-3'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      }),
    ];
  }

  if (scenario === 'closed') {
    return [
      buildPreviewDossier({
        id: 'dos-neg-closed-1',
        reference: 'DH-2026-NG-061',
        statut: 'cloture',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Rami', prenom: 'Imane', email: 'imane.rami@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(18),
        date_formulaire_complete: daysAgo(17),
        date_upload_complete: daysAgo(15),
        date_analyse_debut: daysAgo(13),
        date_livraison: daysAgo(9),
        date_cloture: daysAgo(1),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-neg-closed-1'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      }),
      buildPreviewDossier({
        id: 'dos-neg-closed-2',
        reference: 'DH-2026-NG-062',
        statut: 'cloture',
        offre: '2',
        client: clientProfile({ ...client, nom: 'El Idrissi', prenom: 'Sami', email: 'sami.elidrissi@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(16),
        date_formulaire_complete: daysAgo(15),
        date_upload_complete: daysAgo(13),
        date_analyse_debut: daysAgo(11),
        date_livraison: daysAgo(7),
        date_cloture: daysAgo(2),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-neg-closed-2', 2),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 7,
      }),
      buildPreviewDossier({
        id: 'dos-neg-closed-3',
        reference: 'DH-2026-NG-063',
        statut: 'mediation_en_cours',
        offre: '2',
        client: clientProfile({ ...client, nom: 'Messaoudi', prenom: 'Lamia', email: 'lamia.messaoudi@example.com' }),
        negotiator_id: 'preview-negotiator',
        date_creation: daysAgo(4),
        date_formulaire_complete: daysAgo(4),
        date_upload_complete: daysAgo(3),
        date_analyse_debut: daysAgo(2),
        date_livraison: daysAgo(1),
        formulaire_data: DEMO_FORM_DATA,
        documents: cloneDocumentsForDossier('dos-neg-closed-3'),
        rapport_url: '/demo/rapport.pdf',
        rapport_data: DEMO_REPORT_DATA,
        scoring_verdict: 'OUI',
        scoring_confiance: 8,
      }),
    ];
  }

  return [
    buildPreviewDossier({
      id: 'dos-neg-active-1',
      reference: 'DH-2026-NG-021',
      statut: 'mediation_en_cours',
      offre: '2',
      client: clientProfile({ ...client, nom: 'Cherkaoui', prenom: 'Lina', email: 'lina.cherkaoui@example.com' }),
      negotiator_id: 'preview-negotiator',
      date_creation: daysAgo(12),
      date_formulaire_complete: daysAgo(11),
      date_upload_complete: daysAgo(9),
      date_analyse_debut: daysAgo(6),
      date_livraison: daysAgo(3),
      formulaire_data: DEMO_FORM_DATA,
      documents: cloneDocumentsForDossier('dos-neg-active-1'),
      rapport_url: '/demo/rapport.pdf',
      rapport_data: DEMO_REPORT_DATA,
      scoring_verdict: 'OUI',
      scoring_confiance: 8,
    }),
    buildPreviewDossier({
      id: 'dos-neg-active-2',
      reference: 'DH-2026-NG-022',
      statut: 'mediation_en_cours',
      offre: '2',
      client: clientProfile({ ...client, nom: 'Mouline', prenom: 'Karim', email: 'karim.mouline@example.com' }),
      negotiator_id: 'preview-negotiator',
      date_creation: daysAgo(5),
      date_formulaire_complete: daysAgo(4),
      date_upload_complete: daysAgo(3),
      date_analyse_debut: daysAgo(2),
      date_livraison: daysAgo(1),
      formulaire_data: DEMO_FORM_DATA,
      documents: cloneDocumentsForDossier('dos-neg-active-2', 2),
      rapport_url: '/demo/rapport.pdf',
      rapport_data: DEMO_REPORT_DATA,
      scoring_verdict: 'OUI',
      scoring_confiance: 7,
    }),
    buildPreviewDossier({
      id: 'dos-neg-active-3',
      reference: 'DH-2026-NG-023',
      statut: 'rapport_genere',
      offre: '2',
      client: clientProfile({ ...client, nom: 'Rami', prenom: 'Imane', email: 'imane.rami@example.com' }),
      negotiator_id: 'preview-negotiator',
      date_creation: daysAgo(7),
      date_formulaire_complete: daysAgo(6),
      date_upload_complete: daysAgo(5),
      date_analyse_debut: daysAgo(4),
      date_livraison: daysAgo(1),
      formulaire_data: DEMO_FORM_DATA,
      documents: cloneDocumentsForDossier('dos-neg-active-3'),
      rapport_data: DEMO_REPORT_DATA,
      scoring_verdict: 'OUI',
      scoring_confiance: 8,
    }),
  ];
}

function clientProfile(profile: PreviewProfile): PreviewProfile {
  return profile;
}

function buildStatusBreakdown(dossiers: Dossier[]) {
  const labels = [
    { id: 'pieces_attendues', label: 'Pieces attendues' },
    { id: 'analyse_en_cours', label: 'Analyse' },
    { id: 'livre', label: 'Livres' },
    { id: 'mediation_en_cours', label: 'Mediations' },
    { id: 'cloture', label: 'Clotures' },
  ] as const;

  return labels.map((entry) => ({
    label: entry.label,
    value: dossiers.filter((dossier) => dossier.statut === entry.id).length,
  }));
}

function cloneDocumentsForDossier(dossierId: string, count = 3): Document[] {
  return BASE_DOCUMENTS.slice(0, count).map((document, index) => ({
    ...document,
    id: `${dossierId}-doc-${index + 1}`,
    dossier_id: dossierId,
  }));
}

function buildPreviewMediationEtapes(
  dossierId: string,
  completedCount = 2
): MediationEtape[] {
  const labels = [
    'Envoi de la mise en demeure',
    'Prise de contact avec la partie prenante',
    'Analyse des pieces complementaires',
    "Proposition d'accord amiable",
    'Cloture de la mediation',
  ];

  return labels.map((label, index) => ({
    id: `etape-${dossierId}-${index}`,
    dossier_id: dossierId,
    label,
    ordre: index,
    complete: index < completedCount,
    completed_at: index < completedCount ? daysAgo(Math.max(1, completedCount - index)) : null,
    completed_by: index < completedCount ? 'preview-negotiator' : null,
    created_at: daysAgo(5),
  }));
}

function buildPreviewDossier({
  id,
  reference,
  statut,
  offre,
  client,
  date_creation,
  documents = [],
  negotiator_id = null,
  scoring_verdict = null,
  scoring_confiance = null,
  date_formulaire_complete = null,
  date_upload_complete = null,
  date_analyse_debut = null,
  date_livraison = null,
  date_cloture = null,
  formulaire_data = {},
  rapport_url = null,
  rapport_data = {},
}: {
  id: string;
  reference: string;
  statut: Dossier['statut'];
  offre: Dossier['offre'];
  client: PreviewProfile;
  date_creation: string;
  documents?: Document[];
  negotiator_id?: string | null;
  scoring_verdict?: string | null;
  scoring_confiance?: number | null;
  date_formulaire_complete?: string | null;
  date_upload_complete?: string | null;
  date_analyse_debut?: string | null;
  date_livraison?: string | null;
  date_cloture?: string | null;
  formulaire_data?: Record<string, unknown>;
  rapport_url?: string | null;
  rapport_data?: Record<string, unknown>;
}): Dossier {
  return {
    id,
    reference,
    statut,
    offre,
    client_id: client.id,
    negotiator_id,
    formulaire_data,
    scoring_verdict,
    scoring_confiance,
    scoring_justification: scoring_verdict ? 'Apercu local - donnees simulees.' : null,
    montant_paye: getOfferAmount(offre),
    stripe_payment_id: null,
    date_paiement: daysAgo(10),
    date_creation,
    date_formulaire_complete,
    date_upload_complete,
    date_analyse_debut,
    date_livraison,
    date_cloture,
    rapport_url,
    rapport_data,
    created_at: date_creation,
    updated_at: daysAgo(1),
    client,
    negotiator: negotiator_id ? (getPreviewProfile('negotiator') as Profile) : undefined,
    documents,
  };
}

function getOfferAmount(offre: Dossier['offre']) {
  switch (offre) {
    case '1':
      return 99;
    case '2':
      return 199;
    case '3':
      return 399;
    default:
      return 0;
  }
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
