'use client';

import { useState } from 'react';
import { Scale } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface PaymentTriggerProps {
  dossierId: string;
}

export default function PaymentTrigger({ dossierId }: PaymentTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02]"
      >
        <Scale size={18} />
        Payer 199 € — Négociateur
      </button>

      <PaymentModal dossierId={dossierId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
