/**
 * Script pour exécuter la migration SQL
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Exécution de la migration SQL...');

// Lire le fichier de migration
const migrationPath = path.join(__dirname, '..', 'migrations', 'add_participation_arrondissement.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Contenu de la migration:');
console.log(migrationSQL);

console.log('\n📋 Pour exécuter cette migration:');
console.log('1. Connectez-vous à votre base de données PostgreSQL');
console.log('2. Exécutez le contenu du fichier migrations/add_participation_arrondissement.sql');
console.log('3. Ou utilisez psql: psql -d votre_base -f migrations/add_participation_arrondissement.sql');

console.log('\n✅ Migration prête à être exécutée !');
