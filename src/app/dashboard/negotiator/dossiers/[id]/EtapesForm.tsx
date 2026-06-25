'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { MediationEtape } from '@/types';
import ProgressionMediation from '@/components/ProgressionMediation';
import { toggleMediationEtape } from './actions';

interface EtapesFormProps {
  dossierId: string;
  etapes: MediationEtape[];
}

export default function EtapesForm({ dossierId, etapes }: EtapesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleToggle(étapeId: string, complete: boolean) {
    startTransition(async () => {
      await toggleMediationEtape(dossierId, étapeId, complete);
      router.refresh();
    });
  }

  return (
    <div className={`transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      <ProgressionMediation etapes={etapes} onToggle={handleToggle} />
    </div>
  );
}
