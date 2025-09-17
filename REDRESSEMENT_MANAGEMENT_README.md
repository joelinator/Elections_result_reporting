# Gestion des Redressements Électoraux

## Vue d'ensemble

Ce module permet la gestion complète des redressements électoraux, incluant :
- **Redressements Candidats** : Correction des votes par candidat/parti dans un bureau de vote
- **Redressements Bureaux de Vote** : Correction des données globales d'un bureau de vote (participation, bulletins, etc.)

## Architecture

### Backend (API-CRUD)

Le backend est développé avec **Next.js 15** et **Prisma ORM** avec PostgreSQL.

#### Routes API disponibles :

**Redressements Candidats :**
- `GET /api/redressement-candidat` - Liste tous les redressements candidats (avec filtres)
- `GET /api/redressement-candidat/[id]` - Détails d'un redressement candidat
- `POST /api/redressement-candidat` - Créer un nouveau redressement candidat
- `PUT /api/redressement-candidat/[id]` - Modifier un redressement candidat
- `DELETE /api/redressement-candidat/[id]` - Supprimer un redressement candidat

**Redressements Bureaux de Vote :**
- `GET /api/redressement-bureau-vote` - Liste tous les redressements bureaux (avec filtres)
- `GET /api/redressement-bureau-vote/[id]` - Détails d'un redressement bureau
- `POST /api/redressement-bureau-vote` - Créer un nouveau redressement bureau
- `PUT /api/redressement-bureau-vote/[id]` - Modifier un redressement bureau
- `DELETE /api/redressement-bureau-vote/[id]` - Supprimer un redressement bureau

**Endpoints Helper :**
- `GET /api/bureaux-vote` - Liste des bureaux de vote (avec filtres par arrondissement/département)
- `GET /api/partis-politiques` - Liste des partis politiques avec candidats

#### Modèles de données

**RedressementCandidat :**
```prisma
model RedressementCandidat {
  code              Int                   @id @default(autoincrement())
  code_bureau_vote  Int?
  code_parti        Int?
  nombre_vote_initial Int?
  nombre_vote_redresse Int?
  raison_redressement String?
  date_redressement DateTime              @default(now())
  bureauVote        BureauVote?           @relation(fields: [code_bureau_vote], references: [code])
  parti             PartiPolitique?       @relation(fields: [code_parti], references: [code])
}
```

**RedressementBureauVote :**
```prisma
model RedressementBureauVote {
  code                            Int                   @id @default(autoincrement())
  code_bureau_vote                Int?                  @unique
  nombre_inscrit_initial          Int?
  nombre_inscrit_redresse         Int?
  nombre_votant_initial           Int?
  nombre_votant_redresse          Int?
  taux_participation_initial      Float?
  taux_participation_redresse     Float?
  bulletin_nul_initial            Int?
  bulletin_nul_redresse           Int?
  suffrage_exprime_valables_initial Int?
  suffrage_exprime_valables_redresse Int?
  erreurs_materielles_initiales   String?
  erreurs_materielles_initiales_redresse String?
  raison_redressement             String?
  date_redressement               DateTime              @default(now())
  bureauVote                      BureauVote?           @relation(fields: [code_bureau_vote], references: [code])
}
```

### Frontend (assign_takwa_corrected)

Le frontend est développé avec **React** et **TypeScript**.

#### Composants :

1. **RedressementManagement** : Composant principal avec onglets
2. **RedressementsCandidatsView** : Affichage des redressements candidats
3. **RedressementsBureauxView** : Affichage des redressements bureaux
4. **Modales** : Formulaires avec validation et calculs automatiques

#### API Client :

Le fichier `src/api/redressementApi.ts` contient tous les appels API typés avec fonctions de calcul et validation.

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

3. **Démarrage du serveur :**
```bash
npm run dev
# Serveur disponible sur http://localhost:3000
```

### Frontend (assign_takwa_corrected)

1. **Configuration de l'API :**
L'URL de base est configurée dans `src/api/redressementApi.ts` :
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
- Naviguer vers "Gestion des Redressements" dans le menu

## Tests

### Test des APIs
```bash
cd api-crud
node scripts/test-redressement-api.js
```

## Fonctionnalités

### Gestion des Redressements Candidats

- **Création** : Associer un redressement à un bureau de vote et un parti/candidat
- **Modification** : Éditer les votes initial/redressé et la raison
- **Suppression** : Supprimer un redressement
- **Calculs automatiques** : Différence de votes et pourcentage de changement
- **Filtrage** : Par bureau de vote, parti, arrondissement
- **Visualisation** : Badges colorés pour les changements positifs/négatifs

### Gestion des Redressements Bureaux de Vote

- **Création** : Redresser toutes les données d'un bureau de vote
- **Modification** : Éditer les données initiales/redressées
- **Suppression** : Supprimer un redressement (contrainte unique par bureau)
- **Calculs automatiques** : Taux de participation recalculés
- **Erreurs matérielles** : Documentation des erreurs initiales et corrections
- **Validation** : Vérification de cohérence des données
- **Comparaison** : Vue côte à côte initial vs redressé

## Fonctionnalités Avancées

### Calculs Automatiques

**Pour les Candidats :**
- Différence de votes (redressé - initial)
- Pourcentage de changement
- Validation des données cohérentes

**Pour les Bureaux :**
- Taux de participation (votants/inscrits) automatique
- Validation croisée des données
- Vérification suffrage valable + bulletins nuls ≤ votants

### Interface Utilisateur

**Filtres Hiérarchiques :**
- Département → Arrondissement → Bureau de vote
- Parti politique (pour candidats)
- Filtrage en temps réel

**Validation Temps Réel :**
- Vérification de cohérence instantanée
- Messages d'erreur explicites
- Blocage de sauvegarde si données incohérentes

**Visualisation Avancée :**
- Badges colorés pour changements positifs/négatifs
- Comparaison côte à côte initial/redressé
- Métriques calculées en temps réel
- Historique des modifications

## Sécurité et Validation

### Backend
- Contrainte unique : Un seul redressement bureau par bureau de vote
- Validation des relations (bureau/parti doivent exister)
- Vérification de cohérence des données numériques
- Gestion des erreurs avec messages explicites

### Frontend
- Validation côté client en temps réel
- Calculs automatiques pour éviter les erreurs
- Confirmations de suppression
- Interface intuitive avec feedback visuel

## Cas d'Usage

### Redressement Candidat
1. **Erreur de décompte** : Correction des votes d'un candidat spécifique
2. **Bulletin mal attribué** : Réattribution de votes entre candidats
3. **Erreur de saisie** : Correction de données erronées

### Redressement Bureau
1. **Recomptage complet** : Correction de toutes les données du bureau
2. **Erreur matérielle** : Correction suite à dysfonctionnement
3. **Fraude détectée** : Redressement après enquête

## Permissions

Actuellement accessible aux **Administrateurs** uniquement. Pour étendre l'accès :

1. Modifier les filtres de menu dans `App.tsx`
2. Ajouter les rôles souhaités (ex: Superviseurs, Validateurs)

## Structure des fichiers

### Backend
```
api-crud/
├── app/api/
│   ├── redressement-candidat/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── redressement-bureau-vote/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── bureaux-vote/route.ts
│   └── partis-politiques/route.ts
└── scripts/test-redressement-api.js
```

### Frontend
```
assign_takwa_corrected/src/
├── api/redressementApi.ts
├── components/RedressementManagement.tsx
└── App.tsx (modifié)
```

## Dépannage

### Erreurs Communes

1. **Erreur de contrainte unique** : 
   - Un bureau ne peut avoir qu'un seul redressement
   - Modifier le redressement existant au lieu d'en créer un nouveau

2. **Données incohérentes** :
   - Vérifier que votants ≤ inscrits
   - Vérifier que suffrages valables ≤ votants
   - Vérifier que suffrages valables + bulletins nuls ≤ votants

3. **Bureau/Parti inexistant** :
   - Vérifier que les IDs existent en base
   - Recharger les listes déroulantes

### Validation

Le système inclut une validation complète :
- **Côté client** : Validation en temps réel avec messages d'erreur
- **Côté serveur** : Vérification des contraintes et cohérence
- **Calculs automatiques** : Évite les erreurs de calcul manuel

## Extensions Futures

1. **Audit Trail** : Historique détaillé des modifications
2. **Notifications** : Alertes pour redressements importants
3. **Rapports** : Génération de rapports de redressement
4. **Workflow** : Processus d'approbation des redressements
5. **Comparaisons** : Graphiques avant/après redressement
6. **Export** : Export des données en Excel/PDF
7. **Import** : Import en masse de redressements
8. **Dashboard** : Tableau de bord des tendances de redressement

## Support

Pour toute question ou problème :
1. Vérifier les logs d'erreur dans la console
2. Utiliser le script de test pour valider le fonctionnement
3. Vérifier la cohérence des données saisies
4. Consulter la documentation Prisma pour les contraintes
