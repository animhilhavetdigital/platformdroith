import { MediationEtape } from '@/types';

// Store en mémoire partagé entre toutes les requêtes du serveur de dev
// Permet de simuler la persistance DB en mode preview

interface DevStore {
  mediationEtapes: Record<string, MediationEtape[]>;
}

// @ts-ignore
const globalStore = globalThis.__DEV_STORE__ as DevStore | undefined;

export const devStore: DevStore = globalStore || {
  mediationEtapes: {},
};

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
