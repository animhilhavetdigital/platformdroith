import { MediationEtape, Profile, Dossier, Document } from '@/types';

export interface DevPayment {
  id: string;
  client_email: string;
  client_phone: string;
  client_first_name: string;
  client_last_name: string;
  amount: number;
  offer_type: '1' | '2' | '3';
  payment_type: 'initial_offer' | 'negotiator_option';
  payment_status: 'paid' | 'failed' | 'pending';
  platform_status: 'to_create' | 'account_created';
  dossier_id?: string;
  user_id?: string;
  created_at: string;
}

export interface DevEmail {
  id: string;
  email: string;
  prenom: string;
  subject: string;
  type: 'acces_client' | 'reset_password' | 'notification_rapport';
  status: 'sent' | 'failed';
  created_at: string;
}

export interface DevNegotiationAction {
  id: string;
  dossier_id: string;
  negotiator_id: string;
  action_type: 'appel' | 'email' | 'relance' | 'reponse_organisme' | 'document_complementaire' | 'note_interne';
  title: string;
  description: string;
  result?: string;
  created_at: string;
}

export interface DevMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

interface DevStore {
  mediationEtapes: Record<string, MediationEtape[]>;
  clientsPayes: DevPayment[];
  profiles: Profile[];
  dossiers: Dossier[];
  emails: DevEmail[];
  negotiationActions: Record<string, DevNegotiationAction[]>;
  messages: DevMessage[];
  initialized: boolean;
}

// Helper for dates relative to today
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// Singleton store in globalThis
// @ts-ignore
const globalStore = globalThis.__DEV_STORE__ as DevStore | undefined;

export const devStore: DevStore = globalStore || {
  mediationEtapes: {},
  clientsPayes: [],
  profiles: [],
  dossiers: [],
  emails: [],
  negotiationActions: {},
  messages: [],
  initialized: false,
};

// Initialize with default mock data if not already initialized
if (!devStore.initialized) {
  // 1. Initial Mock Profiles
  devStore.profiles = [
    {
      id: 'preview-admin',
      role: 'super_admin',
      nom: 'Admin',
      prenom: 'Demo',
      email: 'admin@preview.local',
      téléphone: '+33 6 11 22 33 44',
      avatar_url: undefined,
      status: 'active',
      created_at: daysAgo(90),
      updated_at: daysAgo(1),
    },
    {
      id: 'preview-negotiator',
      role: 'negotiator',
      nom: 'Bennani',
      prenom: 'Samir',
      email: 'samir.bennani@example.com',
      téléphone: '+33 6 55 44 33 22',
      avatar_url: undefined,
      status: 'active',
      created_at: daysAgo(120),
      updated_at: daysAgo(1),
    },
    {
      id: 'preview-client',
      role: 'client',
      nom: 'Alaoui',
      prenom: 'Nadia',
      email: 'nadia.alaoui@example.com',
      téléphone: '+33 6 77 88 99 11',
      avatar_url: undefined,
      status: 'active',
      created_at: daysAgo(20),
      updated_at: daysAgo(1),
    },
    {
      id: 'preview-client-2',
      role: 'client',
      nom: 'El Idrissi',
      prenom: 'Yassine',
      email: 'yassine.elidrissi@example.com',
      téléphone: '+33 6 12 34 56 78',
      avatar_url: undefined,
      status: 'active',
      created_at: daysAgo(2),
      updated_at: daysAgo(2),
    },
  ];

  // 2. Initial Mock Dossiers
  devStore.dossiers = [
    {
      id: 'dos-client-1',
      reference: 'DH-2026-000014',
      statut: 'mediation_en_cours',
      offre: '2',
      client_id: 'preview-client',
      negotiator_id: 'preview-negotiator',
      formulaire_data: {
        'type_problème': 'Fraude / Demarchage abusif',
        'montant_crédit': '18900',
        organisme: 'Finacredit Habitat',
        date_survenance: '2026-03-14',
        'numéro_dossier': 'CR-784512',
        description: 'Le contrat a ete signe a domicile apres un demarchage insistant. Les informations precontractuelles paraissent incompletes.',
      },
      scoring_verdict: 'OUI',
      scoring_confiance: 8,
      montant_paye: 199.00,
      date_paiement: daysAgo(10),
      date_creation: daysAgo(10),
      date_formulaire_complete: daysAgo(9),
      date_upload_complete: daysAgo(6),
      date_analyse_debut: daysAgo(4),
      date_livraison: daysAgo(2),
      rapport_url: '/demo/rapport.pdf',
      rapport_data: {
        title: 'Memoire juridique d\'expertise',
        verdict: 'Fort potentiel de contestation',
        summary: 'Le dossier presente plusieurs irregularites exploitables : demarchage contestable, information precontractuelle incomplete.',
        irregularities: [
          'Verification de solvabilite incomplete avant signature.',
          'Informations contractuelles insuffisamment explicites sur le cout total.',
        ],
        recommendations: [
          'Conserver tous les echanges et justificatifs.',
          'Envoyer une mise en demeure.',
        ],
        generated_at: daysAgo(2),
      },
      scoring_justification: null,
      stripe_payment_id: null,
      date_cloture: null,
      created_at: daysAgo(10),
      updated_at: daysAgo(2),
    },
    {
      id: 'dos-client-demo-form',
      reference: 'DH-2026-000021',
      statut: 'formulaire_en_cours',
      offre: '1',
      client_id: 'preview-client',
      negotiator_id: null,
      formulaire_data: {},
      scoring_verdict: null,
      scoring_confiance: null,
      scoring_justification: null,
      montant_paye: 99.00,
      stripe_payment_id: null,
      date_paiement: daysAgo(1),
      date_creation: daysAgo(1),
      date_formulaire_complete: null,
      date_upload_complete: null,
      date_analyse_debut: null,
      date_livraison: null,
      date_cloture: null,
      rapport_url: null,
      rapport_data: {},
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
    },
    {
      id: 'dos-client-demo-analyse',
      reference: 'DH-2026-000022',
      statut: 'analyse_en_cours',
      offre: '2',
      client_id: 'preview-client',
      negotiator_id: null,
      formulaire_data: {
        'type_problème': 'Vice caché / Conformité',
        'montant_crédit': '25000',
        organisme: 'Cofidis France',
        date_survenance: '2026-04-10',
        'numéro_dossier': 'CF-44781',
        description: 'Panneaux solaires non fonctionnels et défaut de conformité de l installation.',
      },
      scoring_verdict: null,
      scoring_confiance: null,
      scoring_justification: null,
      montant_paye: 199.00,
      stripe_payment_id: null,
      date_paiement: daysAgo(4),
      date_creation: daysAgo(4),
      date_formulaire_complete: daysAgo(4),
      date_upload_complete: daysAgo(3),
      date_analyse_debut: daysAgo(1),
      date_livraison: null,
      date_cloture: null,
      rapport_url: null,
      rapport_data: {},
      created_at: daysAgo(4),
      updated_at: daysAgo(1),
    },
    {
      id: 'dos-client-demo-rapport',
      reference: 'DH-2026-000023',
      statut: 'livre',
      offre: '1',
      client_id: 'preview-client',
      negotiator_id: null,
      formulaire_data: {
        'type_problème': 'Taux usuraire',
        'montant_crédit': '8500',
        organisme: 'Sofinco',
        date_survenance: '2026-02-18',
        'numéro_dossier': 'SF-99632',
        description: 'Taux effectif global (TEG) supérieur au taux d usure applicable lors de la signature.',
      },
      scoring_verdict: 'OUI',
      scoring_confiance: 9,
      montant_paye: 99.00,
      stripe_payment_id: null,
      date_paiement: daysAgo(7),
      date_creation: daysAgo(7),
      date_formulaire_complete: daysAgo(7),
      date_upload_complete: daysAgo(6),
      date_analyse_debut: daysAgo(5),
      date_livraison: daysAgo(4),
      rapport_url: '/demo/rapport.pdf',
      rapport_data: {
        title: 'Mémoire d expertise - Taux Usuraire Sofinco',
        verdict: 'Non-conformité du TEG validée',
        summary: 'L analyse confirme que le TEG indiqué dépasse le taux d usure légal.',
        irregularities: [
          'Dépassement du taux d usure légal pour la période concernée.',
          'Calcul erroné des frais annexes dans le TEG.'
        ],
        recommendations: [
          'Exiger la déchéance du droit aux intérêts auprès de Sofinco.',
          'Négocier à l amiable le remboursement des trop-perçus.'
        ],
        generated_at: daysAgo(4),
      },
      scoring_justification: null,
      date_cloture: null,
      created_at: daysAgo(7),
      updated_at: daysAgo(4),
    },
    {
      id: 'dos-client-demo-cloture',
      reference: 'DH-2026-000024',
      statut: 'cloture',
      offre: '2',
      client_id: 'preview-client',
      negotiator_id: 'preview-negotiator',
      formulaire_data: {
        'type_problème': 'Assurance forcée',
        'montant_crédit': '42000',
        organisme: 'Cetelem',
        date_survenance: '2026-01-05',
        'numéro_dossier': 'CT-88963',
        description: 'Défaut d information précontractuelle sur le caractère facultatif de l assurance emprunteur.',
      },
      scoring_verdict: 'OUI',
      scoring_confiance: 8,
      montant_paye: 199.00,
      stripe_payment_id: null,
      date_paiement: daysAgo(20),
      date_creation: daysAgo(20),
      date_formulaire_complete: daysAgo(19),
      date_upload_complete: daysAgo(18),
      date_analyse_debut: daysAgo(16),
      date_livraison: daysAgo(15),
      date_cloture: daysAgo(2),
      rapport_url: '/demo/rapport-final.pdf',
      rapport_data: {
        title: 'Mémoire de médiation Cetelem',
        verdict: 'Accord amiable conclu',
        summary: 'Médiation résolue avec remboursement partiel de la prime d assurance.',
        irregularities: [
          'Frais d assurance prélevés sans accord écrit valide.',
          'Absence de fiche standardisée d information.'
        ],
        recommendations: [
          'Valider le protocole d accord transactionnel reçu.'
        ],
        generated_at: daysAgo(15),
      },
      scoring_justification: null,
      created_at: daysAgo(20),
      updated_at: daysAgo(2),
    },
    {
      id: 'dos-client-2',
      reference: 'DH-2026-000015',
      statut: 'formulaire_en_cours',
      offre: '2',
      client_id: 'preview-client-2',
      negotiator_id: null,
      formulaire_data: {},
      scoring_verdict: null,
      scoring_confiance: null,
      scoring_justification: null,
      montant_paye: 199.00,
      stripe_payment_id: null,
      date_paiement: daysAgo(2),
      date_creation: daysAgo(2),
      date_formulaire_complete: null,
      date_upload_complete: null,
      date_analyse_debut: null,
      date_livraison: null,
      date_cloture: null,
      rapport_url: null,
      rapport_data: {},
      created_at: daysAgo(2),
      updated_at: daysAgo(2),
    }
  ];

  // 3. Initial Mock Clients Payés (Unregistered buyers)
  devStore.clientsPayes = [
    {
      id: 'pay-1',
      client_first_name: 'Yassine',
      client_last_name: 'El Idrissi',
      client_email: 'yassine.elidrissi@example.com',
      client_phone: '+33 6 12 34 56 78',
      amount: 199.00,
      offer_type: '2',
      payment_type: 'initial_offer',
      payment_status: 'paid',
      platform_status: 'account_created',
      user_id: 'preview-client-2',
      dossier_id: 'dos-client-2',
      created_at: daysAgo(2),
    },
    {
      id: 'pay-2',
      client_first_name: 'Sophie',
      client_last_name: 'Laurent',
      client_email: 'sophie.laurent@example.com',
      client_phone: '+33 7 98 76 54 32',
      amount: 99.00,
      offer_type: '1',
      payment_type: 'initial_offer',
      payment_status: 'paid',
      platform_status: 'to_create',
      created_at: daysAgo(1),
    },
  ];

  // 4. Initial Mock Emails
  devStore.emails = [
    {
      id: 'mail-1',
      email: 'nadia.alaoui@example.com',
      prenom: 'Nadia',
      subject: 'Votre espace client est pret',
      type: 'acces_client',
      status: 'sent',
      created_at: daysAgo(20),
    },
    {
      id: 'mail-2',
      email: 'nadia.alaoui@example.com',
      prenom: 'Nadia',
      subject: 'Votre rapport d\'analyse est disponible',
      type: 'notification_rapport',
      status: 'sent',
      created_at: daysAgo(2),
    }
  ];

  // 5. Initial Mock Negotiation Actions
  devStore.negotiationActions = {
    'dos-client-1': [
      {
        id: 'act-1',
        dossier_id: 'dos-client-1',
        negotiator_id: 'preview-negotiator',
        action_type: 'note_interne',
        title: 'Prise en charge du dossier',
        description: 'Dossier affecte au negociateur Samir Bennani suite au paiement de l\'option.',
        created_at: daysAgo(2),
      },
      {
        id: 'act-2',
        dossier_id: 'dos-client-1',
        negotiator_id: 'preview-negotiator',
        action_type: 'appel',
        title: 'Appel telephonique client',
        description: 'Entretien telephonique avec Nadia Alaoui pour valider les details du credit.',
        result: 'Client confirme les pressions lors du demarchage.',
        created_at: daysAgo(1),
      }
    ]
  };

  // 6. Mediation Etapes
  devStore.mediationEtapes = {
    'dos-client-1': [
      { id: 'et-1', dossier_id: 'dos-client-1', label: 'Prise de contact client', ordre: 1, complete: true, completed_at: daysAgo(2), completed_by: 'preview-negotiator', created_at: daysAgo(2) },
      { id: 'et-2', dossier_id: 'dos-client-1', label: 'Constitution du dossier de contestation', ordre: 2, complete: true, completed_at: daysAgo(1), completed_by: 'preview-negotiator', created_at: daysAgo(2) },
      { id: 'et-3', dossier_id: 'dos-client-1', label: 'Notification officielle a l\'organisme', ordre: 3, complete: false, completed_at: null, completed_by: null, created_at: daysAgo(2) },
      { id: 'et-4', dossier_id: 'dos-client-1', label: 'Negociation des conditions d\'accord', ordre: 4, complete: false, completed_at: null, completed_by: null, created_at: daysAgo(2) },
      { id: 'et-5', dossier_id: 'dos-client-1', label: 'Resolution amiable finale', ordre: 5, complete: false, completed_at: null, completed_by: null, created_at: daysAgo(2) },
    ]
  };

  devStore.initialized = true;
}

// @ts-ignore
globalThis.__DEV_STORE__ = devStore;

export function getDevMediationEtapes(dossierId: string): MediationEtape[] | undefined {
  return devStore.mediationEtapes[dossierId];
}

export function setDevMediationEtapes(dossierId: string, etapes: MediationEtape[]) {
  devStore.mediationEtapes[dossierId] = etapes;
}

export function updateDevMediationEtape(
  dossierId: string,
  etapeId: string,
  updates: Partial<MediationEtape>
): boolean {
  const etapes = devStore.mediationEtapes[dossierId];
  if (!etapes) return false;
  const index = etapes.findIndex((e) => e.id === etapeId);
  if (index === -1) return false;
  devStore.mediationEtapes[dossierId][index] = {
    ...etapes[index],
    ...updates,
  };
  return true;
}
