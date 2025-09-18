/**
 * Script de test pour l'API des participations d'arrondissement
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testParticipationArrondissementAPI() {
  console.log('🧪 Test de l\'API Participation Arrondissement');
  console.log('================================================');

  try {
    // Test 1: GET /api/participation-arrondissement
    console.log('\n1. Test GET /api/participation-arrondissement');
    const getAllResponse = await fetch(`${API_BASE_URL}/participation-arrondissement`);
    const allParticipations = await getAllResponse.json();
    console.log(`✅ Récupération de ${allParticipations.length} participations`);
    console.log('Première participation:', allParticipations[0] || 'Aucune participation trouvée');

    // Test 2: GET avec filtres
    console.log('\n2. Test GET avec filtres');
    const filteredResponse = await fetch(`${API_BASE_URL}/participation-arrondissement?region=1`);
    const filteredParticipations = await filteredResponse.json();
    console.log(`✅ Récupération de ${filteredParticipations.length} participations filtrées par région`);

    // Test 3: POST /api/participation-arrondissement
    console.log('\n3. Test POST /api/participation-arrondissement');
    const newParticipation = {
      code_arrondissement: 1, // Assurez-vous que cet arrondissement existe
      nombre_bureau_vote: 5,
      nombre_inscrit: 1000,
      nombre_votant: 800,
      nombre_suffrages_valable: 750,
      bulletin_nul: 50,
      nombre_enveloppe_urnes: 800,
      nombre_enveloppe_vide: 0,
      nombre_enveloppe_non_elecam: 0
    };

    const createResponse = await fetch(`${API_BASE_URL}/participation-arrondissement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newParticipation)
    });

    if (createResponse.ok) {
      const createdParticipation = await createResponse.json();
      console.log('✅ Participation créée avec succès:', createdParticipation.code);
      
      // Test 4: GET /api/participation-arrondissement/[id]
      console.log('\n4. Test GET /api/participation-arrondissement/[id]');
      const getByIdResponse = await fetch(`${API_BASE_URL}/participation-arrondissement/${createdParticipation.code}`);
      const participationById = await getByIdResponse.json();
      console.log('✅ Récupération par ID:', participationById.code);

      // Test 5: PUT /api/participation-arrondissement/[id]
      console.log('\n5. Test PUT /api/participation-arrondissement/[id]');
      const updateData = {
        nombre_votant: 850,
        nombre_suffrages_valable: 800
      };

      const updateResponse = await fetch(`${API_BASE_URL}/participation-arrondissement/${createdParticipation.code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updatedParticipation = await updateResponse.json();
        console.log('✅ Participation mise à jour:', updatedParticipation.nombre_votant);
      } else {
        console.log('❌ Erreur lors de la mise à jour:', await updateResponse.text());
      }

      // Test 6: DELETE /api/participation-arrondissement/[id]
      console.log('\n6. Test DELETE /api/participation-arrondissement/[id]');
      const deleteResponse = await fetch(`${API_BASE_URL}/participation-arrondissement/${createdParticipation.code}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log('✅ Participation supprimée avec succès');
      } else {
        console.log('❌ Erreur lors de la suppression:', await deleteResponse.text());
      }
    } else {
      console.log('❌ Erreur lors de la création:', await createResponse.text());
    }

    // Test 7: Test des calculs automatiques
    console.log('\n7. Test des calculs automatiques');
    const testData = {
      code_arrondissement: 2, // Assurez-vous que cet arrondissement existe
      nombre_inscrit: 2000,
      nombre_votant: 1600,
      nombre_suffrages_valable: 1500
    };

    const testCreateResponse = await fetch(`${API_BASE_URL}/participation-arrondissement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (testCreateResponse.ok) {
      const testParticipation = await testCreateResponse.json();
      console.log('✅ Test de création avec calculs automatiques:');
      console.log(`   Taux de participation: ${testParticipation.taux_participation}%`);
      console.log(`   Suffrage exprimé: ${testParticipation.suffrage_exprime}%`);
      
      // Nettoyer
      await fetch(`${API_BASE_URL}/participation-arrondissement/${testParticipation.code}`, {
        method: 'DELETE'
      });
    }

    console.log('\n🎉 Tous les tests sont terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
testParticipationArrondissementAPI();
