import { Suspense } from 'react';
import PaiementForm from './PaiementForm';

export default function PaiementPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Chargement...</p>
      </div>
    }>
      <PaiementForm />
    </Suspense>
  );
}
