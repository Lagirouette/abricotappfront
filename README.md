# Abricot – Front-end

Application de gestion de projet collaboratif (projets, tâches, commentaires, tableau de bord),
réalisée avec **Next.js 16**, **React 19**, **TypeScript** et **Tailwind CSS**.
Elle consomme l'API REST du backend Abricot (Express + Prisma).

## Prérequis

- Node.js 20 ou plus récent
- Le **backend Abricot** installé et démarré sur `http://localhost:8000` (voir son README)
- Pour la création de tâches par IA : une **clé d'API Google Gemini** (gratuite)

## Installation

```bash
npm install
```

## Configuration

Copier le modèle de configuration puis le compléter :

```bash
cp .env.example .env.local
```

| Variable | Rôle | Obligatoire |
|---|---|---|
| `API_URL` | URL du backend (par défaut `http://localhost:8000`) | oui |
| `GEMINI_API_KEY` | Clé de l'API Google Gemini, utilisée par la création de tâches par IA | seulement pour l'IA |

### Activer la création de tâches par IA (gratuit)

La génération utilise l'**offre gratuite de l'API Google Gemini** (modèle `gemini-3.5-flash-lite`) :
aucun paiement n'est nécessaire.

1. Obtenir une clé : la demander **à l'auteur du projet** (transmise en privé), ou créer la vôtre
   avec un compte Google sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. La coller dans `.env.local` :
   ```
   GEMINI_API_KEY=votre_cle_ici
   ```
3. **Redémarrer** le serveur (`npm run dev`) : les variables d'environnement sont lues au démarrage.

> ⚠️ **Sécurité** : la clé ne doit jamais être écrite dans le code, ni dans ce README, ni être versionnée.
> `.env.local` est ignoré par Git. La clé n'est utilisée que **côté serveur** (Server Action) :
> elle n'est jamais envoyée au navigateur.
>
> Sur l'offre gratuite, Google peut utiliser les contenus envoyés pour améliorer ses produits :
> ne saisissez pas de données confidentielles dans la description envoyée à l'IA.

Sans clé, l'application fonctionne normalement ; seul le bouton **IA** affiche un message
indiquant que la fonctionnalité n'est pas configurée.

## Lancement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Comptes de test : ceux créés par le script de seed du backend (`npm run seed` côté backend),
par exemple `alice@example.com` (le mot de passe est indiqué dans le README du backend).

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm start` | lance le build de production |
| `npm run lint` | vérification ESLint |

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion, modification du profil et du mot de passe.
- **Tableau de bord** : tâches assignées en vue Liste (par urgence), vue Kanban (du mois), vue Projets (par urgence).
- **Projets** : création, modification, suppression, gestion des contributeurs, progression.
- **Tâches** : création, modification, suppression, assignation, statut, commentaires, vues Liste et Calendrier, filtre par statut et recherche.
- **Création de tâches par IA** : sur la page d'un projet, le bouton **IA** propose des tâches à partir d'une description.
  On supprime ou modifie les propositions, puis **« + Ajouter les tâches »** crée dans le projet celles qui ont été gardées.
- **Droits** : seuls les administrateurs modifient le projet et les tâches ; les contributeurs créent et suppriment des tâches.

## Architecture

```
src/
├── app/
│   ├── (auth)/          pages Connexion / Inscription
│   ├── (app)/           pages connectées (tableau de bord, projets, compte)
│   ├── actions/         Server Actions (auth, projets, tâches, compte, IA)
│   └── api/             route de recherche d'utilisateurs
├── components/          composants par domaine (tasks, projects, ui, layout…)
├── lib/                 appels API, session, formatage
├── types/               types de l'API
└── proxy.ts             protection des routes (redirection vers /login)
```

- Le token JWT est stocké dans un **cookie httpOnly** ; tous les appels au backend partent du serveur Next.
- La logique IA est dans `src/app/actions/ai.ts` : appel de l'API Gemini côté serveur (`fetch`, sans SDK),
  réponse en **mode JSON** revalidée avant affichage, puis création des tâches choisies dans le backend.
