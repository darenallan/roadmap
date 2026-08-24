# Sanhia — Roadmap V1.5

> Généré à partir de l'audit technique du code actuel face au cahier des charges V1.5
> (`Sanhia_Cahier_des_charges_V1.5.md`) : adresses pré-enregistrées, stories boutiques, feed vidéo immersif.
> Chaque étape est atomique (15-30 min), séquentielle, et se termine par un critère de validation vérifiable.
> Cocher `[x]` la case Statut une fois l'étape terminée ET son critère de validation vérifié — pas avant.

**Convention de chemins** : `server-sanhia/` = backend, `sanhia-web/` = web, `sanhia-mobile/` = mobile (React Native/Expo Router).

**Ordre des phases** : conforme à l'ordre recommandé par le cahier des charges lui-même (section 9) — adresses, puis stories, puis feed vidéo, du moins complexe au plus complexe.

---

## Constats de l'audit (à lire avant d'exécuter)

Trois écarts entre les hypothèses du cahier des charges et l'état réel du code, qui ont un impact direct sur le contenu des étapes ci-dessous :

1. **Le carnet d'adresses est déjà construit à ~50%, mais totalement déconnecté de la commande.** Le modèle `Address` existe déjà (et est même plus riche que ce que demande le cahier : `name, phone, city, desc, tag, lat, lng, isDefault`), avec les routes `GET/POST/DELETE /api/users/me/addresses` et un onglet "Adresses" fonctionnel dans `Profile.jsx` (web). En revanche, **aucune route d'édition n'existe**, **aucune UI mobile n'existe** (grep vide sur `app/(buyer)/cart.js`), et surtout : le modèle `Order` ne stocke **aucune** donnée d'adresse. Le sélecteur "Adresse de livraison" de `Cart.jsx` (web) est un `<select>` à 4 options codées en dur, utilisé uniquement pour calculer un frais d'affichage — la valeur choisie n'est **jamais envoyée** à `POST /api/orders` (payload confirmé : `{ items }` uniquement, ligne 130-132). Côté mobile, le panier n'a même pas ce sélecteur cosmétique. Pire : la `zone` utilisée aujourd'hui pour créer la `Livraison` (à l'approbation du paiement, `admin.routes.js`) est dérivée de **la ville de la boutique**, pas d'une adresse cliente. Ce n'est donc pas un branchement UI à faire, mais un vrai circuit de bout en bout à construire (voir Phase A).

2. **« Extension du processus de modération existant (photos) » repose sur une prémisse fausse.** `POST /api/products` passe un produit en `status: "active"` immédiatement à la création (confirmé, `routes/products.js`) — il n'existe **aucun** flux de modération pour les photos/produits aujourd'hui, seulement pour les boutiques (`Shop.status: pending/active`, approuvé par un admin). La modération vidéo (Phase C) sera donc construite à neuf, en réutilisant le **pattern** boutique (`status` string + route admin d'approbation) plutôt qu'un système photo qui n'existe pas. À signaler au porteur produit si la priorité "Moyenne" donnée à cette tâche supposait un simple branchement.

3. **La navigation mobile a déjà 5 onglets, pas 4.** Le cahier affirme (§1.2, §6) que la nav client "passe de 4 à 5 entrées avec l'ajout du feed vidéo". Or `sanhia-mobile/app/(buyer)/_layout.js` déclare déjà 5 `Tabs.Screen` (`index`, `catalogue`, `boutiques`, `cart`, `profile`) — l'onglet "Boutiques" a été ajouté pendant les travaux de parité mobile/web menés après la rédaction probable de ce chiffre. Le feed vidéo sera donc un **6ème** onglet dans l'implémentation réelle, pas un 5ème. Ceci ne change rien au travail technique, seulement au comptage — signalé ici pour ne pas surprendre le porteur produit en recette.

4. **La compression vidéo est une hypothèse ouverte du cahier lui-même (§5.1), pas une exigence ferme.** Le pipeline d'upload actuel (`services/upload.js`) ne compresse que les images (`sharp`) ; les vidéos passent déjà tel quel (comportement déjà en place pour `Product.videoUrl`, aucune lib `ffmpeg`/transcodage dans `package.json`). Le cahier indique explicitement que l'arbitrage streaming tiers vs traitement interne "doit être arbitré selon le budget technique". Cette roadmap implémente donc un stockage vidéo **sans compression** (identique au comportement déjà en prod pour les vidéos produit), et traite la compression/streaming adaptatif comme **hors périmètre d'exécution**, à trancher séparément — même traitement que les 3 points hors périmètre LLM de la roadmap V1.1.

---

## Phase A — Localisations pré-enregistrées

> La plus simple selon le cahier, mais le vrai travail est le branchement commande, pas le CRUD (déjà largement présent). Sous-étapes ordonnées : compléter le CRUD, préparer le schéma commande, brancher le checkout.

### Étape 1 : Ajouter la route d'édition d'adresse (backend)
- **Objectif :** Permettre à un client de modifier une adresse enregistrée, seule opération CRUD manquante côté backend.
- **Fichiers impactés :** `server-sanhia/routes/users.routes.js`
- **Instructions d'exécution :** Ajouter `PATCH /api/users/me/addresses/:id`, protégée par `verifyToken`. Vérifier que l'adresse appartient bien à `req.user.uid` (404 sinon, même pattern que `DELETE /api/users/me/addresses/:id`). Accepter en body un sous-ensemble de `{ name, phone, city, desc, tag, lat, lng, isDefault }` (mise à jour partielle). Si `isDefault: true` est envoyé, repasser les autres adresses du même utilisateur à `isDefault: false` dans la même transaction (cohérence avec le comportement déjà attendu par le front sur `POST`).
- **Critères de validation :** `PATCH /api/users/me/addresses/:id` sur une adresse existante renvoie 200 avec les champs modifiés ; la même requête sur l'adresse d'un autre utilisateur renvoie 404.
- **Statut :** [ ] Non commencé

### Étape 2 : Ajouter l'édition dans l'onglet Adresses (web)
- **Objectif :** Rendre la route d'édition utilisable depuis le profil web.
- **Fichiers impactés :** `sanhia-web/src/pages/Profile.jsx` (composant `TabAdresses`)
- **Instructions d'exécution :** Ajouter un bouton "Modifier" sur chaque carte d'adresse, ouvrant le même formulaire que "Ajouter" pré-rempli avec les valeurs existantes, soumettant vers `PATCH /api/users/me/addresses/:id` au lieu de `POST`. Réutiliser l'état de formulaire déjà existant pour l'ajout plutôt que d'en dupliquer un.
- **Critères de validation :** Modifier le libellé d'une adresse depuis `/profile` → onglet Adresses met à jour la carte affichée sans rechargement de page, et persiste après rafraîchissement.
- **Statut :** [ ] Non commencé

### Étape 3 : Créer l'écran "Mes adresses" côté mobile
- **Objectif :** Combler l'absence totale d'UI mobile pour le carnet d'adresses (liste, ajout, édition, suppression).
- **Fichiers impactés :** `sanhia-mobile/app/(buyer)/addresses.js` (nouveau), `sanhia-mobile/app/(buyer)/profile.js`
- **Instructions d'exécution :** Nouvel écran listant `GET /api/users/me/addresses`, avec formulaire d'ajout/édition (nom, téléphone, ville, description, tag, `isDefault`) réutilisant les composants existants (`Button`, `Text`, `EmptyState` si liste vide). Pas de sélection de point sur carte (aucune lib de carte dans les dépendances mobiles actuelles) — `lat`/`lng` restent optionnels et saisis nulle part ici, cohérent avec le fait que `Address.lat/lng` sont déjà nullable côté schéma. Ajouter un lien "Mes adresses" dans `profile.js`, au même emplacement que les autres liens de compte existants.
- **Critères de validation :** Depuis l'app mobile, ajouter une adresse, la modifier, puis la supprimer aboutit aux 3 opérations reflétées immédiatement dans la liste, et visibles côté web (`/profile` → Adresses) après rafraîchissement.
- **Statut :** [ ] Non commencé

### Étape 4 : Ajouter les champs de snapshot d'adresse au modèle `Order` et `lat/lng` à `Livraison` (migration Prisma)
- **Objectif :** Donner à la commande un endroit où stocker l'adresse choisie au moment du checkout, indépendamment de toute modification/suppression ultérieure de l'adresse enregistrée (snapshot, même logique que `OrderItem.price`).
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`
- **Instructions d'exécution :** Sur `model Order`, ajouter `addressLabel String?`, `addressText String?`, `addressLat Float?`, `addressLng Float?`. Sur `model Livraison`, ajouter `lat Float?`, `lng Float?` (pour transmettre une position précise au livreur, en plus du `zone` textuel déjà existant). Appliquer avec `npx prisma db push` (pas `migrate dev` — ce projet n'a pas d'historique Prisma Migrate, voir précédent de l'Étape 19/29/41/47/57 de ROADMAP.md).
- **Critères de validation :** `npx prisma db push` s'exécute sans erreur ; `npx prisma studio` (ou une requête directe) montre les nouvelles colonnes sur `Order` et `Livraison`, toutes nullables, sans perte de données existantes.
- **Statut :** [ ] Non commencé

### Étape 5 : Accepter une adresse (enregistrée ou ponctuelle) à la création de commande (backend)
- **Objectif :** Permettre au client de transmettre une adresse de livraison réelle à `POST /api/orders`, avec repli sur saisie libre si aucune adresse n'est enregistrée (US-V1.5-04 : la commande sans adresse enregistrée doit rester possible).
- **Fichiers impactés :** `server-sanhia/routes/orders.js`
- **Instructions d'exécution :** Étendre `createOrderSchema` (zod) pour accepter en option soit `addressId` (string), soit un objet `address: { label, text, lat, lng }` en saisie libre — les deux optionnels, ni l'un ni l'autre requis. Si `addressId` fourni : charger l'adresse via `prisma.address.findUnique`, vérifier `userId === req.user.uid` (400 sinon), puis copier ses champs dans `addressLabel/addressText/addressLat/addressLng` de la commande créée. Si `address` (saisie libre) fourni : copier directement ces valeurs. Si ni l'un ni l'autre : laisser les 4 champs à `null` (comportement actuel inchangé).
- **Critères de validation :** Créer une commande avec `addressId` valide stocke les 4 champs snapshot corrects sur l'`Order` créé (vérifiable via `GET /api/orders/:id`) ; créer une commande sans aucun champ d'adresse continue de fonctionner comme avant (aucune régression) ; un `addressId` appartenant à un autre utilisateur est rejeté en 400.
- **Statut :** [ ] Non commencé

### Étape 6 : Utiliser l'adresse de la commande pour la zone/position de la Livraison (backend)
- **Objectif :** Remplacer le repli actuel (ville de la boutique) par la vraie adresse client quand elle est disponible, sans casser le comportement existant quand elle ne l'est pas.
- **Fichiers impactés :** `server-sanhia/routes/admin.routes.js` (2 points de création de `Livraison` : approbation commande directe et validation de paiement)
- **Instructions d'exécution :** Aux deux endroits où `prisma.livraison.create` est appelé, récupérer `order.addressLabel`, `order.addressLat`, `order.addressLng` (déjà chargeable via le `orderId`). Utiliser `order.addressLabel ?? <ville boutique actuelle>` pour `zone` (repli identique à l'existant si aucune adresse n'a été fournie), et passer `lat: order.addressLat, lng: order.addressLng` sur la `Livraison` créée.
- **Critères de validation :** Approuver une commande créée avec une adresse (Étape 5) produit une `Livraison` avec `zone` = libellé de l'adresse et `lat`/`lng` renseignés ; approuver une commande sans adresse produit une `Livraison` identique à avant (zone = ville boutique, lat/lng null) — aucune régression sur le flux existant.
- **Statut :** [ ] Non commencé

### Étape 7 : Brancher la sélection d'adresse réelle au checkout (web)
- **Objectif :** Remplacer le `<select>` cosmétique à 4 options par une vraie sélection parmi les adresses enregistrées du client, avec repli en saisie libre.
- **Fichiers impactés :** `sanhia-web/src/pages/Cart.jsx`
- **Instructions d'exécution :** Charger `GET /api/users/me/addresses` à l'ouverture de la page (React Query ou `useEffect`+`useState`, selon le pattern déjà dominant dans ce fichier). Remplacer les 4 `<option>` codées en dur par la liste réelle des adresses du client (libellé = `tag`/`name` + `city`), plus une option "Nouvelle adresse" ouvrant 2-3 champs de saisie libre (texte + ville) si le client n'a rien d'enregistré ou veut saisir autre chose. Dans `handleCheckout`, inclure `addressId` (si une adresse enregistrée est sélectionnée) ou `address: { label, text }` (si saisie libre) dans le `payload` envoyé à `POST /api/orders`. Le frais d'affichage (`SHIPPING_FEE`) peut rester basé sur la simple présence d'une adresse sélectionnée, inchangé.
- **Critères de validation :** Passer une commande en sélectionnant une adresse enregistrée aboutit à un `Order` dont `addressLabel`/`addressText` correspondent à cette adresse (vérifiable côté backend) ; passer une commande sans adresse enregistrée mais avec saisie libre aboutit également à un `Order` avec adresse renseignée.
- **Statut :** [ ] Non commencé

### Étape 8 : Ajouter la sélection d'adresse au checkout (mobile)
- **Objectif :** Porter la même intégration checkout sur mobile, qui n'a aujourd'hui aucune notion d'adresse au panier.
- **Fichiers impactés :** `sanhia-mobile/app/(buyer)/cart.js`
- **Instructions d'exécution :** Avant le bouton "Passer la commande", charger `GET /api/users/me/addresses` et afficher un sélecteur simple (liste de boutons/rows, une adresse cochée à la fois — pas besoin de `<select>` natif, suivre le pattern déjà utilisé pour d'autres choix courts dans l'app). Si aucune adresse enregistrée, permettre de continuer sans (repli identique au comportement actuel, aucune adresse envoyée). Inclure `addressId` dans le `payload` de `handleCheckout` si une adresse est sélectionnée.
- **Critères de validation :** Depuis l'app mobile, passer une commande avec une adresse enregistrée sélectionnée aboutit à un `Order` dont les champs d'adresse sont renseignés (vérifiable côté backend) ; passer une commande sans sélection continue de fonctionner comme avant.
- **Statut :** [ ] Non commencé

---

## Phase B — Stories boutiques

> Rien n'existe aujourd'hui (confirmé par grep, aucun faux-positif sur "histoire"/"brand_story"). Le modèle `Follow` (déjà utilisé pour la wishlist/notifications) et le pipeline d'upload (`uploadToStorage`) sont directement réutilisables.

### Étape 9 : Ajouter le modèle `Story` (migration Prisma)
- **Objectif :** Créer la table de stockage des stories, liée aux boutiques.
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`
- **Instructions d'exécution :** Ajouter `model Story { id String @id @default(cuid()); shopId String; shop Shop @relation(fields: [shopId], references: [id]); mediaUrl String; type String; createdAt DateTime @default(now()) }` (`type` = `"photo"` ou `"video"`). Ajouter la relation inverse `stories Story[]` sur `model Shop`. Appliquer avec `npx prisma db push`.
- **Critères de validation :** `npx prisma db push` s'exécute sans erreur ; la table `Story` est visible dans `npx prisma studio`.
- **Statut :** [ ] Non commencé

### Étape 10 : Ajouter la route de publication de story (backend)
- **Objectif :** Permettre à une boutique de publier une story (photo ou vidéo courte).
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js`
- **Instructions d'exécution :** Ajouter `POST /api/shops/:id/stories`, protégée par `verifyToken` + vérification que `req.user.uid` possède bien la boutique `:id` (même pattern IDOR déjà en place sur `PATCH /api/shops/:id`). Multer en mémoire, un seul champ `media` (image ou `video/mp4`, réutiliser `ALLOWED_IMAGE_MIME`/la logique de `fileFilter` de `products.js`). Upload via `uploadToStorage` existant. Déterminer `type` à partir du mimetype reçu (`image/*` → `"photo"`, `video/mp4` → `"video"`). Créer la `Story`.
- **Critères de validation :** `POST /api/shops/:id/stories` avec une image en multipart renvoie 201 avec une story dont `mediaUrl` pointe vers un fichier réellement accessible (R2) ; un utilisateur qui ne possède pas la boutique reçoit 403.
- **Statut :** [ ] Non commencé

### Étape 11 : Ajouter les routes de lecture des stories (backend)
- **Objectif :** Exposer la liste des stories actives d'une boutique (gestion boutique) et le fil des stories des boutiques suivies (client), avec expiration filtrée à la lecture (pas de tâche planifiée, conforme au cahier §5.3).
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js`
- **Instructions d'exécution :** Ajouter `GET /api/shops/:id/stories` (les stories de la boutique avec `createdAt > now() - 24h`, triées par date décroissante — utile pour l'écran de gestion boutique). Ajouter `GET /api/stories/feed` (protégée par `verifyToken`) : stories des boutiques suivies par `req.user.uid` (jointure via `Follow`), filtrées sur les dernières 24h, groupées par boutique (une entrée par boutique avec sa story la plus récente + le compte total actif).
- **Critères de validation :** Publier une story pour une boutique suivie par le compte de test la fait apparaître dans `GET /api/stories/feed` pour ce compte ; elle n'apparaît pas dans le feed d'un compte qui ne suit pas cette boutique.
- **Statut :** [ ] Non commencé

### Étape 12 : Créer l'écran de publication de story (web, dashboard vendeur)
- **Objectif :** Donner aux boutiques un moyen de publier une story depuis le web.
- **Fichiers impactés :** `sanhia-web/src/pages/Seller.jsx`
- **Instructions d'exécution :** Ajouter un nouvel onglet ou une section "Story" dans le dashboard vendeur, avec un input file (image ou vidéo courte) + aperçu avant envoi, soumettant vers `POST /api/shops/:id/stories` en `multipart/form-data` (attention au bug déjà corrigé ailleurs dans ce fichier : ne pas fixer manuellement le `Content-Type`, laisser le navigateur générer le boundary). Afficher un message de succès et la liste des stories actives de la boutique (via `GET /api/shops/:id/stories`) sous le formulaire.
- **Critères de validation :** Publier une story depuis `/seller` aboutit à une entrée visible dans la liste sous le formulaire, sans erreur réseau.
- **Statut :** [ ] Non commencé

### Étape 13 : Afficher le bandeau de stories et le visionnage (web, fil de découverte)
- **Objectif :** Afficher les stories actives des boutiques suivies en tête du fil de découverte, avec un visionnage plein écran.
- **Fichiers impactés :** `sanhia-web/src/pages/Home.jsx`
- **Instructions d'exécution :** En tête de page (avant le contenu existant), ajouter un bandeau horizontal scrollable des boutiques suivies ayant une story active (`GET /api/stories/feed`), chaque avatar affichant un anneau distinctif. Rester discret conformément au point d'attention du cahier (§6) — pas de composant envahissant. Au clic sur un avatar, ouvrir une superposition plein écran affichant la/les story(ies) de cette boutique (image ou `<video autoPlay>`), avec navigation "suivant" (tap/flèche) passant à la story suivante puis à la boutique suivante, et fermeture (croix ou clic hors zone). Ne rien afficher si le client ne suit aucune boutique avec story active (bandeau absent, pas de zone vide).
- **Critères de validation :** Un compte suivant une boutique avec story active voit le bandeau sur `/` ; cliquer dessus ouvre le visionnage plein écran de la story publiée à l'Étape 12 ; un compte ne suivant personne (ou dont les boutiques suivies n'ont pas de story active) ne voit pas le bandeau.
- **Statut :** [ ] Non commencé

### Étape 14 : Créer l'écran de publication de story (mobile, côté vendeur)
- **Objectif :** Porter la publication de story sur mobile.
- **Fichiers impactés :** `sanhia-mobile/app/(seller)/story.js` (nouveau), `sanhia-mobile/app/(seller)/index.js` ou `settings.js` (point d'entrée)
- **Instructions d'exécution :** Nouvel écran réutilisant `expo-image-picker` (déjà installé et utilisé pour l'ajout de produit) pour sélectionner une image ou une courte vidéo depuis la galerie, aperçu avant envoi, soumission multipart vers `POST /api/shops/:id/stories` (même pattern que `app/seller/add-product.js`). Ajouter un point d'entrée ("Publier une story") depuis le tableau de bord vendeur mobile existant.
- **Critères de validation :** Publier une story depuis l'app mobile vendeur aboutit à une entrée visible côté web dans la liste de gestion (Étape 12) sous quelques secondes.
- **Statut :** [ ] Non commencé

### Étape 15 : Afficher le bandeau de stories et le visionnage (mobile, fil de découverte)
- **Objectif :** Porter le bandeau et le visionnage plein écran sur mobile.
- **Fichiers impactés :** `sanhia-mobile/app/(buyer)/index.js`
- **Instructions d'exécution :** Même logique que l'Étape 13 : bandeau horizontal (`ScrollView horizontal` ou `FlatList horizontal`) en tête de `index.js`, alimenté par `GET /api/stories/feed`. Le visionnage plein écran est un nouvel écran (`app/story/[shopId].js`) avec `Image`/`useVideoPlayer`+`VideoView` (pattern déjà utilisé dans `app/product/[id].js`) et navigation tap gauche/droite entre stories.
- **Critères de validation :** Depuis l'app mobile, le bandeau apparaît pour un compte suivant une boutique avec story active, et le tap ouvre le visionnage plein écran correspondant.
- **Statut :** [ ] Non commencé

---

## Phase C — Feed vidéo immersif

> Le chantier le plus lourd — traité en dernier, comme demandé explicitement par le cahier (§9, §12). Réutilise le pattern d'upload vidéo déjà en place pour `Product.videoUrl` (Étapes 57-62 de ROADMAP.md), mais avec des tables dédiées (le cahier est explicite : "Distincte de la table produits").

### Étape 16 : Ajouter les modèles `Video` et `VideoProductTag` (migration Prisma)
- **Objectif :** Créer les tables de stockage des vidéos du feed et de leurs tags produit par intervalle.
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`
- **Instructions d'exécution :** Ajouter `model Video { id String @id @default(cuid()); shopId String; shop Shop @relation(fields: [shopId], references: [id]); mediaUrl String; description String?; status String @default("pending"); createdAt DateTime @default(now()); tags VideoProductTag[] }`. Ajouter `model VideoProductTag { id String @id @default(cuid()); videoId String; video Video @relation(fields: [videoId], references: [id]); productId String; product Product @relation(fields: [productId], references: [id]); startTime Float; endTime Float }`. Ajouter les relations inverses `videos Video[]` sur `model Shop` et `videoTags VideoProductTag[]` sur `model Product`. Appliquer avec `npx prisma db push`.
- **Critères de validation :** `npx prisma db push` s'exécute sans erreur ; les tables `Video` et `VideoProductTag` sont visibles dans `npx prisma studio`.
- **Statut :** [ ] Non commencé

### Étape 17 : Ajouter la route d'upload vidéo (backend)
- **Objectif :** Permettre à une boutique d'importer une vidéo pour le feed, en attente de modération.
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js`
- **Instructions d'exécution :** Ajouter `POST /api/shops/:id/videos`, protégée par `verifyToken` + vérification de propriété (même pattern que l'Étape 10). Réutiliser la config multer de `products.js` (limite de taille, `fileFilter` sur `video/mp4`) — soit en important cette config, soit en la dupliquant localement si l'import croise des routes non liées (juger sur place selon la structure du fichier). Upload via `uploadToStorage` (passthrough vidéo tel quel, sans compression — voir constat n°4 en tête de document). Créer la `Video` avec `status: "pending"`.
- **Critères de validation :** `POST /api/shops/:id/videos` avec un fichier `video/mp4` valide renvoie 201 avec `status: "pending"` et un `mediaUrl` accessible ; un fichier d'un autre type est rejeté.
- **Statut :** [ ] Non commencé

### Étape 18 : Ajouter les routes de tagging produit sur vidéo (backend)
- **Objectif :** Permettre à la boutique d'associer un produit de son catalogue à un intervalle de temps précis sur sa vidéo.
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js`
- **Instructions d'exécution :** Ajouter `POST /api/videos/:id/tags` (body : `{ productId, startTime, endTime }`), vérifiant que la vidéo appartient à une boutique possédée par `req.user.uid` ET que le produit appartient à la même boutique (éviter le tag d'un produit d'une autre boutique). Ajouter `DELETE /api/videos/:id/tags/:tagId` (même vérification de propriété). Ajouter `GET /api/shops/:id/videos` (liste des vidéos de la boutique, tous statuts confondus, avec leurs tags — pour l'écran de gestion boutique).
- **Critères de validation :** Taguer un produit de la boutique sur une vidéo qu'elle possède renvoie 201 ; taguer un produit d'une autre boutique est rejeté en 400 ; `DELETE` retire bien le tag de la réponse suivante de `GET /api/shops/:id/videos`.
- **Statut :** [ ] Non commencé

### Étape 19 : Ajouter la modération vidéo côté admin (backend)
- **Objectif :** Permettre à un admin d'approuver ou rejeter une vidéo avant publication dans le feed (US-V1.5-01 : "La vidéo n'est publiée dans le feed qu'après validation de la modération"), en réutilisant le pattern d'approbation boutique déjà existant.
- **Fichiers impactés :** `server-sanhia/routes/admin.routes.js`
- **Instructions d'exécution :** Ajouter `PATCH /api/admin/videos/:id/approve` (`status: "approved"`) et `PATCH /api/admin/videos/:id/reject` (`status: "rejected"`), suivant exactement le pattern de `PATCH /api/admin/shops/:id/approve` (Étape 12 de ROADMAP.md). Ajouter `GET /api/admin/videos` (liste paginée, filtrable par `status`, priorité implicite aux boutiques déjà `active` en triant sur le statut boutique si simple à faire, sinon tri par date de soumission — cf. recommandation du cahier §11 "en priorisant les boutiques déjà validées").
- **Critères de validation :** `PATCH /api/admin/videos/:id/approve` sur une vidéo `pending` renvoie 200 avec `status: "approved"` ; un compte non-admin reçoit 403.
- **Statut :** [ ] Non commencé

### Étape 20 : Ajouter la route du fil vidéo public (backend)
- **Objectif :** Exposer les vidéos approuvées, avec leurs tags produit, pour alimenter le feed client.
- **Fichiers impactés :** `server-sanhia/routes/shops.routes.js` (ou nouveau `server-sanhia/routes/videos.routes.js` si le fichier existant devient trop chargé — à juger sur place)
- **Instructions d'exécution :** Ajouter `GET /api/videos/feed`, publique ou authentifiée selon le pattern déjà utilisé pour `GET /api/products` (suivre le même choix), paginée (`page`/`limit`, même convention que l'Étape 50 de ROADMAP.md), filtrée sur `status: "approved"`, incluant `shop` (nom, id) et `tags` avec leur `product` (au minimum `id, name, price, images[0]`, suffisant pour l'overlay).
- **Critères de validation :** `GET /api/videos/feed` ne renvoie que des vidéos `approved` (une vidéo `pending` créée pour le test n'apparaît pas tant qu'elle n'est pas approuvée via l'Étape 19) ; chaque entrée inclut ses tags avec les infos produit nécessaires à l'overlay.
- **Statut :** [ ] Non commencé

### Étape 21 : Créer l'outil de tagging vidéo (web, dashboard vendeur)
- **Objectif :** Permettre à une boutique d'importer une vidéo et d'y associer des produits par intervalle, via des curseurs visuels (pas de saisie manuelle de temps, exigence explicite du cahier §5.2).
- **Fichiers impactés :** `sanhia-web/src/pages/Seller.jsx`
- **Instructions d'exécution :** Nouvel onglet ou section "Feed vidéo" : upload vidéo (`POST /api/shops/:id/videos`), puis une fois la vidéo importée, afficher un lecteur `<video>` avec une timeline sous forme de barre horizontale sur laquelle l'utilisateur positionne 2 curseurs (début/fin) par glisser-déposer (utiliser `input[type=range]` en double, ou une implémentation `mousedown`/`mousemove` simple sur une div — pas de librairie externe nécessaire pour un besoin aussi ciblé), avec sélection du produit à taguer dans un `<select>` du catalogue existant de la boutique. Soumettre via `POST /api/videos/:id/tags`. Lister les tags déjà créés sous la timeline, avec suppression individuelle (`DELETE /api/videos/:id/tags/:tagId`). Afficher le statut de modération de la vidéo (`pending`/`approved`/`rejected`).
- **Critères de validation :** Importer une vidéo, y positionner 2 curseurs, sélectionner un produit et valider crée un tag visible dans la liste sous la timeline, sans saisie manuelle de nombre à aucune étape.
- **Statut :** [ ] Non commencé

### Étape 22 : Créer le fil vidéo immersif (web)
- **Objectif :** Donner un équivalent web du "5ème onglet" mobile — une page dédiée au défilement de vidéos avec overlay produit dynamique.
- **Fichiers impactés :** `sanhia-web/src/pages/VideoFeed.jsx` (nouveau), `sanhia-web/src/App.jsx` (nouvelle route), `sanhia-web/src/components/layout/Header.jsx` (lien de nav)
- **Instructions d'exécution :** Nouvelle route `/feed`, avec un conteneur à défilement vertical `scroll-snap-type: y mandatory` (CSS pur, pas de librairie), une `<video>` par section, chargeant `GET /api/videos/feed` (pagination infinie simple au scroll si raisonnable, sinon une première page suffit pour cette étape). Sur chaque vidéo, écouter l'événement `timeupdate` du lecteur pour trouver le tag dont `startTime <= currentTime < endTime` (recherche linéaire dans le tableau des tags de cette vidéo, largement suffisant vu le volume attendu) et afficher un bouton produit superposé (image + nom + prix) qui navigue vers `/produit/:id` au clic. Aucun bouton si aucun tag ne correspond à l'instant courant. Ajouter un lien "Feed" dans la navigation principale (`Header.jsx`).
- **Critères de validation :** Ouvrir `/feed` fait défiler verticalement les vidéos approuvées ; sur une vidéo avec un tag, le bouton produit apparaît exactement pendant l'intervalle tagué (avant et après, absent) et le clic ouvre la fiche produit existante.
- **Statut :** [ ] Non commencé

### Étape 23 : Créer l'outil de tagging vidéo (mobile, côté vendeur)
- **Objectif :** Porter l'import vidéo + tagging sur mobile, avec la même exigence de simplicité (curseurs, pas de saisie de temps).
- **Fichiers impactés :** `sanhia-mobile/app/(seller)/video-tagging.js` (nouveau)
- **Instructions d'exécution :** Sélection vidéo via `expo-image-picker` (déjà utilisé, supporte aussi la vidéo en configurant `mediaTypes`), upload vers `POST /api/shops/:id/videos`. Une fois importée, lecteur `useVideoPlayer`/`VideoView` (pattern déjà utilisé dans `app/product/[id].js`) avec 2 curseurs tactiles sur une barre de progression personnalisée (`PanResponder` ou `Pressable` avec calcul de position au toucher — pas de librairie de slider externe si évitable, sinon vérifier une lib déjà présente dans les dépendances avant d'en ajouter une). Sélection du produit dans le catalogue de la boutique, soumission vers `POST /api/videos/:id/tags`.
- **Critères de validation :** Depuis l'app mobile vendeur, importer une vidéo et y créer un tag produit aboutit à un tag visible côté web (Étape 21) pour la même vidéo.
- **Statut :** [ ] Non commencé

### Étape 24 : Créer le nouvel onglet Feed vidéo (mobile)
- **Objectif :** Ajouter le nouvel onglet de défilement vidéo plein écran à la navigation principale acheteur (6ème onglet dans l'état réel actuel — voir constat n°3 en tête de document).
- **Fichiers impactés :** `sanhia-mobile/app/(buyer)/feed.js` (nouveau), `sanhia-mobile/app/(buyer)/_layout.js`
- **Instructions d'exécution :** Nouvel écran avec une `FlatList` verticale `pagingEnabled` (ou `snapToInterval` = hauteur d'écran), chaque item plein écran contenant une vidéo (`useVideoPlayer`/`VideoView`) chargée depuis `GET /api/videos/feed`. Ne lire automatiquement que la vidéo actuellement visible à l'écran (via `onViewableItemsChanged` de `FlatList`), mettre les autres en pause — comportement attendu d'un feed type Reels, et nécessaire pour ne pas jouer plusieurs vidéos en simultané. Écouter le statut de lecture pour afficher le bouton produit superposé pendant l'intervalle tagué correspondant (même logique de recherche de tag que l'Étape 22), navigant vers `/product/:id` au tap. Enregistrer l'écran comme nouvel onglet dans `_layout.js` (ajout aux objets `ICONS`/`LABELS` existants et à la liste des `Tabs.Screen`).
- **Critères de validation :** Le nouvel onglet apparaît dans la barre de navigation mobile ; y défiler verticalement joue une vidéo à la fois (les autres en pause) ; le bouton produit apparaît/disparaît selon l'intervalle tagué et ouvre la fiche produit au tap.
- **Statut :** [ ] Non commencé

---

## Hors périmètre d'exécution (décisions produit/budget, pas techniques)

Ces points, explicitement soulevés comme des hypothèses ouvertes par le cahier des charges lui-même, ne sont pas traités par les étapes ci-dessus et nécessitent un arbitrage séparé avant tout travail technique supplémentaire :

- **Compression/streaming adaptatif vidéo** (cahier §5.1, §11) : arbitrage entre un service de streaming tiers et un traitement interne (ex. transcodage `ffmpeg` avant stockage R2), selon le budget technique disponible — aucune des deux options n'est implémentée par cette roadmap (stockage passthrough uniquement, identique au comportement déjà en place pour `Product.videoUrl`).
- **Bêta fermée du feed vidéo** (cahier §9, §12) : recommandation de tester avec un groupe restreint de boutiques volontaires avant généralisation — décision de rollout, pas une étape de code ; peut se traduire techniquement par une simple restriction manuelle côté admin (ne pas approuver de vidéos hors du groupe pilote) sans développement dédié.
- **Correction manuelle du point sur la carte** pour la précision d'adresse en zone dense (cahier §11) : nécessiterait l'intégration d'une librairie de carte interactive (aucune actuellement dans les dépendances web ou mobile) — non inclus dans la Phase A, qui se limite à la saisie texte + coordonnées déjà supportée par le modèle `Address` existant.
