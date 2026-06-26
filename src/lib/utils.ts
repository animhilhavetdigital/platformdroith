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
