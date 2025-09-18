/**
 * Script pour exécuter le seed de la base de données
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Exécution du seed de la base de données...');
console.log('===============================================');

// Changer vers le répertoire api-crud
const apiCrudPath = path.join(__dirname, '..');

exec('npx prisma db seed', { cwd: apiCrudPath }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors du seed:', error);
    return;
  }
  
  if (stderr) {
    console.log('⚠️ Avertissements:', stderr);
  }
  
  console.log('✅ Seed exécuté avec succès !');
  console.log(stdout);
  
  console.log('\n📋 Données créées:');
  console.log('   • 4 régions (Adamaoua, Centre, Littoral, Sud-Ouest)');
  console.log('   • 3 départements (Wouri, Mfoundi, Fako)');
  console.log('   • 4 arrondissements (Douala 1er/2ème, Yaoundé 1er/2ème)');
  console.log('   • 3 bureaux de vote');
  console.log('   • 3 candidats (Paul BIYA, Maurice KAMTO, Cabral LIBII)');
  console.log('   • 3 partis politiques (RDPC, MRC, PCRN)');
  console.log('   • 3 utilisateurs avec rôles');
  console.log('   • 2 participations départementales');
  console.log('   • 4 participations d\'arrondissement');
  console.log('   • Résultats électoraux par département');
  
  console.log('\n🚀 Vous pouvez maintenant:');
  console.log('   1. Tester l\'API avec: node scripts/test-participation-arrondissement-api.js');
  console.log('   2. Démarrer le serveur avec: npm run dev');
  console.log('   3. Accéder à l\'interface d\'administration');
});
