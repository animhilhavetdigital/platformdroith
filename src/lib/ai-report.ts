export interface GeneratedReport {
  title: string;
  verdict: string;
  summary: string;
  irregularities: string[];
  recommendations: string[];
  generated_at: string;
}

export interface AnalysisInput {
  type_problème?: string;
  montant_crédit?: string;
  organisme?: string;
  date_survenance?: string;
  numéro_dossier?: string;
  description?: string;
  type_credit?: string;
  taux_credit?: string;
  prejudice?: string;
  objectif?: string;
}

export function generateAIReport(data: AnalysisInput): GeneratedReport {
  const type = data.type_problème || 'Autre';
  const montant = data.montant_crédit || 'non précisé';
  const organisme = data.organisme || 'l\'organisme';

  let title = 'Mémoire juridique de contestation';
  let verdict = 'Potentiel de contestation à confirmer';
  let summary = `Analyse du dossier concernant un crédit de ${montant} € auprès de ${organisme}. Le problème déclaré est de type "${type}".`;
  let irregularities: string[] = [];
  let recommendations: string[] = [];

  switch (type) {
    case 'Taux usuraire':
      title = 'Mémoire — Taux usuraire';
      verdict = 'Fort potentiel de contestation';
      summary += ` Le taux déclaré de ${data.taux_credit}% pourrait dépasser le taux d'usure en vigueur à la date du contrat.`;
      irregularities = [
        'Taux appliqué potentiellement supérieur au taux d\'usure légal.',
        'Absence de vérification claire du TAEG dans l\'offre préalable.',
        'Mensualités non conformes au tableau d\'amortissement initial.',
      ];
      recommendations = [
        'Demander à l\'organisme le détail du calcul du TAEG.',
        'Comparer le taux contractuel avec le taux d\'usure applicable.',
        'Envoyer une mise en demeure pour remboursement des sommes indues.',
      ];
      break;

    case 'Vice caché / Conformité':
      title = 'Mémoire — Vice caché et conformité';
      verdict = 'Potentiel de contestation élevé';
      summary += ' Les éléments décrivant un vice caché ou un défaut de conformité peuvent ouvrir droit à une action en garantie.';
      irregularities = [
        'Défaut de conformité des biens ou services financés.',
        'Information insuffisante sur les caractéristiques essentielles du crédit.',
        'Absence de mise en garde sur les risques liés au financement.',
      ];
      recommendations = [
        'Conserver les preuves du vice caché (photos, expertises, courriers).',
        'Mettre en demeure l\'organisme et le vendeur de reconnaître la garantie.',
        'Solliciter une expertise technique si nécessaire.',
      ];
      break;

    case 'Assurance forcée':
      title = 'Mémoire — Assurance forcée';
      verdict = 'Potentiel de contestation confirmé';
      summary += ' La souscription forcée ou non détaillée d\'une assurance emprunteur constitue une irrégularité fréquente.';
      irregularities = [
        'Assurance imposée sans information sur les garanties équivalentes externes.',
        'Prix de l\'assurance non intégré de manière transparente dans le TAEG.',
        'Absence de délai de réflexion ou d\'information sur la résiliation annuelle.',
      ];
      recommendations = [
        'Vérifier si une délégation d\'assurance est possible.',
        'Calculer le surcoût de l\'assurance groupe par rapport à une assurance externe.',
        'Demander le remboursement des primes indues.',
      ];
      break;

    case 'Fraude / Démarchage abusif':
      title = 'Mémoire — Démarchage abusif';
      verdict = 'Fort potentiel de contestation';
      summary += ' Les éléments de démarchage abusif ou de fraude peuvent entraîner l\'annulation du contrat.';
      irregularities = [
        'Démarchage téléphonique ou à domicile sans consentement préalable.',
        'Signature recueillie sous pression ou avec des informations incomplètes.',
        'Manquement aux obligations d\'information précontractuelle.',
      ];
      recommendations = [
        'Rassembler les preuves de démarchage (SMS, appels, témoignages).',
        'Envoyer une mise en demeure pour annulation du contrat.',
        'Saisir le médiateur du crédit ou l\'autorité compétente.',
      ];
      break;

    case 'Erreur de calcul':
      title = 'Mémoire — Erreur de calcul';
      verdict = 'Potentiel de contestation modéré';
      summary += ' Une erreur de calcul dans les mensualités ou le coût total du crédit peut justifier un remboursement.';
      irregularities = [
        'Écart constaté entre le coût total annoncé et les mensualités réelles.',
        'Montant des intérêts non conforme au tableau d\'amortissement.',
        'Application de frais non prévus au contrat.',
      ];
      recommendations = [
        'Demander un tableau d\'amortissement détaillé.',
        'Refaire le calcul du coût total du crédit.',
        'Réclamer le remboursement des sommes indûment perçues.',
      ];
      break;

    case 'Modification unilatérale':
      title = 'Mémoire — Modification unilatérale';
      verdict = 'Potentiel de contestation élevé';
      summary += ' Toute modification unilatérale des conditions du crédit par l\'organisme est généralement illicite.';
      irregularities = [
        'Modification du taux ou des conditions sans accord écrit du client.',
        'Augmentation des frais non prévue au contrat.',
        'Information tardive ou insuffisante sur la modification.',
      ];
      recommendations = [
        'Conserver le contrat initial et la notification de modification.',
        'Contester par écrit la modification unilatérale.',
        'Demander l\'annulation des nouvelles conditions appliquées.',
      ];
      break;

    default:
      title = 'Mémoire juridique de contestation';
      verdict = 'Potentiel à étudier';
      summary += ' Les éléments fournis nécessitent une analyse approfondie par un juriste.';
      irregularities = [
        'Informations précontractuelles à vérifier.',
        'Conformité du contrat avec la législation en vigueur à confirmer.',
        'Preuves et documents complémentaires nécessaires.',
      ];
      recommendations = [
        'Compléter le dossier avec tous les documents contractuels.',
        'Contacter un conseiller pour une analyse personnalisée.',
        'Envisager une mise en demeure selon les conclusions.',
      ];
  }

  if (data.prejudice) {
    summary += ` Le préjudice estimé est de ${data.prejudice} €.`;
    recommendations.unshift(`Réclamer le remboursement du préjudice estimé à ${data.prejudice} €.`);
  }

  return {
    title,
    verdict,
    summary,
    irregularities,
    recommendations,
    generated_at: new Date().toISOString(),
  };
}

export function generateScoring(data: AnalysisInput): { verdict: string; confiance: number } {
  const type = data.type_problème || 'Autre';
  const hasDescription = (data.description || '').length > 50;
  const hasMontant = !!data.montant_crédit;

  let baseConfiance = 5;

  switch (type) {
    case 'Taux usuraire':
    case 'Fraude / Démarchage abusif':
      baseConfiance = 8;
      break;
    case 'Assurance forcée':
    case 'Modification unilatérale':
      baseConfiance = 7;
      break;
    case 'Vice caché / Conformité':
      baseConfiance = 6;
      break;
    default:
      baseConfiance = 5;
  }

  if (hasDescription) baseConfiance += 1;
  if (hasMontant) baseConfiance += 1;

  const confiance = Math.min(10, baseConfiance);
  const verdict = confiance >= 7 ? 'OUI' : confiance >= 5 ? 'OUI_FAIBLE' : 'NON';

  return { verdict, confiance };
}
