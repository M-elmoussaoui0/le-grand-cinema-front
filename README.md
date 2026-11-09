# Le Grand Cinéma – Front end (interface de réservation)

Interface web de réservation de places pour le cinéma Le Grand Cinéma (10 salles modulables, 1 700 places).

## Branches principales

| Branche | Rôle | Règle |
|---|---|---|
| `main` | Version en production, toujours stable | Aucun push direct : modification uniquement par Pull Request validée |
| `develop` | Branche d'intégration de toutes les fonctionnalités terminées | Reçoit les branches `feature/` et `fix/` par Pull Request |

## Convention de nommage des branches

Format : `type/ID-description-courte`

| Type | Usage | Part de | Revient dans | Exemple |
|---|---|---|---|---|
| `feature/` | Nouvelle fonctionnalité (une User Story) | `develop` | `develop` | `feature/US4-paiement-mobile` |
| `fix/` | Correction d'un bug non urgent | `develop` | `develop` | `fix/US5-double-reservation` |
| `hotfix/` | Correction urgente en production | `main` | `main` et `develop` | `hotfix/paiement-stripe` |
| `release/` | Préparation d'une version | `develop` | `main` et `develop` | `release/1.0.0` |

## Règles d'écriture

- Tout en minuscules, sauf l'identifiant de la User Story (US4).
- Mots séparés par des tirets `-` : pas d'espaces, pas d'accents.
- L'identifiant reprend celui de la carte Trello (US1 à US16).
- Une branche = une User Story ou un bug.

## Cycle de travail

1. Créer sa branche depuis `develop` : `feature/US4-paiement-mobile`.
2. Développer et tester en local.
3. Ouvrir une Pull Request vers `develop`, relue par un autre développeur.
4. Fusionner une fois les tests passés et la DoD respectée.
5. En fin de sprint : `release/x.y.z` puis fusion dans `main`.

## Messages de commit

Format : `type: description` (convention Conventional Commits)

- `feat: ajout du plan de salle interactif`
- `fix: blocage de la place pendant le paiement`
- `docs: mise à jour de la convention de branches`

## Stack technique

- **React 18** avec **TypeScript**, construit avec **Vite**
- **React Router** : navigation entre les écrans
- **Vitest** et **Testing Library** : tests unitaires des composants
- **GitHub Actions** : lint, tests et build à chaque Pull Request
- Interface pensée d'abord pour le téléphone (mobile first)

## Démarrer le projet en local

```bash
npm install
cp .env.example .env      # adresse de l'API (par défaut http://localhost:3000/api)
npm run dev               # application sur http://localhost:5173
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Démarre l'application en mode développement |
| `npm run lint` | Vérifie la qualité du code (ESLint) |
| `npm test` | Lance les tests unitaires (Vitest) |
| `npm run build` | Construit la version de production dans `dist/` |
