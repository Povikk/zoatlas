# ZOATLAS

Un jeu de collection de cartes consacré aux animaux. On y explore un atlas d’espèces, ouvre des boosters et répond à des quiz sur la biodiversité.

[Ouvrir l’application](https://zoatlas-living-world.povik.chatgpt.site/)

## Fonctionnalités

- Parcourir un catalogue de 12 espèces et rechercher un animal par son nom courant, son nom scientifique ou sa famille.
- Filtrer les cartes de l’Atlas par région ou par rareté.
- Consulter une fiche avec la description, le milieu de vie, la répartition et le statut de conservation d’un animal.
- Ouvrir un booster de cinq cartes, les révéler une à une ou passer directement au récapitulatif.
- Voir les cartes de la collection et leurs variantes : brillantes, holographiques, premières éditions et exemplaires numérotés.
- Répondre aux trois questions de l’expédition dans le bassin du Congo et ouvrir un booster à la fin du parcours.
- Consulter des annonces et simuler un achat avec un solde de crédits.
- Comparer les styles de cartes et leurs cinq raretés dans la galerie `/dev/cards`.

Les cartes utilisent le style Atlas Pop, avec des couleurs par rareté, des reflets et une inclinaison au survol. L’interface s’adapte aux écrans d’ordinateur et de téléphone.

## Fonctionnement actuel

L’application est une démo interactive. Le catalogue et le profil sont des données d’exemple ; les statistiques affichées ne correspondent pas à une collection réelle de plusieurs milliers d’espèces.

Les boosters ont un contenu prédéfini. Les achats modifient le solde affiché, sans transférer de carte. L’ajout à la collection et le recyclage affichent une confirmation, mais ne modifient pas l’inventaire. Les changements restent en mémoire et sont perdus au rechargement de la page.

Un schéma PostgreSQL pour Supabase est fourni dans `supabase/migrations`. Il décrit les espèces, les cartes, les portefeuilles et les transactions, mais il n’est pas connecté à l’interface. Les choix de structure sont détaillés dans [la documentation d’architecture](docs/architecture.md).

## Technologies utilisées

- **TypeScript et React** pour l’interface et les interactions.
- **Vinext et Vite**, avec les conventions et API de Next.js, pour le développement et la compilation.
- **CSS, modules CSS et Tailwind CSS** pour les mises en page et les effets visuels.
- **Lucide React** pour les icônes.
- **Cloudflare Workers et Wrangler** pour l’exécution de la version compilée, avec une intégration à Sites pour l’hébergement.

## Installation et utilisation

Prérequis : Node.js **22.13.0 ou supérieur** et npm.

```bash
git clone https://github.com/Povikk/zoatlas.git
cd zoatlas
npm ci
npm run dev
```

Ouvrir ensuite [http://localhost:5173](http://localhost:5173). Aucune configuration Supabase n’est nécessaire pour utiliser la démo. Une connexion Internet est requise pour charger les photos hébergées sur des services externes.

Pour compiler le projet et lancer la version compilée dans l’environnement local Cloudflare :

```bash
npm run build
npm start
```

Pour vérifier les types sans générer de fichiers :

```bash
npx tsc --noEmit --incremental false
```

## Auteur

**Jonathan Ragot**\
GitHub : [Povikk](https://github.com/Povikk)
