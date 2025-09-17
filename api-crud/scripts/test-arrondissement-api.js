/**
 * Script de test pour les APIs d'arrondissement et documents
 * Utilisation: node scripts/test-arrondissement-api.js
 */

const BASE_URL = 'http://localhost:3000/api';
const fs = require('fs');
const path = require('path');

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

// Helper pour les requêtes avec FormData
const apiFormCall = async (endpoint, formData, method = 'POST') => {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`🔍 ${method} ${url} (FormData)`);
  
  try {
    const response = await fetch(url, {
      method,
      body: formData,
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

// Créer un fichier de test
const createTestFile = () => {
  const testContent = 'Test document content for arrondissement';
  const testFilePath = path.join(__dirname, 'test-document.txt');
  fs.writeFileSync(testFilePath, testContent);
  return testFilePath;
};

// Tests des APIs
const runTests = async () => {
  console.log('🧪 Démarrage des tests des APIs Arrondissement\n');

  // 1. Test des régions
  console.log('1️⃣ Test: Récupération des régions');
  const regions = await apiCall('/regions');
  if (!regions || regions.length === 0) {
    console.log('⚠️ Aucune région trouvée, les tests suivants peuvent échouer\n');
    return;
  }
  
  const premiereRegion = regions[0];
  console.log(`   Première région: ${premiereRegion.libelle} (${premiereRegion.code})\n`);

  // 2. Test des départements
  console.log('2️⃣ Test: Récupération des départements');
  const departements = await apiCall('/departements');
  if (!departements || departements.length === 0) {
    console.log('⚠️ Aucun département trouvé, les tests suivants peuvent échouer\n');
    return;
  }
  
  const premierDepartement = departements[0];
  console.log(`   Premier département: ${premierDepartement.libelle} (${premierDepartement.code})\n`);

  // 3. Test des arrondissements
  console.log('3️⃣ Test: Gestion des arrondissements');
  
  // Créer un arrondissement
  const nouvelArrondissement = await apiCall('/arrondissement', {
    method: 'POST',
    body: JSON.stringify({
      libelle: 'Arrondissement de Test',
      abbreviation: 'TEST',
      description: 'Arrondissement créé par le script de test',
      code_region: premiereRegion.code,
      code_departement: premierDepartement.code
    })
  });
  
  if (!nouvelArrondissement) return;
  const arrondissementId = nouvelArrondissement.code;
  
  // Lister les arrondissements
  console.log('   Liste des arrondissements:');
  await apiCall('/arrondissement');
  
  // Récupérer un arrondissement par ID
  console.log('   Récupération par ID:');
  await apiCall(`/arrondissement/${arrondissementId}`);
  
  // Modifier l'arrondissement
  console.log('   Modification de l\'arrondissement:');
  await apiCall(`/arrondissement/${arrondissementId}`, {
    method: 'PUT',
    body: JSON.stringify({
      libelle: 'Arrondissement de Test Modifié',
      abbreviation: 'TEST-MOD',
      description: 'Description modifiée'
    })
  });

  // 4. Test des documents d'arrondissement
  console.log('\n4️⃣ Test: Gestion des documents d\'arrondissement');
  
  // Créer un fichier de test
  const testFilePath = createTestFile();
  
  try {
    // Créer un document avec upload
    const formData = new FormData();
    formData.append('code_arrondissement', arrondissementId.toString());
    formData.append('libelle', 'Document de Test');
    
    // Simuler un fichier (dans un vrai test, on utiliserait un vrai fichier)
    const fileContent = fs.readFileSync(testFilePath);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const file = new File([blob], 'test-document.txt', { type: 'text/plain' });
    formData.append('file', file);
    
    const nouveauDocument = await apiFormCall('/document-arrondissement', formData, 'POST');
    
    if (!nouveauDocument) return;
    const documentId = nouveauDocument.code;
    
    // Lister les documents
    console.log('   Liste des documents:');
    await apiCall('/document-arrondissement');
    
    // Récupérer un document par ID
    console.log('   Récupération par ID:');
    await apiCall(`/document-arrondissement/${documentId}`);
    
    // Modifier le document (sans nouveau fichier)
    console.log('   Modification du document:');
    const updateFormData = new FormData();
    updateFormData.append('libelle', 'Document de Test Modifié');
    
    await apiFormCall(`/document-arrondissement/${documentId}`, updateFormData, 'PUT');

    // 5. Nettoyage - Suppression des données de test
    console.log('\n5️⃣ Nettoyage: Suppression des données de test');
    
    // Supprimer le document
    console.log('   Suppression du document:');
    await apiCall(`/document-arrondissement/${documentId}`, {
      method: 'DELETE'
    });
    
    // Supprimer l'arrondissement
    console.log('   Suppression de l\'arrondissement:');
    await apiCall(`/arrondissement/${arrondissementId}`, {
      method: 'DELETE'
    });

    console.log('\n✅ Tous les tests sont terminés avec succès !');
    
  } finally {
    // Nettoyer le fichier de test
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
};

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});
