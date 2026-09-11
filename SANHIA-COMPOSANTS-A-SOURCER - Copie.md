# SANHIA — Checklist composants à sourcer (Web + Mobile)

**Usage :** cherche chaque composant listé "À CHERCHER", dépose le fichier brut dans un seul dossier
`composants/` à la racine du repo (peu importe le nom exact du fichier), donne-moi le dossier — je
l'adapte aux tokens Sanhia (`SANHIA-FIGMA-MASTER-PROMPT.md` Partie J §2) et je le place au bon endroit
(colonne "Destination" ci-dessous). Ne me donne pas de composants déjà marqués **[EXISTE]** — ils sont
déjà codés, resourcer casserait ce qui fonctionne déjà.

**Important — deux méthodes de recherche différentes selon la plateforme :**
- **Web** (`sanhia-web`, React + Vite) : cherche sur un registre web (21st.dev, shadcn/ui, etc.) — ce
  sont des composants React/HTML/CSS, directement compatibles.
- **Mobile** (`sanhia-mobile`, React Native/Expo) : **21st.dev ne convient pas**, ses composants sont
  du HTML/CSS web, pas du React Native. Cherche plutôt sur des registres RN (React Native Reusables,
  gluestack-ui, Tamagui, NativeBase) ou explicitement filtré "React Native" — sinon je devrai le
  réécrire entièrement à la main, ce qui annule le gain de temps.

---

## 1. Navigation & Chrome

| Composant | Plateforme | Statut | Destination |
|---|---|---|---|
| Header/Navbar desktop | Web | À CHERCHER | `sanhia-web/src/components/layout/Header.jsx` *(existe déjà — resourcer seulement si tu veux le remplacer, pas par défaut)* |
| Footer | Web | **[EXISTE]** | `sanhia-web/src/components/layout/Footer.jsx` |
| Bottom Tab Bar (5 items, badge compteur) | Mobile | À CHERCHER | nouveau, `sanhia-mobile/src/components/BottomNavigation.js` |
| Header mobile minimal (localisation + icônes) | Mobile | À CHERCHER | nouveau, `sanhia-mobile/src/components/Header.js` |
| Search bar (vide/focus/résultats/aucun résultat) | Web + Mobile | À CHERCHER | `.../components/ui/SearchBar.jsx` (web) + `.../src/components/SearchBar.js` (mobile) |
| Category nav (chips horizontaux scrollables) | Web + Mobile | À CHERCHER | `.../CategoryNav.jsx` / `.js` |
| Breadcrumb | Web | À CHERCHER | `sanhia-web/src/components/ui/Breadcrumb.jsx` |
| Drawer (menu latéral) | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Drawer.jsx` |
| Bottom Sheet | Mobile | **[EXISTE, partiel]** | `sanhia-mobile/src/components/GlassSheet.js` — vérifier s'il couvre tous les cas (filtres, options) avant d'en resourcer un autre |
| Modal | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Modal.jsx` |

## 2. Commerce / Produit

| Composant | Plateforme | Statut | Destination |
|---|---|---|---|
| Product Card (grille standard) | Web | **[EXISTE]** | `sanhia-web/src/components/ui/ProductCard.jsx` |
| Product Card — variante masonry (hauteur variable) | Web + Mobile | À CHERCHER | nouveau fichier séparé, ne pas écraser l'existant — `ProductCardMasonry.jsx` / `.js` |
| Product Card compact (vue liste dense, vendeur) | Web + Mobile | À CHERCHER | `ProductCardCompact.jsx` / `.js` |
| Product Card — overlay vidéo (quick-add) | Mobile | À CHERCHER | `ProductCardVideo.js` |
| Product Card — variante wishlist (cœur actif) | Web + Mobile | À CHERCHER | `ProductCardWishlist.jsx` / `.js` |
| Shop Card (vignette boutique) | Web + Mobile | À CHERCHER | `ShopCard.jsx` / `.js` |
| Price (prix / prix barré+réduit / gratuit) | Web + Mobile | À CHERCHER | `Price.jsx` / `.js` |
| Rating (étoiles + nombre d'avis) | Web + Mobile | À CHERCHER | `Rating.jsx` / `.js` |
| Stock indicator (en stock/faible/rupture) | Web + Mobile | À CHERCHER | `StockIndicator.jsx` / `.js` |
| Quantity Selector / Stepper (−/+) | Web + Mobile | À CHERCHER | `QuantitySelector.jsx` / `.js` |
| Add-to-Cart Button (avec état "ajouté") | Web + Mobile | À CHERCHER | `AddToCartButton.jsx` / `.js` |
| Wishlist Toggle (cœur) | Web + Mobile | À CHERCHER | `WishlistToggle.jsx` / `.js` |
| Seller Badge (nom + vérifié) | Web + Mobile | À CHERCHER | `SellerBadge.jsx` / `.js` |
| Promo Code Input (checkout) | Web + Mobile | À CHERCHER | `PromoCodeInput.jsx` / `.js` |
| Payment Method selector (Orange/Moov) | Web + Mobile | À CHERCHER | `PaymentMethod.jsx` / `.js` |

## 3. Formulaires

| Composant | Plateforme | Statut | Destination |
|---|---|---|---|
| Input texte | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Input.jsx` |
| Input texte | Mobile | **[EXISTE]** | `sanhia-mobile/src/components/TextField.js` |
| Select / Dropdown | Web + Mobile | À CHERCHER | `Select.jsx` / `.js` |
| Checkbox | Web + Mobile | À CHERCHER | `Checkbox.jsx` / `.js` |
| Radio | Web + Mobile | À CHERCHER | `Radio.jsx` / `.js` |
| Toggle / Switch | Web + Mobile | À CHERCHER | `Toggle.jsx` / `.js` |
| Upload zone (photo/document, avec preview + progress) | Web + Mobile | À CHERCHER | `UploadZone.jsx` / `.js` |
| Date Picker | Web + Mobile | À CHERCHER | `DatePicker.jsx` / `.js` |
| OTP Input (6 cases) | Web + Mobile | À CHERCHER | `OtpInput.jsx` / `.js` |
| Location Picker (carte + adresse) | Web | **[EXISTE]** | `sanhia-web/src/components/ui/LocationPicker.jsx` |
| Location Picker (carte + adresse) | Mobile | À CHERCHER *(`react-native-maps` déjà en dépendance côté produit réel — chercher un composant compatible)* | nouveau, `sanhia-mobile/src/components/LocationPicker.js` |

## 4. Feedback / États

| Composant | Plateforme | Statut | Destination |
|---|---|---|---|
| Toast | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Toast.jsx` + `PushToast.jsx` |
| Toast | Mobile | À CHERCHER | `sanhia-mobile/src/components/Toast.js` |
| Empty State | Web | **[EXISTE]** | `sanhia-web/src/components/ui/EmptyState.jsx` |
| Empty State | Mobile | **[EXISTE]** | `sanhia-mobile/src/components/EmptyState.js` |
| Error State | Web | **[EXISTE]** | `sanhia-web/src/components/ui/ErrorState.jsx` |
| Error State | Mobile | À CHERCHER | `sanhia-mobile/src/components/ErrorState.js` |
| Skeleton | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Skeleton.jsx` |
| Skeleton | Mobile | **[EXISTE]** | `sanhia-mobile/src/components/Skeleton.js` |
| Confirmation dialog | Web | **[EXISTE]** | `sanhia-web/src/components/ui/useConfirm.jsx` |
| Confirmation dialog | Mobile | À CHERCHER | `sanhia-mobile/src/components/ConfirmDialog.js` |
| Alert inline (bandeau d'avertissement formulaire) | Web + Mobile | À CHERCHER | `AlertInline.jsx` / `.js` |
| Badge | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Badge.jsx` |
| Badge | Mobile | À CHERCHER | `sanhia-mobile/src/components/Badge.js` |

## 5. Contenu social (Stories, vidéo, avis, messagerie)

| Composant | Plateforme | Statut | Destination |
|---|---|---|---|
| Story Item (avatar + anneau + traitement éditorial) | Web | **[EXISTE, partiel]** | `sanhia-web/src/components/boutique/StorySection.jsx` — vérifier si couvre le rail Home aussi |
| Story Item | Mobile | À CHERCHER | `sanhia-mobile/src/components/StoryItem.js` |
| Story Viewer (plein écran) | Web + Mobile | À CHERCHER | `StoryViewer.jsx` / `.js` |
| Video Feed Card (Reels-style) | Mobile | À CHERCHER | `VideoFeedCard.js` |
| Review Card | Web | À CHERCHER | `sanhia-web/src/components/ui/ReviewCard.jsx` |
| Review Modal | Mobile | **[EXISTE]** | `sanhia-mobile/src/components/ReviewModal.js` |
| Message Bubble | Web + Mobile | À CHERCHER | `MessageBubble.jsx` / `.js` |
| Conversation List Item | Web + Mobile | À CHERCHER | `ConversationListItem.jsx` / `.js` |
| Notification Item | Web + Mobile | À CHERCHER | `NotificationItem.jsx` / `.js` |
| Order Timeline (piste de statut) | Web | **[EXISTE]** | `sanhia-web/src/components/ui/OrderTimeline.jsx` |
| Order Timeline | Mobile | **[EXISTE]** | `sanhia-mobile/src/components/OrderTimeline.js` |
| Order Card (vue liste commandes) | Web + Mobile | À CHERCHER | `OrderCard.jsx` / `.js` |
| Proof Object (preuve de paiement) | Web | **[EXISTE]** | `sanhia-web/src/components/ui/ProofObject.jsx` |
| Proof Object | Mobile | À CHERCHER | `sanhia-mobile/src/components/ProofObject.js` |

## 6. Vendeur / Dashboard

| Composant | Plateforme | Statut | Destination |
|---|---|---|---|
| Stat Tile / KPI card | Web | **[EXISTE]** | `sanhia-web/src/components/ui/StatTile.jsx` |
| Stat Tile / KPI card | Mobile | À CHERCHER | `sanhia-mobile/src/components/StatTile.js` |
| Chart (barres/ligne, sobre) | Web + Mobile | À CHERCHER | `Chart.jsx` / `.js` |
| Tabs | Web + Mobile | À CHERCHER | `Tabs.jsx` / `.js` |
| Table (avec actions par ligne) | Web *(dashboard vendeur desktop uniquement — pas de back-office mobile)* | À CHERCHER | `sanhia-web/src/components/ui/Table.jsx` |
| Filter Bar | Web | À CHERCHER | `sanhia-web/src/components/ui/FilterBar.jsx` |
| Pagination | Web | À CHERCHER | `sanhia-web/src/components/ui/Pagination.jsx` |
| Payout Summary (revenus/reversement) | Web + Mobile | À CHERCHER | `PayoutSummary.jsx` / `.js` |
| Logo/Banner Upload (2 zones dédiées) | Web + Mobile | À CHERCHER | `LogoBannerUpload.jsx` / `.js` |
| Shop Anchor Band (bandeau boutique dans panier/commande) | Web | **[EXISTE]** | `sanhia-web/src/components/ui/ShopAnchorBand.jsx` |

## 7. Génériques (utilisés partout)

| Composant | Plateforme | Statut | Destination |
|---|---|---|---|
| Button | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Button.jsx` |
| Button | Mobile | **[EXISTE, radius à corriger]** | `sanhia-mobile/src/components/Button.js` — ne pas resourcer, juste corriger le token radius (déjà noté dans `SANHIA-FIGMA-MASTER-PROMPT.md`) |
| Icon Button | Web + Mobile | À CHERCHER | `IconButton.jsx` / `.js` |
| Card (générique) | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Card.jsx` |
| Card (générique) | Mobile | À CHERCHER | `sanhia-mobile/src/components/Card.js` |
| Avatar | Web + Mobile | À CHERCHER | `Avatar.jsx` / `.js` |
| Accordion | Web | **[EXISTE]** | `sanhia-web/src/components/ui/Accordion.jsx` |
| Accordion | Mobile | À CHERCHER *(utile pour FAQ/Informations)* | `sanhia-mobile/src/components/Accordion.js` |

---

## Récapitulatif — combien reste à sourcer

- **Déjà codé, ne rien resourcer** : ~22 composants web, ~9 composants mobile.
- **À chercher** : ~45 entrées (la plupart valables web ET mobile séparément — donc ~65-70 fichiers
  au total une fois les deux plateformes comptées).

## Priorité de recherche (si tu veux y aller dans l'ordre)

1. **Composants produit** (section 2) — bloquent Home/Catalogue/Product/Cart, les 4 premiers écrans du
   Master Prompt.
2. **Formulaires** (section 3) — bloquent Checkout/Candidature vendeur.
3. **Génériques** (section 7) — utilisés partout, à sourcer tôt même si l'écran exact n'est pas encore fait.
4. **Feedback/États mobiles manquants** (section 4) — Toast/ErrorState/Badge/ConfirmDialog mobile.
5. **Social/Vendeur** (sections 5-6) — une fois le tunnel d'achat posé.

---

*Une fois que tu déposes des fichiers dans `composants/`, dis-le moi — je les lis, je les adapte aux
tokens de `SANHIA-FIGMA-MASTER-PROMPT.md` (Poppins, palette, radius/shadow par rôle — voir Partie J §2 et
Partie K), et je les place aux chemins ci-dessus.*
