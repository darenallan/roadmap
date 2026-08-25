# Sanhia — Roadmap V1.7

> Généré à partir de l'audit technique du code actuel face au cahier des charges V1.7
> (`Sanhia_Cahier_des_charges_V1.7.md`) : portail web coordinateur logistique, sécurisation
> de la remise de commande par code de retrait.
> Chaque étape est atomique (15-30 min), séquentielle, et se termine par un critère de validation vérifiable.
> Cocher `[x]` la case Statut une fois l'étape terminée ET son critère de validation vérifié — pas avant.

**Convention de chemins** : `server-sanhia/` = backend, `sanhia-web/` = web, `sanhia-mobile/` = mobile (React Native/Expo Router).

**Ordre des phases** : conforme à l'ordre recommandé par le cahier des charges lui-même (section 9) — backend, puis portail coordinateur, puis application boutique.

---

## Constats de l'audit (à lire avant d'exécuter)

Sept écarts entre les hypothèses du cahier des charges et l'état réel du code, qui ont un impact direct sur le contenu des étapes ci-dessous :

1. **Le rôle « coordinateur_logistique » doit devenir `COORDINATOR`.** Le cahier (§8) propose une valeur de rôle en français snake_case, mais l'enum Prisma `Role` existant est strictement anglais majuscule (`BUYER, SELLER, ADMIN, DELIVERY`). Pour rester cohérent avec l'existant plutôt qu'avec la lettre du cahier, cette roadmap ajoute `COORDINATOR`.

2. **« Ajout d'un champ à l'écran Commandes reçues existant » est trompeur — cet écran est aujourd'hui 100 % en lecture seule, sur mobile ET sur web.** `sanhia-mobile/app/(seller)/orders.js` et l'onglet Commandes de `sanhia-web/src/pages/Seller.jsx` affichent uniquement la liste et le statut — zéro bouton d'action. Un grep sur tout le frontend (web + mobile) confirme que `PATCH /api/orders/:id/status` (la transition `CONFIRMED → SHIPPED` déjà codée côté backend, `SELLER_TRANSITIONS`) n'est appelée **nulle part**. Ce n'est donc pas un ajout de champ à une action existante, mais la construction complète d'une action de bout en bout qui n'existe encore sur aucune des deux plateformes.

3. **Un système de livraison interne complet et déjà fonctionnel existe (rôle `DELIVERY`).** Marketplace de missions (`GET /api/delivery/marketplace`), écrans mobile dédiés (`app/(delivery)/`), flux `accept → pickup → in-transit → confirm`, avec sa propre machine à états sur `Livraison.status` (`WAITING_PICKUP → ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED/FAILED`). Ceci contredit la prémisse du cahier (« la V1 externalise la livraison... sans intégration API directe »). Conformément aux recommandations finales du cahier lui-même (« ne pas reconsidérer le périmètre de la V1.5 ou de la V2 »), cette roadmap **ne touche pas** au flux livreur existant : la clôture côté coordinateur est un **second mécanisme, parallèle**, qui écrit directement sur `Order.status`/`Livraison.status` sans passer par le marketplace de missions. Les deux coexisteront.

4. **Aucune authentification email/mot de passe n'existe aujourd'hui côté web.** `AuthContext.jsx` n'expose que `sendOtp`/`confirmOtp` (téléphone, Firebase Phone Auth). Le compte `ADMIN` est pourtant déjà créé avec email + mot de passe (`scripts/create-users.js`), mais rien dans l'UI web actuelle ne permet de s'authentifier ainsi — l'admin n'a, à ce jour, aucun moyen confirmé de se connecter à `/admin` via un formulaire. Construire l'auth email/mot de passe pour le coordinateur (cahier §5.1, explicite : « authentification dédiée par identifiants ») est donc un vrai chantier neuf, pas une adaptation d'existant.

5. **Un patron de provisioning existe déjà et sera réutilisé tel quel.** `POST /api/admin/create-seller` (email + mot de passe, Firebase + Prisma, déjà branché à un formulaire dans `Admin.jsx`) est exactement le patron à reproduire pour créer un compte coordinateur. `POST /api/admin/certify-delivery` confirme le même schéma pour un provisioning côté admin, formulaire inclus.

6. **La localisation client précise est déjà disponible** grâce à la Phase A de la roadmap V1.5 (`Order.addressLabel/addressText/addressLat/addressLng`, snapshot pris à la commande). Rien à construire côté adresse — seulement à l'exposer au coordinateur. La localisation boutique reste limitée à la ville (`Shop.city`, pas de lat/lng boutique en base) : cohérent avec l'existant, pas une régression introduite par cette roadmap.

7. **`DELETE /api/admin/users/:id` est un hard delete** (suppression Postgres + Firebase), pas une désactivation douce. Le cahier (§5.5, §11) demande un accès « révocable rapidement » — le hard-delete existant suffit techniquement à cette exigence minimale (le compte disparaît immédiatement), mais reste irréversible. Construire un mécanisme de suspension/réactivation dédié n'est pas explicitement demandé par le cahier et n'est pas inclus dans cette roadmap.

---

## Phase A — Backend : rôle coordinateur, code de retrait, actions de collecte et clôture

> Ordre conforme à la recommandation du cahier (§9, étape 1) : fondations avant toute interface.

### Étape 1 : Ajouter le rôle `COORDINATOR` et les champs de code de retrait (migration Prisma)
- **Objectif :** Donner au schéma les moyens de représenter un coordinateur logistique et de tracer le code de retrait d'une commande.
- **Fichiers impactés :** `server-sanhia/prisma/schema.prisma`
- **Instructions d'exécution :** Ajouter `COORDINATOR` à `enum Role`. Sur `model Livraison`, ajouter `codeRetrait String?` et `coordinatorId String?` avec la relation `coordinator User? @relation("CoordinatorUser", fields: [coordinatorId], references: [id])` (nom de relation distinct de `"DeliveryUser"` déjà utilisée par `deliveryUserId` sur ce même modèle). Ajouter la relation inverse `coordinatedDeliveries Livraison[] @relation("CoordinatorUser")` sur `model User`, à côté de `deliveries Livraison[] @relation("DeliveryUser")` déjà existante. Appliquer avec `npx prisma db push` (jamais `migrate dev` — voir précédent établi sur ce projet).
- **Critères de validation :** `npx prisma db push` s'exécute sans erreur ; les nouvelles colonnes sont visibles et nullables sur `Livraison` (`information_schema` ou `prisma studio`) ; `COORDINATOR` accepté comme valeur de `role` sur un `User` de test.
- **Statut :** [ ] Non commencé

### Étape 2 : Middleware `verifyCoordinator` + génération du code de retrait
- **Objectif :** Restreindre les futures routes coordinateur au rôle `COORDINATOR`, et générer un code de retrait unique dès la création de la `Livraison`.
- **Fichiers impactés :** `server-sanhia/middleware/verifyCoordinator.js` (nouveau), `server-sanhia/routes/admin.routes.js`
- **Instructions d'exécution :** Créer `verifyCoordinator.js` sur le modèle exact de `middleware/verifyDelivery.js` (charge l'utilisateur, vérifie `role === 'COORDINATOR'`, pose `req.coordinatorUser`, 403 sinon). Dans `admin.routes.js`, ajouter une fonction locale `generateCodeRetrait()` : 5 caractères alphanumériques majuscules, alphabet sans caractères ambigus (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — pas de `O/0` ni `I/1`, code destiné à être lu à voix haute ou recopié depuis WhatsApp). Vérifier l'unicité par une boucle `do/while` interrogeant `prisma.livraison.findFirst({ where: { codeRetrait, status: { notIn: ['DELIVERED', 'FAILED'] } } })`, en régénérant en cas de collision. Câbler l'appel de cette fonction aux **deux** points existants de création de `Livraison` (`PATCH /orders/:id/approve` et `PATCH /payments/:id/validate`, Étape 6 de la roadmap V1.5) en ajoutant `codeRetrait: generateCodeRetrait()` aux données de création.
- **Critères de validation :** Approuver une commande ou valider un paiement (flux existant, inchangé pour le reste) crée désormais une `Livraison` avec un `codeRetrait` de 5 caractères renseigné ; deux commandes approuvées à la suite ont des codes différents.
- **Statut :** [ ] Non commencé

### Étape 3 : Route de collecte boutique (`PATCH /api/orders/:id/collect`)
- **Objectif :** Permettre à la boutique de valider la collecte du colis par le livreur en saisissant le code de retrait, faisant basculer la commande de « préparée » à « en livraison ».
- **Fichiers impactés :** `server-sanhia/routes/orders.js`
- **Instructions d'exécution :** Ajouter `PATCH /api/orders/:id/collect`, protégée par `verifyToken`. Body : `{ codeRetrait }`. Charger la commande avec ses `items.product.shop` (même pattern IDOR que `PATCH /:id/status` : `order.items.some(i => i.product.shop.ownerId === req.user.uid)`, 403 sinon). Vérifier `order.status === 'CONFIRMED'` (409 sinon, message clair). Charger la `Livraison` liée (`orderId`), comparer `codeRetrait` fourni au `livraison.codeRetrait` enregistré — comparaison stricte, insensible à la casse (le champ peut être ressaisi manuellement) ; 400 avec message clair si le code ne correspond pas, **sans bloquer de nouvelles tentatives** (US-V1.7-02, 2ème critère — donc pas de compteur de tentatives/verrouillage dans cette étape). Si le code correspond, transaction : `Order.status → SHIPPED`, `Livraison.status → PICKED_UP`, `Livraison.pickedUpAt → now()`.
- **Critères de validation :** Saisir le bon code sur une commande `CONFIRMED` fait basculer son statut à `SHIPPED` et la `Livraison` à `PICKED_UP` ; un code incorrect renvoie 400 sans changer aucun statut, et une nouvelle tentative reste possible immédiatement après ; une boutique qui ne possède pas la commande reçoit 403.
- **Statut :** [ ] Non commencé

### Étape 4 : Routes coordinateur (liste, détail, clôture)
- **Objectif :** Exposer aux coordinateurs les commandes en cours avec leurs informations de livraison, et l'action de clôture finale.
- **Fichiers impactés :** `server-sanhia/routes/coordinator.routes.js` (nouveau), `server-sanhia/index.js`
- **Instructions d'exécution :** Nouveau routeur, `router.use(verifyToken, verifyCoordinator)` en tête (même pattern que `admin.routes.js`). Ajouter `GET /orders` : commandes `status IN [CONFIRMED, SHIPPED]` (« commandes en cours », toutes zones confondues — pas de pagination pour cette version, volume de lancement faible), incluant `user: {displayName, phone}`, `addressLabel/addressText/addressLat/addressLng` (déjà sur `Order`), `items[0].product.shop: {name, city}`, sans le `codeRetrait` (visible seulement au détail, US-V1.7-01 3ème critère). Ajouter `GET /orders/:id` : même commande, cette fois avec `livraison.codeRetrait` inclus. Ajouter `PATCH /orders/:id/close` : vérifie `order.status === 'SHIPPED'` (409 sinon, US-V1.7-03 1er critère), transaction `Order.status → DELIVERED`, `Livraison.status → DELIVERED`, `Livraison.deliveredAt → now()`, `Livraison.coordinatorId → req.user.uid`. Monter ce routeur dans `index.js` : `app.use('/api/coordinator', require('./routes/coordinator.routes'));`.
- **Critères de validation :** `GET /api/coordinator/orders` renvoie les commandes `CONFIRMED`/`SHIPPED` sans code de retrait ; `GET /api/coordinator/orders/:id` inclut le code ; `PATCH /.../close` sur une commande `SHIPPED` bascule son statut à `DELIVERED` et renseigne `coordinatorId` ; la même action sur une commande encore `CONFIRMED` (pas encore collectée) est rejetée en 409 ; un compte non-coordinateur reçoit 403.
- **Statut :** [ ] Non commencé

### Étape 5 : Provisioning admin d'un compte coordinateur
- **Objectif :** Permettre à un administrateur Sanhia de créer un compte coordinateur (email + mot de passe), sans script CLI.
- **Fichiers impactés :** `server-sanhia/routes/admin.routes.js`
- **Instructions d'exécution :** Ajouter `POST /api/admin/create-coordinator`, exactement sur le modèle de `POST /api/admin/create-seller` déjà existant (body `{name, email, phone, password}`, `admin.auth().createUser({email, password, displayName: name})` puis `prisma.user.create({..., role: 'COORDINATOR'})`).
- **Critères de validation :** `POST /api/admin/create-coordinator` avec des identifiants valides crée un compte Firebase + une ligne `User` avec `role: 'COORDINATOR'` ; le compte ainsi créé peut obtenir un token Firebase valide (vérifiable via `firebase.auth().signInWithEmailAndPassword` en local ou équivalent).
- **Statut :** [ ] Non commencé

---

## Phase B — Portail web coordinateur

> Le cahier est explicite (§6, point d'attention) : cette interface n'a pas besoin d'être mobile-first — priorité à la clarté et à la rapidité d'accès, pas à l'esthétique.

### Étape 6 : Authentification email/mot de passe dans `AuthContext.jsx`
- **Objectif :** Donner à l'application web la capacité de connecter un utilisateur par identifiants (email + mot de passe), inexistante à ce jour.
- **Fichiers impactés :** `sanhia-web/src/context/AuthContext.jsx`
- **Instructions d'exécution :** Ajouter une méthode `loginWithEmail(email, password)` exposée par le contexte, utilisant `signInWithEmailAndPassword` (import depuis `firebase/auth`, déjà une dépendance du projet). En mode mock (`isMockMode`), simuler une connexion réussie sans appel réseau (même esprit que le mock OTP existant), pour ne pas casser le mode sandbox de ce projet. `onIdTokenChanged` déjà en place capte automatiquement la session résultante — aucune autre modification de la logique d'écoute d'état n'est nécessaire.
- **Critères de validation :** Depuis la console du navigateur ou un test manuel, `loginWithEmail(email, password)` avec les identifiants du compte créé à l'Étape 5 authentifie l'utilisateur et peuple `user`/`token` du contexte.
- **Statut :** [ ] Non commencé

### Étape 7 : Écran de connexion coordinateur + garde de route
- **Objectif :** Donner au coordinateur un point d'entrée dédié, distinct de l'authentification téléphone client/boutique.
- **Fichiers impactés :** `sanhia-web/src/pages/CoordinatorLogin.jsx` (nouveau), `sanhia-web/src/App.jsx`
- **Instructions d'exécution :** Nouvelle page avec un formulaire email + mot de passe simple, appelant `loginWithEmail` (Étape 6), redirection vers `/coordinator` en cas de succès. Ajouter la route publique `/coordinator/login`. Ajouter un composant `CoordinatorRoute` dans `App.jsx`, sur le modèle exact d'`AdminRoute` (vérifie `role === 'COORDINATOR'` via `GET /api/users/me`), redirigeant vers `/coordinator/login` (pas `/auth`, qui est le flux téléphone) si non authentifié ou mauvais rôle.
- **Critères de validation :** Se connecter avec un compte `COORDINATOR` depuis `/coordinator/login` redirige vers `/coordinator` ; un compte d'un autre rôle tentant d'accéder à `/coordinator` est redirigé ailleurs (comportement `AdminRoute` reproduit).
- **Statut :** [ ] Non commencé

### Étape 8 : Liste des commandes en cours (avec rafraîchissement automatique)
- **Objectif :** Donner au coordinateur une vue centralisée des commandes à traiter, avec un signal visible sur les nouvelles arrivées, sans WebSockets (choix explicite du cahier §5.2).
- **Fichiers impactés :** `sanhia-web/src/pages/Coordinator.jsx` (nouveau)
- **Instructions d'exécution :** Nouvelle page, layout simple orienté back-office (peut s'inspirer de la structure `admin.css`/`seller.css` existante — tableau + carte — sans reproduire leur sidebar complète, cette interface étant plus restreinte en fonctionnalités). Charger `GET /api/coordinator/orders` avec un rafraîchissement automatique toutes les 5 à 10 secondes (`setInterval` ou équivalent — pas de dépendance nouvelle). Afficher pour chaque commande : référence, statut, localisation client (ville/label), localisation boutique (ville), contact client. Signal visuel sur une commande apparue depuis le dernier rafraîchissement (comparaison des identifiants entre deux cycles de poll — un simple badge « Nouveau » ou surbrillance suffit, pas de son ni de notification système). Route protégée `/coordinator` via `CoordinatorRoute` (Étape 7).
- **Critères de validation :** `/coordinator` affiche la liste des commandes `CONFIRMED`/`SHIPPED` réelles ; créer une nouvelle commande éligible côté backend la fait apparaître avec le signal « nouveau » dans les 10 secondes, sans rechargement manuel de la page.
- **Statut :** [ ] Non commencé

### Étape 9 : Détail commande et action de clôture
- **Objectif :** Donner accès aux informations complètes d'une commande (localisations précises, contacts, code de retrait) et permettre la clôture finale.
- **Fichiers impactés :** `sanhia-web/src/pages/Coordinator.jsx`
- **Instructions d'exécution :** Au clic sur une commande de la liste (Étape 8), afficher un panneau ou une modale de détail chargeant `GET /api/coordinator/orders/:id` : localisation client précise (label + coordonnées si disponibles), localisation boutique, téléphones, et le **code de retrait** en évidence. Bouton « Clôturer la commande », actif uniquement si `status === 'SHIPPED'` (US-V1.7-03, 1er critère), appelant `PATCH /api/coordinator/orders/:id/close` ; succès → mise à jour immédiate de la liste (retrait ou changement de statut affiché) sans attendre le prochain cycle de poll.
- **Critères de validation :** Ouvrir le détail d'une commande `SHIPPED` affiche son code de retrait et propose la clôture ; cliquer sur « Clôturer » fait passer la commande à `DELIVERED` (visible immédiatement dans l'interface coordinateur) ; le bouton de clôture est absent ou désactivé sur une commande encore `CONFIRMED`.
- **Statut :** [ ] Non commencé

### Étape 10 : Formulaire de création de coordinateur (admin)
- **Objectif :** Donner à l'admin un moyen de provisionner un coordinateur sans passer par un script CLI, cohérent avec l'existant.
- **Fichiers impactés :** `sanhia-web/src/pages/Admin.jsx`
- **Instructions d'exécution :** Ajouter un formulaire (nom, email, téléphone, mot de passe) sur le modèle exact du formulaire `createSeller`/`certifyDelivery` déjà présent dans ce fichier, soumettant vers `POST /api/admin/create-coordinator` (Étape 5). Emplacement suggéré : à côté des formulaires existants de création vendeur/certification livreur, dans la même section de l'onglet concerné.
- **Critères de validation :** Créer un coordinateur depuis `/admin` aboutit à un compte utilisable pour se connecter sur `/coordinator/login` (Étape 7) dans la foulée.
- **Statut :** [ ] Non commencé

---

## Phase C — Application boutique : saisie du code de retrait

> Construction complète de bout en bout, pas un ajout ponctuel — voir constat n°2 en tête de document.

### Étape 11 : Saisie du code de retrait (mobile, écran Commandes reçues)
- **Objectif :** Permettre à la boutique de valider la collecte depuis l'app mobile.
- **Fichiers impactés :** `sanhia-mobile/app/(seller)/orders.js`
- **Instructions d'exécution :** Sur chaque commande au statut `CONFIRMED`, afficher un champ de saisie (`TextField`, majuscule automatique) + bouton « Confirmer la collecte », appelant `PATCH /api/orders/:id/collect` (Étape 3) avec le code saisi. Message d'erreur clair en cas de code incorrect (`Alert.alert`, pattern déjà utilisé ailleurs dans ce fichier/dossier), sans bloquer une nouvelle tentative. Rafraîchir la liste (invalidation react-query) après succès pour refléter le nouveau statut `SHIPPED`.
- **Critères de validation :** Depuis l'app mobile vendeur, saisir le bon code sur une commande `CONFIRMED` la fait passer à `SHIPPED` dans la liste ; un code incorrect affiche une erreur et permet de ressaisir immédiatement.
- **Statut :** [ ] Non commencé

### Étape 12 : Saisie du code de retrait (web, onglet Commandes vendeur)
- **Objectif :** Porter la même action côté web, sur le dashboard vendeur.
- **Fichiers impactés :** `sanhia-web/src/pages/Seller.jsx`
- **Instructions d'exécution :** Même traitement que l'Étape 11, sur l'onglet « Commandes » existant du dashboard vendeur : champ de saisie + bouton visibles uniquement sur les commandes `CONFIRMED`, appelant `PATCH /api/orders/:id/collect`, rafraîchissement de la liste après succès.
- **Critères de validation :** Depuis `/seller` (onglet Commandes), saisir le bon code sur une commande `CONFIRMED` la fait passer à `SHIPPED`, visible sans rechargement de page.
- **Statut :** [ ] Non commencé

---

## Hors périmètre d'exécution (décisions produit/contractuelles, pas techniques)

Ces points, explicitement soulevés par le cahier des charges lui-même comme hors périmètre ou non tranchés, ne sont pas traités par les étapes ci-dessus :

- **Zonage et répartition multi-coordinateurs** (cahier §2.1, §11) : explicitement reporté à une version ultérieure par le cahier lui-même (« notamment lorsque Sanhia opérera sa propre logistique (V3) ») — non implémenté ici, au-delà du fait que le schéma (`Livraison.zone` déjà existant depuis la V1.5) n'empêche pas cette évolution plus tard.
- **Renvoi automatique du code de retrait perdu** (cahier §2.3) : délibérément écarté par le cahier lui-même (« évite d'introduire une faille de sécurité... au prix d'un simple appel téléphonique ») — non implémenté, conforme à cette décision.
- **Preuve numérique de remise finale** (photo, signature — cahier §2.4, §11) : explicitement hors périmètre du cahier, repose sur la vérification d'identité des livreurs et les contrats du partenaire.
- **Formation du coordinateur et accord de confidentialité formel** (cahier §9 étape 5, §11) : processus humain/contractuel entre Sanhia et le partenaire logistique, pas une tâche de code.
- **Clarification de la prise en charge financière du temps de travail du coordinateur** (cahier §10) : hypothèse explicitement non tranchée par le cahier, à valider avec le partenaire avant tout arbitrage technique éventuel.
- **Mécanisme de suspension/réactivation dédié pour un compte coordinateur** (au-delà du hard-delete déjà existant, `DELETE /api/admin/users/:id`) : non explicitement demandé par le cahier (« révocable rapidement » est déjà satisfait techniquement par la suppression existante) — voir constat n°7.
