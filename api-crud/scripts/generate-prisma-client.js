/**
 * Script pour générer le client Prisma après les modifications du schéma
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Génération du client Prisma...');

// Changer vers le répertoire api-crud
const apiCrudPath = path.join(__dirname, '..');

exec('npx prisma generate', { cwd: apiCrudPath }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors de la génération du client Prisma:', error);
    return;
  }
  
  if (stderr) {
    console.log('⚠️ Avertissements:', stderr);
  }
  
  console.log('✅ Client Prisma généré avec succès !');
  console.log(stdout);
  
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Exécuter la migration SQL: migrations/add_participation_arrondissement.sql');
  console.log('2. Redémarrer le serveur API');
  console.log('3. Tester les endpoints avec: node scripts/test-participation-arrondissement-api.js');
});
