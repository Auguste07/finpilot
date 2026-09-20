# FinPilot — Advanced Personal Finance OS

Application personnelle de gestion financière conçue pour Vercel + Supabase.

## Ce que couvre ce starter

- Tableau de bord fintech professionnel, responsive, avec mode clair/sombre et navigation riche.
- Entrées et dépenses réelles.
- Dépenses planifiées avec échéances et récurrences.
- Projets / enveloppes et allocations.
- Prévisions de trésorerie interactives avec allocation libre des revenus par pourcentage.
- Planification avancée des dépenses : montant unitaire, quantité, fréquence, nombre d’échéances et date de départ.
- Import Excel/CSV avec prévisualisation et futur mapping de colonnes.
- Authentification Supabase par Magic Link.
- Modèle PostgreSQL complet avec RLS par utilisateur.
- En-têtes de sécurité HTTP et CSP.
- Déduplication prévue pour les imports via `import_fingerprint`.

> Sécurité : aucun site public ne peut être garanti « impossible à pirater ». Ce projet applique une défense en profondeur, mais la sécurité doit rester maintenue (mises à jour, audits, logs, MFA/SSO si nécessaire, WAF/rate limiting, sauvegardes).

## Architecture

- Next.js 16 / App Router
- TypeScript
- Supabase Auth + PostgreSQL
- Vercel pour le déploiement
- XLSX pour l'import local des fichiers Excel

## Installation locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Renseigner :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Base de données

Créer un projet Supabase puis appliquer `supabase/migrations/001_initial_schema.sql`.

Dans Supabase Auth > URL Configuration :

- Site URL local : `http://localhost:3000`
- Redirect local : `http://localhost:3000/auth/callback`
- Ajouter ensuite l'URL Vercel de production dans les redirects autorisés.

## Déploiement Vercel (GitHub → Vercel)

1. Créer un dépôt GitHub et y pousser ce projet.
2. Importer le dépôt dans Vercel.
3. Ajouter les 3 variables d'environnement.
4. Déployer.
5. Activer Vercel Firewall / rate limiting autour des routes sensibles après observation du trafic.

## Feuille de route recommandée

### V1
- CRUD réel des transactions, catégories et comptes.
- Conversion d'une dépense planifiée en dépense réelle.
- Mapping Excel + validation + import serveur.
- Génération automatique des occurrences futures.
- Calcul de budgets, soldes et prévisions à partir de PostgreSQL.

### V1.5
- Scénarios pessimiste / central / optimiste.
- Alertes budget et échéances.
- Règles d'allocation automatiques par pourcentage ou montant fixe.
- Réconciliation importée vs saisie manuelle.
- PWA / mobile.

### V2
- Espaces famille / couple / équipe avec rôles.
- Comptes bancaires via connecteurs selon pays et disponibilité.
- OCR justificatifs.
- Assistant financier explicatif basé sur les données de l'utilisateur.

## Règles métier centrales

- Une `planned_expense` représente une intention future et ne réduit pas le solde réel.
- Une `transaction` en statut `cleared` représente une opération réelle.
- Une dépense planifiée peut pointer vers `converted_transaction_id` lorsqu'elle devient réelle.
- Une `allocation` réserve virtuellement une portion des ressources mais n'est pas une dépense comptable.
- Un projet sépare `target_amount`, `allocated_amount` et les transactions réellement dépensées.
- Les prévisions combinent solde réel + revenus attendus - dépenses planifiées - réserves/allocation selon le scénario.

## V3 — Calendrier, dettes/créances et interactions

- Calendrier financier mensuel cliquable : dépenses planifiées, dettes et créances.
- Prévision : sélection du mois par calendrier natif (`input type=month`).
- Dettes à payer = passif prévisionnel négatif jusqu'au règlement.
- Créances à recevoir = revenu prévisionnel positif jusqu'à l'encaissement.
- Entrées enrichies : salaire, bonus, remboursement, créance encaissée, freelance, vente.
- CRUD local fonctionnel pour entrées, dettes/créances, projets, budgets, dépenses planifiées et transactions.
- Recherche de navigation fonctionnelle dans la barre supérieure.
- Validation d'import Excel persistée localement avec notification.
- Paramètres et règles automatiques activables/désactivables et persistés localement.
- Schéma Supabase étendu par `004_obligations_calendar.sql`.

### Note de persistance

Tant que l'authentification est volontairement ouverte, les écrans interactifs utilisent `localStorage` pour rester fonctionnels sans compte. Les tables Supabase sont déjà prêtes pour un futur retour à une authentification multi-utilisateur avec RLS.
