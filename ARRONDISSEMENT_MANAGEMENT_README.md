# Gestion des Arrondissements et Documents d'Arrondissement

## Vue d'ensemble

Ce module permet la gestion complète des arrondissements et de leurs documents, incluant :
- **Arrondissements** : Gestion des arrondissements par région/département
- **Documents d'Arrondissement** : Upload, stockage et téléchargement de documents avec gestion de fichiers

## Architecture

### Backend (API-CRUD)

Le backend est développé avec **Next.js 15** et **Prisma ORM** avec PostgreSQL, incluant la gestion d'upload de fichiers.

#### Routes API disponibles :

**Arrondissements :**
- `GET /api/arrondissement` - Liste tous les arrondissements (avec filtres optionnels par région/département)
- `GET /api/arrondissement/[id]` - Détails d'un arrondissement
- `POST /api/arrondissement` - Créer un nouvel arrondissement
- `PUT /api/arrondissement/[id]` - Modifier un arrondissement
- `DELETE /api/arrondissement/[id]` - Supprimer un arrondissement

**Documents d'Arrondissement :**
- `GET /api/document-arrondissement` - Liste tous les documents (avec filtre optionnel par arrondissement)
- `GET /api/document-arrondissement/[id]` - Détails d'un document
- `POST /api/document-arrondissement` - Créer un nouveau document avec upload de fichier
- `PUT /api/document-arrondissement/[id]` - Modifier un document (avec option de nouveau fichier)
- `DELETE /api/document-arrondissement/[id]` - Supprimer un document et son fichier

**Helpers :**
- `GET /api/regions` - Liste des régions avec leurs départements
- `GET /api/departements` - Liste des départements (déjà existant)

#### Gestion des fichiers

**Configuration d'upload :**
- **Dossier de stockage** : `public/uploads/documents/`
- **Taille maximum** : 10MB
- **Formats acceptés** : PDF, DOC, DOCX, JPG, JPEG, PNG
- **Sécurité** : Hash SHA256 des fichiers, noms uniques générés

**Fonctionnalités :**
- Upload automatique lors de la création
- Remplacement de fichier lors de la modification
- Suppression automatique du fichier lors de la suppression du document
- Génération d'URLs de téléchargement

### Frontend (assign_takwa_corrected)

Le frontend est développé avec **React** et **TypeScript** avec interface d'upload/download.

#### Composants :

1. **ArrondissementManagement** : Composant principal avec onglets
2. **ArrondissementsTab** : Gestion des arrondissements
3. **DocumentsTab** : Gestion des documents avec upload/download
4. **Modales** : Formulaires avec gestion de fichiers

#### API Client :

Le fichier `src/api/arrondissementApi.ts` contient tous les appels API typés avec gestion des FormData pour les uploads.

## Installation et Configuration

### Backend (api-crud)

1. **Installation des dépendances :**
```bash
cd api-crud
npm install
```

2. **Configuration de la base de données :**
```bash
# Configurer DATABASE_URL dans .env
echo "DATABASE_URL=postgresql://username:password@localhost:5432/election_db" > .env

# Synchroniser le schéma
npm run db:push
```

3. **Création du dossier d'uploads :**
```bash
mkdir -p public/uploads/documents
```

4. **Démarrage du serveur :**
```bash
npm run dev
# Serveur disponible sur http://localhost:3000
```

### Frontend (assign_takwa_corrected)

1. **Configuration de l'API :**
L'URL de base est configurée dans `src/api/arrondissementApi.ts` :
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

2. **Démarrage :**
```bash
cd assign_takwa_corrected
npm run dev
```

3. **Accès :**
- Se connecter en tant qu'administrateur
- Naviguer vers "Gestion des Arrondissements" dans le menu

## Tests

### Test des APIs
```bash
cd api-crud
node scripts/test-arrondissement-api.js
```

### Test du CORS (si nécessaire)
```bash
cd api-crud
node scripts/test-cors.js
```

## Fonctionnalités

### Gestion des Arrondissements

- **Création** : Associer un arrondissement à une région et/ou département
- **Modification** : Éditer toutes les informations de l'arrondissement
- **Suppression** : Supprimer un arrondissement (vérification des contraintes)
- **Filtrage** : Filtrer par région et département
- **Hiérarchie** : Gestion de la relation région → département → arrondissement
- **Visualisation** : Voir le nombre de bureaux de vote et documents

### Gestion des Documents d'Arrondissement

- **Upload** : Téléverser des fichiers (PDF, DOC, DOCX, images)
- **Téléchargement** : Télécharger les documents stockés
- **Modification** : Changer le libellé et optionnellement le fichier
- **Suppression** : Supprimer document et fichier associé
- **Sécurité** : Validation des types de fichiers et tailles
- **Intégrité** : Hash des fichiers pour vérification
- **Filtrage** : Filtrer par région, département, arrondissement

## Modèles de données

### Arrondissement
```prisma
model Arrondissement {
  code              Int                   @id @default(autoincrement())
  code_departement  Int?
  code_region       Int?
  abbreviation      String?
  libelle           String?
  description       String?
  code_createur     String?
  code_modificateur String?
  date_creation     String?
  date_modification String?
  departement       Departement?          @relation(fields: [code_departement], references: [code])
  region            Region?               @relation(fields: [code_region], references: [code])
  bureauVotes       BureauVote[]
  pvArrondissements PvArrondissement[]    // Documents
}
```

### Document d'Arrondissement (PvArrondissement)
```prisma
model PvArrondissement {
  code              Int                   @id @default(autoincrement())
  code_arrondissement Int
  url_pv            String?               // Chemin vers le fichier
  hash_file         String?               // Hash SHA256 du fichier
  libelle           String?
  timestamp         DateTime              @default(now())
  arrondissement    Arrondissement        @relation(fields: [code_arrondissement], references: [code])
}
```

## Sécurité et Validation

### Backend
- Validation des types de fichiers autorisés
- Limitation de la taille des fichiers (10MB)
- Génération de noms de fichiers uniques
- Hash des fichiers pour intégrité
- Vérification des contraintes de suppression
- Gestion des erreurs avec messages explicites

### Frontend
- Validation côté client des fichiers
- Interface de glisser-déposer pour l'upload
- Aperçu des fichiers avant upload
- Gestion d'état avec loading/error
- Confirmations de suppression
- Interface de téléchargement intuitive

## Structure des fichiers

### Backend
```
api-crud/
├── app/api/
│   ├── arrondissement/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── document-arrondissement/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── regions/route.ts
├── lib/
│   ├── prisma.ts
│   └── fileUpload.ts
├── public/uploads/documents/
└── scripts/test-arrondissement-api.js
```

### Frontend
```
assign_takwa_corrected/src/
├── api/arrondissementApi.ts
├── components/ArrondissementManagement.tsx
└── App.tsx (modifié)
```

## Permissions

Actuellement accessible aux **Administrateurs** uniquement. Pour étendre l'accès :

1. Modifier les filtres de menu dans `App.tsx`
2. Ajouter les rôles souhaités dans les conditions

## Dépannage

### Erreurs Communes

1. **Erreur d'upload** :
   - Vérifier que le dossier `public/uploads/documents` existe
   - Vérifier les permissions d'écriture
   - Vérifier la taille et le type de fichier

2. **Erreur de téléchargement** :
   - Vérifier que le fichier existe physiquement
   - Vérifier l'URL générée

3. **Erreur de suppression d'arrondissement** :
   - Vérifier les contraintes (bureaux de vote, documents)

4. **Erreur de connexion API** :
   - Vérifier que le serveur api-crud fonctionne sur le port 3000
   - Vérifier l'URL dans `arrondissementApi.ts`

### Logs

- Backend : Console du serveur Next.js
- Upload : Logs dans la console pour les erreurs de fichier
- Frontend : Console du navigateur et Network tab

## Extensions Futures

1. **Prévisualisation** : Aperçu des documents PDF/images
2. **Versioning** : Historique des versions de documents
3. **Métadonnées** : Informations EXIF pour les images
4. **Compression** : Compression automatique des fichiers
5. **Cloud Storage** : Intégration AWS S3/Google Cloud
6. **Recherche** : Recherche dans le contenu des documents
7. **Notifications** : Alertes lors d'ajout de documents
8. **Audit** : Traçabilité des modifications de fichiers

## Sécurité Avancée

Pour un environnement de production :

1. **Scan antivirus** des fichiers uploadés
2. **Chiffrement** des fichiers sensibles
3. **Authentification** pour les téléchargements
4. **Rate limiting** sur les uploads
5. **Backup** automatique des fichiers
6. **CDN** pour la distribution des fichiers

## Support

Pour toute question ou problème :
1. Vérifier les logs d'erreur
2. Tester avec les scripts fournis
3. Vérifier les permissions de fichiers
4. Consulter la documentation Prisma/Next.js
