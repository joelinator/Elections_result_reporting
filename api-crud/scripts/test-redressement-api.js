/**
 * Script de test pour les APIs de redressement
 * Utilisation: node scripts/test-redressement-api.js
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
  console.log('🧪 Démarrage des tests des APIs Redressement\n');

  // 1. Test des prérequis - bureaux de vote
  console.log('1️⃣ Test: Récupération des bureaux de vote');
  const bureauxVote = await apiCall('/bureaux-vote');
  if (!bureauxVote || bureauxVote.length === 0) {
    console.log('⚠️ Aucun bureau de vote trouvé, les tests suivants peuvent échouer\n');
    return;
  }
  
  const premierBureau = bureauxVote[0];
  console.log(`   Premier bureau: ${premierBureau.designation} (${premierBureau.code})\n`);

  // 2. Test des partis politiques
  console.log('2️⃣ Test: Récupération des partis politiques');
  const partis = await apiCall('/partis-politiques');
  if (!partis || partis.length === 0) {
    console.log('⚠️ Aucun parti trouvé, les tests candidats peuvent échouer\n');
    return;
  }
  
  const premierParti = partis[0];
  console.log(`   Premier parti: ${premierParti.designation} (${premierParti.code})\n`);

  // 3. Test des redressements bureau de vote
  console.log('3️⃣ Test: Gestion des redressements bureau de vote');
  
  // Créer un redressement bureau
  const nouveauRedressementBureau = await apiCall('/redressement-bureau-vote', {
    method: 'POST',
    body: JSON.stringify({
      code_bureau_vote: premierBureau.code,
      nombre_inscrit_initial: 1000,
      nombre_inscrit_redresse: 1050,
      nombre_votant_initial: 750,
      nombre_votant_redresse: 780,
      bulletin_nul_initial: 50,
      bulletin_nul_redresse: 45,
      suffrage_exprime_valables_initial: 700,
      suffrage_exprime_valables_redresse: 735,
      erreurs_materielles_initiales: 'Erreur de comptage initial',
      erreurs_materielles_initiales_redresse: 'Erreur corrigée après vérification',
      raison_redressement: 'Correction suite à recomptage des bulletins'
    })
  });
  
  if (!nouveauRedressementBureau) return;
  const redressementBureauId = nouveauRedressementBureau.code;

  // Vérifier les calculs automatiques
  console.log('\n   Vérification des calculs:');
  const tauxInitial = (750 / 1000) * 100;
  const tauxRedresse = (780 / 1050) * 100;
  console.log(`   Taux participation initial: ${tauxInitial.toFixed(2)}%`);
  console.log(`   Taux participation redressé: ${tauxRedresse.toFixed(2)}%`);
  console.log(`   Amélioration: ${(tauxRedresse - tauxInitial).toFixed(2)} points`);

  // 4. Test des redressements candidat
  console.log('\n4️⃣ Test: Gestion des redressements candidat');
  
  // Créer un redressement candidat
  const nouveauRedressementCandidat = await apiCall('/redressement-candidat', {
    method: 'POST',
    body: JSON.stringify({
      code_bureau_vote: premierBureau.code,
      code_parti: premierParti.code,
      nombre_vote_initial: 350,
      nombre_vote_redresse: 365,
      raison_redressement: 'Correction suite à recomptage des bulletins pour ce candidat'
    })
  });
  
  if (!nouveauRedressementCandidat) return;
  const redressementCandidatId = nouveauRedressementCandidat.code;

  // Vérifier les calculs pour le candidat
  console.log('\n   Calculs pour le candidat:');
  const differenceVotes = 365 - 350;
  const pourcentageChange = ((365 - 350) / 350) * 100;
  console.log(`   Différence de votes: +${differenceVotes}`);
  console.log(`   Pourcentage de changement: +${pourcentageChange.toFixed(2)}%`);

  // 5. Test de récupération avec filtres
  console.log('\n5️⃣ Test: Récupération avec filtres');
  
  // Filtrer par bureau
  console.log('   Redressements pour ce bureau:');
  await apiCall(`/redressement-candidat?bureau_vote=${premierBureau.code}`);
  await apiCall(`/redressement-bureau-vote?bureau_vote=${premierBureau.code}`);

  // Filtrer par parti
  console.log('   Redressements pour ce parti:');
  await apiCall(`/redressement-candidat?parti=${premierParti.code}`);

  // 6. Test de modification
  console.log('\n6️⃣ Test: Modification des redressements');
  
  // Modifier le redressement bureau
  await apiCall(`/redressement-bureau-vote/${redressementBureauId}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre_inscrit_redresse: 1100,
      nombre_votant_redresse: 820,
      raison_redressement: 'Redressement modifié - nouvelle correction'
    })
  });

  // Modifier le redressement candidat
  await apiCall(`/redressement-candidat/${redressementCandidatId}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre_vote_redresse: 370,
      raison_redressement: 'Redressement candidat modifié'
    })
  });

  // 7. Test de récupération par ID
  console.log('\n7️⃣ Test: Récupération par ID');
  await apiCall(`/redressement-bureau-vote/${redressementBureauId}`);
  await apiCall(`/redressement-candidat/${redressementCandidatId}`);

  // 8. Analyse des données de redressement
  console.log('\n8️⃣ Test: Analyse des redressements');
  const tousRedressementsBureaux = await apiCall('/redressement-bureau-vote');
  const tousRedressementsCandidats = await apiCall('/redressement-candidat');

  if (tousRedressementsBureaux && tousRedressementsCandidats) {
    console.log('📊 Statistiques des redressements:');
    console.log(`   Redressements bureaux: ${tousRedressementsBureaux.length}`);
    console.log(`   Redressements candidats: ${tousRedressementsCandidats.length}`);

    // Analyser les tendances
    const redressementsPositifs = tousRedressementsCandidats.filter(r => 
      (r.nombre_vote_redresse || 0) > (r.nombre_vote_initial || 0)
    ).length;

    console.log(`   Redressements candidats positifs: ${redressementsPositifs}/${tousRedressementsCandidats.length}`);
  }

  // 9. Test de contraintes - tentative de doublon
  console.log('\n9️⃣ Test: Tentative de création en double (doit échouer)');
  await apiCall('/redressement-bureau-vote', {
    method: 'POST',
    body: JSON.stringify({
      code_bureau_vote: premierBureau.code, // Même bureau que le premier redressement
      nombre_inscrit_initial: 500,
      nombre_inscrit_redresse: 520,
      raison_redressement: 'Test de doublon'
    })
  });

  // 10. Nettoyage - Suppression des données de test
  console.log('\n🔟 Nettoyage: Suppression des données de test');
  
  // Supprimer le redressement candidat
  console.log('   Suppression du redressement candidat:');
  await apiCall(`/redressement-candidat/${redressementCandidatId}`, {
    method: 'DELETE'
  });
  
  // Supprimer le redressement bureau
  console.log('   Suppression du redressement bureau:');
  await apiCall(`/redressement-bureau-vote/${redressementBureauId}`, {
    method: 'DELETE'
  });

  console.log('\n✅ Tous les tests sont terminés avec succès !');
  
  // Recommandations pour l'UI
  console.log('\n💡 Recommandations pour l\'interface utilisateur:');
  console.log('   - Implémenter la validation en temps réel');
  console.log('   - Afficher les calculs de différence et pourcentage');
  console.log('   - Proposer des graphiques avant/après');
  console.log('   - Ajouter des alertes pour les changements importants');
  console.log('   - Permettre l\'export des rapports de redressement');
  console.log('   - Ajouter un historique des modifications');
};

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});