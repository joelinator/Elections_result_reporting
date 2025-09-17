# Gestion des Commissions Départementales

## Vue d'ensemble

Ce module permet la gestion complète des commissions départementales, incluant :
- **Commissions Départementales** : Gestion des commissions par département
- **Fonctions de Commission** : Définition des rôles au sein des commissions
- **Membres de Commission** : Gestion des personnes membres des commissions

## Architecture

### Backend (API-CRUD)

Le backend est développé avec **Next.js 15** et **Prisma ORM** avec PostgreSQL.

#### Routes API disponibles :

**Commissions Départementales :**
- `GET /api/commission-departementale` - Liste toutes les commissions (avec filtre optionnel par département)
- `GET /api/commission-departementale/[id]` - Détails d'une commission
- `POST /api/commission-departementale` - Créer une nouvelle commission
- `PUT /api/commission-departementale/[id]` - Modifier une commission
- `DELETE /api/commission-departementale/[id]` - Supprimer une commission

**Fonctions de Commission :**
- `GET /api/fonction-commission` - Liste toutes les fonctions
- `GET /api/fonction-commission/[id]` - Détails d'une fonction
- `POST /api/fonction-commission` - Créer une nouvelle fonction
- `PUT /api/fonction-commission/[id]` - Modifier une fonction
- `DELETE /api/fonction-commission/[id]` - Supprimer une fonction

**Membres de Commission :**
- `GET /api/membre-commission` - Liste tous les membres (avec filtres optionnels)
- `GET /api/membre-commission/[id]` - Détails d'un membre
- `POST /api/membre-commission` - Créer un nouveau membre
- `PUT /api/membre-commission/[id]` - Modifier un membre
- `DELETE /api/membre-commission/[id]` - Supprimer un membre

**Départements (helper) :**
- `GET /api/departements` - Liste des départements pour les dropdowns

#### Configuration CORS

Le serveur est configuré pour accepter les requêtes de toutes les origines :
- **Headers CORS** : Configurés dans `next.config.ts`
- **Middleware** : Gestion automatique des requêtes OPTIONS
- **Routes API** : Chaque route inclut les handlers OPTIONS

### Frontend (assign_takwa_corrected)

Le frontend est développé avec **React** et **TypeScript**.

#### Composants :

1. **CommissionManagement** : Composant principal avec onglets
2. **CommissionsTab** : Gestion des commissions départementales
3. **FonctionsTab** : Gestion des fonctions
4. **MembresTab** : Gestion des membres
5. **Modales** : Formulaires de création/modification

#### API Client :

Le fichier `src/api/commissionApi.ts` contient tous les appels API typés avec TypeScript.

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
L'URL de base est configurée dans `src/api/commissionApi.ts` :
```typescript
const API_BASE_URL = 'http://localhost:3000/api'; // Port du projet api-crud
```

2. **Démarrage :**
```bash
cd assign_takwa_corrected
npm run dev
```

3. **Accès :**
- Se connecter en tant qu'administrateur
- Naviguer vers "Gestion des Commissions" dans le menu

## Tests

### Test des APIs
```bash
cd api-crud
node scripts/test-commission-api.js
```

### Test du CORS
```bash
cd api-crud
node scripts/test-cors.js
```

## Fonctionnalités

### Gestion des Commissions Départementales

- **Création** : Associer une commission à un département avec libellé et description
- **Modification** : Éditer le libellé et la description (le département ne peut pas être modifié)
- **Suppression** : Supprimer une commission (seulement si elle n'a pas de membres)
- **Filtrage** : Filtrer par département
- **Visualisation** : Voir le nombre de membres et la date de création

### Gestion des Fonctions

- **Création** : Définir de nouvelles fonctions (ex: Président, Secrétaire, Membre)
- **Modification** : Éditer libellé et description
- **Suppression** : Supprimer une fonction (seulement si elle n'est pas utilisée)
- **Visualisation** : Voir le nombre de membres ayant cette fonction

### Gestion des Membres

- **Création** : Ajouter un membre avec nom, fonction, commission, contacts
- **Modification** : Éditer toutes les informations du membre
- **Suppression** : Supprimer un membre
- **Secrétariat** : Marquer un membre comme faisant partie du secrétariat
- **Contacts** : Gérer téléphone et email
- **Association** : Associer à une commission et une fonction

## Sécurité et Validation

### Backend
- Validation des données d'entrée
- Vérification des contraintes de suppression
- Gestion des erreurs avec messages explicites
- Relations de base de données respectées
- Configuration CORS sécurisée

### Frontend
- Validation côté client
- Gestion d'état avec loading/error
- Confirmations de suppression
- Interface utilisateur intuitive

## Permissions

Actuellement accessible aux **Administrateurs** uniquement. Pour étendre l'accès :

1. Modifier les filtres de menu dans `App.tsx`
2. Ajouter les rôles souhaités dans les conditions

## Structure des fichiers

### Backend
```
api-crud/
├── app/api/
│   ├── commission-departementale/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── fonction-commission/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── membre-commission/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── departements/route.ts
├── lib/prisma.ts
├── middleware.ts
├── next.config.ts
└── scripts/
    ├── test-commission-api.js
    └── test-cors.js
```

### Frontend
```
assign_takwa_corrected/src/
├── api/commissionApi.ts
├── components/CommissionManagement.tsx
└── App.tsx (modifié)
```

## Dépannage

### Erreurs Communes

1. **Erreur de connexion API** : 
   - Vérifier que le serveur api-crud fonctionne sur le port 3000
   - Vérifier l'URL dans `commissionApi.ts`

2. **Erreur de base de données** : 
   - Vérifier la configuration DATABASE_URL
   - Exécuter `npm run db:push` pour synchroniser le schéma

3. **Menu non visible** : 
   - Vérifier les permissions utilisateur (doit être admin)

4. **Erreur CORS** : 
   - Vérifier que le middleware est bien configuré
   - Tester avec `node scripts/test-cors.js`

5. **Erreur de suppression** : 
   - Vérifier les contraintes (commission avec membres, fonction utilisée)

### Logs

- Backend : Console du serveur Next.js
- Frontend : Console du navigateur et Network tab

## Extensions Futures

1. **Export** : Génération de rapports PDF/Excel
2. **Import** : Import en masse depuis CSV
3. **Notifications** : Alertes par email aux membres
4. **Historique** : Suivi des modifications
5. **Photos** : Gestion des photos de profil des membres
6. **Calendrier** : Planification des réunions
7. **Permissions granulaires** : Gestion fine des accès

## Support

Pour toute question ou problème, référez-vous à :
1. Les logs d'erreur dans la console
2. Les scripts de test pour valider le fonctionnement
3. La documentation Prisma pour les modèles de données
4. La documentation React pour les composants
