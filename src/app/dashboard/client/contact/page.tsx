import DashboardLayout from '@/components/layout/DashboardLayout';
import { Mail, Phone, MessageSquare, Clock, MapPin } from 'lucide-react';

export default function ClientContactPage() {
  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="space-y-6 pb-8">
        <div className="w-full">
          <h1 className="text-3xl font-extrabold text-gray-900">Contact</h1>
          <p className="mt-2 text-gray-500">Notre équipe est à votre écoute</p>
        </div>

        <div className="w-full grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Mail size={22} />, title: 'Email', value: 'contact@droithabitat.fr', desc: 'Réponse sous 24h' },
            { icon: <Phone size={22} />, title: 'Téléphone', value: '+33 1 23 45 67 89', desc: 'Lun-Ven, 9h-18h' },
            { icon: <Clock size={22} />, title: 'Horaires', value: '9h00 - 18h00', desc: 'Du lundi au vendredi' },
            { icon: <MapPin size={22} />, title: 'Adresse', value: 'Paris, France', desc: 'Sur rendez-vous' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                {item.icon}
              </div>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wider text-gray-400">{item.title}</h3>
              <p className="mt-1 text-lg font-bold text-gray-900">{item.value}</p>
              <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Envoyer un message</h2>
              <p className="text-sm text-gray-500">Remplissez le formulaire ci-dessous</p>
            </div>
          </div>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Nom</label>
                <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="Votre nom" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                <input type="email" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="votre@email.fr" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Sujet</label>
              <input type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="Sujet de votre message" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Message</label>
              <textarea rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" placeholder="Votre message..." />
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02]">
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
