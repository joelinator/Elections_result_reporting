/**
 * Script de test pour vérifier le seed
 */

const { PrismaClient } = require('@prisma/client');

async function testSeed() {
  console.log('🧪 Test du seed de la base de données');
  console.log('=====================================');

  const prisma = new PrismaClient();

  try {
    // Test de connexion
    console.log('🔌 Test de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion réussie !');

    // Vérifier les données existantes
    console.log('\n📊 Vérification des données existantes...');
    
    const regions = await prisma.region.count();
    const departments = await prisma.departement.count();
    const arrondissements = await prisma.arrondissement.count();
    const participationsDept = await prisma.participationDepartement.count();
    const participationsArr = await prisma.participationArrondissement.count();
    const candidats = await prisma.candidat.count();
    const partis = await prisma.partiPolitique.count();
    const utilisateurs = await prisma.utilisateur.count();
    const roles = await prisma.role.count();

    console.log(`   • Régions: ${regions}`);
    console.log(`   • Départements: ${departments}`);
    console.log(`   • Arrondissements: ${arrondissements}`);
    console.log(`   • Participations départementales: ${participationsDept}`);
    console.log(`   • Participations d'arrondissement: ${participationsArr}`);
    console.log(`   • Candidats: ${candidats}`);
    console.log(`   • Partis politiques: ${partis}`);
    console.log(`   • Utilisateurs: ${utilisateurs}`);
    console.log(`   • Rôles: ${roles}`);

    // Test des relations
    console.log('\n🔗 Test des relations...');
    
    const participationArrWithRelations = await prisma.participationArrondissement.findFirst({
      include: {
        arrondissement: {
          include: {
            departement: {
              include: {
                region: true
              }
            }
          }
        }
      }
    });

    if (participationArrWithRelations) {
      console.log('✅ Relations ParticipationArrondissement → Arrondissement → Département → Région OK');
      console.log(`   Exemple: ${participationArrWithRelations.arrondissement.libelle} → ${participationArrWithRelations.arrondissement.departement.libelle} → ${participationArrWithRelations.arrondissement.departement.region.libelle}`);
    } else {
      console.log('⚠️ Aucune participation d\'arrondissement trouvée');
    }

    // Test des calculs
    console.log('\n🧮 Test des calculs...');
    
    const participation = await prisma.participationArrondissement.findFirst();
    if (participation) {
      const tauxParticipation = (participation.nombre_votant / participation.nombre_inscrit) * 100;
      const suffrageExprime = (participation.nombre_suffrages_valable / participation.nombre_votant) * 100;
      
      console.log(`   Taux de participation calculé: ${tauxParticipation.toFixed(2)}%`);
      console.log(`   Suffrage exprimé calculé: ${suffrageExprime.toFixed(2)}%`);
      console.log(`   Taux stocké: ${participation.taux_participation}%`);
      console.log(`   Suffrage stocké: ${participation.suffrage_exprime}%`);
      
      if (Math.abs(tauxParticipation - participation.taux_participation) < 0.01) {
        console.log('✅ Calculs de participation corrects');
      } else {
        console.log('⚠️ Différence dans les calculs de participation');
      }
    }

    console.log('\n✅ Test du seed terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.message.includes('DATABASE_URL')) {
      console.log('\n💡 Solution:');
      console.log('   1. Configurez votre base de données PostgreSQL');
      console.log('   2. Modifiez le fichier .env avec vos informations de connexion');
      console.log('   3. Exécutez: node scripts/setup-database.js');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testSeed();
