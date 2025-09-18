# 🌱 Seed de la Base de Données - Elections

## 📋 Vue d'ensemble

Le fichier `seed.ts` a été mis à jour pour inclure le nouveau modèle `ParticipationArrondissement` et créer des données de test réalistes pour toutes les entités du système électoral.

## 🏗️ Données créées

### **Géographie**
- **4 Régions** : Adamaoua, Centre, Littoral, Sud-Ouest
- **3 Départements** : Wouri, Mfoundi, Fako
- **4 Arrondissements** : Douala 1er/2ème, Yaoundé 1er/2ème

### **Élections**
- **3 Candidats** : Paul BIYA, Maurice KAMTO, Cabral LIBII
- **3 Partis politiques** : RDPC, MRC, PCRN
- **3 Bureaux de vote** avec coordonnées GPS

### **Utilisateurs et Rôles**
- **4 Rôles** : Administrateur, Coordinateur Régional, Superviseur Départemental, Opérateur
- **3 Utilisateurs** avec assignations départementales

### **Données de Participation**
- **2 Participations départementales** (Wouri, Mfoundi)
- **4 Participations d'arrondissement** (tous les arrondissements)
- **Résultats électoraux** par département et parti

## 🚀 Utilisation

### **1. Configuration de la base de données**

```bash
# Configurer la base de données
node scripts/setup-database.js

# Modifier le fichier .env avec vos informations de connexion
# Exemple: DATABASE_URL="postgresql://user:password@localhost:5432/elections_db?schema=public"
```

### **2. Création de la base de données**

```bash
# Créer la base de données PostgreSQL
createdb elections_db

# Ou via psql
sudo -u postgres psql
CREATE DATABASE elections_db;
CREATE USER elections_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE elections_db TO elections_user;
\q
```

### **3. Migration et Seed**

```bash
# Appliquer le schéma à la base de données
npx prisma db push

# Exécuter le seed
node scripts/run-seed.js

# Ou directement
npx prisma db seed
```

### **4. Test des données**

```bash
# Tester que le seed a fonctionné
node scripts/test-seed.js
```

## 📊 Données de Test

### **Participations d'Arrondissement**

| Arrondissement | Inscrits | Votants | Taux | Suffrages Valables |
|----------------|----------|---------|------|-------------------|
| Douala 1er     | 225,000  | 142,500 | 63.33% | 139,750 |
| Douala 2ème    | 225,000  | 142,500 | 63.33% | 139,750 |
| Yaoundé 1er    | 190,000  | 122,500 | 64.47% | 120,600 |
| Yaoundé 2ème   | 190,000  | 122,500 | 64.47% | 120,600 |

### **Résultats Électoraux**

#### **Wouri (Douala)**
- RDPC (Paul BIYA) : 165,000 voix (59.05%)
- MRC (Maurice KAMTO) : 75,000 voix (26.83%)
- PCRN (Cabral LIBII) : 25,000 voix (8.94%)

#### **Mfoundi (Yaoundé)**
- RDPC (Paul BIYA) : 120,000 voix (49.75%)
- MRC (Maurice KAMTO) : 85,000 voix (35.23%)
- PCRN (Cabral LIBII) : 22,000 voix (9.12%)

## 🔧 Scripts Disponibles

### **Configuration**
- `scripts/setup-database.js` - Configuration de la base de données
- `scripts/run-seed.js` - Exécution du seed
- `scripts/test-seed.js` - Test des données créées

### **API**
- `scripts/test-participation-arrondissement-api.js` - Test des endpoints API
- `scripts/generate-prisma-client.js` - Génération du client Prisma

## 🎯 Utilisateurs de Test

### **Administrateur**
- **Username** : `admin`
- **Password** : `admin123`
- **Rôle** : Administrateur Système
- **Accès** : Toutes les fonctionnalités

### **Superviseur Départemental**
- **Username** : `jmballa`
- **Password** : `password123`
- **Rôle** : Superviseur Départemental
- **Département** : Wouri (Douala)

### **Superviseur Départemental**
- **Username** : `mngono`
- **Password** : `password123`
- **Rôle** : Superviseur Départemental
- **Département** : Mfoundi (Yaoundé)

## 🔍 Vérification des Données

### **Relations Testées**
- ✅ ParticipationArrondissement → Arrondissement
- ✅ Arrondissement → Département
- ✅ Département → Région
- ✅ Candidat → PartiPolitique
- ✅ Utilisateur → Rôle
- ✅ Utilisateur → Département

### **Calculs Vérifiés**
- ✅ Taux de participation = (votants / inscrits) × 100
- ✅ Suffrage exprimé = (suffrages valables / votants) × 100
- ✅ Cohérence des données entre arrondissements et départements

## 🚨 Dépannage

### **Erreur DATABASE_URL**
```bash
# Solution
node scripts/setup-database.js
# Puis modifier le fichier .env
```

### **Erreur de connexion PostgreSQL**
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl start postgresql

# Vérifier la connexion
psql -h localhost -U postgres -d elections_db
```

### **Erreur de permissions**
```bash
# Accorder les permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE elections_db TO elections_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO elections_user;
\q
```

## 📝 Notes Importantes

- **Données réalistes** : Tous les chiffres sont cohérents et réalistes
- **Relations intactes** : Toutes les relations entre entités sont préservées
- **Calculs automatiques** : Les taux sont calculés automatiquement
- **Sécurité** : Les mots de passe sont hashés (en production)
- **Performance** : Index créés pour les requêtes rapides

## 🔄 Réinitialisation

Pour réinitialiser complètement la base de données :

```bash
# Supprimer et recréer la base
dropdb elections_db
createdb elections_db

# Réappliquer le schéma et le seed
npx prisma db push
npx prisma db seed
```

Le seed est maintenant prêt à être utilisé avec le nouveau modèle `ParticipationArrondissement` ! 🎉
