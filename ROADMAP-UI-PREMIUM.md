# Sanhia — Roadmap Transformation UI/UX Premium

> Généré à partir d'un audit réel du code (pas d'hypothèses) en réponse à la mission de
> transformation UI/UX premium. Chaque étape est atomique (15-45 min selon la densité de
> la page), séquentielle, et se termine par un critère de validation vérifiable (build +
> QA responsive réelle aux points de rupture demandés — 320/375/390/430/768/1024/1280/
> 1440/1920px — pas juste "ça compile").
> Cocher `[x]` la case Statut une fois l'étape terminée ET vérifiée — pas avant.

**Convention de chemins** : `sanhia-web/` = web, `sanhia-mobile/` = mobile. Le backend
(`server-sanhia/`) n'est pas concerné par cette roadmap — aucune étape ne touche aux
routes, au schéma, à l'auth ou à la logique métier, conformément au brief (§32).

**Priorité, dans l'ordre exact demandé par le brief (§35)** : UX → Clarté → Conversion →
Cohérence → Responsive → Accessibilité → Performance → Esthétique → Micro-interactions.
Ça détermine l'ordre des phases ci-dessous : les fondations et le tunnel d'achat
(Home → Catalogue → Produit → Panier/Checkout) passent avant les dashboards internes
(vendeur/livreur/admin), qui restent fonctionnels mais moins visibles publiquement.

---

## Constats de l'audit (à lire avant d'exécuter)

### 1. Une identité de marque existe déjà, verrouillée et cross-plateforme — on la garde
`sanhia-web/src/styles/global.css` et `sanhia-mobile/src/theme/colors.js` définissent
**la même charte** (commentaire : « Charte graphique Sanhia V2, verrouillée le
14/08/2026 ») : fond crème chaud `#F3E9DD`, accent terracotta `#D96A3A`, texte navy
profond `#153B5C`, typographie Unbounded (display) + Syne (corps) + Instrument Serif
(accent éditorial), curseur personnalisé (`CustomCursor.jsx`, cercle + point qui suit la
souris, grossit au survol des éléments interactifs). C'est déjà une identité distinctive
— chaleureuse, artisanale, premium, clairement différente d'un template SaaS générique.
**Cette roadmap professionnalise et complète cette charte, ne la remplace pas** (brief
§4 : « si une identité existe déjà, conserve son ADN »). Le document de charte référencé
en commentaire (`Sanhia Migration Charte Graphique V2.md`) n'existe plus dans le dépôt —
`global.css`/`colors.js` font foi comme seule source de vérité actuelle.

### 2. La charte est dupliquée au lieu d'être centralisée — vraie incohérence à corriger
Malgré `global.css` qui définit `--color-gold` etc., au moins 6 fichiers CSS de page
(`home.css`, `catalogue.css`, `about.css`, `boutique.css`, `delivery.css`,
`SellerOnboarding.module.css`) redéfinissent leur propre `--gold`/`--g` local sur leur
propre `:root`, avec les mêmes valeurs recopiées à la main. Risque réel : une future
mise à jour de couleur devra être répétée dans 6+ endroits, avec le risque de désync
déjà latent. Phase 0 corrige ça en consolidant tout vers `global.css`.

### 3. Aucune bibliothèque de composants partagés côté web (le mobile en a déjà une)
`sanhia-mobile/src/components/` a déjà `Button`, `TextField`, `GlassSheet`, `Heading`,
`Text`, `EmptyState`, `Skeleton` — réutilisés partout. Côté web, chaque page définit ses
propres classes CSS et JSX pour boutons/cartes/badges/champs (`.ax-bcart`, `.sd-btn-
primary`, `.dv-accept-btn`, `.tk-btn`, `.cat-*`... au moins 5 systèmes de bouton
différents, visuellement proches mais tous codés indépendamment). C'est le plus gros
chantier structurel de cette roadmap côté web : construire `src/components/ui/` une
fois, migrer les pages dessus au fil des phases suivantes plutôt que de tout faire d'un
bloc (risque de tout casser en même temps sinon).

### 4. Ce qui manque dans le design system actuel (à ajouter, pas à réinventer)
- Pas d'échelle typographique nommée (Display/H1-H4/Body/Small/Caption/Price) — seulement
  un style générique `h1..h6`.
- Aucun token d'ombre (`shadow`) nulle part dans le projet.
- Motion : deux valeurs génériques (`--transition`, `--transition-slow`), pas de rampe
  fast/normal/complex, pas de respect explicite de `prefers-reduced-motion` en dehors du
  curseur.
- `radius` s'arrête à `lg` (16px) — pas de valeur "pill" pour badges/chips/avatars.

### 5. États déjà couverts vs. réellement manquants (vérifié page par page)
- **Skeletons** : déjà présents et bien faits côté mobile (`src/components/Skeleton.js`,
  `RowListSkeleton`/`CardGridSkeleton`) et sur `Product.jsx` web (`.ax-loader`). **Absents
  du Catalogue web, de la Boutique web, du Panier web, de `/account`.**
- **Empty states** : présents et bons côté mobile (`EmptyState.js`, réutilisé partout).
  Côté web, présents sur Admin (`Empty` interne au fichier) mais **absents ou minimalistes
  sur Wishlist, Panier vide, recherche sans résultat côté catalogue**.
- **Error states réseau** : gérés au cas par cas (`catch` silencieux ou `Alert`/toast) —
  pas de composant dédié réutilisable "Erreur réseau, réessayer" sur aucune des deux
  plateformes.

### 6. Pages/sections demandées par le brief déjà présentes vs. réellement absentes
Déjà là (à professionnaliser, pas à recréer) : Home, Catalogue, Fiche produit (avec vue
3D — ROADMAP-3D-VIEWER.md — et repli galerie), Panier, Paiement, Wishlist, Profil/Compte
(onglets infos/adresses/commandes), Messagerie, Notifications, Facture, Boutique
publique (`BoutiqueLayout` + sections Hero/Products/Reviews/Story/Contact — déjà une
vraie structure "storefront", pas juste une liste), Suivi de commande (implicite dans le
statut de commande, jamais présenté comme une timeline visuelle).
Réellement absents et à construire (brief §6, §9, §14) : **section Trending/Tendances**,
**section "Vu récemment"**, **timeline de suivi de commande dédiée et visuelle**,
**page de confirmation de commande dédiée** (aujourd'hui la confirmation se limite à un
toast + redirection, pas de vraie page récapitulative), **breadcrumbs sur le catalogue**,
**recherche avec suggestions live** (aujourd'hui : simple champ texte sans autocomplétion).

### 7. Aucune régression fonctionnelle tolérée
Chaque étape ci-dessous ne touche que des fichiers de présentation (`.jsx` pour le JSX
et les classes, `.css`, nouveaux composants dans `src/components/ui/`) et jamais les
appels `axios`/`api`, les routes, le contexte d'auth ou la logique métier — conforme au
brief §32. Là où une page nécessite un nouvel appel API pour une section absente
(Trending, Vu récemment), l'étape le signale explicitement et vérifie que la route
existe déjà côté backend avant de l'utiliser (ex. `GET /api/products?sort=popular`
existe déjà — confirmé dans `routes/products.js` — donc "Trending" est réalisable sans
toucher au backend ; "Vu récemment" se fait en local storage, aucun backend requis).

---

## Phase 0 — Fondations du Design System (web + mobile)

> Rien ne se construit sur une page tant que ces fondations ne sont pas posées — sinon
> chaque page suivante réinvente sa propre version, exactement le problème actuel.

### Étape 1 : Compléter `global.css` — échelle typographique, ombres, motion
- **Objectif :** Ajouter les tokens manquants sans toucher aux valeurs de couleur déjà verrouillées.
- **Fichiers impactés :** `sanhia-web/src/styles/global.css`
- **Instructions :** Ajouter au `:root` : `--font-size-display` (clamp fluide), `--font-size-h1` à `--h4`, `--font-size-body`, `--font-size-small`, `--font-size-caption`, `--font-size-price` ; `--shadow-subtle`, `--shadow-card`, `--shadow-elevated`, `--shadow-modal` (teintées navy, pas noir pur — cohérent avec la palette chaude) ; `--ease-fast` (120ms), `--ease-normal` (240ms), `--ease-complex` (400ms, même courbe que le curseur existant) ; `--radius-full` (999px). Ajouter un bloc `@media (prefers-reduced-motion: reduce)` global qui neutralise `--ease-*` à `0ms` (hérité automatiquement partout où les tokens sont utilisés).
- **Critère de validation :** `npm run build` passe ; aucune valeur de couleur modifiée (diff limité à des ajouts) ; les 4 tokens d'ombre rendent visuellement différents à l'œil sur un élément de test.
- **Statut :** [x] Terminé (2026-08-31) — Tokens ajoutés en pur ajout à `global.css` : échelle typographique (Display/H1/H2 en `clamp()` fluide, H3/H4/Body/Small/Caption/Price fixes), 4 ombres teintées navy (`--color-text`, jamais noir pur), rampe motion `--ease-fast/normal/complex` (400ms complex reprend exactement la courbe du curseur existant `cubic-bezier(0.16,1,0.3,1)`), `--radius-full`, et un bloc `@media (prefers-reduced-motion: reduce)` neutralisant toute la rampe motion à `0ms linear`. `npm run build` passe. Vérifié en conditions réelles via Playwright (serveur de dev démarré avec `NODE_ENV=development` — leçon de la session précédente déjà appliquée) : les 4 ombres se résolvent en valeurs `getComputedStyle` distinctes (`Set` de taille 4) ; `--color-gold` inchangé (non-régression) ; une transition réelle utilisant `--ease-normal` mesure bien `0.24s` de durée appliquée ; avec `page.emulateMedia({reducedMotion: 'reduce'})`, les 3 tokens motion se résolvent bien à `0ms linear`. Fichier de test et artefacts supprimés.

### Étape 2 : Consolider les couleurs dupliquées dans les CSS de page
- **Objectif :** Une seule source de vérité pour les couleurs — corrige le constat n°2.
- **Fichiers impactés :** `home.css`, `catalogue.css`, `about.css`, `boutique.css`, `delivery.css`, `SellerOnboarding.module.css`
- **Instructions :** Retirer les redéfinitions locales de `--gold`/`--g` etc. sur `:root` dans ces fichiers, faire pointer les usages vers `var(--color-gold)` (global). Pour les fichiers `.module.css` (scope CSS Modules, pas de `:root` global partagé) : garder une redéclaration locale mais dont la valeur référence `var(--color-gold)` du global plutôt qu'un hex recopié, pour rester synchronisé si la charte change.
- **Critère de validation :** Recherche globale (`grep -rn "gold:\s*#D96A3A"`) ne retourne plus que `global.css` et `colors.js` ; rendu visuel inchangé (comparaison capture avant/après sur Home et Catalogue via Playwright déjà en place).
- **Statut :** [ ] Non commencé

### Étape 3 : Composants UI partagés web — Button, Badge, Card
- **Objectif :** Poser les 3 primitives les plus réutilisées, corrige le constat n°3 (partie 1/3).
- **Fichiers impactés :** `sanhia-web/src/components/ui/Button.jsx`, `Badge.jsx`, `Card.jsx` (nouveaux) + CSS associés
- **Instructions :** `Button` : variants `primary`/`outline`/`ghost`/`danger`, tailles `sm`/`md`/`lg`, état `loading` (spinner intégré, remplace les boutons-texte-qui-change-au-clic actuels type `{saving ? '...' : 'Enregistrer'}`), état `disabled`. `Badge` : variants sémantiques (`gold`/`ok`/`warn`/`danger`/`neutral`) — unifie `Chip` (Admin/Coordinator), `dv-chip` (Delivery), les badges ad hoc du panier. `Card` : conteneur avec `--shadow-card`, coins `--radius-lg`, padding cohérent. Ne migre **aucune page existante** dans cette étape — juste la construction des primitives, testées isolément (Storybook non nécessaire ici, un rendu dans une page de test temporaire suffit puis supprimée).
- **Critère de validation :** Les 3 composants rendent correctement dans un test isolé (page temporaire), tous les variants visibles, `npm run build` passe, aucune page existante modifiée.
- **Statut :** [ ] Non commencé

### Étape 4 : Composants UI partagés web — EmptyState, ErrorState, Skeleton
- **Objectif :** Corrige le constat n°5 — un seul composant réutilisable par état plutôt que du code dupliqué par page.
- **Fichiers impactés :** `sanhia-web/src/components/ui/EmptyState.jsx`, `ErrorState.jsx`, `Skeleton.jsx` (nouveaux)
- **Instructions :** `EmptyState` : icône (SVG inline, cohérent avec le style déjà utilisé sur Admin), titre, sous-titre, action optionnelle — signature proche de `EmptyState.js` mobile pour cohérence cross-plateforme. `ErrorState` : message + bouton "Réessayer" (`onRetry` callback), pour les erreurs réseau. `Skeleton` : `SkeletonCard` (grille produit), `SkeletonRow` (liste), `SkeletonText` — animation shimmer via `--ease-normal`, respecte `prefers-reduced-motion` (pas d'animation, juste un fond statique si activé).
- **Critère de validation :** Build passe ; les 3 composants testés isolément avec des props réalistes ; animation shimmer visible et fluide (pas de saccade).
- **Critère de validation :** `npm run build` passe.
- **Statut :** [ ] Non commencé

### Étape 5 : Composants UI partagés web — Modal, Drawer/BottomSheet, Toast
- **Objectif :** Unifie les patrons de superposition (le brief §7 exige explicitement un bottom sheet mobile pour les filtres, actuellement inexistant sous quelque forme que ce soit sur le catalogue web).
- **Fichiers impactés :** `sanhia-web/src/components/ui/Modal.jsx`, `Drawer.jsx`, `Toast.jsx` (nouveaux)
- **Instructions :** `Modal` : overlay + panneau centré, `--shadow-modal`, fermeture Échap/clic-extérieur, `role="dialog"`/`aria-modal` (accessibilité, brief §27). `Drawer` : glisse depuis le bas sur mobile (< 768px) et depuis la droite sur desktop — même composant, comportement responsive interne, pas deux composants séparés. `Toast` : consolide `PushToast.jsx` existant (déjà fonctionnel pour les notifications push) en le généralisant pour les confirmations d'action (ajout panier, sauvegarde profil, etc.) actuellement gérées par des toasts ad hoc par page.
- **Critère de validation :** Build passe ; `Drawer` testé aux deux comportements (redimensionner la fenêtre de test sous/au-dessus de 768px) ; navigation clavier (Tab, Échap) fonctionnelle sur `Modal`.
- **Statut :** [ ] Non commencé

### Étape 6 : Design tokens mobile — compléter `colors.js` en miroir de l'Étape 1
- **Objectif :** Garder mobile et web strictement synchronisés (déjà le cas aujourd'hui pour les couleurs — l'étendre à shadow/motion).
- **Fichiers impactés :** `sanhia-mobile/src/theme/colors.js`
- **Instructions :** Ajouter `shadows` (React Native : `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` + `elevation` Android, un objet par niveau `subtle`/`card`/`elevated`/`modal`, mêmes teintes navy que web), `motion` (`fast`/`normal`/`complex` en ms, utilisables avec `Animated.timing`), `radius.full`. Ajouter `typography` : tailles nommées en miroir de l'échelle web (`display`/`h1`..`h4`/`body`/`small`/`caption`/`price`).
- **Critère de validation :** `npx expo export --platform web` bundle sans erreur ; les nouveaux tokens s'importent et s'appliquent sans crash sur un composant de test.
- **Statut :** [ ] Non commencé

---

## Phase 1 — Tunnel d'achat (priorité conversion maximale)

> Home → Catalogue → Fiche produit → Panier → Checkout → Confirmation : le cœur du
> brief. Chaque étape migre une page vers les composants de la Phase 0 ET ajoute ce qui
> manque (constat n°6), dans le même geste pour éviter de repasser deux fois sur la même page.

### Étape 7 : Header + navigation — recherche, wishlist, panier, compte
- **Fichiers impactés :** `sanhia-web/src/components/layout/Header.jsx`, `header.css`
- **Instructions :** Professionnaliser la hiérarchie (logo / recherche centrale / icônes compte-wishlist-panier à droite, badge de compteur sur le panier). Recherche : ajouter un menu de suggestions live au focus (produits populaires + catégories, données déjà disponibles via `GET /api/products?sort=popular&limit=5` — pas de nouvel endpoint). Mobile : drawer déjà existant à revoir avec le nouveau `Drawer` (Étape 5) plutôt que son implémentation actuelle ad hoc.
- **Critère de validation :** QA responsive complète (320/375/390/430/768/1024/1280/1440/1920px) — aucun élément qui déborde ou se chevauche ; recherche live testée avec un vrai terme.
- **Statut :** [ ] Non commencé

### Étape 8 : Home — Hero
- **Fichiers impactés :** `sanhia-web/src/pages/Home.jsx`, `home.css`
- **Instructions :** Retravailler le hero existant (déjà structuré : eyebrow/titre/recherche/pills) pour une proposition de valeur plus forte visuellement — pas juste du texte, une vraie mise en scène produit (grille de vignettes produits en arrière-plan ou composition éditoriale, cohérente avec Instrument Serif déjà réservé aux moments éditoriaux). Ne pas inventer d'image : réutiliser de vraies photos produit déjà en base (`GET /api/products?limit=6`).
- **Critère de validation :** QA responsive complète ; hero lisible et impactant dès 320px, pas seulement en desktop large.
- **Statut :** [ ] Non commencé

### Étape 9 : Home — Catégories, Tendances, Recommandé
- **Fichiers impactés :** `Home.jsx`, `home.css`
- **Instructions :** Navigation visuelle des catégories (déjà une liste de `pills` textuels — l'étoffer en vignettes avec icône/couleur par catégorie, cohérent avec `ALLOWED_CATEGORIES` déjà défini côté backend). **Section Trending** (nouvelle, brief §6) : `GET /api/products?sort=popular&limit=8`, déjà supporté. **Section Recommandé** : sans moteur de recommandation réel côté backend, afficher honnêtement "Nouveautés" (`sort=recent`) plutôt que de prétendre une personnalisation inexistante (brief §25 : ne jamais mentir sur les capacités réelles du système).
- **Critère de validation :** QA responsive ; les deux sections chargent de vraies données, pas de placeholder.
- **Statut :** [ ] Non commencé

### Étape 10 : Home — Flash deals, Boutiques à la une, section éditoriale, Vu récemment
- **Fichiers impactés :** `Home.jsx`, `home.css`, `sanhia-web/src/lib/recentlyViewed.js` (nouveau, localStorage)
- **Instructions :** Flash deals : produits avec `originalPrice` renseigné (champ déjà existant), triés par `% de réduction` décroissant. Boutiques à la une : `GET /api/shops?limit=4` (déjà existant), présentation type storefront (logo, ville, catégorie). Section éditoriale : un bloc narratif court mettant en avant l'artisanat local (Instrument Serif), pas une fausse promesse de contenu dynamique. **Vu récemment** (nouveau, brief §6) : stocker les 8 derniers `productId` visités en `localStorage`, hydrater via `GET /api/products/:id` en parallèle — aucun backend requis.
- **Critère de validation :** QA responsive ; "Vu récemment" persiste après rechargement de page, vide proprement si aucun historique (pas de section vide affichée).
- **Statut :** [ ] Non commencé

### Étape 11 : Catalogue — recherche, filtres desktop (sidebar) + mobile (bottom sheet)
- **Fichiers impactés :** `sanhia-web/src/pages/Catalogue.jsx`, `catalogue.css`
- **Instructions :** Desktop ≥ 1024px : sidebar filtres (catégorie, prix, ville — tous déjà supportés par `GET /api/products`) + grille. Mobile/tablette : bouton "Filtres" ouvrant le `Drawer` en bottom sheet (Étape 5) — jamais de sidebar compressée (brief §7, explicite). Chips de filtres actifs au-dessus de la grille, retirables individuellement. Breadcrumbs (nouveau, brief §6) : `Accueil / Catalogue / [Catégorie active]`.
- **Critère de validation :** QA responsive aux 9 points de rupture ; filtres fonctionnels aux deux formats ; aucun filtre actif perdu au changement de taille d'écran en cours de session.
- **Statut :** [ ] Non commencé

### Étape 12 : Product Card — refonte complète
- **Fichiers impactés :** `Catalogue.jsx` (composant `ProductCard` interne ou extrait), `Home.jsx` (`RelatedCard`), CSS associés
- **Instructions :** Un seul composant `ProductCard` réutilisé partout (actuellement dupliqué entre Catalogue/Home/Boutique avec des variantes légères) : image + badge réduction si `originalPrice` + nom + boutique + prix (+ ancien prix barré) + note moyenne si avis existants + wishlist (icône cœur, état rempli/vide) + quick-add au survol desktop. Hover : légère élévation (`--shadow-elevated`) + zoom image subtil (`--ease-normal`). Densité maîtrisée : jamais plus de 6 informations visibles simultanément (brief §8, hiérarchie évidente en < 1s).
- **Critère de validation :** QA responsive ; testé avec un produit sans réduction, un avec réduction, un sans avis, un en rupture de stock — les 4 cas s'affichent correctement sans élément vide/cassé.
- **Statut :** [ ] Non commencé

### Étape 13 : Fiche produit — galerie et informations principales
- **Fichiers impactés :** `sanhia-web/src/pages/Product.jsx`, `product.css`
- **Instructions :** **Ne pas toucher** à la logique de repli galerie/vidéo/vue-3D (ROADMAP-3D-VIEWER.md, déjà fonctionnelle et testée) — professionnaliser uniquement la présentation autour : thumbnails plus nets, zoom au survol sur l'image principale (desktop), bloc prix/stock/CTA restructuré selon la hiérarchie du brief §9 (nom → note → prix → stock → CTA), CTA principal "Ajouter au panier" visuellement dominant, actions secondaires (wishlist, partage) clairement subordonnées.
- **Critère de validation :** QA responsive ; les 3 chemins d'affichage (galerie/vidéo/vue-3D) toujours fonctionnels après la refonte visuelle — retester manuellement avec un produit de chaque type (voir `CHECKLIST-TESTS-MANUELS.md` section 1).
- **Statut :** [ ] Non commencé

### Étape 14 : Fiche produit — livraison, paiement, avis, boutique, produits liés
- **Fichiers impactés :** `Product.jsx`, `product.css`
- **Instructions :** Bloc livraison : afficher clairement la zone/délai à partir de la ville de la boutique (donnée déjà disponible). Bloc paiement : afficher les moyens réellement intégrés (Orange Money, Moov Money — `PaymentMethod` enum déjà en base, ne pas inventer d'autres méthodes, brief §12 explicite). Avis : distribution par note (calculable à partir des avis déjà chargés, pas de nouvel endpoint), filtres note/plus récents en JS local. Boutique : bloc déjà présent, enrichir avec le nombre d'abonnés (`GET /api/shops/:id` a déjà `_count.followers` à vérifier/exposer si absent — sinon utiliser ce qui existe déjà sans sur-promettre). Produits liés + "Vous pourriez aussi aimer" : déjà partiellement présent, uniformiser sur le nouveau `ProductCard`.
- **Critère de validation :** QA responsive ; aucune méthode de paiement inventée (vérifier contre l'enum Prisma réel) ; distribution des avis correcte sur un produit avec plusieurs notes différentes.
- **Statut :** [ ] Non commencé

### Étape 15 : Panier — clarté et résumé sticky
- **Fichiers impactés :** `sanhia-web/src/pages/Cart.jsx`, `cart.css`
- **Instructions :** Restructurer en deux colonnes desktop (liste produits / résumé sticky avec sous-total, livraison, total, CTA checkout) — une colonne empilée mobile avec le résumé en bas, non sticky (évite de masquer le contenu sur petit écran). Conserver intégralement la logique existante (sélection adresse, adresse manuelle, contrainte mono-boutique). État panier vide : nouveau, message + CTA "Découvrir le catalogue" (brief §18).
- **Critère de validation :** QA responsive ; panier vide affiche l'état dédié (plus de page blanche/minimale) ; résumé sticky ne recouvre jamais le CTA principal sur aucune taille d'écran testée.
- **Statut :** [ ] Non commencé

### Étape 16 : Checkout / Paiement — minimalisme
- **Fichiers impactés :** `sanhia-web/src/pages/Payment.jsx`, `payment.css`
- **Instructions :** Retirer toute distraction (navigation secondaire, liens hors-sujet) pendant le paiement — header simplifié à juste le logo. Présenter clairement l'étape en cours si le flux a plusieurs écrans (adresse déjà choisie au panier → paiement → confirmation ; ne pas dupliquer la sélection d'adresse déjà faite). Moyens de paiement réels uniquement (Orange Money / Moov Money, référence bancaire).
- **Critère de validation :** QA responsive ; parcours complet testé de bout en bout (panier → paiement → confirmation) sans régression sur la création réelle de commande.
- **Statut :** [ ] Non commencé

### Étape 17 : Page de confirmation de commande (nouvelle)
- **Objectif :** Combler l'absence constatée (constat n°6) — aujourd'hui juste un toast + redirection.
- **Fichiers impactés :** `sanhia-web/src/pages/OrderConfirmation.jsx` (nouveau), route dans `App.jsx`, `Payment.jsx` (redirection après succès)
- **Instructions :** Après paiement/commande réussie, rediriger vers `/order-confirmation/:id` plutôt que directement `/profile`. Afficher : numéro de commande, résumé articles, montant total, adresse de livraison (snapshot déjà stocké sur `Order`, ROADMAP-V1.5.md Étape 5), moyen de paiement, statut actuel. CTA principal "Suivre ma commande" (→ Étape 18), secondaire "Continuer mes achats" (→ `/catalogue`).
- **Critère de validation :** QA responsive ; commande réelle créée en conditions de test, page de confirmation affiche les vraies données de cette commande (pas de placeholder).
- **Statut :** [ ] Non commencé

### Étape 18 : Timeline de suivi de commande (nouvelle)
- **Objectif :** Combler l'absence constatée (constat n°6) — le statut existe déjà en base (`OrderStatus` enum) mais n'est jamais présenté visuellement comme un parcours.
- **Fichiers impactés :** `sanhia-web/src/components/ui/OrderTimeline.jsx` (nouveau), intégré dans `OrderConfirmation.jsx` et l'onglet Commandes du Profil
- **Instructions :** Timeline verticale mobile / horizontale desktop : Commande passée → Paiement confirmé → Préparation → Expédition (correspond exactement à `PENDING → CONFIRMED → SHIPPED → DELIVERED`, plus `CANCELLED` en état alternatif si applicable) — mapping direct sur l'enum existant, aucune nouvelle donnée requise. Étape courante mise en évidence, étapes passées cochées, étapes futures neutres.
- **Critère de validation :** QA responsive ; testée sur une commande à chacun des 5 statuts réels (créer/faire progresser une commande de test comme dans les roadmaps précédentes) — le bon état visuel correspond à chaque statut.
- **Statut :** [ ] Non commencé

---

## Phase 2 — Compte, Wishlist, Boutique

### Étape 19 : Espace Compte — restructuration en hub
- **Fichiers impactés :** `sanhia-web/src/pages/Profile.jsx`, `Profile.module.css`
- **Instructions :** Réorganiser les onglets existants (infos, adresses, commandes, avis) selon la structure brief §15 (profil / commandes / wishlist-lien / adresses / notifications-lien / sécurité). Ne pas dupliquer Wishlist/Notifications qui ont déjà leur propre page — les représenter comme des liens/raccourcis depuis le hub compte plutôt que comme du contenu recréé sur place.
- **Critère de validation :** QA responsive ; navigation entre onglets sans perte d'état (formulaire d'adresse en cours non réinitialisé par un changement d'onglet accidentel).
- **Statut :** [ ] Non commencé

### Étape 20 : Wishlist — expérience complète
- **Fichiers impactés :** `sanhia-web/src/pages/Wishlist.jsx`, `wishlist.css`
- **Instructions :** Pour chaque article : prix actuel, indicateur si le prix a baissé depuis l'ajout (comparer au prix stocké côté client au moment de l'ajout — `WishlistContext` à vérifier/étendre côté mobile en miroir), indicateur rupture de stock, retrait, ajout direct au panier. État vide dédié (brief §18, "Votre wishlist est encore vide").
- **Critère de validation :** QA responsive ; état vide affiché sur un compte de test sans wishlist ; ajout/retrait fonctionnel sans perte de synchronisation avec le panier.
- **Statut :** [ ] Non commencé

### Étape 21 : Boutique publique — professionnalisation du storefront
- **Fichiers impactés :** `sanhia-web/src/components/boutique/*.jsx`, `boutique.css`
- **Instructions :** La structure existante (`BoutiqueHero`, `ProductsSection`, `ReviewsSection`, `StorySection`, `ContactCTA`) est déjà la bonne architecture (brief §10) — professionnaliser chaque section avec les nouveaux tokens/composants (Étape 1-5) plutôt que la refaire. Renforcer la hiérarchie du header boutique (logo, couverture, nom, note, nombre d'abonnés, bouton suivre) pour qu'elle se lise comme une vraie vitrine, pas une simple page de liste.
- **Critère de validation :** QA responsive ; testé sur une boutique avec stories actives et une sans, une avec avis et une sans.
- **Statut :** [ ] Non commencé

---

## Phase 3 — Recherche, notifications, pages de contenu

### Étape 22 : Recherche — expérience dédiée
- **Fichiers impactés :** `Header.jsx` (suggestions déjà posées Étape 7), `Catalogue.jsx` (résultats de recherche)
- **Instructions :** Étendre les suggestions de l'Étape 7 : recherches récentes (localStorage, même patron que "Vu récemment"), état "aucun résultat" avec suggestion de catégories proches plutôt qu'une page blanche.
- **Critère de validation :** QA responsive ; recherche sans résultat affiche l'état dédié, jamais une grille vide silencieuse.
- **Statut :** [ ] Non commencé

### Étape 23 : Notifications — catégorisation visuelle
- **Fichiers impactés :** `sanhia-web/src/pages/Notifications.jsx`, `notifications.css`
- **Instructions :** Icône/couleur par catégorie déjà déductible du champ `link` existant (`/profile` → commande, `/delivery` → mission, etc.) — grouper visuellement sans changer le modèle de données.
- **Critère de validation :** QA responsive.
- **Statut :** [ ] Non commencé

### Étape 24 : Pages de contenu — About, Contact, Informations
- **Fichiers impactés :** `About.jsx`/`about.css`, `Contact.jsx`/`contact.css`, `Informations.jsx`/`informations.css`
- **Instructions :** Alignement sur les nouveaux tokens (Étape 1-2) et composants (formulaire Contact sur les nouveaux inputs, FAQ Informations sur un composant accordéon extrait plutôt qu'ad hoc). Contenu inchangé.
- **Critère de validation :** QA responsive ; formulaire de contact toujours fonctionnel (message reçu côté admin).
- **Statut :** [ ] Non commencé

---

## Phase 4 — Dashboards internes (Vendeur, Livreur, Coordinateur, Admin)

> Moins prioritaires que le tunnel d'achat public (usage interne, pas de pression de
> conversion) mais doivent rester cohérents avec la nouvelle charte plutôt que de
> ressembler à une application différente.

### Étape 25 : Dashboard Vendeur — vue d'ensemble et produits
- **Fichiers impactés :** `Seller.jsx` (OverviewTab, ProductsTab), `seller.css`
- **Instructions :** Migrer sur `Card`/`Badge`/`Button` (Étape 3), stats en cartes cohérentes avec le nouveau système d'ombres.
- **Critère de validation :** QA responsive.
- **Statut :** [ ] Non commencé

### Étape 26 : Dashboard Vendeur — Commandes, Story, Feed vidéo, Paramètres
- **Fichiers impactés :** `Seller.jsx` (reste des onglets), `seller.css`
- **Instructions :** Même traitement. **Ne pas toucher** à la logique de tagging vidéo (timeline à poignées, ROADMAP-V1.5.md) ni à la saisie du code de retrait (ROADMAP-V1.7.md) — seulement leur habillage visuel.
- **Critère de validation :** QA responsive ; tagging vidéo et saisie code de retrait toujours fonctionnels après la refonte visuelle.
- **Statut :** [ ] Non commencé

### Étape 27 : Dashboard Livreur
- **Fichiers impactés :** `Delivery.jsx`, `delivery.css`
- **Instructions :** Migration sur les nouveaux composants. Le motif d'échec de livraison (`ROADMAP-DETTES-TECHNIQUES.md`) passe sur `Modal` (Étape 5) plutôt que son overlay ad hoc actuel.
- **Critère de validation :** QA responsive ; signalement d'un problème avec motif toujours fonctionnel.
- **Statut :** [ ] Non commencé

### Étape 28 : Portail Coordinateur
- **Fichiers impactés :** `Coordinator.jsx`, `CoordinatorLogin.jsx`
- **Instructions :** Migration sur les nouveaux composants — cahier V1.7 §6 rappelle explicitement que cette interface n'a pas besoin d'être esthétiquement poussée, priorité à la clarté. Le panneau de détail (actuellement une modale ad hoc) passe sur `Modal` (Étape 5).
- **Critère de validation :** QA responsive ; clôture de commande toujours fonctionnelle.
- **Statut :** [ ] Non commencé

### Étape 29 : Back-office Admin
- **Fichiers impactés :** `Admin.jsx`, `admin.css`
- **Instructions :** Le plus gros fichier du projet (920+ lignes) — migration progressive onglet par onglet sur `Card`/`Badge`/`Button`/`EmptyState` plutôt qu'en un seul passage. Ne pas retoucher la logique métier (aucun changement de comportement, uniquement de présentation).
- **Critère de validation :** QA responsive ; les 3 erreurs ESLint préexistantes non liées (déjà documentées dans les roadmaps précédentes) ne doivent pas augmenter en nombre.
- **Statut :** [ ] Non commencé

---

## Phase 5 — Mobile (miroir des priorités web)

> Chaque étape mobile suit son équivalent web déjà fait, avec les composants déjà
> partagés côté mobile (`Button`, `TextField`, `GlassSheet`, `Heading`, `Text`,
> `EmptyState`, `Skeleton`) — moins de travail de fondation qu'en web puisqu'ils existent
> déjà, l'effort porte sur l'application cohérente aux écrans, pas leur création.

### Étape 30 : Mobile — Accueil, Catalogue, Boutiques (onglets buyer)
- **Fichiers impactés :** `app/(buyer)/index.js`, `catalogue.js`, `boutiques.js`
- **Instructions :** Sections Trending/Vu récemment en miroir des Étapes 9-10 web (AsyncStorage au lieu de localStorage). Filtres catalogue en bottom sheet natif (`GlassSheet` déjà adapté à cet usage).
- **Critère de validation :** `npx expo export --platform web` bundle sans erreur ; contrat de données vérifié comme dans les roadmaps précédentes.
- **Statut :** [ ] Non commencé

### Étape 31 : Mobile — Fiche produit
- **Fichiers impactés :** `app/product/[id].js`
- **Instructions :** Hiérarchie alignée sur l'Étape 13 web. **Ne pas toucher** à `Model3DViewer` (ROADMAP-HARMONISATION-MOBILE.md) ni au repli vidéo/image — habillage seulement.
- **Critère de validation :** Bundle + contrat de données ; les 3 chemins d'affichage (image/vidéo/3D) toujours fonctionnels.
- **Statut :** [ ] Non commencé

### Étape 32 : Mobile — Panier, Paiement
- **Fichiers impactés :** `app/(buyer)/cart.js`, `app/payment/[orderId].js`
- **Instructions :** État panier vide (brief §18) — actuellement `ListEmptyComponent` déjà présent, vérifier qu'il est bien à niveau visuel avec le reste plutôt que de le recréer.
- **Critère de validation :** Bundle ; parcours panier → paiement testé sans régression.
- **Statut :** [ ] Non commencé

### Étape 33 : Mobile — Confirmation + suivi de commande (nouveau)
- **Fichiers impactés :** `app/order-confirmation/[id].js` (nouveau), `app/invoice/[id].js`
- **Instructions :** Miroir des Étapes 17-18 web — `OrderTimeline` en version React Native (composant dédié, réutilisant les tokens motion/shadow de l'Étape 6).
- **Critère de validation :** Bundle + contrat de données, testé aux 5 statuts de commande.
- **Statut :** [ ] Non commencé

### Étape 34 : Mobile — Compte, Wishlist, Adresses
- **Fichiers impactés :** `app/(buyer)/profile.js`, `app/wishlist.js`, `app/addresses.js`
- **Instructions :** Miroir des Étapes 19-20 web. **Ne pas toucher** à la carte interactive (`react-native-maps`, ROADMAP-DETTES-TECHNIQUES.md) — habillage du reste de l'écran seulement.
- **Critère de validation :** Bundle ; carte interactive toujours fonctionnelle.
- **Statut :** [ ] Non commencé

### Étape 35 : Mobile — Messages, Notifications
- **Fichiers impactés :** `app/messages/`, `app/notifications.js`
- **Instructions :** Catégorisation visuelle en miroir de l'Étape 23 web.
- **Critère de validation :** Bundle.
- **Statut :** [ ] Non commencé

### Étape 36 : Mobile — Dashboards Vendeur et Livreur
- **Fichiers impactés :** `app/(seller)/*`, `app/(delivery)/*`
- **Instructions :** Miroir des Étapes 25-27 web. **Ne pas toucher** au tagging vidéo (`PanResponder` timeline) ni à la saisie du code de retrait ni au motif d'échec de livraison — habillage seulement.
- **Critère de validation :** Bundle ; les 3 fonctionnalités sensibles retestées sans régression.
- **Statut :** [ ] Non commencé

### Étape 37 : Mobile — Navigation globale (tabs) et header
- **Fichiers impactés :** `app/(buyer)/_layout.js`, `app/(seller)/_layout.js`, `app/(delivery)/_layout.js`
- **Instructions :** Brief §23 — vérifier que les 5 onglets acheteur (Accueil/Catalogue/Boutiques/Feed/Panier/Profil — 6 en réalité, déjà en place) restent lisibles et que le badge panier (si ajouté) ne surcharge pas la barre. Alignement visuel avec le nouveau header web sans dupliquer inutilement de la logique entre plateformes.
- **Critère de validation :** Bundle ; les 3 groupes de tabs (buyer/seller/delivery) inchangés fonctionnellement.
- **Statut :** [ ] Non commencé

---

## Phase 6 — États transverses, micro-interactions, accessibilité

### Étape 38 : Audit et harmonisation des micro-interactions (web)
- **Fichiers impactés :** transverse — `Button`/`Card`/`ProductCard` (Étapes 3, 12) principalement
- **Instructions :** Passer sur chaque interaction principale (brief §21) : hover carte produit (déjà posé Étape 12), feedback ajout panier (transformation du CTA, pas juste un toast), animation wishlist (cœur qui se remplit avec un léger rebond), ouverture/fermeture Modal/Drawer (déjà posées avec transition Étape 5, vérifier la cohérence des durées `--ease-*`). Aucune animation sans fonction UX (brief §21, §31 — pas de gratuité).
- **Critère de validation :** Chaque interaction testée manuellement, durées cohérentes avec les tokens (120/240/400ms), `prefers-reduced-motion` respecté (basculer le mode dans les DevTools et revérifier).
- **Statut :** [ ] Non commencé

### Étape 39 : Accessibilité — contraste, focus, clavier, cibles tactiles (web)
- **Fichiers impactés :** transverse
- **Instructions :** Vérifier le contraste texte/fond de la palette existante (le navy `#153B5C` sur crème `#F3E9DD` : à valider au ratio WCAG AA, ajuster uniquement si insuffisant, sans changer la teinte de base). États de focus visibles sur tous les éléments interactifs (actuellement `cursor:none` global — vérifier que ça ne supprime pas aussi le focus ring clavier, sinon le restaurer explicitement pour la navigation clavier uniquement via `:focus-visible`). Cibles tactiles ≥ 44×44px sur mobile web.
- **Critère de validation :** Navigation complète au clavier seul (Tab/Entrée/Échap) sur le tunnel d'achat, sans piège de focus ; contrastes vérifiés (outil navigateur).
- **Statut :** [ ] Non commencé

### Étape 40 : Accessibilité mobile
- **Fichiers impactés :** transverse
- **Instructions :** `accessibilityLabel`/`accessibilityRole` sur les éléments interactifs principaux (boutons icône notamment, ex. wishlist/like sans texte visible). Tailles de zone tactile déjà correctes dans les composants partagés existants (`Button`, `hitSlop` déjà utilisé par endroits) — généraliser où manquant.
- **Critère de validation :** Bundle ; VoiceOver/TalkBack non testables dans cet environnement (pas d'appareil) — à vérifier par l'utilisateur, ajouté à `CHECKLIST-TESTS-MANUELS.md`.
- **Statut :** [ ] Non commencé

### Étape 41 : Performance — images et lazy loading
- **Fichiers impactés :** transverse (grilles produits principalement)
- **Instructions :** Vérifier `loading="lazy"` sur les images hors-écran (déjà présent par endroits — ex. `RelatedCard`, généraliser). Le pipeline R2 compresse déjà les images à l'upload (`services/upload.js`, 1600px max, JPEG q80 — vérifié en V1.7) : pas de nouveau travail de compression côté frontend nécessaire, juste s'assurer que rien n'affiche une image en taille native inutilement grande.
- **Critère de validation :** `npm run build` — vérifier la taille des chunks JS (déjà un avertissement existant sur le chunk principal, ROADMAP-3D-VIEWER.md l'a déjà noté à cause de `@google/model-viewer` — ne pas chercher à le résoudre ici, hors périmètre design).
- **Statut :** [ ] Non commencé

---

## Phase 7 — QA finale et audit "bonne → exceptionnelle"

### Étape 42 : QA responsive systématique — Playwright étendu
- **Fichiers impactés :** `sanhia-web/e2e/` (nouveaux specs)
- **Instructions :** Étendre la suite Playwright déjà en place (session précédente) avec des captures d'écran aux tailles clés (375, 768, 1280, 1920px) sur Home/Catalogue/Produit/Panier — détection visuelle de débordement (`page.evaluate` vérifiant `scrollWidth > clientWidth` sur `body`, doit toujours être faux).
- **Critère de validation :** Tests passent aux 4 tailles, zéro dépassement horizontal détecté.
- **Statut :** [ ] Non commencé

### Étape 43 : Revue finale et 10 dernières améliorations
- **Objectif :** Brief §36 — passer de "bonne" à "exceptionnelle".
- **Instructions :** Une fois les Étapes 1-42 terminées, relire l'ensemble avec les 5 questions du brief §30 (3 secondes / 10 secondes / 30 secondes / 1 minute / au checkout / sur mobile) et identifier 10 améliorations concrètes restantes, les implémenter. Cette étape ne peut être détaillée qu'une fois le reste construit — son contenu dépend du résultat réel, pas d'une liste théorique écrite à l'avance.
- **Critère de validation :** Les 10 améliorations sont listées explicitement dans la mise à jour de cette étape avant implémentation, puis chacune vérifiée individuellement.
- **Statut :** [ ] Non commencé

---

## Hors périmètre d'exécution

- **Backend/logique métier/routes/auth/schéma** : explicitement exclu par le brief lui-même (§32) — cette roadmap est strictement présentation.
- **Nouveaux moyens de paiement** : le brief interdit explicitement d'inventer des méthodes non réellement intégrées (§12) — seuls Orange Money/Moov Money (déjà en base) sont représentés.
- **Vrai moteur de recommandation personnalisée** : le brief interdit explicitement de prétendre une capacité IA inexistante (§25) — "Recommandé" affiche des nouveautés réelles, pas une fausse personnalisation.
- **Refonte du tagging vidéo, de la saisie de code de retrait, de la carte interactive, du viewer 3D** : fonctionnalités déjà construites et testées dans les roadmaps précédentes cette session — seul leur habillage visuel est retouché, jamais leur logique.
- **Test visuel réel sur mobile (émulateur/appareil)** : cette session n'a jamais eu accès à un émulateur ou appareil physique — chaque étape mobile se limite à une vérification de bundling + contrat de données, le rendu visuel réel reste à confirmer par l'utilisateur (déjà la limite systématique documentée dans `CHECKLIST-TESTS-MANUELS.md`).
