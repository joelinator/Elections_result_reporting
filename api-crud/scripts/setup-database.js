/**
 * Script de configuration de la base de données
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration de la base de données');
console.log('=====================================');

// Vérifier si .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Création du fichier .env...');
  
  const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/elections_db?schema=public"

# Instructions:
# 1. Remplacez 'postgres' par votre nom d'utilisateur PostgreSQL
# 2. Remplacez 'password' par votre mot de passe PostgreSQL
# 3. Remplacez 'localhost' par l'adresse de votre serveur PostgreSQL
# 4. Remplacez '5432' par le port de votre serveur PostgreSQL
# 5. Remplacez 'elections_db' par le nom de votre base de données
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Fichier .env créé avec succès !');
} else {
  console.log('✅ Fichier .env existe déjà');
}

console.log('\n📋 Prochaines étapes:');
console.log('1. Configurez votre base de données PostgreSQL');
console.log('2. Modifiez le fichier .env avec vos informations de connexion');
console.log('3. Créez la base de données: createdb elections_db');
console.log('4. Exécutez la migration: npx prisma db push');
console.log('5. Exécutez le seed: node scripts/run-seed.js');

console.log('\n🔗 Exemple de configuration PostgreSQL:');
console.log('   sudo -u postgres psql');
console.log('   CREATE DATABASE elections_db;');
console.log('   CREATE USER elections_user WITH PASSWORD \'your_password\';');
console.log('   GRANT ALL PRIVILEGES ON DATABASE elections_db TO elections_user;');
console.log('   \\q');

console.log('\n📝 Exemple de DATABASE_URL:');
console.log('   DATABASE_URL="postgresql://elections_user:your_password@localhost:5432/elections_db?schema=public"');
