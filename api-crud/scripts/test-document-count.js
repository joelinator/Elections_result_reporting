/**
 * Script de test pour vérifier l'affichage du nombre de documents par arrondissement
 * Utilisation: node scripts/test-document-count.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Helper pour faire des requêtes
const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

// Test de l'affichage des comptes de documents
const testDocumentCount = async () => {
  console.log('🧪 Test de l\'affichage du nombre de documents par arrondissement\n');

  try {
    // 1. Récupérer tous les arrondissements avec leurs documents
    console.log('1️⃣ Récupération des arrondissements avec documents');
    const arrondissements = await apiCall('/arrondissement');
    
    console.log(`✅ ${arrondissements.length} arrondissements trouvés\n`);

    // 2. Analyser les données pour chaque arrondissement
    console.log('2️⃣ Analyse des documents par arrondissement:');
    console.log('─'.repeat(80));
    console.log('| Arrondissement                    | Documents | Dernière soumission     |');
    console.log('─'.repeat(80));

    let totalDocuments = 0;
    let arrondissementsAvecDocuments = 0;

    arrondissements.forEach(arr => {
      const nbDocuments = arr.pvArrondissements?.length || 0;
      totalDocuments += nbDocuments;
      
      if (nbDocuments > 0) {
        arrondissementsAvecDocuments++;
      }

      // Trouver le document le plus récent
      let dernierDocument = null;
      if (arr.pvArrondissements && arr.pvArrondissements.length > 0) {
        dernierDocument = arr.pvArrondissements
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      }

      const nomArrondissement = `${arr.libelle} (${arr.abbreviation || 'N/A'})`.padEnd(35);
      const nbDocsStr = nbDocuments.toString().padStart(7);
      const derniereDate = dernierDocument 
        ? new Date(dernierDocument.timestamp).toLocaleDateString()
        : 'Aucun';

      console.log(`| ${nomArrondissement} | ${nbDocsStr} | ${derniereDate.padEnd(20)} |`);
    });

    console.log('─'.repeat(80));
    console.log(`Total: ${arrondissements.length} arrondissements, ${totalDocuments} documents`);
    console.log(`Arrondissements avec documents: ${arrondissementsAvecDocuments}/${arrondissements.length}`);

    // 3. Test des statistiques calculées
    console.log('\n3️⃣ Vérification des statistiques UI:');
    
    const stats = {
      totalArrondissements: arrondissements.length,
      totalDocuments: totalDocuments,
      arrondissementsAvecDocuments: arrondissementsAvecDocuments,
      pourcentageAvecDocuments: arrondissements.length > 0 
        ? Math.round((arrondissementsAvecDocuments / arrondissements.length) * 100)
        : 0
    };

    console.log('📊 Statistiques pour l\'interface utilisateur:');
    console.log(`   - Arrondissements total: ${stats.totalArrondissements}`);
    console.log(`   - Documents soumis: ${stats.totalDocuments}`);
    console.log(`   - Avec documents: ${stats.arrondissementsAvecDocuments}`);
    console.log(`   - Pourcentage avec documents: ${stats.pourcentageAvecDocuments}%`);

    // 4. Test d'un arrondissement spécifique avec ses documents détaillés
    const arrAvecDocuments = arrondissements.find(arr => (arr.pvArrondissements?.length || 0) > 0);
    
    if (arrAvecDocuments) {
      console.log('\n4️⃣ Exemple détaillé d\'un arrondissement avec documents:');
      console.log(`📍 ${arrAvecDocuments.libelle} (${arrAvecDocuments.abbreviation})`);
      console.log(`   Département: ${arrAvecDocuments.departement?.libelle || 'N/A'}`);
      console.log(`   Région: ${arrAvecDocuments.region?.libelle || 'N/A'}`);
      console.log(`   Documents (${arrAvecDocuments.pvArrondissements.length}):`);
      
      arrAvecDocuments.pvArrondissements
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .forEach((doc, index) => {
          console.log(`     ${index + 1}. ${doc.libelle}`);
          console.log(`        Soumis le: ${new Date(doc.timestamp).toLocaleString()}`);
        });
    } else {
      console.log('\n4️⃣ Aucun arrondissement avec documents trouvé pour l\'exemple détaillé');
    }

    // 5. Recommandations pour l'UI
    console.log('\n5️⃣ Recommandations pour l\'interface utilisateur:');
    
    if (totalDocuments === 0) {
      console.log('⚠️  Aucun document trouvé - l\'UI devrait afficher un message d\'encouragement');
    } else if (arrondissementsAvecDocuments < arrondissements.length / 2) {
      console.log('📢 Moins de 50% des arrondissements ont des documents - considérer des rappels');
    } else {
      console.log('✅ Bonne couverture de documents par arrondissement');
    }

    if (stats.totalDocuments > 10) {
      console.log('💡 Considérer l\'ajout de pagination ou de filtres avancés');
    }

    console.log('\n✅ Test de l\'affichage des documents terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
};

// Exécuter le test
testDocumentCount();
