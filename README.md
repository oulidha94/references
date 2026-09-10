# references.samibenmansour.com

Portail de partage de diplômes, certifications et attestations avec les clients et cabinets partenaires. Lien non listé, non indexé, sans authentification (comme portfolio.samibenmansour.com). Sert deux usages : navigation filtrée libre, et sélection ciblée par lien pour un envoi précis à un client.

## Structure

```
index.html              page unique du portail
assets/style.css         charte Etik (Fraunces + DM Sans, palette crème/terracotta/sauge)
assets/app.js             chargement des donnees, filtres, mode selection, export zip
data/documents.json       fichier de metadonnees unique (82 documents actuellement)
documents/diplome/        fichiers reels a deposer ici (4 attendus)
documents/certif/         fichiers reels a deposer ici (51 attendus)
documents/formation/      fichiers reels a deposer ici (27 attendus)
CNAME                     sous-domaine GitHub Pages
```

## Ce qui reste a faire avant mise en ligne

**1. Deposer les fichiers reels.** Cette version a ete construite sans acces direct aux fichiers binaires stockes dans Box (l'outil disponible dans ce chat n'extrait que le texte des documents, pas leurs octets). `data/documents.json` reference deja le nom exact et l'emplacement attendu de chacun des 82 fichiers (`documents/<dossier>/<nom exact du fichier Box>`) : il suffit de les copier depuis Box vers les trois dossiers `documents/` en conservant ces noms. C'est l'etape naturelle pour Claude Code Desktop, qui peut acceder a Box et au systeme de fichiers local dans la meme session.

**2. Trancher les points releves lors de l'inventaire**, chacun note dans le champ `a_verifier` du document concerne dans `documents.json` :
- 4 attestations utilisent le prefixe `Attestation prestation` ou `Attestation` seule (sans qualificatif formateur/mission) : a reclasser en attestation-formation ou attestation-conseil.
- 1 fichier date 2021 se trouve dans le dossier Box `formation/2020` (Step 360) : incoherence a corriger a la source.
- 1 fichier de 2016 n'a pas de segment organisme dans son nom (MOOC Digital RH).
- 3 documents (Design Thinking, Fondamentaux du marketing numerique, Scrum Fundamentals) ne correspondent a aucun des 9 domaines du CV : `themes` est vide pour eux dans le fichier de metadonnees, a trancher (les rattacher a un domaine existant ou les laisser sans tag thematique, auquel cas ils resteront filtrables uniquement par type et recherche).
- Le secteur du client final n'a ete rempli que lorsqu'il etait clairement deductible ; a completer au fil de l'eau.

**3. Deploiement.** Creer le depot `references-samibenmansour` sur GitHub, y pousser ce contenu, activer GitHub Pages sur la branche principale, puis pointer un enregistrement CNAME chez OVH vers `<votre-compte>.github.io`, conformement au montage deja utilise pour vos autres sous-domaines.

## Faire evoluer le catalogue

Chaque document est une entree de `data/documents.json` :

```json
{
  "id": "f28",
  "dossier": "formation",
  "fichier": "documents/formation/Attestation formateur - ... .pdf",
  "type_document": "attestation-formation",
  "type_document_label": "Attestation de formation",
  "titre": "...",
  "organisme": "...",
  "client_final": "",
  "secteur": "",
  "annee": "2026",
  "themes": ["rh"],
  "a_verifier": ""
}
```

Ajouter un document = ajouter une entree ici et deposer le fichier au bon endroit. Aucune autre modification de code n'est necessaire ; la page se reconstruit automatiquement a partir de ce fichier.

## Mode selection ciblee

Cocher des documents dans la liste fait apparaitre une barre en haut de page permettant de copier un lien contenant la selection (`?sel=id1,id2,...`) ou de telecharger directement un `.zip` de la selection. Ouvrir ce lien affiche le portail avec ces documents deja coches, prets a etre reexportes en zip par le destinataire.

Contact : samibm@etik.com · samibenmansour.com
