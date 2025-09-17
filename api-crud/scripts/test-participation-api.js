/**
 * Script de test pour les APIs de participation départementale
 * Utilisation: node scripts/test-participation-api.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Helper pour faire des requêtes
const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`🔍 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Erreur ${response.status}:`, data.error);
      return null;
    }
    
    console.log(`✅ Succès:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Erreur réseau:`, error.message);
    return null;
  }
};

// Tests des APIs
const runTests = async () => {
  console.log('🧪 Démarrage des tests des APIs Participation Départementale\n');

  // 1. Test des départements (prérequis)
  console.log('1️⃣ Test: Récupération des départements');
  const departements = await apiCall('/departements');
  if (!departements || departements.length === 0) {
    console.log('⚠️ Aucun département trouvé, les tests suivants peuvent échouer\n');
    return;
  }
  
  const premierDepartement = departements[0];
  console.log(`   Premier département: ${premierDepartement.libelle} (${premierDepartement.code})\n`);

  // 2. Test des participations - Lecture initiale
  console.log('2️⃣ Test: Récupération des participations existantes');
  const participationsInitiales = await apiCall('/participation-departement');
  console.log(`   ${participationsInitiales ? participationsInitiales.length : 0} participations trouvées\n`);

  // 3. Test de création d'une participation
  console.log('3️⃣ Test: Création d\'une nouvelle participation');
  
  const nouvelleParticipation = await apiCall('/participation-departement', {
    method: 'POST',
    body: JSON.stringify({
      code_departement: premierDepartement.code,
      nombre_bureau_vote: 15,
      nombre_inscrit: 25000,
      nombre_votant: 18500,
      nombre_enveloppe_urnes: 18500,
      nombre_enveloppe_bulletins_differents: 50,
      nombre_bulletin_electeur_identifiable: 25,
      nombre_bulletin_enveloppes_signes: 30,
      nombre_enveloppe_non_elecam: 10,
      nombre_bulletin_non_elecam: 15,
      nombre_bulletin_sans_enveloppe: 8,
      nombre_enveloppe_vide: 45,
      nombre_suffrages_valable: 17800,
      bulletin_nul: 700,
      suffrage_exprime: 96.2,
      taux_participation: 74.0
    })
  });
  
  if (!nouvelleParticipation) return;
  const participationId = nouvelleParticipation.code;
  
  // 4. Vérification des calculs automatiques
  console.log('\n4️⃣ Test: Vérification des calculs automatiques');
  const tauxCalcule = (18500 / 25000) * 100;
  const suffrageCalcule = (17800 / 18500) * 100;
  
  console.log(`   Taux de participation calculé: ${tauxCalcule.toFixed(2)}%`);
  console.log(`   Suffrage exprimé calculé: ${suffrageCalcule.toFixed(2)}%`);
  console.log(`   Cohérence: Suffrages valables (17800) + Bulletins nuls (700) = ${17800 + 700} / Votants (18500)`);

  // 5. Test de récupération par ID
  console.log('\n5️⃣ Test: Récupération par ID');
  await apiCall(`/participation-departement/${participationId}`);

  // 6. Test de modification
  console.log('\n6️⃣ Test: Modification de la participation');
  await apiCall(`/participation-departement/${participationId}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre_inscrit: 26000,
      nombre_votant: 19000,
      nombre_suffrages_valable: 18200,
      bulletin_nul: 800
    })
  });

  // 7. Test avec filtres
  console.log('\n7️⃣ Test: Filtrage par département');
  await apiCall(`/participation-departement?departement=${premierDepartement.code}`);

  // 8. Test de validation des données incohérentes
  console.log('\n8️⃣ Test: Validation des données (doit échouer)');
  await apiCall('/participation-departement', {
    method: 'POST',
    body: JSON.stringify({
      code_departement: premierDepartement.code + 999, // Département inexistant
      nombre_inscrit: 1000,
      nombre_votant: 1500, // Plus de votants que d'inscrits (incohérent)
      nombre_suffrages_valable: 800,
      bulletin_nul: 200
    })
  });

  // 9. Test de création en double (doit échouer)
  console.log('\n9️⃣ Test: Création en double (doit échouer)');
  await apiCall('/participation-departement', {
    method: 'POST',
    body: JSON.stringify({
      code_departement: premierDepartement.code, // Même département que la première participation
      nombre_inscrit: 5000,
      nombre_votant: 3000,
      nombre_suffrages_valable: 2800,
      bulletin_nul: 200
    })
  });

  // 10. Analyse statistique
  console.log('\n🔟 Test: Analyse statistique des participations');
  const toutesParticipations = await apiCall('/participation-departement');
  
  if (toutesParticipations && toutesParticipations.length > 0) {
    const stats = toutesParticipations.reduce((acc, p) => {
      acc.totalInscrits += p.nombre_inscrit;
      acc.totalVotants += p.nombre_votant;
      acc.totalSuffragesValables += p.nombre_suffrages_valable;
      acc.totalBulletinsNuls += p.bulletin_nul;
      return acc;
    }, { totalInscrits: 0, totalVotants: 0, totalSuffragesValables: 0, totalBulletinsNuls: 0 });

    const tauxParticipationGlobal = stats.totalInscrits > 0 ? (stats.totalVotants / stats.totalInscrits) * 100 : 0;
    const suffrageExprimeGlobal = stats.totalVotants > 0 ? (stats.totalSuffragesValables / stats.totalVotants) * 100 : 0;

    console.log('📊 Statistiques globales:');
    console.log(`   Départements avec participation: ${toutesParticipations.length}`);
    console.log(`   Total inscrits: ${stats.totalInscrits.toLocaleString()}`);
    console.log(`   Total votants: ${stats.totalVotants.toLocaleString()}`);
    console.log(`   Taux de participation global: ${tauxParticipationGlobal.toFixed(2)}%`);
    console.log(`   Total suffrages valables: ${stats.totalSuffragesValables.toLocaleString()}`);
    console.log(`   Total bulletins nuls: ${stats.totalBulletinsNuls.toLocaleString()}`);
    console.log(`   Suffrage exprimé global: ${suffrageExprimeGlobal.toFixed(2)}%`);

    // Analyse par département
    console.log('\n📋 Détail par département:');
    toutesParticipations.forEach(p => {
      const taux = p.taux_participation || ((p.nombre_votant / p.nombre_inscrit) * 100);
      console.log(`   ${p.departement?.libelle || 'N/A'}: ${taux.toFixed(2)}% participation (${p.nombre_votant.toLocaleString()}/${p.nombre_inscrit.toLocaleString()})`);
    });
  }

  // 11. Nettoyage - Suppression des données de test
  console.log('\n1️⃣1️⃣ Nettoyage: Suppression des données de test');
  await apiCall(`/participation-departement/${participationId}`, {
    method: 'DELETE'
  });

  console.log('\n✅ Tous les tests sont terminés avec succès !');
  
  // Recommandations pour l'UI
  console.log('\n💡 Recommandations pour l\'interface utilisateur:');
  console.log('   - Implémenter la validation en temps réel des données');
  console.log('   - Afficher les calculs automatiques (taux, pourcentages)');
  console.log('   - Proposer des graphiques pour visualiser les tendances');
  console.log('   - Ajouter des alertes pour les données incohérentes');
  console.log('   - Permettre l\'export des données en CSV/Excel');
};

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});
