# Checklists de tests

> Fichier chargé automatiquement par le site. Format : une section `## Module` par thème, puis une ligne par test :
> `- [ ] ID | Titre du test | Attendu`
> Les validations (À tester / Validé / Échec) sont partagées par l'équipe et stockées dans Firebase, pas dans ce fichier.

## Connexion
- [ ] AUTH-01 | Code Daren ouvre le dashboard | Redirection vers le tableau de bord, nom « Daren » affiché
- [ ] AUTH-02 | Code Hassan ouvre le dashboard | Redirection vers le tableau de bord, nom « Hassan » affiché
- [ ] AUTH-03 | Code Youssouf ouvre le dashboard | Redirection vers le tableau de bord, nom « Youssouf » affiché
- [ ] AUTH-04 | Code incorrect | Message « Code incorrect. » sous le formulaire, pas de redirection
- [ ] AUTH-05 | Déconnexion puis reconnexion | Retour sur l'écran de connexion, puis accès avec le code

## Vue d'ensemble
- [ ] OVR-01 | Compteurs de la vue d'ensemble | Nombre d'étapes, de phases, pourcentage et anneau cohérents avec la roadmap
- [ ] OVR-02 | Indicateur de synchronisation | « ● Sync temps réel » en vert si Firebase est connecté, « ○ Mode local » sinon

## Roadmap détaillée
- [ ] RDM-01 | Recherche par mot | Seules les étapes contenant le mot restent affichées, compteur « X étapes affichées » à jour
- [ ] RDM-02 | Filtre par phase | Seules les étapes de la phase choisie sont affichées
- [ ] RDM-03 | Filtre par statut | Seules les étapes au statut choisi sont affichées
- [ ] RDM-04 | Cocher une étape (✓) | Statut passe à « Terminé », date de fin renseignée, toast « Étape mise à jour »
- [ ] RDM-05 | Décocher une étape terminée | Statut repasse à « Non commencé »
- [ ] RDM-06 | Modifier une étape | La fenêtre s'ouvre avec le statut, le responsable et la note actuels ; enregistrer met à jour la carte
- [ ] RDM-07 | Réduire / développer une phase | La phase se replie et se déploie au clic sur son en-tête
- [ ] RDM-08 | Bouton « Tout développer / Tout réduire » | Toutes les phases changent d'état en une fois
- [ ] RDM-09 | Export JSON | Le fichier `sanhia-roadmap-complete.json` se télécharge avec toutes les étapes

## Composants à sourcer
- [ ] CMP-01 | Cocher un composant trouvé | Ligne barrée, badge « Trouvé ✓ », progression mise à jour
- [ ] CMP-02 | Décocher un composant | Retour au statut d'origine
- [ ] CMP-03 | Filtres plateforme et statut | Liste filtrée sans recharger la page

## Tests partagés
- [ ] CHK-01 | Cycle d'un test | Un clic sur ✓ fait passer « À tester » → « Validé » → « Échec » → « À tester »
- [ ] CHK-02 | Synchronisation entre comptes | Un test validé par un membre apparaît pour les autres sans recharger la page
- [ ] CHK-03 | Auteur et date | Un test validé affiche le nom de la personne et la date
- [ ] CHK-04 | Filtre par statut et recherche | La liste et les compteurs suivent le filtre et la recherche

## Navigation et affichage
- [ ] NAV-01 | Menu latéral | Chaque entrée affiche la bonne page et met en évidence le bouton actif
- [ ] NAV-02 | Affichage mobile (≤ 900 px) | Le menu se masque et s'ouvre avec ☰, aucun défilement horizontal
- [ ] NAV-03 | Roadmap chargée depuis le fichier | Modifier une étape dans `roadmap-universel.md` puis recharger affiche le nouveau texte
