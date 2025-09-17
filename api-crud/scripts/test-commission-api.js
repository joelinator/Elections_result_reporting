/**
 * Script de test pour les APIs de commission
 * Utilisation: node scripts/test-commission-api.js
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
  console.log('🧪 Démarrage des tests des APIs Commission\n');

  // 1. Test des départements
  console.log('1️⃣ Test: Récupération des départements');
  const departements = await apiCall('/departements');
  if (!departements) return;
  
  const premierDepartement = departements[0];
  console.log(`   Premier département: ${premierDepartement.libelle} (${premierDepartement.code})\n`);

  // 2. Test des fonctions de commission
  console.log('2️⃣ Test: Gestion des fonctions de commission');
  
  // Créer une fonction
  const nouvelleFonction = await apiCall('/fonction-commission', {
    method: 'POST',
    body: JSON.stringify({
      libelle: 'Président de Test',
      description: 'Fonction créée par le script de test'
    })
  });
  
  if (!nouvelleFonction) return;
  const fonctionId = nouvelleFonction.code;
  
  // Lister les fonctions
  console.log('   Liste des fonctions:');
  const fonctions = await apiCall('/fonction-commission');
  
  // Modifier la fonction
  console.log('   Modification de la fonction:');
  await apiCall(`/fonction-commission/${fonctionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      libelle: 'Président de Test Modifié',
      description: 'Description modifiée'
    })
  });

  // 3. Test des commissions départementales
  console.log('\n3️⃣ Test: Gestion des commissions départementales');
  
  // Créer une commission
  const nouvelleCommission = await apiCall('/commission-departementale', {
    method: 'POST',
    body: JSON.stringify({
      libelle: 'Commission de Test',
      description: 'Commission créée par le script de test',
      code_departement: premierDepartement.code
    })
  });
  
  if (!nouvelleCommission) return;
  const commissionId = nouvelleCommission.code;
  
  // Lister les commissions
  console.log('   Liste des commissions:');
  await apiCall('/commission-departementale');
  
  // Modifier la commission
  console.log('   Modification de la commission:');
  await apiCall(`/commission-departementale/${commissionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      libelle: 'Commission de Test Modifiée',
      description: 'Description modifiée'
    })
  });

  // 4. Test des membres de commission
  console.log('\n4️⃣ Test: Gestion des membres de commission');
  
  // Créer un membre
  const nouveauMembre = await apiCall('/membre-commission', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Jean Dupont',
      code_fonction: fonctionId,
      code_commission: commissionId,
      contact: '+237123456789',
      email: 'jean.dupont@test.com',
      est_membre_secretariat: true
    })
  });
  
  if (!nouveauMembre) return;
  const membreId = nouveauMembre.code;
  
  // Lister les membres
  console.log('   Liste des membres:');
  await apiCall('/membre-commission');
  
  // Modifier le membre
  console.log('   Modification du membre:');
  await apiCall(`/membre-commission/${membreId}`, {
    method: 'PUT',
    body: JSON.stringify({
      nom: 'Jean Dupont Modifié',
      code_fonction: fonctionId,
      code_commission: commissionId,
      contact: '+237987654321',
      email: 'jean.dupont.modifie@test.com',
      est_membre_secretariat: false
    })
  });

  // 5. Nettoyage - Suppression des données de test
  console.log('\n5️⃣ Nettoyage: Suppression des données de test');
  
  // Supprimer le membre
  console.log('   Suppression du membre:');
  await apiCall(`/membre-commission/${membreId}`, {
    method: 'DELETE'
  });
  
  // Supprimer la commission
  console.log('   Suppression de la commission:');
  await apiCall(`/commission-departementale/${commissionId}`, {
    method: 'DELETE'
  });
  
  // Supprimer la fonction
  console.log('   Suppression de la fonction:');
  await apiCall(`/fonction-commission/${fonctionId}`, {
    method: 'DELETE'
  });

  console.log('\n✅ Tous les tests sont terminés avec succès !');
};

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});
