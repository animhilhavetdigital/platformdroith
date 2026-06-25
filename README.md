# Droit Habitat — Plateforme

> Plateforme de qualification, de constitution de dossier et d'orientation pour les crédits conso litigieux.

## 🏗️ Architecture

```
droit-habitat-platform/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── auth/
│   │   │   ├── login/               # Page connexion
│   │   │   └── register/            # Page inscription client
│   │   ├── dashboard/
│   │   │   ├── admin/               # Espace Super Admin
│   │   │   ├── client/              # Espace Client
│   │   │   └── negotiator/          # Espace Négociateur
│   │   ├── api/
│   │   │   ├── auth/signout         # API déconnexion
│   │   │   └── webhook/             # Webhooks (Stripe, n8n)
│   │   ├── layout.tsx               # Layout racine
│   │   └── globals.css              # Styles Tailwind
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx  # Layout protégé par rôle
│   │   │   └── Sidebar.tsx          # Navigation latérale par rôle
│   │   ├── ui/                      # Composants UI réutilisables
│   │   └── forms/                   # Formulaires (login, register, etc.)
│   ├── lib/
│   │   ├── supabase.ts              # Client Supabase (server/middleware/browser)
│   │   └── utils.ts                 # Utilitaires (cn, formatDate, etc.)
│   ├── types/
│   │   └── index.ts                 # Types TypeScript
│   ├── hooks/                       # React hooks personnalisés
│   └── middleware.ts                # Authentification + autorisation par route
├── supabase/
│   └── schema.sql                   # Schéma complet (tables, RLS, triggers)
├── public/                          # Assets statiques
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

## 👥 Rôles et permissions

| Rôle | Description | Accès |
|---|---|---|
| **super_admin** | Administrateur global | Tous les dossiers, utilisateurs, statistiques, paramètres |
| **client** | Client ayant payé une offre | Son dossier uniquement, ses documents, son rapport |
| **negotiator** | Négociateur / médiateur | Dossiers qui lui sont assignés, médiations, notes internes |

### Politiques RLS (Row Level Security)

- **Client** : peut voir/modifier uniquement ses propres dossiers
- **Négociateur** : peut voir/modifier les dossiers assignés (`negotiator_id`)
- **Super Admin** : accès total à toutes les tables

## 🚀 Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **Base de données** : PostgreSQL (Supabase)
- **Auth** : Supabase Auth (JWT, sessions cookies)
- **Stockage** : Supabase Storage (documents clients)
- **Paiement** : Stripe
- **Workflows** : n8n (webhooks)

## 📊 Schéma de base de données

### Tables principales

| Table | Description |
|---|---|
| `profiles` | Extension de `auth.users` (rôle, nom, téléphone) |
| `dossiers` | Dossier client (statut, offre, scoring, rapport) |
| `documents` | Documents uploadés (OCR, métadonnées) |
| `historique_actions` | Journal d'audit |
| `notes_negociateur` | Notes internes (visibles ou non par le client) |
| `mediation_suivi` | Suivi des actions de médiation |

### Séquence de création

1. `auth.users` (créé par Supabase Auth)
2. `profiles` (auto-créé via trigger à l'inscription)
3. `dossiers` (créé après paiement Stripe)
4. `documents` (uploadés par le client)
5. `rapport` (généré par le pipeline n8n)

## 🛠️ Installation

```bash
# 1. Cloner le repo
git clone ...
cd droit-habitat-platform

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Editer .env.local avec vos clés Supabase / Stripe

# 4. Créer la base de données
cd supabase
psql -h your-project.supabase.co -U postgres -d postgres -f schema.sql

# 5. Lancer le serveur de développement
npm run dev
```

## 📁 Routes de l'application

| Route | Rôle requis | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/auth/login` | Public | Connexion |
| `/auth/register` | Public | Inscription client |
| `/dashboard/admin` | super_admin | Dashboard global |
| `/dashboard/admin/dossiers` | super_admin | Tous les dossiers |
| `/dashboard/admin/users` | super_admin | Gestion utilisateurs |
| `/dashboard/client` | client | Mon dossier |
| `/dashboard/client/documents` | client | Mes documents |
| `/dashboard/client/rapport` | client | Mon rapport PDF |
| `/dashboard/negotiator` | negotiator | Mes dossiers assignés |
| `/dashboard/negotiator/mediations` | negotiator | Suivi médiations |

## 🔒 Sécurité

- **Middleware** : vérifie la session + le rôle pour chaque route protégée
- **RLS** : chaque requête SQL est filtrée par le rôle de l'utilisateur
- **Cookies** : sessions sécurisées (httpOnly, SameSite)
- **MFA** : disponible via Supabase (à activer pour les admins)

## 🔄 Flux d'authentification

```
1. Inscription (register)
   → Supabase Auth crée l'utilisateur
   → Trigger SQL crée le profil avec role='client'
   → Redirection login

2. Connexion (login)
   → Supabase Auth vérifie les credentials
   → Middleware lit le rôle dans `profiles`
   → Redirection vers le dashboard approprié

3. Déconnexion (signout)
   → Supprime la session côté serveur
   → Redirection login
```

## 📝 Prochaines étapes

1. [ ] Implémenter les pages manquantes (dossiers détail, upload, rapport)
2. [ ] Intégrer Stripe (paiement + webhooks)
3. [ ] Connecter n8n (webhooks analyse + génération rapport)
4. [ ] Ajouter le générateur PDF (Gotenberg)
5. [ ] Intégrer le service OCR
6. [ ] Tests E2E (Playwright)
