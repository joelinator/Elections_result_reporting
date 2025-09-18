// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with election data...');

  // Clear existing data
  await prisma.redressementCandidat.deleteMany();
  await prisma.redressementBureauVote.deleteMany();
  await prisma.resultatDepartement.deleteMany();
  await prisma.participationArrondissement.deleteMany();
  await prisma.participationDepartement.deleteMany();
  await prisma.utilisateurDepartement.deleteMany();
  await prisma.bureauVote.deleteMany();
  await prisma.arrondissement.deleteMany();
  await prisma.partiPolitique.deleteMany();
  await prisma.candidat.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.departement.deleteMany();
  await prisma.region.deleteMany();
  await prisma.role.deleteMany();

  // Insert Regions
  console.log('📍 Creating regions...');
  const regions = await Promise.all([
    prisma.region.create({
      data: {
        abbreviation: 'AD',
        libelle: 'Adamaoua',
        chef_lieu: 'Ngaoundéré',
        description: 'Région de l\'Adamaoua',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.region.create({
      data: {
        abbreviation: 'CE',
        libelle: 'Centre',
        chef_lieu: 'Yaoundé',
        description: 'Région du Centre',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.region.create({
      data: {
        abbreviation: 'LT',
        libelle: 'Littoral',
        chef_lieu: 'Douala',
        description: 'Région du Littoral',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.region.create({
      data: {
        abbreviation: 'SW',
        libelle: 'Sud-Ouest',
        chef_lieu: 'Buea',
        description: 'Région du Sud-Ouest',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.region.create({
      data: {
        abbreviation: 'NO',
        libelle: 'Nord-Ouest',
        chef_lieu: 'Bamenda',
        description: 'Région du Nord-Ouest',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.region.create({
      data: {
        abbreviation: 'SU',
        libelle: 'Sud',
        chef_lieu: 'Ebolowa',
        description: 'Région du Sud',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    })
  ]);

  // Insert Departments
  console.log('🏛️ Creating departments...');
  const departments = await Promise.all([
    // Littoral Region
    prisma.departement.create({
      data: {
        abbreviation: 'WOU',
        chef_lieu: 'Douala',
        libelle: 'Wouri',
        description: 'Département du Wouri',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[2].code // Littoral
      }
    }),
    prisma.departement.create({
      data: {
        abbreviation: 'MUN',
        chef_lieu: 'Douala',
        libelle: 'Mungo',
        description: 'Département du Mungo',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[2].code // Littoral
      }
    }),
    // Centre Region
    prisma.departement.create({
      data: {
        abbreviation: 'MFO',
        chef_lieu: 'Yaoundé',
        libelle: 'Mfoundi',
        description: 'Département de la Mfoundi',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[1].code // Centre
      }
    }),
    prisma.departement.create({
      data: {
        abbreviation: 'LEK',
        chef_lieu: 'Monatélé',
        libelle: 'Lekié',
        description: 'Département de la Lekié',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[1].code // Centre
      }
    }),
    // Sud-Ouest Region
    prisma.departement.create({
      data: {
        abbreviation: 'FAK',
        chef_lieu: 'Limbe',
        libelle: 'Fako',
        description: 'Département du Fako',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[3].code // Sud-Ouest
      }
    }),
    prisma.departement.create({
      data: {
        abbreviation: 'MEM',
        chef_lieu: 'Kumba',
        libelle: 'Meme',
        description: 'Département du Meme',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[3].code // Sud-Ouest
      }
    }),
    // Nord-Ouest Region
    prisma.departement.create({
      data: {
        abbreviation: 'MBO',
        chef_lieu: 'Bamenda',
        libelle: 'Mezam',
        description: 'Département du Mezam',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[4].code // Nord-Ouest
      }
    }),
    // Adamaoua Region
    prisma.departement.create({
      data: {
        abbreviation: 'VIN',
        chef_lieu: 'Ngaoundéré',
        libelle: 'Vina',
        description: 'Département de la Vina',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        code_region: regions[0].code // Adamaoua
      }
    })
  ]);

  // Insert Arrondissements
  console.log('🗺️ Creating arrondissements...');
  const arrondissements = await Promise.all([
    // Wouri arrondissements
    prisma.arrondissement.create({
      data: {
        code_departement: departments[0].code,
        code_region: regions[2].code,
        abbreviation: 'DA1',
        libelle: 'Douala 1er',
        description: 'Arrondissement de Douala 1er',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.arrondissement.create({
      data: {
        code_departement: departments[0].code,
        code_region: regions[2].code,
        abbreviation: 'DA2',
        libelle: 'Douala 2ème',
        description: 'Arrondissement de Douala 2ème',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    // Mfoundi arrondissements
    prisma.arrondissement.create({
      data: {
        code_departement: departments[1].code,
        code_region: regions[1].code,
        abbreviation: 'YA1',
        libelle: 'Yaoundé 1er',
        description: 'Arrondissement de Yaoundé 1er',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.arrondissement.create({
      data: {
        code_departement: departments[1].code,
        code_region: regions[1].code,
        abbreviation: 'YA2',
        libelle: 'Yaoundé 2ème',
        description: 'Arrondissement de Yaoundé 2ème',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    })
  ]);

  // Insert Bureau de Vote
  console.log('🗳️ Creating voting bureaus...');
  const bureaux = await Promise.all([
    prisma.bureauVote.create({
      data: {
        designation: 'Bureau de Vote Akwa Nord',
        description: 'École Publique Akwa Nord',
        latitude: 4.0511,
        longitude: 9.7679,
        altitude: 13,
        data_filled: 1,
        code_arrondissement: arrondissements[0].code,
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        data_incoherent: 0,
        effectif: 450
      }
    }),
    prisma.bureauVote.create({
      data: {
        designation: 'Bureau de Vote Bonanjo',
        description: 'École Publique Bonanjo',
        latitude: 4.0483,
        longitude: 9.7542,
        altitude: 15,
        data_filled: 1,
        code_arrondissement: arrondissements[0].code,
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        data_incoherent: 0,
        effectif: 520
      }
    }),
    prisma.bureauVote.create({
      data: {
        designation: 'Bureau de Vote Centre Ville',
        description: 'École Publique Centre Ville',
        latitude: 3.8667,
        longitude: 11.5167,
        altitude: 760,
        data_filled: 1,
        code_arrondissement: arrondissements[2].code,
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        data_incoherent: 0,
        effectif: 420
      }
    })
  ]);

  // Insert Roles
  console.log('👥 Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({
      data: { libelle: 'Administrateur Système' }
    }),
    prisma.role.create({
      data: { libelle: 'Coordinateur Régional' }
    }),
    prisma.role.create({
      data: { libelle: 'Superviseur Départemental' }
    }),
    prisma.role.create({
      data: { libelle: 'Scrutateur Départemental' }
    }),
    prisma.role.create({
      data: { libelle: 'Scrutateur' }
    }),
    prisma.role.create({
      data: { libelle: 'Validateur' }
    }),
    prisma.role.create({
      data: { libelle: 'Observateur' }
    }),
    prisma.role.create({
      data: { libelle: 'Observateur Local' }
    }),
    prisma.role.create({
      data: { libelle: 'Superviseur Régionale' }
    }),
    prisma.role.create({
      data: { libelle: 'Superviseur Communale' }
    }),
    prisma.role.create({
      data: { libelle: 'Opérateur de Saisie' }
    })
  ]);

  // Insert Candidates
  console.log('🎯 Creating candidates...');
  const candidates = await Promise.all([
    prisma.candidat.create({
      data: {
        noms_prenoms: 'Paul BIYA',
        photo: '/images/candidates/biya.jpg',
        date_creation: new Date().toISOString(),
        code_createur: 'SYSTEM'
      }
    }),
    prisma.candidat.create({
      data: {
        noms_prenoms: 'Maurice KAMTO',
        photo: '/images/candidates/kamto.jpg',
        date_creation: new Date().toISOString(),
        code_createur: 'SYSTEM'
      }
    }),
    prisma.candidat.create({
      data: {
        noms_prenoms: 'Cabral LIBII',
        photo: '/images/candidates/libii.jpg',
        date_creation: new Date().toISOString(),
        code_createur: 'SYSTEM'
      }
    })
  ]);

  // Insert Political Parties
  console.log('🏛️ Creating political parties...');
  const parties = await Promise.all([
    prisma.partiPolitique.create({
      data: {
        designation: 'Rassemblement Démocratique du Peuple Camerounais',
        abbreviation: 'RDPC',
        description: 'Parti au pouvoir depuis 1985',
        coloration_bulletin: 'Vert',
        image: '/images/parties/rdpc.png',
        code_candidat: candidates[0].code,
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.partiPolitique.create({
      data: {
        designation: 'Mouvement pour la Renaissance du Cameroun',
        abbreviation: 'MRC',
        description: 'Principal parti d\'opposition',
        coloration_bulletin: 'Blanc',
        image: '/images/parties/mrc.png',
        code_candidat: candidates[1].code,
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    }),
    prisma.partiPolitique.create({
      data: {
        designation: 'Parti Camerounais pour la Réconciliation Nationale',
        abbreviation: 'PCRN',
        description: 'Parti de la réconciliation',
        coloration_bulletin: 'Jaune',
        image: '/images/parties/pcrn.png',
        code_candidat: candidates[2].code,
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString()
      }
    })
  ]);

  // Insert Users
  console.log('👤 Creating users...');
  const users = await Promise.all([
    // Admin
    prisma.utilisateur.create({
      data: {
        noms_prenoms: 'Administrateur Système',
        email: 'admin@elections.cm',
        password: '$2b$10$hash', // In real app, hash properly
        username: 'admin',
        code_role: roles[0].code,
        boite_postale: 'BP 1001',
        adresse: 'Yaoundé',
        contact: '+237 677 123 456',
        code_createur: 'SYSTEM',
        date_creation: new Date().toISOString(),
        statut_vie: 1
      }
    }),
    // Scrutateur Départemental - Wouri
    prisma.utilisateur.create({
      data: {
        noms_prenoms: 'Jean MBALLA',
        email: 'jean.mballa@elections.cm',
        password: '$2b$10$hash',
        username: 'jmballa',
        code_role: roles[3].code, // Scrutateur Départemental
        boite_postale: 'BP 1002',
        adresse: 'Douala',
        contact: '+237 677 234 567',
        code_createur: 'admin',
        date_creation: new Date().toISOString(),
        statut_vie: 1
      }
    }),
    // Scrutateur Départemental - Mfoundi
    prisma.utilisateur.create({
      data: {
        noms_prenoms: 'Marie NGONO',
        email: 'marie.ngono@elections.cm',
        password: '$2b$10$hash',
        username: 'mngono',
        code_role: roles[3].code, // Scrutateur Départemental
        boite_postale: 'BP 1003',
        adresse: 'Yaoundé',
        contact: '+237 677 345 678',
        code_createur: 'admin',
        date_creation: new Date().toISOString(),
        statut_vie: 1
      }
    }),
    // Scrutateur Départemental - Fako
    prisma.utilisateur.create({
      data: {
        noms_prenoms: 'Paul FON',
        email: 'paul.fon@elections.cm',
        password: '$2b$10$hash',
        username: 'pfon',
        code_role: roles[3].code, // Scrutateur Départemental
        boite_postale: 'BP 1004',
        adresse: 'Limbe',
        contact: '+237 677 456 789',
        code_createur: 'admin',
        date_creation: new Date().toISOString(),
        statut_vie: 1
      }
    }),
    // Validateur
    prisma.utilisateur.create({
      data: {
        noms_prenoms: 'Alice TCHOUPOU',
        email: 'alice.tchoupou@elections.cm',
        password: '$2b$10$hash',
        username: 'atchoupou',
        code_role: roles[5].code, // Validateur
        boite_postale: 'BP 1005',
        adresse: 'Yaoundé',
        contact: '+237 677 567 890',
        code_createur: 'admin',
        date_creation: new Date().toISOString(),
        statut_vie: 1
      }
    }),
    // Observateur
    prisma.utilisateur.create({
      data: {
        noms_prenoms: 'David KAMGA',
        email: 'david.kamga@elections.cm',
        password: '$2b$10$hash',
        username: 'dkamga',
        code_role: roles[6].code, // Observateur
        boite_postale: 'BP 1006',
        adresse: 'Douala',
        contact: '+237 677 678 901',
        code_createur: 'admin',
        date_creation: new Date().toISOString(),
        statut_vie: 1
      }
    }),
    // Superviseur Régionale
    prisma.utilisateur.create({
      data: {
        noms_prenoms: 'Grace MBIANDA',
        email: 'grace.mbianda@elections.cm',
        password: '$2b$10$hash',
        username: 'gmbianda',
        code_role: roles[8].code, // Superviseur Régionale
        boite_postale: 'BP 1007',
        adresse: 'Yaoundé',
        contact: '+237 677 789 012',
        code_createur: 'admin',
        date_creation: new Date().toISOString(),
        statut_vie: 1
      }
    })
  ]);

  // Insert User Department Assignments
  console.log('🔗 Creating user assignments...');
  await Promise.all([
    // Jean MBALLA - Scrutateur Départemental for Wouri
    prisma.utilisateurDepartement.create({
      data: {
        code_departement: departments[0].code, // Wouri
        code_utilisateur: users[1].code // Jean MBALLA
      }
    }),
    // Marie NGONO - Scrutateur Départemental for Mfoundi
    prisma.utilisateurDepartement.create({
      data: {
        code_departement: departments[2].code, // Mfoundi
        code_utilisateur: users[2].code // Marie NGONO
      }
    }),
    // Paul FON - Scrutateur Départemental for Fako
    prisma.utilisateurDepartement.create({
      data: {
        code_departement: departments[4].code, // Fako
        code_utilisateur: users[3].code // Paul FON
      }
    }),
    // Paul FON also assigned to Meme (multiple departments)
    prisma.utilisateurDepartement.create({
      data: {
        code_departement: departments[5].code, // Meme
        code_utilisateur: users[3].code // Paul FON
      }
    })
  ]);

  // Insert Participation Data
  console.log('📊 Creating participation data...');
  const participationData = [
    // Wouri
    {
      code_departement: departments[0].code,
      nombre_bureau_vote: 125,
      nombre_inscrit: 450000,
      nombre_enveloppe_urnes: 285000,
      nombre_enveloppe_bulletins_differents: 1250,
      nombre_bulletin_electeur_identifiable: 850,
      nombre_bulletin_enveloppes_signes: 950,
      nombre_enveloppe_non_elecam: 450,
      nombre_bulletin_non_elecam: 320,
      nombre_bulletin_sans_enveloppe: 180,
      nombre_enveloppe_vide: 220,
      nombre_suffrages_valable: 279500,
      nombre_votant: 285000,
      bulletin_nul: 5500,
      suffrage_exprime: 279500,
      taux_participation: 63.33
    },
    // Mungo
    {
      code_departement: departments[1].code,
      nombre_bureau_vote: 85,
      nombre_inscrit: 320000,
      nombre_enveloppe_urnes: 205000,
      nombre_enveloppe_bulletins_differents: 850,
      nombre_bulletin_electeur_identifiable: 680,
      nombre_bulletin_enveloppes_signes: 720,
      nombre_enveloppe_non_elecam: 320,
      nombre_bulletin_non_elecam: 250,
      nombre_bulletin_sans_enveloppe: 120,
      nombre_enveloppe_vide: 150,
      nombre_suffrages_valable: 201500,
      nombre_votant: 205000,
      bulletin_nul: 3500,
      suffrage_exprime: 201500,
      taux_participation: 64.06
    },
    // Mfoundi
    {
      code_departement: departments[2].code,
      nombre_bureau_vote: 98,
      nombre_inscrit: 380000,
      nombre_enveloppe_urnes: 245000,
      nombre_enveloppe_bulletins_differents: 980,
      nombre_bulletin_electeur_identifiable: 720,
      nombre_bulletin_enveloppes_signes: 810,
      nombre_enveloppe_non_elecam: 380,
      nombre_bulletin_non_elecam: 290,
      nombre_bulletin_sans_enveloppe: 150,
      nombre_enveloppe_vide: 190,
      nombre_suffrages_valable: 241200,
      nombre_votant: 245000,
      bulletin_nul: 3800,
      suffrage_exprime: 241200,
      taux_participation: 64.47
    },
    // Lekié
    {
      code_departement: departments[3].code,
      nombre_bureau_vote: 75,
      nombre_inscrit: 280000,
      nombre_enveloppe_urnes: 180000,
      nombre_enveloppe_bulletins_differents: 750,
      nombre_bulletin_electeur_identifiable: 600,
      nombre_bulletin_enveloppes_signes: 650,
      nombre_enveloppe_non_elecam: 280,
      nombre_bulletin_non_elecam: 200,
      nombre_bulletin_sans_enveloppe: 100,
      nombre_enveloppe_vide: 120,
      nombre_suffrages_valable: 177000,
      nombre_votant: 180000,
      bulletin_nul: 3000,
      suffrage_exprime: 177000,
      taux_participation: 64.29
    },
    // Fako
    {
      code_departement: departments[4].code,
      nombre_bureau_vote: 65,
      nombre_inscrit: 250000,
      nombre_enveloppe_urnes: 160000,
      nombre_enveloppe_bulletins_differents: 650,
      nombre_bulletin_electeur_identifiable: 500,
      nombre_bulletin_enveloppes_signes: 550,
      nombre_enveloppe_non_elecam: 250,
      nombre_bulletin_non_elecam: 180,
      nombre_bulletin_sans_enveloppe: 90,
      nombre_enveloppe_vide: 110,
      nombre_suffrages_valable: 157500,
      nombre_votant: 160000,
      bulletin_nul: 2500,
      suffrage_exprime: 157500,
      taux_participation: 64.00
    },
    // Meme
    {
      code_departement: departments[5].code,
      nombre_bureau_vote: 55,
      nombre_inscrit: 220000,
      nombre_enveloppe_urnes: 140000,
      nombre_enveloppe_bulletins_differents: 550,
      nombre_bulletin_electeur_identifiable: 440,
      nombre_bulletin_enveloppes_signes: 480,
      nombre_enveloppe_non_elecam: 220,
      nombre_bulletin_non_elecam: 160,
      nombre_bulletin_sans_enveloppe: 80,
      nombre_enveloppe_vide: 100,
      nombre_suffrages_valable: 137500,
      nombre_votant: 140000,
      bulletin_nul: 2500,
      suffrage_exprime: 137500,
      taux_participation: 63.64
    }
  ];

  await Promise.all(
    participationData.map(data => 
      prisma.participationDepartement.create({
        data: {
          ...data,
          date_creation: new Date().toISOString()
        }
      })
    )
  );

  // Insert Participation Arrondissement Data
  console.log('📊 Creating participation arrondissement data...');
  await Promise.all([
    prisma.participationArrondissement.create({
      data: {
        code_arrondissement: arrondissements[0].code, // Douala 1er
        nombre_bureau_vote: 65,
        nombre_inscrit: 225000,
        nombre_enveloppe_urnes: 142500,
        nombre_enveloppe_bulletins_differents: 625,
        nombre_bulletin_electeur_identifiable: 425,
        nombre_bulletin_enveloppes_signes: 475,
        nombre_enveloppe_non_elecam: 225,
        nombre_bulletin_non_elecam: 160,
        nombre_bulletin_sans_enveloppe: 90,
        nombre_enveloppe_vide: 110,
        nombre_suffrages_valable: 139750,
        nombre_votant: 142500,
        bulletin_nul: 2750,
        suffrage_exprime: 139750,
        taux_participation: 63.33,
        date_creation: new Date().toISOString()
      }
    }),
    prisma.participationArrondissement.create({
      data: {
        code_arrondissement: arrondissements[1].code, // Douala 2ème
        nombre_bureau_vote: 60,
        nombre_inscrit: 225000,
        nombre_enveloppe_urnes: 142500,
        nombre_enveloppe_bulletins_differents: 625,
        nombre_bulletin_electeur_identifiable: 425,
        nombre_bulletin_enveloppes_signes: 475,
        nombre_enveloppe_non_elecam: 225,
        nombre_bulletin_non_elecam: 160,
        nombre_bulletin_sans_enveloppe: 90,
        nombre_enveloppe_vide: 110,
        nombre_suffrages_valable: 139750,
        nombre_votant: 142500,
        bulletin_nul: 2750,
        suffrage_exprime: 139750,
        taux_participation: 63.33,
        date_creation: new Date().toISOString()
      }
    }),
    prisma.participationArrondissement.create({
      data: {
        code_arrondissement: arrondissements[2].code, // Yaoundé 1er
        nombre_bureau_vote: 49,
        nombre_inscrit: 190000,
        nombre_enveloppe_urnes: 122500,
        nombre_enveloppe_bulletins_differents: 490,
        nombre_bulletin_electeur_identifiable: 360,
        nombre_bulletin_enveloppes_signes: 405,
        nombre_enveloppe_non_elecam: 190,
        nombre_bulletin_non_elecam: 145,
        nombre_bulletin_sans_enveloppe: 75,
        nombre_enveloppe_vide: 95,
        nombre_suffrages_valable: 120600,
        nombre_votant: 122500,
        bulletin_nul: 1900,
        suffrage_exprime: 120600,
        taux_participation: 64.47,
        date_creation: new Date().toISOString()
      }
    }),
    prisma.participationArrondissement.create({
      data: {
        code_arrondissement: arrondissements[3].code, // Yaoundé 2ème
        nombre_bureau_vote: 49,
        nombre_inscrit: 190000,
        nombre_enveloppe_urnes: 122500,
        nombre_enveloppe_bulletins_differents: 490,
        nombre_bulletin_electeur_identifiable: 360,
        nombre_bulletin_enveloppes_signes: 405,
        nombre_enveloppe_non_elecam: 190,
        nombre_bulletin_non_elecam: 145,
        nombre_bulletin_sans_enveloppe: 75,
        nombre_enveloppe_vide: 95,
        nombre_suffrages_valable: 120600,
        nombre_votant: 122500,
        bulletin_nul: 1900,
        suffrage_exprime: 120600,
        taux_participation: 64.47,
        date_creation: new Date().toISOString()
      }
    })
  ]);

  // Insert Election Results
  console.log('🎯 Creating election results...');
  const results = [];
  
  // Results for each department
  const departmentResults = [
    // Wouri - RDPC stronghold
    { votes: [165000, 75000, 25000], percentages: [59.05, 26.83, 8.94] },
    // Mungo - Mixed results
    { votes: [120000, 65000, 20000], percentages: [58.54, 31.71, 9.76] },
    // Mfoundi - Opposition stronghold
    { votes: [120000, 85000, 22000], percentages: [49.75, 35.23, 9.12] },
    // Lekié - RDPC stronghold
    { votes: [110000, 55000, 15000], percentages: [60.44, 30.22, 8.24] },
    // Fako - Mixed results
    { votes: [95000, 50000, 15000], percentages: [59.38, 31.25, 9.38] },
    // Meme - Opposition stronghold
    { votes: [80000, 70000, 20000], percentages: [47.06, 41.18, 11.76] }
  ];
  
  for (let deptIndex = 0; deptIndex < departments.length; deptIndex++) {
    for (let partyIndex = 0; partyIndex < parties.length; partyIndex++) {
      const votes = departmentResults[deptIndex].votes[partyIndex] || 5000;
      const percentage = departmentResults[deptIndex].percentages[partyIndex] || 1.79;
      
      results.push(
        prisma.resultatDepartement.create({
          data: {
            code_departement: departments[deptIndex].code,
            code_parti: parties[partyIndex].code,
            nombre_vote: votes,
            pourcentage: percentage,
            date_creation: new Date().toISOString()
          }
        })
      );
    }
  }
  
  await Promise.all(results);

  // Insert Commission Data
  console.log('🏛️ Creating commission data...');
  const commissions = await Promise.all([
    prisma.commissionDepartementale.create({
      data: {
        code_departement: departments[0].code, // Wouri
        libelle: 'Commission Départementale du Wouri',
        description: 'Commission électorale du département du Wouri',
        date_creation: new Date(),
        date_modification: new Date()
      }
    }),
    prisma.commissionDepartementale.create({
      data: {
        code_departement: departments[2].code, // Mfoundi
        libelle: 'Commission Départementale de la Mfoundi',
        description: 'Commission électorale du département de la Mfoundi',
        date_creation: new Date(),
        date_modification: new Date()
      }
    }),
    prisma.commissionDepartementale.create({
      data: {
        code_departement: departments[4].code, // Fako
        libelle: 'Commission Départementale du Fako',
        description: 'Commission électorale du département du Fako',
        date_creation: new Date(),
        date_modification: new Date()
      }
    })
  ]);

  // Insert PV Data
  console.log('📄 Creating PV data...');
  await Promise.all([
    prisma.pvDepartement.create({
      data: {
        code_departement: departments[0].code, // Wouri
        libelle: 'PV Départemental Wouri - Tour 1',
        url_pv: '/uploads/pv/wouri_tour1.pdf',
        hash_file: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        timestamp: new Date()
      }
    }),
    prisma.pvDepartement.create({
      data: {
        code_departement: departments[2].code, // Mfoundi
        libelle: 'PV Départemental Mfoundi - Tour 1',
        url_pv: '/uploads/pv/mfoundi_tour1.pdf',
        hash_file: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
        timestamp: new Date()
      }
    }),
    prisma.pvDepartement.create({
      data: {
        code_departement: departments[4].code, // Fako
        libelle: 'PV Départemental Fako - Tour 1',
        url_pv: '/uploads/pv/fako_tour1.pdf',
        hash_file: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
        timestamp: new Date()
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   • ${regions.length} regions created`);
  console.log(`   • ${departments.length} departments created`);
  console.log(`   • ${arrondissements.length} arrondissements created`);
  console.log(`   • ${bureaux.length} voting bureaus created`);
  console.log(`   • ${candidates.length} candidates created`);
  console.log(`   • ${parties.length} political parties created`);
  console.log(`   • ${users.length} users created`);
  console.log(`   • ${roles.length} roles created`);
  console.log(`   • ${participationData.length} participation departement records created`);
  console.log(`   • 4 participation arrondissement records created`);
  console.log(`   • ${results.length} election results created`);
  console.log(`   • ${commissions.length} commission records created`);
  console.log(`   • 3 PV records created`);
  console.log('');
  console.log('🔑 Demo Login Credentials:');
  console.log('   Admin: admin / admin123');
  console.log('   Scrutateur Départemental (Wouri): jmballa / password123');
  console.log('   Scrutateur Départemental (Mfoundi): mngono / password123');
  console.log('   Scrutateur Départemental (Fako+Meme): pfon / password123');
  console.log('   Validateur: atchoupou / password123');
  console.log('   Observateur: dkamga / password123');
  console.log('   Superviseur Régionale: gmbianda / password123');
  console.log('');
  console.log('📋 Test Scenarios:');
  console.log('   • Department-based access control for scrutateur-departementale role');
  console.log('   • Multiple departments per user (Paul FON has Fako + Meme)');
  console.log('   • Realistic participation rates (63-64%)');
  console.log('   • Varied election results by department');
  console.log('   • RDPC strongholds: Wouri, Lekié');
  console.log('   • Opposition strongholds: Mfoundi, Meme');
  console.log('   • Mixed results: Mungo, Fako');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });