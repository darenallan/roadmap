# Sanhia Roadmap Control

Prototype corporate mobile-first construit à partir de ROADMAP.md.

## Lancer
Ouvrir `index.html` dans un navigateur moderne. Pour un meilleur résultat, lancer un petit serveur local, par exemple avec l’extension Live Server de VS Code.

## Accès
- Daren : code `2252`, Développeur principal
- Hassan : code `3363`, Directeur marketing

## Fonctionnalités
- 64 étapes et 16 phases de la roadmap
- progression globale, par phase et par statut
- recherche et filtres
- attribution à Daren ou Hassan
- notes de suivi et validation rapide
- persistance locale via localStorage
- export JSON

## Important pour une vraie utilisation à deux
Cette version est autonome et conserve les données dans le navigateur de l’appareil. Elle ne synchronise pas deux téléphones ou ordinateurs différents. Pour une synchronisation réelle multi-appareils, connecter l’interface à Firebase, Supabase ou à l’API Sanhia, et remplacer les codes visibles côté client par une authentification sécurisée côté serveur. Les codes fournis sont adaptés uniquement à une démonstration.
