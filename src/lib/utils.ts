import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    nouveau: 'Nouveau',
    éligibilité_en_cours: 'Éligibilité en cours',
    non_eligible: 'Non éligible',
    attente_offre: 'Attente choix offre',
    paiement_en_cours: 'Paiement en cours',
    onboarding: 'Onboarding',
    formulaire_en_cours: 'Formulaire en cours',
    pieces_attendues: 'Pièces attendues',
    analyse_en_cours: 'Analyse en cours',
    rapport_genere: 'Rapport généré',
    livre: 'Livré',
    orientation_en_cours: 'Orientation en cours',
    autonomie: 'Autonomie',
    médiation_en_cours: 'Médiation en cours',
    avocat: 'Suite interne',
    médiation_terminée: 'Médiation terminée',
    feedback: 'Feedback',
    cloture: 'Clôturé',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    nouveau: 'bg-gray-100 text-gray-800',
    éligibilité_en_cours: 'bg-blue-50 text-blue-800',
    non_eligible: 'bg-red-100 text-red-800',
    attente_offre: 'bg-amber-50 text-amber-800',
    paiement_en_cours: 'bg-indigo-50 text-indigo-800',
    onboarding: 'bg-cyan-50 text-cyan-800',
    formulaire_en_cours: 'bg-blue-100 text-blue-800',
    pieces_attendues: 'bg-yellow-100 text-yellow-800',
    analyse_en_cours: 'bg-purple-100 text-purple-800',
    rapport_genere: 'bg-indigo-100 text-indigo-800',
    livre: 'bg-green-100 text-green-800',
    orientation_en_cours: 'bg-pink-50 text-pink-800',
    autonomie: 'bg-emerald-50 text-emerald-800',
    médiation_en_cours: 'bg-orange-100 text-orange-800',
    avocat: 'bg-gray-100 text-gray-800',
    médiation_terminée: 'bg-teal-100 text-teal-800',
    feedback: 'bg-violet-50 text-violet-800',
    cloture: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getDossierCardTheme(status: string) {
  const themes: Record<string, { name: string; gradient: string; border: string; iconText: string; iconBg: string; stepBg: string; stepText: string; stepDot: string; actionBg: string; actionText: string; arrowBg: string; arrowText: string }> = {
    blue: {
      name: 'blue',
      gradient: 'bg-gradient-to-br from-blue-50 to-white',
      border: 'border-blue-200',
      iconText: 'text-blue-600',
      iconBg: 'bg-blue-100',
      stepBg: 'bg-blue-50',
      stepText: 'text-blue-700',
      stepDot: 'bg-blue-500',
      actionBg: 'bg-blue-500 hover:bg-blue-600',
      actionText: 'text-white',
      arrowBg: 'bg-blue-500 hover:bg-blue-600',
      arrowText: 'text-white',
    },
    purple: {
      name: 'purple',
      gradient: 'bg-gradient-to-br from-purple-50 to-white',
      border: 'border-purple-200',
      iconText: 'text-purple-600',
      iconBg: 'bg-purple-100',
      stepBg: 'bg-purple-50',
      stepText: 'text-purple-700',
      stepDot: 'bg-purple-500',
      actionBg: 'bg-purple-500 hover:bg-purple-600',
      actionText: 'text-white',
      arrowBg: 'bg-purple-500 hover:bg-purple-600',
      arrowText: 'text-white',
    },
    green: {
      name: 'green',
      gradient: 'bg-gradient-to-br from-green-50 to-white',
      border: 'border-green-200',
      iconText: 'text-green-600',
      iconBg: 'bg-green-100',
      stepBg: 'bg-green-50',
      stepText: 'text-green-700',
      stepDot: 'bg-green-500',
      actionBg: 'bg-green-500 hover:bg-green-600',
      actionText: 'text-white',
      arrowBg: 'bg-green-500 hover:bg-green-600',
      arrowText: 'text-white',
    },
    amber: {
      name: 'amber',
      gradient: 'bg-gradient-to-br from-amber-50 to-white',
      border: 'border-amber-200',
      iconText: 'text-amber-600',
      iconBg: 'bg-amber-100',
      stepBg: 'bg-amber-50',
      stepText: 'text-amber-700',
      stepDot: 'bg-amber-500',
      actionBg: 'bg-amber-500 hover:bg-amber-600',
      actionText: 'text-white',
      arrowBg: 'bg-amber-500 hover:bg-amber-600',
      arrowText: 'text-white',
    },
    teal: {
      name: 'teal',
      gradient: 'bg-gradient-to-br from-teal-50 to-white',
      border: 'border-teal-200',
      iconText: 'text-teal-600',
      iconBg: 'bg-teal-100',
      stepBg: 'bg-teal-50',
      stepText: 'text-teal-700',
      stepDot: 'bg-teal-500',
      actionBg: 'bg-teal-500 hover:bg-teal-600',
      actionText: 'text-white',
      arrowBg: 'bg-teal-500 hover:bg-teal-600',
      arrowText: 'text-white',
    },
  };

  const statusToTheme: Record<string, keyof typeof themes> = {
    formulaire_en_cours: 'amber',
    pieces_attendues: 'amber',
    nouveau: 'amber',
    attente_offre: 'amber',
    analyse_en_cours: 'purple',
    rapport_genere: 'green',
    livre: 'green',
    médiation_en_cours: 'blue',
    negociation_payment_pending: 'blue',
    negociation_paid: 'blue',
    negociation_en_attente_assignation: 'blue',
    negociation_en_cours: 'blue',
    autonomie: 'teal',
    médiation_terminée: 'teal',
    cloture: 'teal',
    feedback: 'green',
    orientation_en_cours: 'purple',
    paiement_en_cours: 'blue',
    onboarding: 'blue',
    avocat: 'blue',
    éligibilité_en_cours: 'blue',
    non_eligible: 'amber',
  };

  return themes[statusToTheme[status] || 'blue'];
}
