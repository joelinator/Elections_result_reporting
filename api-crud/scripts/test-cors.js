/**
 * Script de test pour vérifier la configuration CORS
 * Utilisation: node scripts/test-cors.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Test de requête CORS avec différentes origines
const testCORS = async () => {
  console.log('🧪 Test de la configuration CORS\n');

  // Test 1: Requête OPTIONS (preflight)
  console.log('1️⃣ Test de la requête OPTIONS (preflight)');
  try {
    const response = await fetch(`${BASE_URL}/departements`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`   Access-Control-Allow-Headers: ${response.headers.get('Access-Control-Allow-Headers')}`);
    
    if (response.status === 200) {
      console.log('   ✅ Requête OPTIONS réussie\n');
    } else {
      console.log('   ❌ Requête OPTIONS échouée\n');
    }
  } catch (error) {
    console.error('   ❌ Erreur lors de la requête OPTIONS:', error.message, '\n');
  }

  // Test 2: Requête GET normale avec origine différente
  console.log('2️⃣ Test de requête GET avec origine différente');
  try {
    const response = await fetch(`${BASE_URL}/departements`, {
      method: 'GET',
      headers: {
        'Origin': 'http://example.com',
        'Content-Type': 'application/json',
      }
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Requête GET réussie - ${data.length} départements récupérés\n`);
    } else {
      console.log('   ❌ Requête GET échouée\n');
    }
  } catch (error) {
    console.error('   ❌ Erreur lors de la requête GET:', error.message, '\n');
  }

  // Test 3: Test avec différents endpoints
  console.log('3️⃣ Test de tous les endpoints principaux');
  const endpoints = [
    '/departements',
    '/fonction-commission',
    '/commission-departementale',
    '/membre-commission'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Origin': 'http://different-origin.com',
          'Content-Type': 'application/json',
        }
      });

      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      console.log(`   ${endpoint}: ${response.status} - CORS: ${corsHeader || 'Absent'}`);
      
    } catch (error) {
      console.log(`   ${endpoint}: Erreur - ${error.message}`);
    }
  }

  console.log('\n✅ Tests CORS terminés');
  console.log('\n📋 Résumé de la configuration:');
  console.log('   - Access-Control-Allow-Origin: * (toutes origines)');
  console.log('   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  console.log('   - Access-Control-Allow-Headers: Content-Type, Authorization');
  console.log('   - Middleware Next.js configuré');
  console.log('   - Handlers OPTIONS ajoutés à toutes les routes');
};

// Exécuter les tests
testCORS().catch(error => {
  console.error('❌ Erreur lors des tests CORS:', error);
  process.exit(1);
});
