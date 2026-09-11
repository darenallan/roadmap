/* ══════════════════════════════════════════════════════════════
 *  SANHIA — Composants à sourcer (données structurées)
 *  Extrait de SANHIA-COMPOSANTS-A-SOURCER.md
 * ══════════════════════════════════════════════════════════════ */

window.COMPOSANTS_DATA = [
  {
    id: 1,
    name: "Navigation & Chrome",
    items: [
      { composant: "Header/Navbar desktop", plateforme: "Web", statut: "a_chercher", destination: "sanhia-web/src/components/layout/Header.jsx", note: "existe déjà — resourcer seulement si tu veux le remplacer, pas par défaut" },
      { composant: "Footer", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/layout/Footer.jsx", note: "" },
      { composant: "Bottom Tab Bar (5 items, badge compteur)", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/BottomNavigation.js", note: "" },
      { composant: "Header mobile minimal (localisation + icônes)", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/Header.js", note: "" },
      { composant: "Search bar (vide/focus/résultats/aucun résultat)", plateforme: "Web + Mobile", statut: "a_chercher", destination: ".../components/ui/SearchBar.jsx (web) + .../src/components/SearchBar.js (mobile)", note: "" },
      { composant: "Category nav (chips horizontaux scrollables)", plateforme: "Web + Mobile", statut: "a_chercher", destination: ".../CategoryNav.jsx / .js", note: "" },
      { composant: "Breadcrumb", plateforme: "Web", statut: "a_chercher", destination: "sanhia-web/src/components/ui/Breadcrumb.jsx", note: "" },
      { composant: "Drawer (menu latéral)", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Drawer.jsx", note: "" },
      { composant: "Bottom Sheet", plateforme: "Mobile", statut: "existe_partiel", destination: "sanhia-mobile/src/components/GlassSheet.js", note: "vérifier s'il couvre tous les cas (filtres, options) avant d'en resourcer un autre" },
      { composant: "Modal", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Modal.jsx", note: "" }
    ]
  },
  {
    id: 2,
    name: "Commerce / Produit",
    items: [
      { composant: "Product Card (grille standard)", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/ProductCard.jsx", note: "" },
      { composant: "Product Card — variante masonry (hauteur variable)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "ProductCardMasonry.jsx / .js", note: "nouveau fichier séparé, ne pas écraser l'existant" },
      { composant: "Product Card compact (vue liste dense, vendeur)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "ProductCardCompact.jsx / .js", note: "" },
      { composant: "Product Card — overlay vidéo (quick-add)", plateforme: "Mobile", statut: "a_chercher", destination: "ProductCardVideo.js", note: "" },
      { composant: "Product Card — variante wishlist (cœur actif)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "ProductCardWishlist.jsx / .js", note: "" },
      { composant: "Shop Card (vignette boutique)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "ShopCard.jsx / .js", note: "" },
      { composant: "Price (prix / prix barré+réduit / gratuit)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Price.jsx / .js", note: "" },
      { composant: "Rating (étoiles + nombre d'avis)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Rating.jsx / .js", note: "" },
      { composant: "Stock indicator (en stock/faible/rupture)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "StockIndicator.jsx / .js", note: "" },
      { composant: "Quantity Selector / Stepper (−/+)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "QuantitySelector.jsx / .js", note: "" },
      { composant: "Add-to-Cart Button (avec état \"ajouté\")", plateforme: "Web + Mobile", statut: "a_chercher", destination: "AddToCartButton.jsx / .js", note: "" },
      { composant: "Wishlist Toggle (cœur)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "WishlistToggle.jsx / .js", note: "" },
      { composant: "Seller Badge (nom + vérifié)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "SellerBadge.jsx / .js", note: "" },
      { composant: "Promo Code Input (checkout)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "PromoCodeInput.jsx / .js", note: "" },
      { composant: "Payment Method selector (Orange/Moov)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "PaymentMethod.jsx / .js", note: "" }
    ]
  },
  {
    id: 3,
    name: "Formulaires",
    items: [
      { composant: "Input texte", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Input.jsx", note: "" },
      { composant: "Input texte", plateforme: "Mobile", statut: "existe", destination: "sanhia-mobile/src/components/TextField.js", note: "" },
      { composant: "Select / Dropdown", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Select.jsx / .js", note: "" },
      { composant: "Checkbox", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Checkbox.jsx / .js", note: "" },
      { composant: "Radio", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Radio.jsx / .js", note: "" },
      { composant: "Toggle / Switch", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Toggle.jsx / .js", note: "" },
      { composant: "Upload zone (photo/document, avec preview + progress)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "UploadZone.jsx / .js", note: "" },
      { composant: "Date Picker", plateforme: "Web + Mobile", statut: "a_chercher", destination: "DatePicker.jsx / .js", note: "" },
      { composant: "OTP Input (6 cases)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "OtpInput.jsx / .js", note: "" },
      { composant: "Location Picker (carte + adresse)", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/LocationPicker.jsx", note: "" },
      { composant: "Location Picker (carte + adresse)", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/LocationPicker.js", note: "react-native-maps déjà en dépendance — chercher un composant compatible" }
    ]
  },
  {
    id: 4,
    name: "Feedback / États",
    items: [
      { composant: "Toast", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Toast.jsx + PushToast.jsx", note: "" },
      { composant: "Toast", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/Toast.js", note: "" },
      { composant: "Empty State", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/EmptyState.jsx", note: "" },
      { composant: "Empty State", plateforme: "Mobile", statut: "existe", destination: "sanhia-mobile/src/components/EmptyState.js", note: "" },
      { composant: "Error State", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/ErrorState.jsx", note: "" },
      { composant: "Error State", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/ErrorState.js", note: "" },
      { composant: "Skeleton", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Skeleton.jsx", note: "" },
      { composant: "Skeleton", plateforme: "Mobile", statut: "existe", destination: "sanhia-mobile/src/components/Skeleton.js", note: "" },
      { composant: "Confirmation dialog", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/useConfirm.jsx", note: "" },
      { composant: "Confirmation dialog", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/ConfirmDialog.js", note: "" },
      { composant: "Alert inline (bandeau d'avertissement formulaire)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "AlertInline.jsx / .js", note: "" },
      { composant: "Badge", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Badge.jsx", note: "" },
      { composant: "Badge", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/Badge.js", note: "" }
    ]
  },
  {
    id: 5,
    name: "Contenu social (Stories, vidéo, avis, messagerie)",
    items: [
      { composant: "Story Item (avatar + anneau + traitement éditorial)", plateforme: "Web", statut: "existe_partiel", destination: "sanhia-web/src/components/boutique/StorySection.jsx", note: "vérifier si couvre le rail Home aussi" },
      { composant: "Story Item", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/StoryItem.js", note: "" },
      { composant: "Story Viewer (plein écran)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "StoryViewer.jsx / .js", note: "" },
      { composant: "Video Feed Card (Reels-style)", plateforme: "Mobile", statut: "a_chercher", destination: "VideoFeedCard.js", note: "" },
      { composant: "Review Card", plateforme: "Web", statut: "a_chercher", destination: "sanhia-web/src/components/ui/ReviewCard.jsx", note: "" },
      { composant: "Review Modal", plateforme: "Mobile", statut: "existe", destination: "sanhia-mobile/src/components/ReviewModal.js", note: "" },
      { composant: "Message Bubble", plateforme: "Web + Mobile", statut: "a_chercher", destination: "MessageBubble.jsx / .js", note: "" },
      { composant: "Conversation List Item", plateforme: "Web + Mobile", statut: "a_chercher", destination: "ConversationListItem.jsx / .js", note: "" },
      { composant: "Notification Item", plateforme: "Web + Mobile", statut: "a_chercher", destination: "NotificationItem.jsx / .js", note: "" },
      { composant: "Order Timeline (piste de statut)", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/OrderTimeline.jsx", note: "" },
      { composant: "Order Timeline", plateforme: "Mobile", statut: "existe", destination: "sanhia-mobile/src/components/OrderTimeline.js", note: "" },
      { composant: "Order Card (vue liste commandes)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "OrderCard.jsx / .js", note: "" },
      { composant: "Proof Object (preuve de paiement)", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/ProofObject.jsx", note: "" },
      { composant: "Proof Object", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/ProofObject.js", note: "" }
    ]
  },
  {
    id: 6,
    name: "Vendeur / Dashboard",
    items: [
      { composant: "Stat Tile / KPI card", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/StatTile.jsx", note: "" },
      { composant: "Stat Tile / KPI card", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/StatTile.js", note: "" },
      { composant: "Chart (barres/ligne, sobre)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Chart.jsx / .js", note: "" },
      { composant: "Tabs", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Tabs.jsx / .js", note: "" },
      { composant: "Table (avec actions par ligne)", plateforme: "Web", statut: "a_chercher", destination: "sanhia-web/src/components/ui/Table.jsx", note: "dashboard vendeur desktop uniquement — pas de back-office mobile" },
      { composant: "Filter Bar", plateforme: "Web", statut: "a_chercher", destination: "sanhia-web/src/components/ui/FilterBar.jsx", note: "" },
      { composant: "Pagination", plateforme: "Web", statut: "a_chercher", destination: "sanhia-web/src/components/ui/Pagination.jsx", note: "" },
      { composant: "Payout Summary (revenus/reversement)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "PayoutSummary.jsx / .js", note: "" },
      { composant: "Logo/Banner Upload (2 zones dédiées)", plateforme: "Web + Mobile", statut: "a_chercher", destination: "LogoBannerUpload.jsx / .js", note: "" },
      { composant: "Shop Anchor Band (bandeau boutique dans panier/commande)", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/ShopAnchorBand.jsx", note: "" }
    ]
  },
  {
    id: 7,
    name: "Génériques (utilisés partout)",
    items: [
      { composant: "Button", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Button.jsx", note: "" },
      { composant: "Button", plateforme: "Mobile", statut: "existe_partiel", destination: "sanhia-mobile/src/components/Button.js", note: "ne pas resourcer, juste corriger le token radius" },
      { composant: "Icon Button", plateforme: "Web + Mobile", statut: "a_chercher", destination: "IconButton.jsx / .js", note: "" },
      { composant: "Card (générique)", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Card.jsx", note: "" },
      { composant: "Card (générique)", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/Card.js", note: "" },
      { composant: "Avatar", plateforme: "Web + Mobile", statut: "a_chercher", destination: "Avatar.jsx / .js", note: "" },
      { composant: "Accordion", plateforme: "Web", statut: "existe", destination: "sanhia-web/src/components/ui/Accordion.jsx", note: "" },
      { composant: "Accordion", plateforme: "Mobile", statut: "a_chercher", destination: "sanhia-mobile/src/components/Accordion.js", note: "utile pour FAQ/Informations" }
    ]
  }
];

window.COMPOSANTS_PRIORITIES = [
  { rank: 1, section: "Composants produit (section 2)", reason: "bloquent Home/Catalogue/Product/Cart, les 4 premiers écrans du Master Prompt" },
  { rank: 2, section: "Formulaires (section 3)", reason: "bloquent Checkout/Candidature vendeur" },
  { rank: 3, section: "Génériques (section 7)", reason: "utilisés partout, à sourcer tôt même si l'écran exact n'est pas encore fait" },
  { rank: 4, section: "Feedback/États mobiles manquants (section 4)", reason: "Toast/ErrorState/Badge/ConfirmDialog mobile" },
  { rank: 5, section: "Social/Vendeur (sections 5-6)", reason: "une fois le tunnel d'achat posé" }
];
