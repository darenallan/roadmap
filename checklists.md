# Checklist de test — site web Sanhia

> Chaque module porte un tag `[rôle]` en fin de titre : seuls ces rôles le voient (admin et testeur voient tout). Sans tag, le module est visible par tout le monde.

Pour chaque ligne : coche `[x]` si c'est bon. Sinon, envoie-moi le **numéro** (ex. `C3.2`) avec ce
que tu as vu (message d'erreur, capture, ce qui était attendu). On corrige section par section.

Teste chaque page **sur ordinateur et sur téléphone** (ou fenêtre réduite à ~390 px de large).
Sur chaque page, vérifie aussi : pas de page blanche, pas de texte qui déborde, pas d'image cassée.

---

## 0. Préparation

- [ ] 0.1 Backend relancé avec le dernier code : `cd server-sanhia` puis `node index.js` (port 5050)
- [ ] 0.2 Site lancé : `cd sanhia-web` puis `npm run dev`, ouvrir http://localhost:5173
- [ ] 0.3 Page blanche ? → relancer avec `$env:NODE_ENV="development"; npm run dev` (PowerShell)
- [ ] 0.4 Numéros de test Firebase créés (console Firebase → Authentication → Phone → numéros de
      test) : un **client**, un **vendeur**, un **livreur**
- [ ] 0.5 Compte admin disponible

---

## A. Pages publiques (sans être connecté) [acheteur]

**A1 — Accueil `/`**
- [ ] A1.1 La page charge, les sections s'affichent dans l'ordre (héro, catégories, produits, boutiques…)
- [ ] A1.2 Les produits et boutiques affichés sont réels (pas de faux chiffres)
- [ ] A1.3 Les liens et boutons mènent à la bonne page
- [ ] A1.4 Aucune boutique suspendue ni sans abonnement n'apparaît

**A2 — En-tête et pied de page (toutes les pages)**
- [ ] A2.1 Menu, logo, panier (compteur), favoris fonctionnent
- [ ] A2.2 Recherche : taper « robe » → suggestions en direct (5 max)
- [ ] A2.3 Recherche avec une faute (« chemize ») → le bon produit sort quand même
- [ ] A2.4 Entrée dans la recherche → ouvre le catalogue filtré
- [ ] A2.5 Menu mobile (burger) s'ouvre et se ferme
- [ ] A2.6 Liens du pied de page (CGU, contact, à propos…) fonctionnent

**A3 — Catalogue `/catalogue` et `/catalogue/:categorie`**
- [ ] A3.1 Liste de produits réels
- [ ] A3.2 Filtres : catégorie, prix min/max, ville, note, promo, **En stock**
- [ ] A3.3 Tri (récents, prix, popularité)
- [ ] A3.4 Pagination ou chargement de la suite
- [ ] A3.5 Ouvrir une catégorie depuis l'accueil → bon filtre appliqué
- [ ] A3.6 Recherche sans résultat → message clair

**A4 — Recherche par photo `/recherche-photo`**
- [ ] A4.1 Envoi d'une photo → produits ressemblants (ou message « indisponible » propre)
- [ ] A4.2 Fichier non image ou trop lourd → message d'erreur clair

**A5 — Fiche produit `/product/:id`**
- [ ] A5.1 Galerie photos (défilement, zoom), vue 3D si disponible
- [ ] A5.2 Produit avec vidéo : vidéo avec image d'aperçu, **ne se charge qu'au clic sur lecture**
- [ ] A5.3 Prix, stock (« En stock », « Plus que N », « Épuisé »)
- [ ] A5.4 Choix des variantes (taille, couleur) si le produit en a
- [ ] A5.5 Produit « sur commande / à confirmer » : mention visible, ajout au panier possible même à stock 0
- [ ] A5.6 Mentions « la couleur peut varier » / « fabriqué à la commande » / délai, selon le produit
- [ ] A5.7 Ajouter au panier, ajouter aux favoris
- [ ] A5.8 Bouton WhatsApp de la boutique (ouvre WhatsApp avec le bon numéro)
- [ ] A5.9 Avis clients réels (ou « Aucun avis pour le moment »)
- [ ] A5.10 Produits similaires ; en cliquer un → la nouvelle fiche s'ouvre **en haut de page**
- [ ] A5.11 Produit d'une boutique suspendue → introuvable

**A6 — Boutiques `/boutiques` et boutique `/boutique/:id`**
- [ ] A6.1 Liste des boutiques actives seulement
- [ ] A6.2 Page boutique : bannière, logo, compteurs réels (produits, abonnés…)
- [ ] A6.3 Navigation interne (Produits / Notre histoire / Avis / Contact) fait défiler la page
- [ ] A6.4 Suivre / ne plus suivre la boutique
- [ ] A6.5 Contact → messagerie (ou page de connexion si non connecté)

**A7 — Fil `/feed`**
- [ ] A7.1 Fil mode + alimentation, vidéos lues correctement
- [ ] A7.2 Like, produits liés à une vidéo cliquables

**A8 — Pages d'information**
- [ ] A8.1 `/about` : contenu, liens
- [ ] A8.2 `/contact` : formulaire envoie, email affiché `contact@sanhia.bf`
- [ ] A8.3 `/informations` : onglets FAQ, CGU & CGV, Mentions, Confidentialité
- [ ] A8.4 FAQ : la recherche filtre les questions
- [ ] A8.5 CGU : **9 articles**, l'article 09 « Photos et fiches envoyées par les Vendeurs » est présent, date « 10 Octobre 2026 »
- [ ] A8.6 Lien direct `/informations#cgu` ouvre l'onglet CGU

**A9 — Pages d'erreur**
- [ ] A9.1 Adresse inconnue (ex. `/nimporte`) → page 404 propre
- [ ] A9.2 `/admin` sans être admin → page « accès refusé » ou connexion

---

## B. Connexion

- [ ] B1 `/auth` : saisie du numéro, réception du code (numéro de test), connexion
- [ ] B2 Mauvais code → message d'erreur clair
- [ ] B3 `/login` et `/register` redirigent vers le bon parcours
- [ ] B4 Déconnexion depuis le profil
- [ ] B5 Après connexion, retour sur la page demandée avant (ex. panier)

---

## C. Client connecté [acheteur]

**C1 — Panier `/cart`**
- [ ] C1.1 Panier utilisable **sans être connecté**
- [ ] C1.2 Modifier les quantités (bloqué au stock, sauf produits « sur commande »), supprimer
- [ ] C1.3 Panier d'une seule boutique : ajout d'un produit d'une autre boutique → message clair
- [ ] C1.4 Code promo (valide, invalide, expiré)
- [ ] C1.5 Frais de livraison, livraison offerte au-delà du seuil
- [ ] C1.6 Se connecter → le panier invité est conservé et fusionné avec celui du compte
- [ ] C1.7 Panier retrouvé sur un autre navigateur / le téléphone avec le même compte

**C2 — Commande `/checkout`**
- [ ] C2.1 Choix ou ajout d'une adresse (avec position sur la carte)
- [ ] C2.2 Récapitulatif correct (articles, livraison, total)
- [ ] C2.3 Validation → page de paiement

**C3 — Paiement `/payment/:orderId`**
- [ ] C3.1 Numéros Orange Money / Moov Money affichés
- [ ] C3.2 Envoi de la référence + capture du reçu → « en attente de validation »
- [ ] C3.3 Sans capture ou sans référence → refus clair
- [ ] C3.4 Pas d'option carte bancaire
- [ ] C3.5 Paiement à la livraison proposé seulement si activé par l'admin

**C4 — Après commande**
- [ ] C4.1 `/order-confirmation/:id` : récapitulatif
- [ ] C4.2 `/order/:id` : détail, statut ; commande « à confirmer par la boutique » → note visible
- [ ] C4.3 `/order/:id/suivi` : étapes de la commande
- [ ] C4.4 `/invoice/:id` : facture lisible et imprimable
- [ ] C4.5 Annuler une commande encore en attente
- [ ] C4.6 Laisser un avis sur une commande livrée

**C5 — Profil `/profile`** (onglets)
- [ ] C5.1 En-tête : nom, numéro, rôle, **solde de points de fidélité**
- [ ] C5.2 Photo de profil : changement
- [ ] C5.3 Mes commandes : liste réelle, statuts
- [ ] C5.4 Favoris : liste, retrait ; favoris retrouvés sur un autre appareil
- [ ] C5.5 Mes adresses : ajouter, modifier, supprimer, position GPS
- [ ] C5.6 Messages : conversations
- [ ] C5.7 Profil : modifier le nom
- [ ] C5.8 Sécurité : suppression du compte en 2 étapes (Annuler ne supprime rien)

**C6 — Autres pages client**
- [ ] C6.1 `/wishlist` : favoris
- [ ] C6.2 `/messages` : envoyer / recevoir un message avec une boutique
- [ ] C6.3 `/notifications` : liste, lien vers la bonne page
- [ ] C6.4 Produits vus récemment : affichés et conservés d'un appareil à l'autre

**C7 — Devenir vendeur**
- [ ] C7.1 `/seller/onboarding` : texte abonnement (5 000 F/mois, 0 % de commission, offre fondateurs)
- [ ] C7.2 `/seller/application` : formulaire en étapes, envoi du logo et des documents
- [ ] C7.3 Mention CGU (article 9) au-dessus de « Soumettre le dossier », le lien ouvre les CGU
- [ ] C7.4 Dossier envoyé → message de confirmation

---

## D. Vendeur `/seller` (onglets) [vendeur]

- [ ] D1 **Tableau de bord** : chiffres réels
- [ ] D2 **Mes résultats** : périodes 30 j / 3 mois / 12 mois ; CA, commandes, visites, vues, clics WhatsApp, ajouts au panier
- [ ] D3 **Clients WhatsApp** : liste vide propre (« Aucune conversation pour le moment »)
- [ ] D4 **Commandes reçues** : liste ; commande « à confirmer » → boutons « Confirmer la disponibilité » / « Indisponible »
- [ ] D5 **Mes produits** : ajout d'un produit (photos, prix, stock, catégorie)
  - [ ] D5.1 Champs « Gestion du stock » (suivi / sur commande), « Politique de variantes », « Délai »
  - [ ] D5.2 Vidéo : MP4 de **moins de 30 s** acceptée ; **plus de 30 s refusée** avec message ; plus de 15 Mo refusée
  - [ ] D5.3 Modifier, supprimer, réordonner les photos
- [ ] D6 **Ma boutique** : logo, bannière, textes, couleurs, enregistrement
- [ ] D7 **Mon numéro WhatsApp** (dans Ma boutique)
  - [ ] D7.1 « Lier un numéro » → code `LIER-xxxxxx` + numéro Sanhia affichés
  - [ ] D7.2 Numéro lié affiché masqué, retrait possible, 3 numéros maximum
  - [ ] D7.3 Interrupteurs « Mettre en ligne dès que je réponds OUI » et « Donner mon numéro aux clients » : changent et restent après rechargement
  - [ ] D7.4 Lien client `wa.me/…` affiché (seulement si le numéro Sanhia est configuré)
- [ ] D8 **Abonnement** : statut (essai, actif, en retard…), date d'échéance, rang fondateur, historique des paiements, numéro de paiement +226 64 50 26 26
- [ ] D9 **Stories** : publier, supprimer
- [ ] D10 **Vidéos** : publier, associer des produits
- [ ] D11 **Messages clients** : répondre

---

## E. Admin `/admin` (onglets) [admin]

- [ ] E1 **Vue globale** : chiffres réels
- [ ] E2 **Commandes** : liste, approuver une commande en paiement à la livraison
- [ ] E3 **Paiements** : voir la capture, **valider** → commande confirmée, livraison créée, vendeur et client notifiés, points de fidélité crédités au client (vérifier en C5.1)
- [ ] E4 **Paiements** : **rejeter** avec motif → le client peut renvoyer
- [ ] E5 **Candidatures** : approuver → boutique active **avec abonnement d'essai** ; refuser
- [ ] E6 **Créer Vendeur / Certifier Livreur / Créer Coordinateur / Comptes**
- [ ] E7 **Boutiques** : liste, suspendre / réactiver
- [ ] E8 **Abonnements** : filtres, résumé ; « Marquer payé » (référence obligatoire, refus si déjà utilisée) ; prolonger l'essai ; suspendre ; réactiver
- [ ] E9 **Produits, Modèles 3D, Vidéos** : modération
- [ ] E10 **Codes Promo, Newsletter, Messagerie**
- [ ] E11 **Paiement à la livraison** (activer jusqu'à une date) et **Livraison offerte** (seuil)

---

## F. Livreur et coordinateur [livreur, coordinateur]

- [ ] F1 `/delivery` : missions disponibles, prise en charge, code de retrait, livraison
- [ ] F2 `/coordinator/login` : bon et mauvais mot de passe
- [ ] F3 `/coordinator` : tableau de bord

---

## G. Parcours complet (à faire à la fin)

- [ ] G1 Client : ajoute 2 produits d'une boutique → commande → paiement Orange Money avec capture
- [ ] G2 Admin : valide le paiement
- [ ] G3 Vendeur : voit la commande, la prépare ; ses résultats montrent la vente
- [ ] G4 Livreur : récupère avec le code et livre
- [ ] G5 Client : commande « livrée », laisse un avis, points de fidélité affichés
- [ ] G6 Produit « sur commande » : commande « à confirmer » → vendeur confirme → paiement possible

---

# Application mobile (Android)

Mêmes règles : numéro de ligne (ex. `MC2`) + ce que tu as vu, capture si possible.
Vérifie aussi sur chaque écran : rien de coupé, clavier qui ne cache pas les champs, bouton
retour Android qui revient au bon écran, pas d'écran rouge d'erreur.

## M0. Préparation

- [ ] M0.1 Backend relancé (comme 0.1) ; téléphone et PC sur le **même Wi-Fi**
- [ ] M0.2 Expo lancé : `cd sanhia-mobile` puis `npx expo start --dev-client --lan`
      (si l'API ne répond pas : variable `EXPO_PUBLIC_API_URL=http://<IP du PC>:5050/api`)
- [ ] M0.3 L'app s'ouvre sur le téléphone sans écran rouge

## MA. Écrans publics [acheteur]

- [ ] MA1 Écran d'accueil de connexion : boutons connexion / continuer sans compte
- [ ] MA2 Accueil : sections, produits et boutiques réels, liens
- [ ] MA3 Catalogue : liste, filtres (catégorie, prix, ville, note, promo, **En stock**), tri, recherche
- [ ] MA4 Recherche par photo : appareil photo et galerie, résultats ou message propre
- [ ] MA5 Boutiques : liste ; page boutique : bannière, compteurs réels, suivre, contacter
- [ ] MA6 Stories d'une boutique : défilement, fermeture
- [ ] MA7 Fil vidéo : lecture, like, produits liés
- [ ] MA8 Fiche produit :
  - [ ] MA8.1 Galerie (glisser entre les photos, points), vue 3D si disponible
  - [ ] MA8.2 Produit avec vidéo : photo + bouton « Lire la vidéo », la vidéo ne démarre qu'au toucher
  - [ ] MA8.3 Prix, stock, variantes, mentions « sur commande » / couleur variable / délai
  - [ ] MA8.4 Ajouter au panier (même à stock 0 si « sur commande »), favoris, WhatsApp boutique
  - [ ] MA8.5 Avis, produits similaires
- [ ] MA9 À propos, Contact (envoi du formulaire), Informations : FAQ avec recherche, **CGU avec l'article 09**, date « 10 octobre 2026 »

## MB. Connexion

- [ ] MB1 Saisie du numéro → code (numéro de test) → connexion
- [ ] MB2 Mauvais code → message clair
- [ ] MB3 Déconnexion ; l'app revient à l'écran de connexion
- [ ] MB4 Relancer l'app → toujours connecté

## MC. Client connecté [acheteur]

- [ ] MC1 Panier : utilisable sans compte, quantités, suppression, une seule boutique, code promo, livraison offerte
- [ ] MC2 Panier et favoris **identiques au site** avec le même compte (ajoute sur le site, vérifie sur l'app et inversement)
- [ ] MC3 Adresse de livraison : ajout, position GPS
- [ ] MC4 Paiement : numéros Orange / Moov, référence + photo du reçu, refus si manquant, pas de carte
- [ ] MC5 Confirmation de commande, facture
- [ ] MC6 Mes commandes : liste, détail, statut « à confirmer par la boutique », annulation, avis
- [ ] MC7 Profil : nom, numéro, statistiques (commandes, dépensé), **points de fidélité**, badges
- [ ] MC8 Profil : suppression du compte en 2 étapes (Annuler ne supprime rien)
- [ ] MC9 Mes adresses : ajouter, modifier, supprimer
- [ ] MC10 Favoris, Notifications (le toucher ouvre la bonne page), Messages (envoyer / recevoir)
- [ ] MC11 Bannière « Devenir vendeur » → candidature en étapes, choix du logo, **mention CGU** au-dessus de « Soumettre le dossier », envoi

## MD. Vendeur [vendeur]

- [ ] MD1 Onglet Accueil vendeur : chiffres réels
- [ ] MD2 Onglet Commandes : liste ; commande « à confirmer » → « Confirmer la disponibilité » / « Indisponible »
- [ ] MD3 Onglet Produits : liste ; ajout d'un produit (photos, prix, stock, catégorie, gestion du stock, politique de variantes, délai)
- [ ] MD4 Brouillon produit assisté (nouveau brouillon, discussion) si utilisé
- [ ] MD5 Vidéo produit : **plus de 30 s refusée** avec message
- [ ] MD6 Story : publier ; Vidéos : associer des produits
- [ ] MD7 Réglages → **Mes résultats** : périodes, chiffres
- [ ] MD8 Réglages → **Mon abonnement** : statut, échéance, rang fondateur, paiements, numéro de paiement
- [ ] MD9 Réglages → **Mon numéro WhatsApp** : lier (code `LIER-…`), retirer, les 2 interrupteurs restent après fermeture de l'écran, lien client affiché
- [ ] MD10 Réglages → **Clients WhatsApp** : liste vide propre
- [ ] MD11 Réglages → Messages, Notifications, Se déconnecter

## ME. Livreur [livreur]

- [ ] ME1 Missions disponibles, prise en charge
- [ ] ME2 Mission en cours : code de retrait, livraison
- [ ] ME3 Historique, profil

## MG. Parcours croisés site ↔ mobile

- [ ] MG1 Client commande **sur le mobile** → admin valide **sur le site** → le client voit « confirmée » sur le mobile
- [ ] MG2 Vendeur sur le mobile reçoit la commande et la notification
- [ ] MG3 Livreur livre sur le mobile → client voit « livrée » sur le site
- [ ] MG4 Message envoyé du site → reçu sur le mobile, et inversement

---

## Non testable pour l'instant

Pas besoin de tester : catalogue par WhatsApp, assistant WhatsApp client, rappels et bilan
mensuel WhatsApp (pas de comptes Meta), paiement automatique (pas d'opérateur), appel vocal.
