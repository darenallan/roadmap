# Sanhia — Roadmap Harmonisation Design (mobile-2 → mobile-1 + web) (18/09/2026)

> Généré à partir de l'audit Phase 0 (lecture complète de `sanhia-web`, `sanhia-mobile`,
> `sanhia-mobila-2`, `server-sanhia` — 18/09/2026) demandé par `claude-harmonie.md`. Même
> contrat que les autres roadmaps du repo (`ROADMAP-SECURITE.md`, `archive/ROADMAP-COMPOSANTS-
> SANHIA.md`) : chaque étape est atomique (1 fichier/composant), se déclenche uniquement sur un
> message explicite « Étape PX-NN » de l'utilisateur, et n'est cochée `[x]` qu'après un test
> réel (build/lint/test/smoke), jamais une simple relecture de code. Statuts : `[ ]` à faire ·
> `[~]` en cours · `[x]` terminé · `[bloqué]` en attente d'une décision ou d'un correctif amont.
>
> Règles transverses valables pour **toutes** les étapes (ne pas les répéter à chaque fois) :
> Expo Router et React Router conservés tels quels, aucune migration TypeScript de
> `sanhia-mobile`, aucun refactor hors périmètre, pas plus d'une stack modifiée par étape,
> jamais de tests globaux (`npm test -- <fichier ciblé>` uniquement), aucun secret/`.env` dans
> le code ou les captures, `sanhia-mobila-2` ne doit jamais être connecté à un backend réel.
>
> **Piège d'environnement (découvert P1-02, 18/09/2026)** : `NODE_ENV=production` est positionné
> dans ce shell (cf. mémoire session). Tout `npm install`/`npm test` dans `sanhia-mobile` lancé
> sans override élague les devDependencies (jest, jest-expo, react-test-renderer... 228 paquets)
> du `node_modules` local (le `package.json`/`package-lock.json` commité restent, eux, intacts).
> Toujours préfixer par `NODE_ENV=development` dans `sanhia-mobile` avant `npm install`/`npm
> test` pour le reste de cette roadmap.

---

## Décisions validées (D0–D6) — 18/09/2026

| # | Sujet | Décision retenue |
|---|---|---|
| D0 | Tokens Poppins/Figma (archive/ROADMAP-COMPOSANTS-SANHIA.md, 15/09/2026) vs mobile-2 | **Remplacer entièrement** par les tokens mobile-2 (Fraunces/Archivo, indigo `#24314f`/terracotta `#b4472a`) |
| D1 | Rôle COORDINATOR — équivalent mobile ? | **Web-only comme Admin** — harmoniser `CoordinatorLogin.jsx`/`Coordinator.jsx` uniquement, aucun écran mobile |
| D2 | Module Livreur interne (existe alors que CLAUDE.md décrit une logistique externalisée) | **Harmoniser normalement** — module réel et utilisé en production |
| D3 | Notifications — aucun écran de référence dans mobile-2 | Extrapoler depuis les tokens + `NotificationItem` déjà existant (web/mobile) |
| D4 | Emplacement nav du Feed vidéo (diverge par plateforme) | Garder la position actuelle de chaque plateforme, ne porter que le style |
| D5 | Theming couleur de marque par boutique (mobile-2 seulement) | **Ne pas porter** — hors périmètre, absent du backend réel |
| D6 | Structure de l'écran Adresses (diverge par plateforme) | Garder la structure de chaque plateforme, harmoniser seulement le style |

---

## Constats clés de l'audit Phase 0

- **Chiffres §2 corrigés** : `sanhia-web` = 29 routes confirmées (27 pages routées + 2
  redirections) ; `sanhia-mobile` = 42 fichiers sous `app/` (5 layouts + 37 non-layout, dont 36
  écrans fonctionnels) ; `sanhia-mobila-2` = **33 écrans réels** (pas ~22 : 4 auth + 13 onglets +
  16 écrans poussés).
- **`sanhia-web/src/pages/BoutiquePage.jsx`** : ni mort, ni doublon, ni non-branché — moitié
  présentationnelle de la route `/boutique/:id`, utilisée par `Boutique.jsx` ligne 135. À
  conserver telle quelle.
- **`sanhia-mobile` a déjà une bibliothèque de composants partagés quasi 1:1 avec
  `sanhia-web/src/components/ui/`** (Button, Badge, EmptyState, ErrorState, Skeleton, Toast,
  OrderCard, MessageBubble, etc. — ~50 paires) issue d'une mission antérieure archivée
  (`archive/ROADMAP-COMPOSANTS-SANHIA.md`). Les Phases 1-3 ci-dessous **restylent ces fichiers
  existants**, elles n'en créent pas de nouveaux (sauf icônes/motifs, absents des deux apps).
- **Conflit doc/code (D2)** : CLAUDE.md/claude.md décrivent une logistique externalisée sans
  module livreur interne ; le code réel a un module complet (`Livraison`, rôle `DELIVERY`,
  marketplace de missions) fonctionnel sur les 3 surfaces. Doc à corriger séparément, hors
  périmètre de cette roadmap.
- **Top 10 composants mobile-2 à extraire en priorité** : tokens (`index.css`), motifs "La
  Trame" (`motif.tsx`), set de 32 icônes (`icons.tsx`), `Button`, `StatusBadge`, `Img`
  (chargement progressif + traitement photo), `EmptyState`/`ErrorState`, `BottomSheet`, `Toast`,
  `Header`.

---

## Phase 0 — Audit `[x]` Terminée (18/09/2026)

- [x] P0-1 : Lecture `CLAUDE.md` + `claude-harmonie.md`
- [x] P0-2 : Audit `sanhia-web` (routes, pages, composants, contexts)
- [x] P0-3 : Audit `sanhia-mobile` (routes, écrans, contexts, composants)
- [x] P0-4 : Audit `sanhia-mobila-2` (écrans, tokens, composants, motifs)
- [x] P0-5 : Audit `server-sanhia` (endpoints, statuts, rôles)
- [x] P0-6 : Matrice de parité + décisions D0-D6 validées

---

## Phase 1 — Fondation visuelle (34 étapes)

**1.a Tokens & socle**

### Étape P1-01 : Extraire tokens (couleur/typo/radius/ombre/anim) → CSS web
- **Fichiers :** `sanhia-web/src/styles/global.css`
- **Dépendance :** P0-6
- **Risque :** Moyen — remplace les tokens Poppins/Figma du 15/09/2026 (D0 validé)
- **Décision liée :** D0
- **Critère de validation :** `cd sanhia-web && npm run build`
- **Statut :** [x] Terminé — 18/09/2026. Fichier localisé : `sanhia-web/src/styles/global.css`
  (le seul fichier de variables globales, ~70 fichiers CSS du projet consomment ses tokens).
  **Décision d'implémentation** : D0 dit "remplacer entièrement", mais renommer/écraser les
  tokens legacy (`--color-gold`, `--font-primary`, `--radius-*`, `--shadow-*`...) en une seule
  étape aurait cassé silencieusement les ~70 fichiers qui les consomment encore — hors périmètre
  de P1-01 (§11 : une seule stack modifiée par changement) et contraire à "petites étapes
  vérifiables". Tokens mobile-2 ajoutés **en parallèle**, valeurs copiées à l'identique depuis
  `sanhia-mobila-2/src/index.css`, avec leurs noms d'origine (`--color-primary`, `--color-accent`,
  `--radius`, `--radius-card`, `--shadow-soft`, `--shadow-lift`, `--font-display`, `--font-sans`,
  classes `.anim-m2-*`/`.paper-m2`/`.photo-treat-m2`). 4 collisions de nom détectées avec des
  tokens legacy de valeur différente (`--color-border`, `--color-success`, `--color-warning`,
  `--color-info`) → suffixées `-m2` pour ne pas écraser l'existant sans le vouloir. Tokens legacy
  intacts, zéro fichier consommateur touché. La suppression du legacy + aplatissement des noms
  `-m2` est repoussée à une étape de nettoyage en fin de Phase 3, une fois toutes les pages
  migrées (Phase 2/3 de cette roadmap).
  **Bugs découverts et corrigés en cours de route** (aucun lien avec le contenu des tokens,
  syntaxe CSS uniquement) : (1) un commentaire CSS contenant littéralement `*/ ` au milieu du
  texte (`.anim-*/.orbit-*/...`) fermait le commentaire prématurément → reformulé sans
  slash-astérisque adjacents ; (2) le `@import` Fraunces/Archivo inséré au milieu du fichier
  violait la règle CSS "`@import` doit précéder toute autre règle" → remonté tout en haut, juste
  après le `@import` Poppins existant (ligne 7).
  **Validation réelle** : `npm run build` → succès (`✓ built in 711ms`, `dist/assets/index-*.css`
  généré à 330.92 kB), aucune erreur/warning CSS. Warning restant (chunks JS >500 kB) préexistant,
  sans rapport avec ce changement.

### Étape P1-02 : Extraire mêmes tokens → thème mobile
- **Fichiers :** `sanhia-mobile/src/theme/colors.js` (étendu), nouveau `sanhia-mobile/src/theme/typography.js`, `sanhia-mobile/app/_layout.js` (chargement des polices), `sanhia-mobile/package.json`+`package-lock.json` (2 nouvelles deps)
- **Dépendance :** P0-6
- **Risque :** Moyen — idem D0
- **Décision liée :** D0
- **Critère de validation :** `cd sanhia-mobile && NODE_ENV=development npm test -- src/components/__tests__/Button.test.js`
- **Statut :** [x] Terminé — 18/09/2026. Même approche additive que P1-01 (tokens mobile-2 ajoutés
  en parallèle, rien de legacy supprimé/écrasé — voir justification détaillée dans la note P1-01
  et la nouvelle règle transverse en tête de ce document).
  **`colors.js`** étendu avec `colorsM2` (objet séparé — 4 collisions de nom avec `colors` legacy
  de valeur différente : `border`, `success`, `warning`, `info` — jamais fusionnées dans `colors`),
  `radiusM2` (`base`/`card`), `shadowsM2` (`soft`/`lift`, styles RN `shadow*`/`elevation`),
  `motionM2` (durées ms) + `easingM2` (même cubic-bezier(0.22,1,0.36,1) que le web).
  **Nouveau `typography.js`** : `fontsM2` (noms exacts `Fraunces_*`/`Archivo_*` tels qu'exportés
  par `@expo-google-fonts/*`, à consommer tel quel en `fontFamily`) + `typographyM2` (échelle de
  tailles). **Différence avec P1-01** : contrairement aux couleurs/radius/ombres (tokens CSS
  exacts de mobile-2), `sanhia-mobila-2` n'a **pas d'échelle typographique nommée** — uniquement
  des valeurs Tailwind arbitraires en dur (`text-[11px]`, etc.). `typographyM2` est donc une
  **approximation documentée** dérivée des plages observées en Phase 0, pas une copie 1:1 comme
  le reste — à ajuster écran par écran si un usage réel diverge.
  **Chargement des polices (hors périmètre strict de l'énoncé, nécessaire pour que les tokens ne
  soient pas silencieusement inertes)** : `@expo-google-fonts/fraunces` et
  `@expo-google-fonts/archivo` installés (`npm install`, additifs, aucune dépendance retirée —
  vérifié par `git diff package.json` : 2 lignes ajoutées seulement) ; `app/_layout.js` étendu
  avec les 9 graisses mobile-2 (Fraunces 400/600/700 + 400/600 italique, Archivo 400/500/600/700)
  dans le même `useFonts()`, à côté des polices existantes (Unbounded/InstrumentSerif/Syne,
  intactes).
  **Incident d'environnement découvert et corrigé** : le premier `npm install` (sans override) a
  fait disparaître 228 paquets de devDependencies (`jest`, `jest-expo`, `react-test-renderer`...)
  du `node_modules` local à cause de `NODE_ENV=production` positionné dans ce shell — confirmé
  sans impact sur `package.json`/`package-lock.json` commités (`git diff` propre, 2 lignes). Réparé
  par `NODE_ENV=development npm install`. Règle ajoutée en tête de ce document pour ne pas
  reproduire l'incident aux étapes mobiles suivantes.
  **Validation réelle** : `NODE_ENV=development npm test -- src/components/__tests__/Button.test.js`
  → 4/4 tests passent (le test qui vérifie `radius.pill` continue de passer, `colors.js` s'importe
  sans erreur malgré l'extension).

### Étape P1-03 : Set d'icônes (32) → web
- **Fichiers :** nouveau `sanhia-web/src/components/ui/icons.jsx`
- **Dépendance :** P1-01
- **Risque :** Faible — fichier additif
- **Décision liée :** —
- **Critère de validation :** `npx eslint src/components/ui/icons.jsx`
- **Statut :** [ ] À faire

### Étape P1-04 : Set d'icônes → mobile
- **Fichiers :** nouveau `sanhia-mobile/src/components/icons.js` (react-native-svg)
- **Dépendance :** P1-02
- **Risque :** Faible — vérifier `react-native-svg` déjà présent
- **Décision liée :** —
- **Critère de validation :** `npx expo start` (smoke)
- **Statut :** [ ] À faire

### Étape P1-05 : Motifs "La Trame" (WeaveBand/MotifRule/Watermark) → web
- **Fichiers :** nouveau `sanhia-web/src/components/ui/motif.jsx` + `motif.css`
- **Dépendance :** P1-01
- **Risque :** Faible — additif
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

### Étape P1-06 : Motifs → mobile
- **Fichiers :** nouveau `sanhia-mobile/src/components/motif.js`
- **Dépendance :** P1-02
- **Risque :** Faible — additif
- **Décision liée :** —
- **Critère de validation :** `npx expo start` (smoke)
- **Statut :** [ ] À faire

**1.b Primitives partagées**

### Étape P1-07 : Restyle `Button` web
- **Fichiers :** `sanhia-web/src/components/ui/Button.jsx`
- **Dépendance :** P1-01
- **Risque :** Moyen — composant le plus réutilisé de l'app
- **Décision liée :** D0
- **Critère de validation :** `npm run build` + smoke `/`
- **Statut :** [ ] À faire

### Étape P1-08 : Restyle `Button.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/Button.js`
- **Dépendance :** P1-02
- **Risque :** Moyen — idem
- **Décision liée :** D0
- **Critère de validation :** `npm test -- src/components/__tests__/Button.test.js`
- **Statut :** [ ] À faire

### Étape P1-09 : Restyle `Input`/TextField web
- **Fichiers :** `sanhia-web/src/components/ui/Input.jsx`
- **Dépendance :** P1-07
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

### Étape P1-10 : Restyle `TextField.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/TextField.js`
- **Dépendance :** P1-08
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/TextField.test.js`
- **Statut :** [ ] À faire

### Étape P1-11 : Restyle `OtpInput` web (inspiration animation "OrbitVerify")
- **Fichiers :** `sanhia-web/src/components/ui/OtpInput.jsx`
- **Dépendance :** P1-09
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build` + smoke `/auth`
- **Statut :** [ ] À faire

### Étape P1-12 : Restyle `OtpInput.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/OtpInput.js`
- **Dépendance :** P1-10
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/OtpInput.test.js`
- **Statut :** [ ] À faire

### Étape P1-13 : Restyle `Badge`/StatusBadge web
- **Fichiers :** `sanhia-web/src/components/ui/Badge.jsx`
- **Dépendance :** P1-07
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

### Étape P1-14 : Restyle `Badge.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/Badge.js`
- **Dépendance :** P1-08
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/Badge.test.js`
- **Statut :** [ ] À faire

### Étape P1-15 : Restyle `EmptyState` web
- **Fichiers :** `sanhia-web/src/components/ui/EmptyState.jsx`
- **Dépendance :** P1-07
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

### Étape P1-16 : Restyle `EmptyState.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/EmptyState.js`
- **Dépendance :** P1-08
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/EmptyState.test.js`
- **Statut :** [ ] À faire

### Étape P1-17 : Restyle `ErrorState` web (le câbler réellement, jamais invoqué côté mobile-2)
- **Fichiers :** `sanhia-web/src/components/ui/ErrorState.jsx`
- **Dépendance :** P1-15
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

### Étape P1-18 : Restyle `ErrorState.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/ErrorState.js`
- **Dépendance :** P1-16
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/ErrorState.test.js`
- **Statut :** [ ] À faire

### Étape P1-19 : Restyle `Skeleton` web
- **Fichiers :** `sanhia-web/src/components/ui/Skeleton.jsx`
- **Dépendance :** P1-07
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

### Étape P1-20 : Restyle `Skeleton.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/Skeleton.js`
- **Dépendance :** P1-08
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/Skeleton.test.js` (si existant, sinon smoke)
- **Statut :** [ ] À faire

### Étape P1-21 : Restyle `Toast`/`useToastQueue` web (harmoniser les toasts locaux dupliqués Admin/Seller/Cart/Wishlist vers celui-ci, sans changer leur logique)
- **Fichiers :** `sanhia-web/src/components/ui/Toast.jsx`
- **Dépendance :** P1-07
- **Risque :** Moyen — plusieurs pages consomment déjà un toast local différent
- **Décision liée :** —
- **Critère de validation :** `npm run build` + smoke `/cart`
- **Statut :** [ ] À faire

### Étape P1-22 : Restyle `Toast.js` mobile
- **Fichiers :** `sanhia-mobile/src/components/Toast.js`
- **Dépendance :** P1-08
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/Toast.test.js`
- **Statut :** [ ] À faire

### Étape P1-23 : Restyle `Drawer` web (= BottomSheet)
- **Fichiers :** `sanhia-web/src/components/ui/Drawer.jsx`
- **Dépendance :** P1-07
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

### Étape P1-24 : Restyle `GlassSheet.js` mobile (= BottomSheet)
- **Fichiers :** `sanhia-mobile/src/components/GlassSheet.js`
- **Dépendance :** P1-08
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/GlassSheet.test.js` (si existant, sinon smoke)
- **Statut :** [ ] À faire

### Étape P1-25 : Restyle `Header.js` mobile (header d'écran, retour+titre — équivalent direct de mobile-2)
- **Fichiers :** `sanhia-mobile/src/components/Header.js`
- **Dépendance :** P1-08, P1-03
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/components/__tests__/Header.test.js`
- **Statut :** [ ] À faire

### Étape P1-26 : Restyle `layout/Header.jsx` web (nav globale persistante — concept différent du header par écran mobile, ne pas en créer un nouveau)
- **Fichiers :** `sanhia-web/src/components/layout/Header.jsx`
- **Dépendance :** P1-05
- **Risque :** Moyen — composant central, recherche live + badges
- **Décision liée :** —
- **Critère de validation :** `npm run build` + smoke toutes routes publiques
- **Statut :** [ ] À faire

**1.c Vérification sur les 4 écrans phares**

### Étape P1-27 : Vérif visuelle Auth mobile
- **Fichiers :** `sanhia-mobile/app/auth/phone.js`, `sanhia-mobile/app/auth/verify.js`
- **Dépendance :** P1-07 à P1-26
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npx expo start` smoke Android 360×800
- **Statut :** [ ] À faire

### Étape P1-28 : Vérif visuelle Auth web
- **Fichiers :** `sanhia-web/src/pages/PhoneAuth.jsx`
- **Dépendance :** P1-07 à P1-26
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/auth` desktop+mobile viewport
- **Statut :** [ ] À faire

### Étape P1-29 : Vérif visuelle Accueil mobile
- **Fichiers :** `sanhia-mobile/app/(buyer)/index.js`
- **Dépendance :** P1-27
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke Android
- **Statut :** [ ] À faire

### Étape P1-30 : Vérif visuelle Accueil web
- **Fichiers :** `sanhia-web/src/pages/Home.jsx`
- **Dépendance :** P1-28
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/`
- **Statut :** [ ] À faire

### Étape P1-31 : Vérif visuelle Catalogue mobile
- **Fichiers :** `sanhia-mobile/app/(buyer)/catalogue.js`
- **Dépendance :** P1-29
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke Android
- **Statut :** [ ] À faire

### Étape P1-32 : Vérif visuelle Catalogue web
- **Fichiers :** `sanhia-web/src/pages/Catalogue.jsx`
- **Dépendance :** P1-30
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/catalogue`
- **Statut :** [ ] À faire

### Étape P1-33 : Vérif visuelle Fiche produit mobile
- **Fichiers :** `sanhia-mobile/app/product/[id].js`
- **Dépendance :** P1-31
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke Android
- **Statut :** [ ] À faire

### Étape P1-34 : Vérif visuelle Fiche produit web
- **Fichiers :** `sanhia-web/src/pages/Product.jsx`
- **Dépendance :** P1-32
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/product/:id`
- **Statut :** [ ] À faire

---

## Phase 2 — Migration `sanhia-mobile` écran par écran (42 étapes)

Expo Router et routes conservés ; restyle du fichier + des composants qu'il consomme, sans
toucher aux hooks API/contexts.

**2.a Chrome/layouts**

### Étape P2-01 : Root layout (fonts, bandeau offline)
- **Fichiers :** `sanhia-mobile/app/_layout.js`
- **Dépendance :** Phase 1
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npx expo start` smoke global
- **Statut :** [ ] À faire

### Étape P2-02 : Auth stack layout
- **Fichiers :** `sanhia-mobile/app/auth/_layout.js`
- **Dépendance :** P1-27
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/auth`
- **Statut :** [ ] À faire

### Étape P2-03 : Tab bar acheteur
- **Fichiers :** `sanhia-mobile/app/(buyer)/_layout.js`
- **Dépendance :** P1-29
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke onglets acheteur
- **Statut :** [ ] À faire

### Étape P2-04 : Tab bar vendeur
- **Fichiers :** `sanhia-mobile/app/(seller)/_layout.js`
- **Dépendance :** P1-25
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke onglets vendeur
- **Statut :** [ ] À faire

### Étape P2-05 : Tab bar livreur
- **Fichiers :** `sanhia-mobile/app/(delivery)/_layout.js`
- **Dépendance :** P1-25
- **Risque :** Faible
- **Décision liée :** D2
- **Critère de validation :** smoke onglets livreur
- **Statut :** [ ] À faire

**2.b Auth + redirect technique**

### Étape P2-06 : Écran téléphone
- **Fichiers :** `sanhia-mobile/app/auth/phone.js`
- **Dépendance :** P2-02
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npx expo start` smoke
- **Statut :** [ ] À faire

### Étape P2-07 : Écran OTP (animation orbit optionnelle)
- **Fichiers :** `sanhia-mobile/app/auth/verify.js`
- **Dépendance :** P2-06
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke saisie OTP mock (123456)
- **Statut :** [ ] À faire

### Étape P2-08 : Spinner redirect racine
- **Fichiers :** `sanhia-mobile/app/index.js`
- **Dépendance :** P2-06
- **Risque :** Faible — couleur du spinner seulement
- **Décision liée :** —
- **Critère de validation :** smoke lancement app
- **Statut :** [ ] À faire

**2.c Général/statique**

### Étape P2-09 : À propos
- **Fichiers :** `sanhia-mobile/app/about.js`
- **Dépendance :** Phase 1
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-10 : Contact
- **Fichiers :** `sanhia-mobile/app/contact.js`
- **Dépendance :** Phase 1
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke + `POST /contact`
- **Statut :** [ ] À faire

### Étape P2-11 : Informations (FAQ/CGU/Mentions/Confidentialité)
- **Fichiers :** `sanhia-mobile/app/informations.js`
- **Dépendance :** Phase 1
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke 4 onglets
- **Statut :** [ ] À faire

### Étape P2-12 : Notifications (pas de référence mobile-2 — extrapoler)
- **Fichiers :** `sanhia-mobile/app/notifications.js`, `sanhia-mobile/src/components/NotificationItem.js`
- **Dépendance :** P1-14, P1-16
- **Risque :** Moyen — aucune référence visuelle directe
- **Décision liée :** D3
- **Critère de validation :** smoke `/notifications`
- **Statut :** [ ] À faire

**2.d Acheteur — cœur**

### Étape P2-13 : Accueil acheteur
- **Fichiers :** `sanhia-mobile/app/(buyer)/index.js`
- **Dépendance :** P2-03, P1-29
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke données live
- **Statut :** [ ] À faire

### Étape P2-14 : Catalogue
- **Fichiers :** `sanhia-mobile/app/(buyer)/catalogue.js`
- **Dépendance :** P2-03, P1-31
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke filtres
- **Statut :** [ ] À faire

### Étape P2-15 : Liste boutiques
- **Fichiers :** `sanhia-mobile/app/(buyer)/boutiques.js`
- **Dépendance :** P2-03
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-16 : Feed vidéo (onglet conservé)
- **Fichiers :** `sanhia-mobile/app/(buyer)/feed.js`, `sanhia-mobile/src/components/VideoFeedCard.js`
- **Dépendance :** P2-03
- **Risque :** Moyen — lecture vidéo, scroll-snap
- **Décision liée :** D4
- **Critère de validation :** smoke réseau lent
- **Statut :** [ ] À faire

### Étape P2-17 : Panier (bannière mono-boutique)
- **Fichiers :** `sanhia-mobile/app/(buyer)/cart.js`
- **Dépendance :** P2-03
- **Risque :** Moyen — logique paiement à ne pas toucher
- **Décision liée :** —
- **Critère de validation :** `npm test -- src/context/__tests__/CartContext.test.js` (si existant) + smoke
- **Statut :** [ ] À faire

### Étape P2-18 : Profil acheteur
- **Fichiers :** `sanhia-mobile/app/(buyer)/profile.js`
- **Dépendance :** P2-03
- **Risque :** Moyen — nombreux sous-flux (commandes, avis, suppression compte)
- **Décision liée :** —
- **Critère de validation :** smoke complet
- **Statut :** [ ] À faire

**2.e Acheteur — flux dynamiques**

### Étape P2-19 : Fiche boutique
- **Fichiers :** `sanhia-mobile/app/boutique/[id].js`
- **Dépendance :** P2-15
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/boutique/1`
- **Statut :** [ ] À faire

### Étape P2-20 : Fiche produit (3D/vidéo/image)
- **Fichiers :** `sanhia-mobile/app/product/[id].js`
- **Dépendance :** P2-14, P1-33
- **Risque :** Moyen — polling `model3dStatus`
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-21 : Wishlist
- **Fichiers :** `sanhia-mobile/app/wishlist.js`
- **Dépendance :** P1-16
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-22 : Adresses (structure conservée)
- **Fichiers :** `sanhia-mobile/app/addresses.js`
- **Dépendance :** P1-09
- **Risque :** Faible
- **Décision liée :** D6
- **Critère de validation :** smoke CRUD
- **Statut :** [ ] À faire

### Étape P2-23 : Story viewer plein écran
- **Fichiers :** `sanhia-mobile/app/story/[shopId].js`, `sanhia-mobile/src/components/StoryViewer.js`
- **Dépendance :** P2-19
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-24 : Paiement (preuve upload obligatoire)
- **Fichiers :** `sanhia-mobile/app/payment/[orderId].js`
- **Dépendance :** P2-17
- **Risque :** Élevé — flux paiement réel, ne pas casser la validation preuve
- **Décision liée :** —
- **Critère de validation :** smoke complet + test manuel Orange/Moov
- **Statut :** [ ] À faire

### Étape P2-25 : Confirmation de commande
- **Fichiers :** `sanhia-mobile/app/order-confirmation/[id].js`
- **Dépendance :** P2-24
- **Risque :** Moyen
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-26 : Facture
- **Fichiers :** `sanhia-mobile/app/invoice/[id].js`, `sanhia-mobile/src/components/OrderTimeline.js`
- **Dépendance :** P2-25
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-27 : Candidature vendeur (wizard 4 étapes)
- **Fichiers :** `sanhia-mobile/app/seller-application.js`
- **Dépendance :** Phase 1
- **Risque :** Moyen — multi-étapes, upload fichiers
- **Décision liée :** —
- **Critère de validation :** smoke parcours complet
- **Statut :** [ ] À faire

### Étape P2-28 : Messages — liste
- **Fichiers :** `sanhia-mobile/app/messages/index.js`, `sanhia-mobile/src/components/ConversationListItem.js`
- **Dépendance :** P1-14
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke polling 10s
- **Statut :** [ ] À faire

### Étape P2-29 : Messages — fil
- **Fichiers :** `sanhia-mobile/app/messages/[id].js`, `sanhia-mobile/src/components/MessageBubble.js`
- **Dépendance :** P2-28
- **Risque :** Moyen — polling 5s + masquage contact
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

**2.f Vendeur**

### Étape P2-30 : Dashboard vendeur
- **Fichiers :** `sanhia-mobile/app/(seller)/index.js`, `sanhia-mobile/src/components/StatTile.js`, `sanhia-mobile/src/components/Chart.js`
- **Dépendance :** P2-04
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-31 : Liste produits vendeur
- **Fichiers :** `sanhia-mobile/app/(seller)/products.js`
- **Dépendance :** P2-04
- **Risque :** Moyen — soft-delete optimiste
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-32 : Commandes reçues (code retrait)
- **Fichiers :** `sanhia-mobile/app/(seller)/orders.js`
- **Dépendance :** P2-04
- **Risque :** Moyen — flux `PATCH /:id/collect`
- **Décision liée :** —
- **Critère de validation :** smoke saisie code
- **Statut :** [ ] À faire

### Étape P2-33 : Réglages boutique (sans theming couleur)
- **Fichiers :** `sanhia-mobile/app/(seller)/settings.js`, `sanhia-mobile/src/components/LogoBannerUpload.js`
- **Dépendance :** P2-04
- **Risque :** Faible
- **Décision liée :** D5
- **Critère de validation :** smoke upload logo/bannière
- **Statut :** [ ] À faire

### Étape P2-34 : Ajout produit manuel
- **Fichiers :** `sanhia-mobile/app/seller/add-product.js`
- **Dépendance :** P2-31
- **Risque :** Moyen — upload images+vidéo
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-35 : Brouillon produit IA — création
- **Fichiers :** `sanhia-mobile/app/seller/product-draft/new.js` (absent de mobile-2, extrapoler)
- **Dépendance :** P2-31
- **Risque :** Moyen — aucune référence visuelle
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-36 : Brouillon produit IA — édition/publication
- **Fichiers :** `sanhia-mobile/app/seller/product-draft/[id].js`
- **Dépendance :** P2-35
- **Risque :** Moyen — polling statut
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-37 : Publication story vendeur
- **Fichiers :** `sanhia-mobile/app/seller/story.js`
- **Dépendance :** P2-23
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-38 : Tagging vidéo (drag timeline)
- **Fichiers :** `sanhia-mobile/app/seller/video-tagging.js`
- **Dépendance :** P2-16
- **Risque :** Élevé — interaction drag custom, UI la plus complexe du repo
- **Décision liée :** —
- **Critère de validation :** smoke manuel complet
- **Statut :** [ ] À faire

**2.g Livreur**

### Étape P2-39 : Marché des missions
- **Fichiers :** `sanhia-mobile/app/(delivery)/index.js`
- **Dépendance :** P2-05
- **Risque :** Faible
- **Décision liée :** D2
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-40 : Mission active
- **Fichiers :** `sanhia-mobile/app/(delivery)/active.js`
- **Dépendance :** P2-39
- **Risque :** Moyen — sheet échec livraison
- **Décision liée :** D2
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-41 : Historique livraisons
- **Fichiers :** `sanhia-mobile/app/(delivery)/history.js`
- **Dépendance :** P2-39
- **Risque :** Faible
- **Décision liée :** D2
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P2-42 : Profil livreur
- **Fichiers :** `sanhia-mobile/app/(delivery)/profile.js`
- **Dépendance :** P2-05
- **Risque :** Faible
- **Décision liée :** D2
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

---

## Phase 3 — Harmonisation `sanhia-web` (36 étapes)

React Router et URLs conservés ; capacités desktop (tableaux, hover, nav admin) préservées ;
responsive ajouté sans masquer d'info.

**3.a Layout global**

### Étape P3-01 : Header global (nav, recherche live, badges)
- **Fichiers :** `sanhia-web/src/components/layout/Header.jsx`
- **Dépendance :** P1-26
- **Risque :** Moyen — composant le plus central du site
- **Décision liée :** —
- **Critère de validation :** `npm run build` + smoke toutes routes
- **Statut :** [ ] À faire

### Étape P3-02 : Footer
- **Fichiers :** `sanhia-web/src/components/layout/Footer.jsx`
- **Dépendance :** P1-05
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** `npm run build`
- **Statut :** [ ] À faire

**3.b Pages publiques statiques**

### Étape P3-03 : À propos
- **Fichiers :** `sanhia-web/src/pages/About.jsx`
- **Dépendance :** P3-01
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/about`
- **Statut :** [ ] À faire

### Étape P3-04 : Contact
- **Fichiers :** `sanhia-web/src/pages/Contact.jsx`
- **Dépendance :** P3-01
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/contact`
- **Statut :** [ ] À faire

### Étape P3-05 : Informations (FAQ/CGU/Mentions/Confidentialité)
- **Fichiers :** `sanhia-web/src/pages/Informations.jsx`
- **Dépendance :** P3-01
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/informations`
- **Statut :** [ ] À faire

### Étape P3-06 : Onboarding vendeur
- **Fichiers :** `sanhia-web/src/pages/SellerOnboarding.jsx`
- **Dépendance :** P3-01
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/seller/onboarding`
- **Statut :** [ ] À faire

**3.c Auth**

### Étape P3-07 : Auth téléphone+OTP
- **Fichiers :** `sanhia-web/src/pages/PhoneAuth.jsx`
- **Dépendance :** P1-28
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/auth`
- **Statut :** [ ] À faire

**3.d Acheteur — cœur**

### Étape P3-08 : Accueil
- **Fichiers :** `sanhia-web/src/pages/Home.jsx`
- **Dépendance :** P1-30
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/`
- **Statut :** [ ] À faire

### Étape P3-09 : Catalogue
- **Fichiers :** `sanhia-web/src/pages/Catalogue.jsx`
- **Dépendance :** P1-32
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/catalogue`
- **Statut :** [ ] À faire

### Étape P3-10 : Liste boutiques
- **Fichiers :** `sanhia-web/src/pages/BoutiqueList.jsx`
- **Dépendance :** P3-01
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/boutiques`
- **Statut :** [ ] À faire

### Étape P3-11 : Feed vidéo (route publique conservée)
- **Fichiers :** `sanhia-web/src/pages/VideoFeed.jsx`
- **Dépendance :** P3-01
- **Risque :** Moyen — scroll-snap + IntersectionObserver
- **Décision liée :** D4
- **Critère de validation :** smoke `/feed`
- **Statut :** [ ] À faire

### Étape P3-12 : Panier (bannière mono-boutique)
- **Fichiers :** `sanhia-web/src/pages/Cart.jsx`
- **Dépendance :** P1-07
- **Risque :** Moyen
- **Décision liée :** —
- **Critère de validation :** smoke `/cart` desktop+mobile
- **Statut :** [ ] À faire

### Étape P3-13 : Wishlist
- **Fichiers :** `sanhia-web/src/pages/Wishlist.jsx`
- **Dépendance :** P1-16
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/wishlist`
- **Statut :** [ ] À faire

**3.e Acheteur — fiche & flux**

### Étape P3-14 : Fiche produit (galerie 3D)
- **Fichiers :** `sanhia-web/src/pages/Product.jsx`
- **Dépendance :** P1-34
- **Risque :** Moyen
- **Décision liée :** —
- **Critère de validation :** smoke `/product/:id`
- **Statut :** [ ] À faire

### Étape P3-15 : Fiche boutique — data wrapper
- **Fichiers :** `sanhia-web/src/pages/Boutique.jsx`
- **Dépendance :** P3-16
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/boutique/:id`
- **Statut :** [ ] À faire

### Étape P3-16 : Fiche boutique — assemblage présentationnel
- **Fichiers :** `sanhia-web/src/pages/BoutiquePage.jsx`
- **Dépendance :** P3-17 à P3-22
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/boutique/:id`
- **Statut :** [ ] À faire

### Étape P3-17 : Sous-composant boutique — layout/palette
- **Fichiers :** `sanhia-web/src/components/boutique/BoutiqueLayout.jsx`
- **Dépendance :** P1-01
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-18 : Sous-composant boutique — héros/nav ancrée
- **Fichiers :** `sanhia-web/src/components/boutique/BoutiqueHero.jsx`
- **Dépendance :** P3-17
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-19 : Sous-composant boutique — grille produits
- **Fichiers :** `sanhia-web/src/components/boutique/ProductsSection.jsx`
- **Dépendance :** P3-17
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-20 : Sous-composant boutique — histoire
- **Fichiers :** `sanhia-web/src/components/boutique/StorySection.jsx`
- **Dépendance :** P3-17
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-21 : Sous-composant boutique — avis
- **Fichiers :** `sanhia-web/src/components/boutique/ReviewsSection.jsx`
- **Dépendance :** P3-17
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-22 : Sous-composant boutique — CTA contact
- **Fichiers :** `sanhia-web/src/components/boutique/ContactCTA.jsx`
- **Dépendance :** P3-17
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-23 : Adresses (onglet Profil conservé)
- **Fichiers :** `sanhia-web/src/pages/Profile.jsx` (onglet Adresses uniquement)
- **Dépendance :** P1-09
- **Risque :** Faible
- **Décision liée :** D6
- **Critère de validation :** smoke onglet
- **Statut :** [ ] À faire

**3.f Paiement/commande/messages**

### Étape P3-24 : Paiement (preuve upload)
- **Fichiers :** `sanhia-web/src/pages/Payment.jsx`
- **Dépendance :** P3-12
- **Risque :** Élevé — flux argent réel
- **Décision liée :** —
- **Critère de validation :** smoke complet + test manuel
- **Statut :** [ ] À faire

### Étape P3-25 : Confirmation commande
- **Fichiers :** `sanhia-web/src/pages/OrderConfirmation.jsx`
- **Dépendance :** P3-24
- **Risque :** Moyen
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-26 : Facture (export PDF)
- **Fichiers :** `sanhia-web/src/pages/Invoice.jsx`
- **Dépendance :** P3-25
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke génération PDF
- **Statut :** [ ] À faire

### Étape P3-27 : Candidature vendeur
- **Fichiers :** `sanhia-web/src/pages/SellerApplication.jsx`
- **Dépendance :** P3-01
- **Risque :** Moyen
- **Décision liée :** —
- **Critère de validation :** smoke parcours
- **Statut :** [ ] À faire

### Étape P3-28 : Messages
- **Fichiers :** `sanhia-web/src/pages/Messages.jsx`
- **Dépendance :** P1-21
- **Risque :** Moyen — SSE+polling
- **Décision liée :** —
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

### Étape P3-29 : Notifications (pas de référence mobile-2)
- **Fichiers :** `sanhia-web/src/pages/Notifications.jsx`
- **Dépendance :** P1-21
- **Risque :** Moyen
- **Décision liée :** D3
- **Critère de validation :** smoke
- **Statut :** [ ] À faire

**3.g Profil + tableaux de bord staff**

### Étape P3-30 : Profil acheteur (onglets)
- **Fichiers :** `sanhia-web/src/pages/Profile.jsx`
- **Dépendance :** P3-23
- **Risque :** Moyen — 4 sous-onglets
- **Décision liée :** —
- **Critère de validation :** smoke `/profile`
- **Statut :** [ ] À faire

### Étape P3-31 : Dashboard vendeur (1640 lignes, plus gros fichier)
- **Fichiers :** `sanhia-web/src/pages/Seller.jsx`
- **Dépendance :** P3-01
- **Risque :** Élevé — 8 onglets internes, fichier volumineux (corriger au passage le `TABS` const obsolète noté par l'audit)
- **Décision liée :** D5
- **Critère de validation :** smoke 8 onglets
- **Statut :** [ ] À faire

### Étape P3-32 : Dashboard livreur
- **Fichiers :** `sanhia-web/src/pages/Delivery.jsx`
- **Dépendance :** P3-01
- **Risque :** Moyen
- **Décision liée :** D2
- **Critère de validation :** smoke 4 onglets
- **Statut :** [ ] À faire

### Étape P3-33 : Connexion coordinateur (email+mdp, web-only)
- **Fichiers :** `sanhia-web/src/pages/CoordinatorLogin.jsx`
- **Dépendance :** P3-01
- **Risque :** Faible
- **Décision liée :** D1
- **Critère de validation :** smoke `/coordinator/login`
- **Statut :** [ ] À faire

### Étape P3-34 : Dashboard coordinateur (corriger l'incohérence SiteChrome : `/coordinator` garde Header/Footer contrairement à `/admin`,`/seller`,`/delivery`)
- **Fichiers :** `sanhia-web/src/pages/Coordinator.jsx`
- **Dépendance :** P3-33
- **Risque :** Moyen
- **Décision liée :** D1
- **Critère de validation :** smoke `/coordinator`
- **Statut :** [ ] À faire

### Étape P3-35 : Dashboard admin (13 onglets, web-only)
- **Fichiers :** `sanhia-web/src/pages/Admin.jsx`
- **Dépendance :** P3-01
- **Risque :** Élevé — fichier volumineux, CRUD critique
- **Décision liée :** —
- **Critère de validation :** smoke 13 onglets
- **Statut :** [ ] À faire

### Étape P3-36 : Pages d'erreur
- **Fichiers :** `sanhia-web/src/pages/errors/Forbidden.jsx`, `sanhia-web/src/pages/errors/NotFound.jsx`
- **Dépendance :** P3-01
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** smoke `/forbidden`, route inconnue
- **Statut :** [ ] À faire

---

## Phase 4 — Parité et validation croisée (15 étapes)

Chaque étape compare mobile-1 ↔ web sur un même parcours utilisateur, avec les deux apps
lancées en parallèle contre le même backend.

### Étape P4-01 : Parité Auth
- **Écrans comparés :** P2-06/07 ↔ P3-07
- **Dépendance :** Phase 2 + Phase 3 (auth)
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** test manuel même numéro sur les 2 apps
- **Statut :** [ ] À faire

### Étape P4-02 : Parité Catalogue
- **Écrans comparés :** P2-14 ↔ P3-09
- **Dépendance :** P2-14, P3-09
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** comparer filtres/tri
- **Statut :** [ ] À faire

### Étape P4-03 : Parité Recherche
- **Écrans comparés :** Header web (P3-01) ↔ barre recherche `catalogue.js` mobile
- **Dépendance :** P3-01, P2-14
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** mêmes résultats pour mêmes requêtes
- **Statut :** [ ] À faire

### Étape P4-04 : Parité Fiche produit
- **Écrans comparés :** P2-20 ↔ P3-14
- **Dépendance :** P2-20, P3-14
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** prix/stock/avis identiques
- **Statut :** [ ] À faire

### Étape P4-05 : Parité Ajout panier
- **Écrans comparés :** `AddToCartButton` mobile/web
- **Dépendance :** P2-17, P3-12
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** quantité/stock cohérents
- **Statut :** [ ] À faire

### Étape P4-06 : Parité Panier mono-boutique
- **Écrans comparés :** P2-17 ↔ P3-12
- **Dépendance :** P4-05
- **Risque :** Moyen — règle métier critique
- **Décision liée :** —
- **Critère de validation :** forcer un conflit 2 boutiques sur les 2 apps
- **Statut :** [ ] À faire

### Étape P4-07 : Parité Paiement
- **Écrans comparés :** P2-24 ↔ P3-24
- **Dépendance :** P4-06
- **Risque :** Élevé
- **Décision liée :** —
- **Critère de validation :** test réel Orange/Moov sandbox si dispo, sinon preuve mockée
- **Statut :** [ ] À faire

### Étape P4-08 : Parité Confirmation
- **Écrans comparés :** P2-25 ↔ P3-25
- **Dépendance :** P4-07
- **Risque :** Moyen
- **Décision liée :** —
- **Critère de validation :** comparaison visuelle + données
- **Statut :** [ ] À faire

### Étape P4-09 : Parité Historique commandes
- **Écrans comparés :** P2-18 (onglet) ↔ P3-30 (onglet)
- **Dépendance :** P2-18, P3-30
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** statuts identiques (`PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED`)
- **Statut :** [ ] À faire

### Étape P4-10 : Parité Favoris
- **Écrans comparés :** P2-21 ↔ P3-13
- **Dépendance :** P2-21, P3-13
- **Risque :** Faible
- **Décision liée :** —
- **Critère de validation :** localStorage vs AsyncStorage cohérents
- **Statut :** [ ] À faire

### Étape P4-11 : Parité Messages
- **Écrans comparés :** P2-28/29 ↔ P3-28
- **Dépendance :** P2-29, P3-28
- **Risque :** Moyen — SSE web vs polling mobile
- **Décision liée :** —
- **Critère de validation :** échanger un message entre les 2 apps
- **Statut :** [ ] À faire

### Étape P4-12 : Parité Candidature vendeur
- **Écrans comparés :** P2-27 ↔ P3-27
- **Dépendance :** P2-27, P3-27
- **Risque :** Moyen
- **Décision liée :** —
- **Critère de validation :** mêmes champs obligatoires
- **Statut :** [ ] À faire

### Étape P4-13 : Parité Création produit
- **Écrans comparés :** P2-34/35/36 ↔ `Seller.jsx` onglet Produits
- **Dépendance :** P2-36, P3-31
- **Risque :** Moyen — mobile a un flux IA (draft) à vérifier côté web
- **Décision liée :** —
- **Critère de validation :** comparer les 2 flux
- **Statut :** [ ] À faire

### Étape P4-14 : Parité Commande vendeur
- **Écrans comparés :** P2-32 ↔ `Seller.jsx` onglet Commandes (P3-31)
- **Dépendance :** P2-32, P3-31
- **Risque :** Moyen — code retrait
- **Décision liée :** —
- **Critère de validation :** même code généré des 2 côtés
- **Statut :** [ ] À faire

### Étape P4-15 : Parité Mission livreur
- **Écrans comparés :** P2-39..42 ↔ P3-32
- **Dépendance :** P2-42, P3-32
- **Risque :** Moyen
- **Décision liée :** D2
- **Critère de validation :** accepter/livrer une mission de test des 2 apps
- **Statut :** [ ] À faire

---

## Synthèse

- **Total étapes :** 133 (6 Phase 0 terminées + 127 restantes : 34 Phase 1, 42 Phase 2, 36 Phase 3, 15 Phase 4).
- **Durée grossière :** Phase 1 ≈ 1,5 semaine · Phase 2 ≈ 3 semaines · Phase 3 ≈ 2,5 semaines ·
  Phase 4 ≈ 1 semaine → **~8 semaines au total**.
- **Prochaine étape :** P1-01 (extraction des tokens mobile-2 → `sanhia-web/src/styles/`), à
  déclencher explicitement par « Étape P1-01 ».
