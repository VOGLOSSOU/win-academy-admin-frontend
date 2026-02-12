# Nathan VOGLOSSOU Admin Panel

## Description

Nathan VOGLOSSOU Admin est le backoffice de gestion de la plateforme Nathan VOGLOSSOU, une plateforme EdTech béninoise de formation en ligne dédiée à la maîtrise du digital, pensée spécifiquement pour les réalités locales, notamment les zones à faible débit internet.

Cette application admin permet aux administrateurs (ADMIN et SUPER_ADMIN) de gérer l'ensemble du système académique, les utilisateurs, les formations, les évaluations et les certificats.

## Objectifs

- **Gérer la structure académique** : Départements, Communes, Catégories
- **Gérer les utilisateurs** : Apprenants, administrateurs
- **Gérer les formations** : Contenu pédagogique (Modules → Contenus → Évaluations)
- **Superviser l'activité** : Inscriptions, progressions, certificats
- **Analyser les statistiques** : Taux de complétion, répartition géographique, performance

## Fonctionnalités

### Dashboard
- KPIs (utilisateurs, formations, inscriptions, certificats)
- Graphiques (inscriptions mensuelles, répartition par département, taux de réussite)
- Activité récente (derniers inscrits, derniers certificats)

### Gestion des Utilisateurs
- Liste paginée avec filtres (rôle, département, statut)
- Recherche par nom
- Détail complet (informations, formations suivies, progressions, tentatives d'évaluation, certificats)

### Gestion Administrative
- **Départements** : CRUD avec code unique
- **Communes** : CRUD liées aux départements
- **Catégories** : CRUD avec contrôle de tranche d'âge

### Gestion des Formations
- **Formations** : CRUD complet (titre, description, niveau, durée, image, catégorie)
- **Modules** : Organisation hiérarchique avec ordre
- **Contenus** : VIDEO, PDF, TEXT, IMAGE avec URL et ordre
- **Évaluations** : Questions, réponses, score de passage, tentatives maximales

### Gestion des Inscriptions & Certificats
- Suivi des enrollments (progression, statut)
- Génération et gestion des certificats avec QR code unique

### Statistiques Avancées
- Taux de complétion par formation
- Analyse géographique
- Top formations

### Paramètres Système (SUPER_ADMIN)
- Gestion des rôles admin
- Paramètres globaux

## Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Framework principal (App Router) |
| **TypeScript** | Typage statique |
| **Tailwind CSS** | Styling utility-first |
| **shadcn/ui** | Composants UI (Radix UI) |
| **TanStack Query** | Gestion des requêtes API et cache |
| **Zustand** | State management global léger |
| **React Hook Form** | Gestion des formulaires |
| **Zod** | Validation des schémas |
| **Recharts** | Graphiques et visualisations |

## Architecture du Projet

```
win-academy-admin-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Authentification
│   │   │   └── login/              # Page de connexion
│   │   ├── (dashboard)/            # Routes protégées
│   │   │   ├── dashboard/         # Tableau de bord
│   │   │   ├── users/              # Gestion utilisateurs
│   │   │   ├── departments/       # Gestion départements
│   │   │   ├── communes/          # Gestion communes
│   │   │   ├── categories/        # Gestion catégories
│   │   │   ├── formations/        # Gestion formations
│   │   │   ├── modules/           # Gestion modules
│   │   │   ├── contents/          # Gestion contenus
│   │   │   ├── evaluations/       # Gestion évaluations
│   │   │   ├── enrollments/       # Gestion inscriptions
│   │   │   ├── certificates/      # Gestion certificats
│   │   │   ├── statistics/         # Statistiques
│   │   │   └── settings/          # Paramètres système
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home (redirect)
│   ├── components/
│   │   ├── layout/                # Sidebar, Topbar
│   │   └── ui/                    # Composants shadcn/ui
│   ├── providers/                 # Context providers
│   ├── store/                     # Zustand stores
│   ├── types/                     # TypeScript interfaces
│   ├── lib/                       # Utilitaires
│   └── hooks/                     # Custom hooks
├── docs/                          # Documentation du projet
├── public/                        # Assets statiques
└── Configuration
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── next.config.ts
```

## Securite

- **Authentification JWT** : Obligatoire pour toutes les routes dashboard
- **Middleware de rôle** : Protection par niveau d'accès (ADMIN / SUPER_ADMIN)
- **Règles métier** :
  - ADMIN ne peut pas supprimer SUPER_ADMIN
  - Journalisation des actions critiques
  - Validation côté client et serveur

## Installation et Demarrage

### Prérequis
- Node.js 18+
- npm, yarn ou pnpm

### Installation

```bash
# Cloner le projet
git clone https://github.com/VOGLOSSOU/win-academy-admin-frontend
cd win-academy-admin-frontend

# Installer les dépendances
npm install
# ou
pnpm install
```

### Démarrage

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Start production
npm start
```

L'application sera accessible à `http://localhost:3000`

## Regles Fonctionnelles

1. Une formation publiée ne peut pas être supprimée si des utilisateurs sont inscrits
2. Une catégorie ne peut être supprimée si des formations y sont liées
3. Une commune ne peut être supprimée si des utilisateurs y sont rattachés
4. Un certificat ne peut être généré qu'après réussite à l'évaluation
5. La progression est mise à jour automatiquement

## Experience Utilisateur

- Interface claire et moderne
- Tables paginées avec tri et filtres
- Recherche dynamique
- Confirmations avant suppression
- Notifications toast (succès/erreur)
- Mode sombre supporté
- Responsive design (mobile-first)

## Licence

Propriété de Nathan VOGLOSSOU - Tous droits réservés

## Contact

Pour toute question concernant ce projet, veuillez contacter Nathan VOGLOSSOU.
