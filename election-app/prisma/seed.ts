// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple hash function for demo purposes (replace with proper bcrypt in production)
function simpleHash(password: string): string {
  return Buffer.from(password).toString('base64');
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.utilisateurAffectationTerritoriale.deleteMany();
  await prisma.utilisateurDepartement.deleteMany();
  await prisma.utilisateurArrondissement.deleteMany();
  await prisma.utilisateurBureauVote.deleteMany();
  await prisma.utilisateurRegion.deleteMany();
  await prisma.redressementCandidat.deleteMany();
  await prisma.redressementBureauVote.deleteMany();
  await prisma.resultatDepartement.deleteMany();
  await prisma.participationDepartement.deleteMany();
  await prisma.membreCommission.deleteMany();
  await prisma.commissionDepartementale.deleteMany();
  await prisma.pvArrondissement.deleteMany();
  await prisma.bureauVote.deleteMany();
  await prisma.arrondissement.deleteMany();
  await prisma.departement.deleteMany();
  await prisma.region.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.role.deleteMany();
  await prisma.partiPolitique.deleteMany();
  await prisma.candidat.deleteMany();
  await prisma.fonctionCommission.deleteMany();
  await prisma.journal.deleteMany();

  // 1. Create Roles
  console.log('👥 Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({ data: { code: 1, libelle: 'Super Administrateur' } }),
    prisma.role.create({ data: { code: 2, libelle: 'Administrateur Régional' } }),
    prisma.role.create({ data: { code: 3, libelle: 'Administrateur Départemental' } }),
    prisma.role.create({ data: { code: 4, libelle: 'Superviseur Arrondissement' } }),
    prisma.role.create({ data: { code: 5, libelle: 'Opérateur Bureau Vote' } }),
  ]);

  // 2. Create Permissions
  console.log('🔑 Creating permissions...');
  const permissions = await Promise.all([
    prisma.permission.create({ data: { code: 1, nom_permission: 'MANAGE_USERS', description: 'Gérer les utilisateurs' } }),
    prisma.permission.create({ data: { code: 2, nom_permission: 'VIEW_ALL_DEPARTMENTS', description: 'Voir tous les départements' } }),
    prisma.permission.create({ data: { code: 3, nom_permission: 'ENTER_PARTICIPATION_DATA', description: 'Saisir données de participation' } }),
    prisma.permission.create({ data: { code: 4, nom_permission: 'VALIDATE_DATA', description: 'Valider les données' } }),
    prisma.permission.create({ data: { code: 5, nom_permission: 'EXPORT_REPORTS', description: 'Exporter les rapports' } }),
  ]);

  // 3. Create Regions (10 regions of Cameroon)
  console.log('🗺️ Creating regions...');
  const regions = await Promise.all([
    prisma.region.create({ data: { code: 1, libelle: 'Adamaoua', abbreviation: 'AD', chef_lieu: 'Ngaoundéré' } }),
    prisma.region.create({ data: { code: 2, libelle: 'Centre', abbreviation: 'CE', chef_lieu: 'Yaoundé' } }),
    prisma.region.create({ data: { code: 3, libelle: 'Est', abbreviation: 'ES', chef_lieu: 'Bertoua' } }),
    prisma.region.create({ data: { code: 4, libelle: 'Extrême-Nord', abbreviation: 'EN', chef_lieu: 'Maroua' } }),
    prisma.region.create({ data: { code: 5, libelle: 'Littoral', abbreviation: 'LT', chef_lieu: 'Douala' } }),
    prisma.region.create({ data: { code: 6, libelle: 'Nord', abbreviation: 'NO', chef_lieu: 'Garoua' } }),
    prisma.region.create({ data: { code: 7, libelle: 'Nord-Ouest', abbreviation: 'NW', chef_lieu: 'Bamenda' } }),
    prisma.region.create({ data: { code: 8, libelle: 'Ouest', abbreviation: 'OU', chef_lieu: 'Bafoussam' } }),
    prisma.region.create({ data: { code: 9, libelle: 'Sud', abbreviation: 'SU', chef_lieu: 'Ebolowa' } }),
    prisma.region.create({ data: { code: 10, libelle: 'Sud-Ouest', abbreviation: 'SW', chef_lieu: 'Buea' } }),
  ]);

  // 4. Create Departments (58 departments of Cameroon - sample)
  console.log('🏛️ Creating departments...');
  const departments = [
    // Centre Region
    { code: 1, libelle: 'Mfoundi', abbreviation: 'MFO', chef_lieu: 'Yaoundé', code_region: 2 },
    { code: 2, libelle: 'Lekie', abbreviation: 'LEK', chef_lieu: 'Monatele', code_region: 2 },
    { code: 3, libelle: 'Mbam-et-Inoubou', abbreviation: 'MBI', chef_lieu: 'Bafia', code_region: 2 },
    { code: 4, libelle: 'Mefou-et-Afamba', abbreviation: 'MEA', chef_lieu: 'Mfou', code_region: 2 },
    { code: 5, libelle: 'Mefou-et-Akono', abbreviation: 'MEAK', chef_lieu: 'Ngoumou', code_region: 2 },
    
    // Littoral Region
    { code: 6, libelle: 'Wouri', abbreviation: 'WOU', chef_lieu: 'Douala', code_region: 5 },
    { code: 7, libelle: 'Nkam', abbreviation: 'NKA', chef_lieu: 'Yabassi', code_region: 5 },
    { code: 8, libelle: 'Sanaga-Maritime', abbreviation: 'SAM', chef_lieu: 'Edéa', code_region: 5 },
    { code: 9, libelle: 'Mungo', abbreviation: 'MUN', chef_lieu: 'Nkongsamba', code_region: 5 },
    
    // Ouest Region
    { code: 10, libelle: 'Mifi', abbreviation: 'MIF', chef_lieu: 'Bafoussam', code_region: 8 },
    { code: 11, libelle: 'Haut-Nkam', abbreviation: 'HNK', chef_lieu: 'Bafang', code_region: 8 },
    { code: 12, libelle: 'Bamboutos', abbreviation: 'BAM', chef_lieu: 'Mbouda', code_region: 8 },
    { code: 13, libelle: 'Menoua', abbreviation: 'MEN', chef_lieu: 'Dschang', code_region: 8 },
    { code: 14, libelle: 'Koung-Khi', abbreviation: 'KKH', chef_lieu: 'Bandjoun', code_region: 8 },
    
    // Nord-Ouest Region
    { code: 15, libelle: 'Mezam', abbreviation: 'MEZ', chef_lieu: 'Bamenda', code_region: 7 },
    { code: 16, libelle: 'Momo', abbreviation: 'MOM', chef_lieu: 'Mbengwi', code_region: 7 },
    { code: 17, libelle: 'Ngo-Ketunjia', abbreviation: 'NGK', chef_lieu: 'Ndop', code_region: 7 },
    { code: 18, libelle: 'Bui', abbreviation: 'BUI', chef_lieu: 'Kumbo', code_region: 7 },
    
    // Sud-Ouest Region
    { code: 19, libelle: 'Fako', abbreviation: 'FAK', chef_lieu: 'Limbe', code_region: 10 },
    { code: 20, libelle: 'Meme', abbreviation: 'MEM', chef_lieu: 'Kumba', code_region: 10 },
  ];

  for (const dept of departments) {
    await prisma.departement.create({ data: dept });
  }

  // 5. Create sample Arrondissements
  console.log('🏘️ Creating arrondissements...');
  const arrondissements = [
    // Mfoundi arrondissements
    { code: 1, libelle: 'Yaoundé I', code_departement: 1, code_region: 2 },
    { code: 2, libelle: 'Yaoundé II', code_departement: 1, code_region: 2 },
    { code: 3, libelle: 'Yaoundé III', code_departement: 1, code_region: 2 },
    { code: 4, libelle: 'Yaoundé IV', code_departement: 1, code_region: 2 },
    { code: 5, libelle: 'Yaoundé V', code_departement: 1, code_region: 2 },
    { code: 6, libelle: 'Yaoundé VI', code_departement: 1, code_region: 2 },
    { code: 7, libelle: 'Yaoundé VII', code_departement: 1, code_region: 2 },
    
    // Wouri arrondissements
    { code: 8, libelle: 'Douala I', code_departement: 6, code_region: 5 },
    { code: 9, libelle: 'Douala II', code_departement: 6, code_region: 5 },
    { code: 10, libelle: 'Douala III', code_departement: 6, code_region: 5 },
    { code: 11, libelle: 'Douala IV', code_departement: 6, code_region: 5 },
    { code: 12, libelle: 'Douala V', code_departement: 6, code_region: 5 },
    
    // Other departments
    { code: 13, libelle: 'Bafia', code_departement: 3, code_region: 2 },
    { code: 14, libelle: 'Mfou', code_departement: 4, code_region: 2 },
    { code: 15, libelle: 'Ngoumou', code_departement: 5, code_region: 2 },
  ];

  for (const arr of arrondissements) {
    await prisma.arrondissement.create({ data: arr });
  }

  // 6. Create sample Bureau de Vote
  console.log('🗳️ Creating voting bureaus...');
  const bureaux = [];
  let bureauCode = 1;

  // Create 5-10 bureaux per arrondissement
  for (const arr of arrondissements) {
    const numBureaux = Math.floor(Math.random() * 6) + 5; // 5-10 bureaux
    for (let i = 1; i <= numBureaux; i++) {
      bureaux.push({
        code: bureauCode++,
        designation: `Bureau de Vote ${arr.libelle} - ${i}`,
        description: `Bureau de vote n°${i} de l'arrondissement ${arr.libelle}`,
        code_arrondissement: arr.code,
        effectif: Math.floor(Math.random() * 800) + 200, // 200-1000 voters
        data_filled: Math.random() > 0.3 ? 1 : 0, // 70% have data
      });
    }
  }

  for (const bureau of bureaux) {
    await prisma.bureauVote.create({ data: bureau });
  }

  // 7. Create Political Parties and Candidates
  console.log('🎯 Creating political parties and candidates...');
  const candidates = [
    { code: 1, noms_prenoms: 'Paul BIYA' },
    { code: 2, noms_prenoms: 'Maurice KAMTO' },
    { code: 3, noms_prenoms: 'Cabral LIBII' },
    { code: 4, noms_prenoms: 'Akere MUNA' },
    { code: 5, noms_prenoms: 'Garga Haman ADJI' },
    { code: 6, noms_prenoms: 'Serge ESPOIR MATOMBA' },
    { code: 7, noms_prenoms: 'Pierre Flambeau NGAYAP' },
  ];

  for (const candidate of candidates) {
    await prisma.candidat.create({ data: candidate });
  }

  const parties = [
    { code: 1, designation: 'Rassemblement Démocratique du Peuple Camerounais', abbreviation: 'RDPC', code_candidat: 1, coloration_bulletin: 'Vert' },
    { code: 2, designation: 'Mouvement pour la Renaissance du Cameroun', abbreviation: 'MRC', code_candidat: 2, coloration_bulletin: 'Blanc' },
    { code: 3, designation: 'Parti Camerounais pour la Réconciliation Nationale', abbreviation: 'PCRN', code_candidat: 3, coloration_bulletin: 'Jaune' },
    { code: 4, designation: 'Front pour le Changement', abbreviation: 'FC', code_candidat: 4, coloration_bulletin: 'Rouge' },
    { code: 5, designation: 'Alliance pour la Démocratie et le Développement', abbreviation: 'ADD', code_candidat: 5, coloration_bulletin: 'Bleu' },
    { code: 6, designation: 'Parti de l\'Alliance Libérale', abbreviation: 'PAL', code_candidat: 6, coloration_bulletin: 'Orange' },
    { code: 7, designation: 'Union Démocratique du Cameroun', abbreviation: 'UDC', code_candidat: 7, coloration_bulletin: 'Violet' },
  ];

  for (const party of parties) {
    await prisma.partiPolitique.create({ data: party });
  }

  // 8. Create Users
  console.log('👤 Creating users...');
  const hashedPassword = simpleHash('password123');
  
  const users = [
    {
      code: 1,
      noms_prenoms: 'Jean Baptiste MBALLA',
      email: 'admin@elections.cm',
      username: 'admin',
      password: hashedPassword,
      code_role: 1,
      statut_vie: 1,
    },
    {
      code: 2,
      noms_prenoms: 'Marie Claire NGONO',
      email: 'centre@elections.cm',
      username: 'centre_admin',
      password: hashedPassword,
      code_role: 2,
      statut_vie: 1,
    },
    {
      code: 3,
      noms_prenoms: 'Paul Etoundi ATANGANA',
      email: 'mfoundi@elections.cm',
      username: 'mfoundi_admin',
      password: hashedPassword,
      code_role: 3,
      statut_vie: 1,
    },
    {
      code: 4,
      noms_prenoms: 'Sophie MBIDA',
      email: 'wouri@elections.cm',
      username: 'wouri_admin',
      password: hashedPassword,
      code_role: 3,
      statut_vie: 1,
    },
    {
      code: 5,
      noms_prenoms: 'Claude ESSOMBA',
      email: 'yaounde1@elections.cm',
      username: 'yaounde1_supervisor',
      password: hashedPassword,
      code_role: 4,
      statut_vie: 1,
    },
  ];

  for (const user of users) {
    await prisma.utilisateur.create({ data: user });
  }

  // 9. Create Participation Data
  console.log('📊 Creating participation data...');
  const participationData = [];
  
  for (let deptCode = 1; deptCode <= 20; deptCode++) {
    const nombreInscrit = Math.floor(Math.random() * 100000) + 50000; // 50k-150k registered
    const tauxParticipation = Math.random() * 30 + 60; // 60-90% participation
    const nombreVotant = Math.floor(nombreInscrit * tauxParticipation / 100);
    const bulletinNul = Math.floor(nombreVotant * 0.02); // 2% invalid ballots
    const suffrageExprime = nombreVotant - bulletinNul;
    
    participationData.push({
      code_departement: deptCode,
      nombre_bureau_vote: Math.floor(Math.random() * 50) + 20, // 20-70 bureaux
      nombre_inscrit: nombreInscrit,
      nombre_votant: nombreVotant,
      nombre_enveloppe_urnes: nombreVotant,
      bulletin_nul: bulletinNul,
      nombre_suffrages_valable: suffrageExprime,
      suffrage_exprime: suffrageExprime,
      taux_participation: tauxParticipation,
      date_creation: new Date().toISOString(),
    });
  }

  for (const participation of participationData) {
    await prisma.participationDepartement.create({ data: participation });
  }

  // 10. Create Results Data
  console.log('🏆 Creating results data...');
  for (let deptCode = 1; deptCode <= 20; deptCode++) {
    const participation = participationData.find(p => p.code_departement === deptCode);
    if (!participation) continue;

    const totalVotes = participation.suffrage_exprime;
    let remainingVotes = totalVotes;

    // Distribute votes among parties (RDPC gets majority, others get varying amounts)
    const voteDistribution = [
      { partyCode: 1, percentage: 0.45 + Math.random() * 0.25 }, // RDPC: 45-70%
      { partyCode: 2, percentage: 0.15 + Math.random() * 0.15 }, // MRC: 15-30%
      { partyCode: 3, percentage: 0.05 + Math.random() * 0.10 }, // Others: 5-15%
      { partyCode: 4, percentage: 0.02 + Math.random() * 0.08 },
      { partyCode: 5, percentage: 0.01 + Math.random() * 0.05 },
      { partyCode: 6, percentage: 0.01 + Math.random() * 0.03 },
      { partyCode: 7, percentage: 0.01 + Math.random() * 0.02 },
    ];

    // Normalize percentages to sum to 1
    const totalPercentage = voteDistribution.reduce((sum, party) => sum + party.percentage, 0);
    voteDistribution.forEach(party => {
      party.percentage = party.percentage / totalPercentage;
    });

    for (const party of voteDistribution) {
      const votes = Math.floor(totalVotes * party.percentage);
      remainingVotes -= votes;

      await prisma.resultatDepartement.create({
        data: {
          code_departement: deptCode,
          code_parti: party.partyCode,
          nombre_vote: votes,
          pourcentage: party.percentage * 100,
          date_creation: new Date().toISOString(),
        },
      });
    }
  }

  // 11. Create User Assignments
  console.log('🔗 Creating user assignments...');
  
  // Assign regional admin to Centre region
  await prisma.utilisateurRegion.create({
    data: { code_utilisateur: 2, code_region: 2 }
  });

  // Assign departmental admins
  await prisma.utilisateurDepartement.create({
    data: { code_utilisateur: 3, code_departement: 1 } // Mfoundi
  });
  
  await prisma.utilisateurDepartement.create({
    data: { code_utilisateur: 4, code_departement: 6 } // Wouri
  });

  // Assign arrondissement supervisor
  await prisma.utilisateurArrondissement.create({
    data: { code_utilisateur: 5, code_arrondissement: 1 } // Yaoundé I
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`
📊 Seeded Data Summary:
   - ${roles.length} Roles
   - ${permissions.length} Permissions  
   - ${regions.length} Regions
   - ${departments.length} Departments
   - ${arrondissements.length} Arrondissements
   - ${bureaux.length} Bureau de Vote
   - ${candidates.length} Candidates
   - ${parties.length} Political Parties
   - ${users.length} Users
   - ${participationData.length} Participation Records

🔐 Test Login Credentials:
   Username: admin
   Password: password123
   
   Username: centre_admin  
   Password: password123
   
   Username: mfoundi_admin
   Password: password123
`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });