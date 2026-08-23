# Sanhia — Roadmap de développement

> Généré à partir de l'audit technique complet (backend / web / mobile vs cahier des charges V1.1).
> Chaque étape est atomique (15-30 min), séquentielle, et se termine par un critère de validation vérifiable.
> Cocher `[x]` la case Statut une fois l'étape terminée ET son critère de validation vérifié — pas avant.

**Convention de chemins** : `server-sanhia/` = backend, `sanhia-web/` = web, `sanhia-mobile/` = mobile (React Native/Expo Router).

---

## Phase A — Sécurité critique & bugs bloquants

> Correctifs indépendants les uns des autres, à traiter en premier car ils touchent des flux déjà en production (tunnel de conversion vendeur, upload produit).

### Étape 1 : Sécuriser le mot de passe admin exposé en clair dans git
- **Objectif :** Éliminer le secret en clair committé dans le dépôt et empêcher sa réapparition.
- **Fichiers impactés :** `server-sanhia/scripts/create-users.js`, `server-sanhia/.env`, `server-sanhia/.gitignore`
- **Instructions d'exécution :** Déplacer l'email/mot de passe admin (et tout compte de test) de `create-users.js` vers des variables d'environnement (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.) lues via `process.env`. Le script doit échouer explicitement si ces variables sont absentes plutôt que d'utiliser une valeur par défaut. Ajouter ces clés à `.env` (jamais committé) et à un `.env.example` mis à jour avec des placeholders. Noter dans un commentaire du script qu'une rotation du mot de passe Firebase réel est nécessaire côté humain (hors périmètre de cette étape — action manuelle sur le compte Firebase).
- **Critères de validation :** `grep -r "password.*:.*['\"]" scripts/create-users.js` ne renvoie plus aucune valeur en clair ; le script lève une erreur claire si `ADMIN_PASSWORD` n'est pas défini ; `.env.example` contient les nouvelles clés sans valeur réelle.
- **Statut :** [x] Terminé (2026-08-22)

### Étape 2 : Corriger le lien mort du tunnel de conversion vendeur (web)
- **Objectif :** Réparer les CTA de la page marketing vendeur qui pointent vers une route inexistante.
- **Fichiers impactés :** `sanhia-web/src/pages/SellerOnboarding.jsx`
- **Instructions d'exécution :** Remplacer les deux occurrences de `<Link to="/seller-application">` par `<Link to="/seller/application">`, conformément à la route déclarée dans `sanhia-web/src/App.jsx`.
- **Critères de validation :** `grep -n "seller-application" sanhia-web/src/pages/SellerOnboarding.jsx` ne renvoie plus aucun résultat ; cliquer sur "Déposer ma candidature" depuis `/seller/onboarding` ouvre bien le formulaire de candidature (pas de 404).
- **Statut :** [x] Terminé (2026-08-23)

### Étape 3 : Corriger le Content-Type multipart sur l'ajout de produit (web)
- **Objectif :** Réparer l'upload d'images produit, cassé par un `Content-Type` fixé manuellement sans boundary.
- **Fichiers impactés :** `sanhia-web/src/pages/Seller.jsx` (composant `AddProductTab`)
- **Instructions d'exécution :** Retirer la ligne `'Content-Type': 'multipart/form-data'` de l'objet `headers` passé à l'appel `axios.post` d'ajout de produit — ne garder que `Authorization`. Le navigateur générera lui-même le `Content-Type` avec le bon `boundary` à partir du `FormData`. Ajouter un commentaire expliquant pourquoi (même bug déjà corrigé dans `SellerApplication.jsx`).
- **Critères de validation :** Publier un produit avec au moins une image depuis `/seller` aboutit à un produit visible dans "Mes Produits" avec son image, sans erreur 400/500 en console réseau.
- **Statut :** [x] Terminé (2026-08-23)

### Étape 4 : Corriger le Content-Type multipart sur l'upload d'avatar (web)
- **Objectif :** Réparer l'upload de photo de profil, potentiellement cassé par le même bug.
- **Fichiers impactés :** `sanhia-web/src/pages/Profile.jsx`
- **Instructions d'exécution :** Même correctif qu'à l'Étape 3 : retirer le `Content-Type` manuel de l'appel d'upload d'avatar, ne garder que `Authorization`.
- **Critères de validation :** Changer sa photo de profil depuis `/profile` aboutit à un avatar mis à jour et persistant après rechargement de la page.
- **Statut :** [x] Terminé (2026-08-23)

### Étape 5 : Réparer la sanitisation XSS contournée sur les routes multipart (backend)
- **Objectif :** Garantir que les champs texte soumis en `multipart/form-data` passent par la sanitisation anti-XSS, comme le JSON.
- **Fichiers impactés :** `server-sanhia/routes/products.js`, `server-sanhia/routes/users.routes.js`, `server-sanhia/routes/seller-apply.routes.js`, `server-sanhia/middleware/sanitize.js`
- **Instructions d'exécution :** Exporter depuis `middleware/sanitize.js` une fonction `sanitizeObject(obj)` réutilisable (extraire la logique actuellement inline dans le middleware global). Dans chaque route utilisant `multer` (création produit, upload avatar, candidature vendeur), appeler `req.body = sanitizeObject(req.body)` juste après le middleware `upload`/`multer`, avant toute lecture des champs.
- **Critères de validation :** Soumettre un produit avec `name: "<script>alert(1)</script>Test"` via le formulaire d'ajout produit ; le nom stocké en base ne contient plus la balise `<script>` brute.
- **Statut :** [x] Terminé (2026-08-23)

### Étape 6 : Ajouter un garde-fou contre la bascule silencieuse en mode mock (web)
- **Objectif :** Empêcher que l'app parte en mode simulation (OTP factice, données mock) sans avertissement si la config Firebase est absente en production.
- **Fichiers impactés :** `sanhia-web/src/context/AuthContext.jsx`, `sanhia-web/src/main.jsx`
- **Instructions d'exécution :** Dans `AuthContext.jsx`, si `isMockMode` est vrai ET `import.meta.env.PROD` est vrai, logger une erreur explicite en console (`console.error('⚠️ Mode mock actif en production — vérifier VITE_FIREBASE_API_KEY')`) au chargement du module. Ne pas bloquer l'app (éviter un écran blanc en cas de vraie mauvaise config), mais rendre l'anomalie impossible à manquer en observabilité.
- **Critères de validation :** Builder l'app avec `VITE_FIREBASE_API_KEY` volontairement absent et `NODE_ENV=production` fait apparaître le message d'erreur en console au premier chargement.
- **Statut :** [x] Terminé (2026-08-23)

---

## Phase B — Nettoyage et dette qui bloque la suite

> Code mort et incohérences à retirer avant d'ajouter de nouvelles routes dans les mêmes fichiers, pour ne pas complexifier davantage un état déjà confus.

### Étape 7 : Supprimer le middleware d'authentification mort et unifier la vérification admin (backend)
- **Objectif :** Éliminer la duplication de logique d'auth (3 implémentations concurrentes) avant d'ajouter de nouvelles routes admin.
- **Fichiers impactés :** `server-sanhia/middleware/auth.js` (supprimé), `server-sanhia/routes/admin.routes.js`
- **Instructions d'exécution :** Supprimer le fichier `middleware/auth.js` (confirmé non importé nulle part). Dans `admin.routes.js`, remplacer la vérification `isAdmin` inline par la composition du middleware `verifyToken` existant (`middleware/verifyToken.js`) suivi d'une vérification `req.user.role === 'ADMIN'` factorisée dans une petite fonction `requireAdmin` locale au fichier (ou dans `middleware/verifyToken.js` sous forme d'export additionnel).
- **Critères de validation :** `grep -r "middleware/auth" server-sanhia/routes` ne renvoie aucun résultat ; toutes les routes de `admin.routes.js` restent inaccessibles (403) à un compte non-admin après le changement.
- **Statut :** [x] Terminé (2026-08-23)

### Étape 8 : Supprimer le dossier `controllers/` vide (backend)
- **Objectif :** Retirer un vestige d'architecture antérieure qui n'a plus d'usage.
- **Fichiers impactés :** `server-sanhia/controllers/` (supprimé)
- **Instructions d'exécution :** Vérifier qu'aucun fichier de `routes/` n'importe quoi que ce soit depuis `controllers/` (`grep -r "require.*controllers" server-sanhia/routes`), puis supprimer le dossier.
- **Critères de validation :** Le dossier `server-sanhia/controllers/` n'existe plus ; `npm start` (ou `npm run dev`) démarre sans erreur de module manquant.
- **Statut :** [x] Terminé (2026-08-23) — dossier déjà absent (probablement perdu lors du re-clone, git ne trace pas les dossiers vides), rien à faire

### Étape 9 : Supprimer le composant `Placeholder.js` orphelin (mobile)
- **Objectif :** Retirer un composant devenu mort après le remplacement de tous les écrans placeholder par de vrais écrans.
- **Fichiers impactés :** `sanhia-mobile/src/components/Placeholder.js` (supprimé), `sanhia-mobile/README.md`
- **Instructions d'exécution :** Confirmer qu'aucun écran sous `app/` n'importe `Placeholder` (`grep -rn "Placeholder" sanhia-mobile/app`), supprimer le fichier, et retirer sa mention de `README.md`.
- **Critères de validation :** `npx expo export --platform web` (depuis `sanhia-mobile/`) réussit sans erreur d'import manquant.
- **Statut :** [x] Terminé (2026-08-23)

### Étape 10 : Configurer `trust proxy` explicitement (backend)
- **Objectif :** Garantir que le rate limiting par IP fonctionne correctement derrière le reverse proxy de Render.
- **Fichiers impactés :** `server-sanhia/index.js`
- **Instructions d'exécution :** Ajouter `app.set('trust proxy', 1)` juste après l'initialisation d'`app`, avant le montage des middlewares `cors`/`rateLimit`.
- **Critères de validation :** Une requête avec un en-tête `X-Forwarded-For` simulé (test local via `curl -H "X-Forwarded-For: 1.2.3.4"`) est bien comptabilisée sous cette IP côté rate limiter, pas sous l'IP du proxy.
- **Statut :** [x] Terminé (2026-08-23)

### Étape 11 : Exempter/assouplir le rate limiting sur le polling de la messagerie (backend)
- **Objectif :** Éviter qu'une conversation ouverte (polling 3-5s recommandé par le code lui-même) épuise le quota global de l'utilisateur sur toute l'API.
- **Fichiers impactés :** `server-sanhia/index.js`, `server-sanhia/routes/messages.routes.js`, `server-sanhia/middleware/` (nouveau limiter dédié optionnel)
- **Instructions d'exécution :** Créer un limiter dédié plus permissif (ex. 120 requêtes/min) pour `GET /api/messages/conversations/:id/messages` et `GET /api/messages/conversations`, appliqué uniquement à ces deux routes. Le rate limiter global de `index.js` reste inchangé pour le reste de l'API.
- **Critères de validation :** 20 requêtes successives vers `GET /api/messages/conversations/:id/messages` en moins de 60 secondes ne renvoient aucun 429 ; une même rafale vers une autre route (ex. `GET /api/products`) reste soumise à la limite globale existante.
- **Statut :** [ ] Non commencé

---

## Phase C — Modération boutique

> Bug ciblé qui bloque la moitié d'un flux MVP prioritaire. Pas de dépendance de schéma (le champ `status` existe déjà).

### Étape 12 : Ajouter la route d'approbation/rejet de boutique (backend)
- **Objectif :** Permettre à un admin de faire passer une boutique de `pending` à `active` (ou à `suspended`), flux actuellement inexistant hors du parcours de candidature.
- **Fichiers impactés :** `server-sanhia/routes/admin.routes.js`
- **Instructions d'exécution :** Ajouter `PATCH /api/admin/shops/:id/approve` (passe `status` à `"active"`) et `PATCH /api/admin/shops/:id/suspend` (passe `status` à `"suspended"`), protégées par `verifyToken` + vérification admin. Suivre le pattern déjà utilisé pour l'approbation des candidatures (`admin.routes.js`, section candidatures) : vérifier que la boutique existe, répondre 404 sinon, répondre la boutique mise à jour en cas de succès.
- **Critères de validation :** `PATCH /api/admin/shops/:id/approve` sur une boutique `pending` renvoie 200 avec `status: "active"` dans le corps ; un compte non-admin reçoit 403 sur cette même route.
- **Statut :** [ ] Non commencé

### Étape 13 : Brancher l'approbation boutique dans le back-office admin (web)
- **Objectif :** Rendre la nouvelle route utilisable depuis l'interface admin.
- **Fichiers impactés :** `sanhia-web/src/pages/Admin.jsx`
- **Instructions d'exécution :** Dans l'onglet "Boutiques", ajouter un bouton "Approuver" (visible si `status === 'pending'`) et "Suspendre" (visible si `status === 'active'`) sur chaque ligne, appelant respectivement `PATCH /api/admin/shops/:id/approve` et `.../suspend`, suivant le pattern déjà utilisé pour `validatePayment`/`rejectPayment`.
- **Critères de validation :** Depuis `/admin` → onglet Boutiques, cliquer "Approuver" sur une boutique `pending` la fait passer visuellement à `active` sans recharger la page.
- **Statut :** [ ] Non commencé

---

## Phase D — Wishlist / Like — réconciliation web

> Trois mécanismes déconnectés à unifier. La page `/wishlist` web est actuellement vide pour tous les utilisateurs, tout le temps.

### Étape 14 : Créer un `WishlistContext.jsx` partagé côté web
- **Objectif :** Donner au web un mécanisme de favoris persistant unique, sur le modèle du contexte déjà existant côté mobile (`sanhia-mobile/src/context/WishlistContext.js`).
- **Fichiers impactés :** `sanhia-web/src/context/WishlistContext.jsx` (nouveau), `sanhia-web/src/App.jsx`
- **Instructions d'exécution :** Créer le contexte avec les mêmes opérations que la version mobile (`toggle`, `isWishlisted`, `items`), persistance `localStorage` sous la clé `sanhia_wishlist` (clé déjà utilisée par `Wishlist.jsx`, à réutiliser pour compatibilité). Monter `<WishlistProvider>` dans `App.jsx` aux côtés de `<CartProvider>`.
- **Critères de validation :** Un composant de test appelant `useWishlist().toggle({id:'x', name:'Test', price:1000})` puis `useWishlist().items` renvoie bien un tableau contenant l'article, et `localStorage.getItem('sanhia_wishlist')` reflète le même contenu.
- **Statut :** [ ] Non commencé

### Étape 15 : Brancher le bouton cœur de `Home.jsx` sur la vraie wishlist
- **Objectif :** Remplacer l'état local factice (`setWished`) par un appel réel au contexte partagé.
- **Fichiers impactés :** `sanhia-web/src/pages/Home.jsx`
- **Instructions d'exécution :** Importer `useWishlist` depuis le nouveau contexte. Remplacer `const [wished, setWished] = useState(false)` par `const { isWishlisted, toggle } = useWishlist()`, `wished = isWishlisted(product.id)`, et l'`onClick` du bouton par `toggle(product)`.
- **Critères de validation :** Cliquer le cœur d'une carte produit sur `/` puis naviguer vers `/wishlist` fait apparaître ce produit dans la liste.
- **Statut :** [ ] Non commencé

### Étape 16 : Brancher le bouton cœur de `Catalogue.jsx` sur la vraie wishlist
- **Objectif :** Même correctif que l'Étape 15, sur la deuxième surface de découverte.
- **Fichiers impactés :** `sanhia-web/src/pages/Catalogue.jsx`
- **Instructions d'exécution :** Identique à l'Étape 15, appliqué au bouton `prd-wish` de `Catalogue.jsx`.
- **Critères de validation :** Cliquer le cœur d'une carte produit sur `/catalogue` fait apparaître ce produit dans `/wishlist`.
- **Statut :** [ ] Non commencé

### Étape 17 : Faire lire `Wishlist.jsx` depuis le contexte partagé
- **Objectif :** Remplacer la lecture/écriture directe de `localStorage` dans `Wishlist.jsx` par le contexte, pour une seule source de vérité.
- **Fichiers impactés :** `sanhia-web/src/pages/Wishlist.jsx`
- **Instructions d'exécution :** Remplacer le `useState(() => JSON.parse(localStorage.getItem('sanhia_wishlist')) || [])` et son `useEffect` de synchronisation par `const { items, toggle } = useWishlist()`. Adapter `onRemove` pour appeler `toggle(item)` (retire l'article s'il est déjà présent).
- **Critères de validation :** Ajouter un produit à la wishlist depuis `/catalogue`, le retirer depuis `/wishlist`, revenir sur `/catalogue` : le cœur du produit n'est plus actif.
- **Statut :** [ ] Non commencé

### Étape 18 : Porter le Like sur la fiche produit mobile
- **Objectif :** Combler l'écart mobile vs web sur le Like (distinct de la wishlist, déjà fonctionnel côté mobile).
- **Fichiers impactés :** `sanhia-mobile/app/product/[id].js`
- **Instructions d'exécution :** Ajouter un bouton (icône `heart`/cœur avec compteur, distinct visuellement du bouton wishlist déjà présent) appelant `POST /api/products/:id/like` avec le token d'auth, sur le modèle du bouton `ax-bwish` de `sanhia-web/src/pages/Product.jsx`. Afficher `likesCount` retourné par `GET /api/products/:id`.
- **Critères de validation :** Taper sur le bouton Like d'une fiche produit sur mobile incrémente le compteur affiché et l'appel réseau `POST /products/:id/like` renvoie 200 (vérifiable dans le réseau du dev-client).
- **Statut :** [ ] Non commencé

---

## Phase E — Avis produit (schéma → backend → web → mobile)

> La collecte d'avis fonctionne déjà (web) ; cette phase répare la restitution et étend le modèle pour noter un produit précis, pas seulement une boutique.

### Étape 19 : Ajouter `productId` optionnel au modèle `Review` (migration Prisma)
- **Objectif :** Permettre de rattacher un avis à un produit précis, en plus de la boutique.
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`, nouvelle migration sous `server-sanhia/prisma/migrations/`
- **Instructions d'exécution :** Ajouter au modèle `Review` : `productId String?` et la relation `product Product? @relation(fields: [productId], references: [id])`. Ajouter la relation inverse `reviews Review[]` sur `Product`. Lancer `npx prisma migrate dev --name add_review_product_id`.
- **Critères de validation :** `npx prisma migrate status` ne montre aucune migration en attente ; `npx prisma studio` (ou une requête directe) confirme la colonne `productId` nullable sur la table `Review`.
- **Statut :** [ ] Non commencé

### Étape 20 : Adapter `POST /api/orders/:id/review` pour accepter un `productId` optionnel
- **Objectif :** Permettre au client de noter un produit précis de sa commande, pas uniquement la boutique globale.
- **Fichiers impactés :** `server-sanhia/routes/orders.js`
- **Instructions d'exécution :** Étendre `reviewSchema` (Zod) avec `productId: z.string().cuid().optional()`. Si fourni, vérifier qu'il correspond bien à un produit de la commande concernée (sinon 400). Inclure `productId` dans le `data` du `prisma.review.create`.
- **Critères de validation :** `POST /api/orders/:id/review` avec un `productId` valide de la commande crée un avis avec ce `productId` renseigné en base ; avec un `productId` n'appartenant pas à la commande, renvoie 400.
- **Statut :** [ ] Non commencé

### Étape 21 : Inclure les avis dans la réponse `GET /api/shops/:slug`
- **Objectif :** Exposer les avis existants pour que le frontend puisse enfin les afficher.
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js`
- **Instructions d'exécution :** Ajouter à la requête Prisma de `GET /:slug` un `include: { reviews: { include: { user: { select: { displayName: true } } }, orderBy: { createdAt: 'desc' }, take: 20 } }` (ou équivalent selon la structure de select existante).
- **Critères de validation :** `GET /api/shops/:slug` sur une boutique ayant au moins un avis renvoie un tableau `reviews` non vide dans la réponse JSON.
- **Statut :** [ ] Non commencé

### Étape 22 : Inclure les avis liés dans `GET /api/products/:id`
- **Objectif :** Exposer les avis rattachés spécifiquement à un produit.
- **Fichiers impactés :** `server-sanhia/routes/products.js`
- **Instructions d'exécution :** Ajouter à la requête de `GET /:id` un `include: { likes: ..., reviews: { where: { productId: <id implicite via la relation> }, include: { user: { select: { displayName: true } } } } }` — utiliser la relation inverse ajoutée à l'Étape 19.
- **Critères de validation :** `GET /api/products/:id` sur un produit ayant reçu un avis avec `productId` renseigné renvoie ce même avis dans la réponse.
- **Statut :** [ ] Non commencé

### Étape 23 : Brancher `ReviewsSection.jsx` sur les vrais avis (Boutique.jsx web)
- **Objectif :** Afficher enfin les avis collectés au lieu du tableau vide codé en dur.
- **Fichiers impactés :** `sanhia-web/src/pages/Boutique.jsx`, `sanhia-web/src/components/boutique/ReviewsSection.jsx`
- **Instructions d'exécution :** Remplacer `reviews={[]}` par `reviews={shop.reviews || []}` (le champ ajouté à l'Étape 21), en s'assurant que `shop` provient bien de l'appel à `GET /api/shops/:slug`.
- **Critères de validation :** La page `/boutique/:id` d'une boutique ayant reçu au moins un avis affiche ce commentaire et sa note dans la section Avis, plus le tableau vide par défaut.
- **Statut :** [ ] Non commencé

### Étape 24 : Afficher les avis sur la fiche produit web
- **Objectif :** Remplacer l'onglet Avis factice (state local, jamais persisté) par les vrais avis du produit.
- **Fichiers impactés :** `sanhia-web/src/pages/Product.jsx`
- **Instructions d'exécution :** Supprimer le `handleReview` qui fait `setReviews(prev => [newReview, ...prev])` sans appel réseau. Initialiser `reviews` depuis `product.reviews` (champ ajouté à l'Étape 22) au lieu de `useState([])`. Retirer le formulaire de soumission d'avis de cette page si aucune route de soumission dédiée au produit n'existe (la soumission reste sur le flux post-livraison de `Profile.jsx`) — ou rediriger l'utilisateur vers ce flux.
- **Critères de validation :** La fiche produit d'un article ayant reçu un avis (via l'Étape 20 avec `productId`) affiche cet avis sans qu'aucune saisie manuelle ne soit nécessaire sur cette page.
- **Statut :** [ ] Non commencé

### Étape 25 : Ajouter un flux de notation post-livraison sur mobile
- **Objectif :** Combler l'absence totale de notation côté mobile.
- **Fichiers impactés :** `sanhia-mobile/app/(buyer)/profile.js`, nouveau composant `sanhia-mobile/src/components/ReviewModal.js`
- **Instructions d'exécution :** Créer un composant modal simple (5 étoiles tap-to-select + champ commentaire optionnel) sur le modèle du `ReviewModal` web (`sanhia-web/src/pages/Profile.jsx`). Dans la liste des commandes de `profile.js`, afficher un bouton "Noter" sur les commandes au statut `DELIVERED` sans avis existant, ouvrant la modal et appelant `POST /api/orders/:id/review`.
- **Critères de validation :** Depuis Profil → Commandes (mobile), noter une commande livrée fait disparaître le bouton "Noter" et l'avis est visible via `GET /api/shops/:slug` (vérifiable côté web ou par appel direct).
- **Statut :** [ ] Non commencé

---

## Phase F — Recherche boutiques

### Étape 26 : Ajouter la recherche texte à `GET /api/shops` (backend)
- **Objectif :** Permettre de rechercher une boutique par mot-clé, actuellement impossible (seul le filtre catégorie existe).
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js`
- **Instructions d'exécution :** Ajouter un paramètre `q` à `GET /`, filtrant sur `name` (et `description` si pertinent) via `contains` insensible à la casse (`mode: 'insensitive'`), suivant le pattern déjà utilisé dans `products.js` pour son propre paramètre `q`.
- **Critères de validation :** `GET /api/shops?q=<terme présent dans le nom d'une boutique existante>` renvoie uniquement les boutiques correspondantes ; `GET /api/shops` sans `q` renvoie le comportement inchangé.
- **Statut :** [ ] Non commencé

### Étape 27 : Brancher la recherche boutiques côté web
- **Objectif :** Exposer le nouveau paramètre dans l'UI de la liste des boutiques.
- **Fichiers impactés :** `sanhia-web/src/pages/BoutiqueList.jsx`
- **Instructions d'exécution :** Ajouter un champ de recherche texte au-dessus de la grille de boutiques, passant sa valeur en paramètre `q` à l'appel `GET /api/shops`, avec un léger debounce (300ms) pour éviter une requête par frappe.
- **Critères de validation :** Taper un mot-clé dans le champ de recherche sur `/boutiques` filtre visuellement la liste sans rechargement de page.
- **Statut :** [ ] Non commencé

### Étape 28 : Brancher la recherche boutiques côté mobile
- **Objectif :** Parité avec le web sur l'écran Boutiques.
- **Fichiers impactés :** `sanhia-mobile/app/(buyer)/boutiques.js`
- **Instructions d'exécution :** Ajouter un `TextInput` de recherche au-dessus de la grille, sur le modèle de celui déjà présent dans `catalogue.js`, passant sa valeur en paramètre `q` à la query `GET /api/shops`.
- **Critères de validation :** Taper un mot-clé dans le nouveau champ sur l'écran Boutiques (mobile) filtre visuellement la grille.
- **Statut :** [ ] Non commencé

---

## Phase G — Vues par produit (schéma → backend → web → mobile)

### Étape 29 : Ajouter le champ `views` au modèle `Product` (migration Prisma)
- **Objectif :** Poser la fondation de données pour le comptage de vues par produit, actuellement inexistant.
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`, nouvelle migration
- **Instructions d'exécution :** Ajouter `views Int @default(0)` au modèle `Product`, sur le modèle du champ déjà existant sur `Shop`. Lancer `npx prisma migrate dev --name add_product_views`.
- **Critères de validation :** `npx prisma migrate status` ne montre aucune migration en attente ; le champ `views` apparaît avec la valeur `0` par défaut sur un produit existant.
- **Statut :** [ ] Non commencé

### Étape 30 : Incrémenter `Product.views` sur `GET /api/products/:id`
- **Objectif :** Faire vivre le compteur ajouté à l'Étape 29.
- **Fichiers impactés :** `server-sanhia/routes/products.js`
- **Instructions d'exécution :** Dans le handler `GET /:id`, après avoir récupéré le produit, ajouter un `prisma.product.update({ where: { id }, data: { views: { increment: 1 } } })` en fire-and-forget (ne pas bloquer la réponse dessus), sur le modèle de l'incrément déjà en place pour `Shop.views` dans `shops.routes.js`.
- **Critères de validation :** Deux appels successifs à `GET /api/products/:id` sur le même produit font passer `views` de `N` à `N+2` (vérifiable via une troisième lecture ou Prisma Studio).
- **Statut :** [ ] Non commencé

### Étape 31 : Afficher le compteur de vues sur la fiche produit web
- **Objectif :** Rendre visible la donnée désormais collectée.
- **Fichiers impactés :** `sanhia-web/src/pages/Product.jsx`
- **Instructions d'exécution :** Afficher `product.views` (icône œil + nombre) près du prix ou des métadonnées produit.
- **Critères de validation :** La fiche produit affiche un nombre de vues cohérent avec le compteur backend, incrémenté à chaque visite.
- **Statut :** [ ] Non commencé

### Étape 32 : Afficher les vues cumulées par produit dans le dashboard vendeur web
- **Objectif :** Donner au vendeur une vue produit par produit, en complément du total boutique déjà affiché.
- **Fichiers impactés :** `sanhia-web/src/pages/Seller.jsx` (onglet Produits ou Vue d'ensemble)
- **Instructions d'exécution :** Dans la liste "Mes Produits", ajouter une colonne/valeur "Vues" par ligne, sourcée depuis `product.views` (déjà inclus dans `GET /products/mine` si la route renvoie les champs scalaires du produit sans `select` restrictif — vérifier et ajuster si besoin).
- **Critères de validation :** Chaque ligne de la liste "Mes Produits" affiche un nombre de vues correspondant aux consultations réelles de la fiche produit.
- **Statut :** [ ] Non commencé

### Étape 33 : Afficher les vues cumulées par produit dans le dashboard vendeur mobile
- **Objectif :** Parité avec le web.
- **Fichiers impactés :** `sanhia-mobile/app/(seller)/products.js`
- **Instructions d'exécution :** Ajouter l'affichage de `product.views` sur chaque ligne de `ProductRow`, à côté du stock déjà affiché.
- **Critères de validation :** L'écran Produits (vendeur, mobile) affiche un nombre de vues par produit cohérent avec les consultations réelles.
- **Statut :** [ ] Non commencé

---

## Phase H — Upload photo produit (mobile)

### Étape 34 : Installer et configurer `expo-image-picker` pour l'ajout de produit
- **Objectif :** Rendre disponible la brique de sélection photo sur l'écran d'ajout de produit (elle est déjà installée et utilisée pour la candidature vendeur, mais pas branchée ici).
- **Fichiers impactés :** `sanhia-mobile/app/seller/add-product.js`
- **Instructions d'exécution :** Importer `* as ImagePicker from 'expo-image-picker'` (déjà une dépendance du projet, pas de nouvelle installation nécessaire — vérifier via `sanhia-mobile/package.json`). Ajouter un state `images` (tableau d'assets sélectionnés) et une fonction `pickImages` appelant `ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 })`, sur le modèle de `pickFile` dans `app/seller-application.js`.
- **Critères de validation :** Taper sur un nouveau bouton "Ajouter des photos" ouvre la galerie du téléphone et permet de sélectionner plusieurs images, stockées dans le state local.
- **Statut :** [ ] Non commencé

### Étape 35 : Ajouter la prévisualisation des photos sélectionnées à l'écran
- **Objectif :** Donner un retour visuel avant soumission.
- **Fichiers impactés :** `sanhia-mobile/app/seller/add-product.js`
- **Instructions d'exécution :** Afficher une rangée de vignettes (`Image` RN, ~70x70) pour chaque photo sélectionnée, avec un bouton de suppression individuel par vignette.
- **Critères de validation :** Sélectionner 3 photos affiche 3 vignettes distinctes ; retirer l'une d'elles la fait disparaître sans affecter les deux autres.
- **Statut :** [ ] Non commencé

### Étape 36 : Envoyer les photos sélectionnées à `POST /api/products`
- **Objectif :** Compléter la soumission du formulaire pour inclure les fichiers, le backend acceptant déjà des images (route déjà utilisée par le web).
- **Fichiers impactés :** `sanhia-mobile/app/seller/add-product.js`
- **Instructions d'exécution :** Dans `handleSubmit`, ajouter chaque image du state à l'objet `FormData` existant via `body.append('images', { uri: asset.uri, name: asset.fileName || 'photo.jpg', type: asset.mimeType || 'image/jpeg' })`, sur le modèle exact du multipart déjà utilisé dans `app/seller-application.js`. Ne pas fixer de `Content-Type` manuel (même piège que Phase A).
- **Critères de validation :** Publier un produit avec au moins une photo depuis le mobile fait apparaître ce produit, avec son image, dans "Mes produits" (mobile) et sur la fiche produit consultée depuis le web.
- **Statut :** [ ] Non commencé

---

## Phase I — Statuts de livraison intermédiaires

### Étape 37 : Exposer la transition `PICKED_UP` côté backend
- **Objectif :** Permettre au livreur de signaler la collecte du colis, distincte de l'acceptation de la mission.
- **Fichiers impactés :** `server-sanhia/routes/delivery.routes.js`
- **Instructions d'exécution :** Ajouter `PATCH /api/delivery/:id/pickup`, passant `Livraison.statut` de `ACCEPTED` à `PICKED_UP` (rejeter avec 400 si le statut actuel n'est pas `ACCEPTED`), protégée par `verifyDelivery` et vérification que la mission appartient bien au livreur connecté.
- **Critères de validation :** `PATCH /api/delivery/:id/pickup` sur une mission `ACCEPTED` renvoie 200 avec le nouveau statut ; la même requête sur une mission déjà `PICKED_UP` renvoie 400.
- **Statut :** [ ] Non commencé

### Étape 38 : Exposer les transitions `IN_TRANSIT` et `FAILED` côté backend
- **Objectif :** Compléter le cycle de vie d'une livraison avec le statut "en route" et un chemin d'échec explicite.
- **Fichiers impactés :** `server-sanhia/routes/delivery.routes.js`
- **Instructions d'exécution :** Ajouter `PATCH /api/delivery/:id/in-transit` (`PICKED_UP` → `IN_TRANSIT`) et `PATCH /api/delivery/:id/fail` (accepte un `reason` optionnel dans le body, passe le statut à `FAILED` depuis n'importe quel statut actif), même pattern de garde que l'Étape 37.
- **Critères de validation :** Les deux nouvelles routes respectent les transitions autorisées (400 si transition invalide) et renvoient 200 avec le nouveau statut sinon.
- **Statut :** [ ] Non commencé

### Étape 39 : Adapter l'écran "En cours" web pour les nouveaux statuts
- **Objectif :** Rendre les nouvelles transitions actionnables depuis l'interface livreur.
- **Fichiers impactés :** `sanhia-web/src/pages/Delivery.jsx`
- **Instructions d'exécution :** Remplacer le bouton unique "Confirmer la livraison" par une séquence de boutons contextuels selon le statut courant de la mission : "Colis récupéré" (si `ACCEPTED`) → "Confirmer la livraison" (si `IN_TRANSIT`), plus un lien "Signaler un problème" ouvrant une petite modale de motif, appelant les routes de l'Étape 37/38.
- **Critères de validation :** Une mission acceptée affiche "Colis récupéré" ; après ce clic, elle affiche "Confirmer la livraison" ; le statut affiché correspond à chaque étape à celui renvoyé par le backend.
- **Statut :** [ ] Non commencé

### Étape 40 : Adapter l'écran "En cours" mobile pour les nouveaux statuts
- **Objectif :** Parité avec le web.
- **Fichiers impactés :** `sanhia-mobile/app/(delivery)/active.js`
- **Instructions d'exécution :** Même logique qu'à l'Étape 39, adaptée aux composants `Button`/`Alert` déjà utilisés sur cet écran.
- **Critères de validation :** L'écran "En cours" (mobile) permet de suivre la même séquence de statuts que le web, avec le bon libellé de bouton à chaque étape.
- **Statut :** [ ] Non commencé

---

## Phase J — Centre de notifications (historique)

### Étape 41 : Ajouter le modèle `Notification` à Prisma (migration)
- **Objectif :** Poser la fondation de données pour un historique de notifications consultable, actuellement inexistant (seul le push éphémère existe).
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`, nouvelle migration
- **Instructions d'exécution :** Ajouter un modèle `Notification { id String @id @default(cuid()), userId String, user User @relation(...), title String, body String, link String?, readAt DateTime?, createdAt DateTime @default(now()) }`. Lancer `npx prisma migrate dev --name add_notification_model`.
- **Critères de validation :** `npx prisma migrate status` ne montre aucune migration en attente ; la table `Notification` existe et est vide après migration.
- **Statut :** [ ] Non commencé

### Étape 42 : Écrire une notification en base à chaque envoi push
- **Objectif :** Faire vivre l'historique en parallèle de l'envoi FCM déjà en place.
- **Fichiers impactés :** `server-sanhia/services/notifications.js`
- **Instructions d'exécution :** Dans `sendPushToUser` (et `sendPushToUsers`/`notifyNewMission`/`notifyNewProduct` si elles n'appellent pas déjà `sendPushToUser` en sous-main), ajouter un `prisma.notification.create({ data: { userId, title, body, link: data?.link } })` avant ou après l'appel FCM — l'écriture en base ne doit pas être bloquée par un éventuel échec d'envoi push (try/catch séparés).
- **Critères de validation :** Déclencher une notification existante (ex. validation d'un paiement) crée une ligne dans la table `Notification` avec le bon `userId`, en plus du push déjà envoyé.
- **Statut :** [ ] Non commencé

### Étape 43 : Ajouter la route `GET /api/notifications`
- **Objectif :** Exposer l'historique au frontend.
- **Fichiers impactés :** `server-sanhia/routes/` (nouveau fichier `notifications.routes.js`), `server-sanhia/index.js`
- **Instructions d'exécution :** Créer la route, protégée par `verifyToken`, renvoyant les notifications de `req.user.uid` triées par `createdAt desc`, paginées (`page`/`limit` sur le modèle de `orders.js`). Monter le router dans `index.js` sous `/api/notifications`.
- **Critères de validation :** `GET /api/notifications` avec un token valide renvoie les notifications de l'utilisateur connecté, les plus récentes en premier.
- **Statut :** [ ] Non commencé

### Étape 44 : Ajouter la route `PATCH /api/notifications/:id/read`
- **Objectif :** Permettre de marquer une notification comme lue.
- **Fichiers impactés :** `server-sanhia/routes/notifications.routes.js`
- **Instructions d'exécution :** Ajouter la route, IDOR vérifié (`userId === req.user.uid` avant update), passant `readAt` à `new Date()`.
- **Critères de validation :** `PATCH /api/notifications/:id/read` sur une notification de l'utilisateur connecté renvoie 200 avec `readAt` renseigné ; sur une notification d'un autre utilisateur, renvoie 403/404.
- **Statut :** [ ] Non commencé

### Étape 45 : Créer l'écran Centre de notifications côté web
- **Objectif :** Rendre l'historique consultable dans l'interface.
- **Fichiers impactés :** `sanhia-web/src/pages/Notifications.jsx` (nouveau), `sanhia-web/src/App.jsx`, `sanhia-web/src/components/layout/Header.jsx`
- **Instructions d'exécution :** Créer la page listant les notifications (`GET /api/notifications`), avec un indicateur visuel non-lu/lu et un clic marquant comme lue (`PATCH .../read`) puis naviguant vers `link` si présent. Ajouter la route `/notifications` dans `App.jsx` (protégée, `PrivateRoute`) et une icône cloche avec badge de compteur non-lu dans `Header.jsx`.
- **Critères de validation :** `/notifications` affiche l'historique réel de l'utilisateur connecté ; cliquer une notification non lue met à jour son état visuel sans recharger la page.
- **Statut :** [ ] Non commencé

### Étape 46 : Créer l'écran Centre de notifications côté mobile
- **Objectif :** Parité avec le web.
- **Fichiers impactés :** `sanhia-mobile/app/notifications.js` (nouveau), point d'entrée dans `app/(buyer)/profile.js` (et éventuellement seller/delivery)
- **Instructions d'exécution :** Même logique que l'Étape 45, avec les composants `RowListSkeleton`/`EmptyState` déjà utilisés ailleurs dans le projet mobile pour les états de chargement/vide. Ajouter un lien "Notifications" dans les boutons utilitaires de Profil (à côté de "Messages").
- **Critères de validation :** L'écran affiche l'historique réel de l'utilisateur connecté, avec le même comportement de marquage lu qu'au web.
- **Statut :** [ ] Non commencé

---

## Phase K — Agrégation temporelle du dashboard vendeur

### Étape 47 : Ajouter un horodatage aux vues boutique (migration + logique)
- **Objectif :** Permettre un filtrage par période, impossible avec le simple compteur cumulatif actuel.
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`, nouvelle migration, `server-sanhia/routes/shops.routes.js`
- **Instructions d'exécution :** Ajouter un modèle léger `ShopView { id String @id @default(cuid()), shopId String, shop Shop @relation(...), createdAt DateTime @default(now()) }`. Dans la route qui incrémente `Shop.views`, ajouter en parallèle un `prisma.shopView.create({ data: { shopId } })`. Garder `Shop.views` tel quel pour compatibilité (compteur cumulatif rapide), la nouvelle table sert uniquement à l'agrégation par période.
- **Critères de validation :** Après migration, chaque visite d'une boutique crée une ligne `ShopView` horodatée, en plus de l'incrément existant sur `Shop.views`.
- **Statut :** [ ] Non commencé

### Étape 48 : Ajouter le filtre semaine/mois au dashboard vendeur (backend)
- **Objectif :** Exposer l'agrégation par période.
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js` (ou nouvelle route dédiée)
- **Instructions d'exécution :** Ajouter `GET /api/shops/mine/stats?period=week|month`, comptant les lignes `ShopView` (Étape 47) et les commandes de la boutique dans la fenêtre temporelle demandée (`gte: <date calculée>`).
- **Critères de validation :** `GET /api/shops/mine/stats?period=week` renvoie des compteurs de vues/commandes cohérents avec les seules 7 derniers jours de données de test.
- **Statut :** [ ] Non commencé

### Étape 49 : Ajouter le sélecteur de période au dashboard vendeur web
- **Objectif :** Rendre le filtre utilisable depuis l'interface.
- **Fichiers impactés :** `sanhia-web/src/pages/Seller.jsx` (`OverviewTab`)
- **Instructions d'exécution :** Ajouter un sélecteur "Cette semaine / Ce mois" au-dessus des statistiques, rechargeant les chiffres via l'endpoint de l'Étape 48 au changement de sélection.
- **Critères de validation :** Changer le sélecteur de période met à jour les chiffres affichés sans recharger la page.
- **Statut :** [ ] Non commencé

---

## Phase L — Cohérence des réponses API (dette moyenne)

### Étape 50 : Harmoniser la pagination de `GET /api/shops`
- **Objectif :** Aligner la forme de réponse de cette route sur le format `{ items, pagination }` déjà utilisé par `GET /api/orders`, pour réduire l'hétérogénéité relevée dans l'audit.
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js`, `sanhia-web/src/pages/BoutiqueList.jsx`, `sanhia-mobile/app/(buyer)/boutiques.js`
- **Instructions d'exécution :** Remplacer le tableau brut + header `X-Total-Count` par `{ shops: [...], pagination: { page, limit, total, pages } }`. Adapter les deux call sites frontend (web et mobile) qui consomment `GET /api/shops` pour lire cette nouvelle forme.
- **Critères de validation :** `GET /api/shops` renvoie un objet avec les clés `shops` et `pagination` ; la liste des boutiques s'affiche toujours correctement sur web et mobile après le changement.
- **Statut :** [ ] Non commencé

### Étape 51 : Ajouter la pagination aux endpoints de listing admin
- **Objectif :** Éviter de charger des tables entières à chaque appel du back-office, à mesure que le volume de données grossit.
- **Fichiers impactés :** `server-sanhia/routes/admin.routes.js`
- **Instructions d'exécution :** Ajouter `skip`/`take` (calculés depuis des paramètres `page`/`limit`, défaut `limit=50`) à chacun des `findMany` de listing (commandes, boutiques, utilisateurs, produits, candidatures, promos, newsletter, contacts).
- **Critères de validation :** `GET /api/admin/orders?page=1&limit=10` renvoie au maximum 10 résultats, `page=2` renvoie la page suivante sans chevauchement.
- **Statut :** [ ] Non commencé

---

## Phase M — Compression média côté serveur

### Étape 52 : Compresser les images à l'upload (backend)
- **Objectif :** Garantir la compression quel que soit le point d'entrée, plutôt que de dépendre d'une compression client appliquée de façon inégale.
- **Fichiers impactés :** `server-sanhia/services/upload.js`, `server-sanhia/package.json`
- **Instructions d'exécution :** Ajouter la dépendance `sharp`. Dans `uploadToStorage`, avant l'envoi vers R2, redimensionner l'image (largeur max ~1600px) et recompresser en JPEG qualité ~80 via `sharp(buffer).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer()`, en conservant le buffer d'origine si le fichier n'est pas une image traitable (fallback silencieux, ne jamais bloquer un upload).
- **Critères de validation :** Uploader une image de plus de 3 Mo aboutit à un fichier stocké sur R2 significativement plus léger (vérifiable via la taille du fichier retourné par l'URL publique).
- **Statut :** [ ] Non commencé

---

## Phase N — Fil de découverte social (décision produit requise avant exécution)

> ⚠️ Cette phase est le chantier le plus lourd de la roadmap et touche au cœur de la proposition de valeur produit (voir audit, "écart de vision majeur"). Ne pas exécuter les étapes 54+ sans validation explicite de l'Étape 53 par le porteur produit — c'est un choix délibéré, pas un oubli technique à corriger mécaniquement.

### Étape 53 : Valider la spec fonctionnelle du fil avec le porteur produit
- **Objectif :** Trancher consciemment entre "garder la grille catalogue comme interprétation MVP pragmatique" et "construire le fil vertical décrit dans le cahier des charges", avant d'engager du temps de développement dessus.
- **Fichiers impactés :** aucun (décision produit, pas de code)
- **Instructions d'exécution :** Documenter dans ce fichier (note à ajouter sous cette étape) la décision prise et sa date. Si "garder la grille" : rayer les étapes 54-56 de cette roadmap. Si "construire le fil" : préciser l'algorithme de tri souhaité (poids récence/popularité/suivi) pour cadrer l'Étape 54.
- **Critères de validation :** Une décision écrite et datée existe dans ce document avant toute exécution des étapes suivantes de cette phase.
- **Statut :** [ ] Non commencé

### Étape 54 : Adapter `GET /api/products` pour un tri "feed" (backend)
- **Objectif :** Fournir un ordre de résultats mêlant récence, popularité et boutiques suivies, conformément à la décision de l'Étape 53.
- **Fichiers impactés :** `server-sanhia/routes/products.js`
- **Instructions d'exécution :** Ajouter une valeur `sort=feed` calculant un score composite (ex. pondération récence décroissante + `likes._count` + bonus si `shopId` figure dans les `Follow` de l'utilisateur connecté, si authentifié). Conserver les valeurs de tri existantes (`recent`, `price-asc`, etc.) inchangées.
- **Critères de validation :** `GET /api/products?sort=feed` avec un token d'utilisateur suivant au moins une boutique renvoie en priorité des produits de cette boutique par rapport à un appel identique sans authentification.
- **Statut :** [ ] Non commencé

### Étape 55 : Construire le composant Feed vertical plein écran (web)
- **Objectif :** Remplacer (ou proposer en alternative à) la grille `Home.jsx` par un scroll séquentiel.
- **Fichiers impactés :** `sanhia-web/src/pages/Home.jsx`, nouveau composant `sanhia-web/src/components/feed/FeedCard.jsx`
- **Instructions d'exécution :** Construire un composant affichant un produit à la fois en pleine largeur (image/vidéo, nom, prix, boutique, actions like/suivre/partager), avec défilement vertical (`scroll-snap-type: y mandatory` en CSS plutôt qu'une librairie tierce), alimenté par `GET /api/products?sort=feed`.
- **Critères de validation :** La page d'accueil affiche un produit à la fois en plein écran, le défilement anime le passage au produit suivant, les actions like/suivre fonctionnent depuis la carte.
- **Statut :** [ ] Non commencé

### Étape 56 : Construire le composant Feed vertical plein écran (mobile)
- **Objectif :** Parité avec le web.
- **Fichiers impactés :** `sanhia-mobile/app/(buyer)/index.js`
- **Instructions d'exécution :** Remplacer le `FlatList numColumns={2}` par un `FlatList` vertical `pagingEnabled` à un item par écran, alimenté par `sort=feed`, réutilisant les actions like/wishlist/contact déjà construites sur la fiche produit.
- **Critères de validation :** L'onglet Accueil (mobile) affiche un produit à la fois en plein écran, avec un swipe vertical fluide vers le suivant.
- **Statut :** [ ] Non commencé

---

## Phase O — Support vidéo produit (dépend de la Phase N si le fil doit lire de la vidéo)

### Étape 57 : Ajouter un champ vidéo au modèle `Product` (migration)
- **Objectif :** Poser la fondation de données pour une courte vidéo par produit, en plus des photos.
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`, nouvelle migration
- **Instructions d'exécution :** Ajouter `videoUrl String?` au modèle `Product`. Lancer `npx prisma migrate dev --name add_product_video`.
- **Critères de validation :** `npx prisma migrate status` ne montre aucune migration en attente.
- **Statut :** [ ] Non commencé

### Étape 58 : Autoriser l'upload vidéo côté backend
- **Objectif :** Permettre l'envoi d'une courte vidéo à la création de produit, avec des limites raisonnables.
- **Fichiers impactés :** `server-sanhia/routes/products.js`
- **Instructions d'exécution :** Étendre `ALLOWED_MIME` avec `video/mp4`. Ajouter une limite de taille dédiée aux vidéos (ex. 15 Mo, plus haute que celle des images) via un champ multer distinct (`upload.fields([{ name: 'images', ... }, { name: 'video', maxCount: 1 }])`). Stocker l'URL résultante dans `videoUrl` (Étape 57).
- **Critères de validation :** `POST /api/products` avec un fichier `video/mp4` de moins de 15 Mo aboutit à un produit dont `videoUrl` est renseigné ; un fichier vidéo de plus de 15 Mo est rejeté avec un message clair.
- **Statut :** [ ] Non commencé

### Étape 59 : Ajouter la sélection vidéo au formulaire d'ajout de produit (web)
- **Objectif :** Rendre la fonctionnalité backend utilisable côté vendeur.
- **Fichiers impactés :** `sanhia-web/src/pages/Seller.jsx` (`AddProductTab`)
- **Instructions d'exécution :** Ajouter un champ `<input type="file" accept="video/mp4">` optionnel, avec aperçu (`<video controls>`) avant soumission, ajouté au `FormData` existant sous la clé `video`.
- **Critères de validation :** Publier un produit avec une courte vidéo depuis `/seller` aboutit à un produit dont la fiche affiche la vidéo (voir Étape 60).
- **Statut :** [ ] Non commencé

### Étape 60 : Ajouter la lecture vidéo sur la fiche produit (web)
- **Objectif :** Afficher la vidéo si elle existe, en complément ou à la place de la galerie photo.
- **Fichiers impactés :** `sanhia-web/src/pages/Product.jsx`
- **Instructions d'exécution :** Si `product.videoUrl` est renseigné, afficher un lecteur `<video controls poster={product.images?.[0]}>` en tête de la galerie, avant les vignettes photo.
- **Critères de validation :** La fiche d'un produit avec vidéo affiche un lecteur fonctionnel ; un produit sans vidéo affiche la galerie photo classique, inchangée.
- **Statut :** [ ] Non commencé

### Étape 61 : Ajouter la sélection vidéo au formulaire d'ajout de produit (mobile)
- **Objectif :** Parité avec le web.
- **Fichiers impactés :** `sanhia-mobile/app/seller/add-product.js`
- **Instructions d'exécution :** Étendre l'`ImagePicker` de l'Étape 34 avec `mediaTypes: ['images', 'videos']`, distinguer le type de l'asset sélectionné (`asset.type`) pour l'ajouter soit à `images`, soit au champ `video` du `FormData`.
- **Critères de validation :** Sélectionner une courte vidéo depuis la galerie du téléphone et publier le produit aboutit à un produit dont la vidéo est lisible côté web.
- **Statut :** [ ] Non commencé

### Étape 62 : Ajouter la lecture vidéo sur la fiche produit (mobile)
- **Objectif :** Parité complète avec le web sur la vidéo produit.
- **Fichiers impactés :** `sanhia-mobile/app/product/[id].js`, nouvelle dépendance `expo-video`
- **Instructions d'exécution :** Installer `expo-video` (`npx expo install expo-video`). Si `product.videoUrl` est renseigné, afficher un composant vidéo en tête d'écran (au lieu de l'`Image` statique), avec contrôles de lecture basiques.
- **Critères de validation :** La fiche d'un produit avec vidéo (mobile) lit la vidéo avec contrôles ; nécessite un nouveau build EAS (nouveau module natif) pour être testable sur appareil.
- **Statut :** [ ] Non commencé

---

## Phase P — Robustesse (basse priorité)

### Étape 63 : Ajouter un cache mémoire simple sur `GET /api/products` le plus consulté
- **Objectif :** Réduire la charge Postgres sur la route la plus sollicitée, sans introduire de dépendance externe (Redis) tant que le volume ne le justifie pas.
- **Fichiers impactés :** `server-sanhia/routes/products.js`
- **Instructions d'exécution :** Ajouter un cache en mémoire process (`Map` avec TTL de ~30s) clé sur les paramètres de requête sérialisés, pour les appels `GET /` sans authentification (feed public). Invalider explicitement l'entrée concernée à chaque création/modification de produit.
- **Critères de validation :** Deux appels identiques à `GET /api/products` en moins de 30 secondes renvoient une réponse identique sans déclencher deux requêtes Postgres distinctes (vérifiable via les logs `log: ['query', ...]` déjà configurés en dev).
- **Statut :** [ ] Non commencé

### Étape 64 : Ajouter la persistance du cache et la détection de connectivité (mobile)
- **Objectif :** Amorcer le "mode dégradé" recommandé par le cahier des charges pour les connexions instables.
- **Fichiers impactés :** `sanhia-mobile/app/_layout.js`, `sanhia-mobile/package.json`
- **Instructions d'exécution :** Installer `@tanstack/query-async-storage-persister` et `@react-native-community/netinfo`. Configurer `persistQueryClient` avec `AsyncStorage` pour que les données déjà chargées restent consultables hors-ligne. Afficher un bandeau discret "Connexion limitée" quand `NetInfo` signale une perte de connexion.
- **Critères de validation :** Couper la connexion réseau du téléphone après un premier chargement du Catalogue affiche toujours les produits déjà chargés (depuis le cache), avec le bandeau de connexion limitée visible.
- **Statut :** [ ] Non commencé

---

## Hors périmètre de cette roadmap

Éléments identifiés par l'audit mais volontairement exclus du découpage atomique ci-dessus :

- **Nettoyage de l'historique git de `server-sanhia/node_modules`** (16 541 fichiers trackés) — nécessite une réécriture d'historique (`git filter-repo` ou équivalent) et un force-push coordonné avec toute l'équipe ayant un clone local ; opération à mener manuellement avec supervision humaine directe, pas comme une étape LLM autonome.
- **Suite de tests automatisés** (backend, web, mobile) — transversal à toutes les phases ci-dessus plutôt qu'une étape isolée ; à cadrer comme un chantier séparé une fois qu'un socle de fonctionnalités stable existe, pour éviter d'écrire des tests contre du code encore en mouvement.
- **Rotation effective du mot de passe Firebase admin** (Étape 1 ne fait que sécuriser le code, pas changer le mot de passe réel) — action à mener directement dans la console Firebase par un humain habilité.
- **Compte admin (`aurumcorporate.d@gmail.com`) sans ligne Postgres correspondante** — découvert en testant l'Étape 7 : `requireAdmin` renvoie 403 même pour ce compte, car `prisma.user.findUnique` ne trouve rien pour son UID Firebase. Hypothèse de l'équipe : lié au passage à l'auth par numéro de téléphone (le compte admin, créé en email/mot de passe, ne passe jamais par le flux `POST /users` qui auto-provisionne la ligne Postgres au premier login OTP). À reprendre une fois la roadmap terminée — décider si l'admin doit aussi passer par l'auth téléphone, ou si `create-users.js` doit resynchroniser ce compte spécifiquement.
