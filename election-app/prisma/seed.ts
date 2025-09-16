// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.redressementCandidat.deleteMany();
  await prisma.redressementBureauVote.deleteMany();
  await prisma.resultatDepartement.deleteMany();
  await prisma.participationDepartement.deleteMany();
  await prisma.pvArrondissement.deleteMany();
  await prisma.utilisateurAffectationTerritoriale.deleteMany();
  await prisma.utilisateurDepartement.deleteMany();
  await prisma.utilisateurArrondissement.deleteMany();
  await prisma.utilisateurBureauVote.deleteMany();
  await prisma.utilisateurRegion.deleteMany();
  await prisma.membreCommission.deleteMany();
  await prisma.commissionDepartementale.deleteMany();
  await prisma.bureauVote.deleteMany();
  await prisma.arrondissement.deleteMany();
  await prisma.departement.deleteMany();
  await prisma.region.deleteMany();
  await prisma.partiPolitique.deleteMany();
  await prisma.candidat.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.fonctionCommission.deleteMany();

  // 1. Create Permissions
  console.log('📋 Creating permissions...');
  const permissions = await Promise.all([
    prisma.permission.create({
      data: { code: 1, nom_permission: 'READ_DEPARTMENTS', description: 'View department data' }
    }),
    prisma.permission.create({
      data: { code: 2, nom_permission: 'WRITE_DEPARTMENTS', description: 'Edit department data' }
    }),
    prisma.permission.create({
      data: { code: 3, nom_permission: 'READ_PARTICIPATION', description: 'View participation data' }
    }),
    prisma.permission.create({
      data: { code: 4, nom_permission: 'WRITE_PARTICIPATION', description: 'Edit participation data' }
    }),
    prisma.permission.create({
      data: { code: 5, nom_permission: 'READ_RESULTS', description: 'View election results' }
    }),
    prisma.permission.create({
      data: { code: 6, nom_permission: 'WRITE_RESULTS', description: 'Edit election results' }
    }),
    prisma.permission.create({
      data: { code: 7, nom_permission: 'MANAGE_USERS', description: 'Manage users and permissions' }
    }),
    prisma.permission.create({
      data: { code: 8, nom_permission: 'VALIDATE_DATA', description: 'Validate election data' }
    })
  ]);

  // 2. Create Roles
  console.log('👥 Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({ data: { libelle: 'Administrateur' } }),
    prisma.role.create({ data: { libelle: 'Responsable Régional' } }),
    prisma.role.create({ data: { libelle: 'Responsable Départemental' } }),
    prisma.role.create({ data: { libelle: 'Opérateur de Saisie' } }),
    prisma.role.create({ data: { libelle: 'Observateur' } })
  ]);

  // 3. Create Role Permissions
  console.log('🔐 Assigning permissions to roles...');
  // Admin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: { code_role: roles[0].code, code_permission: permission.code }
    });
  }

  // Regional manager gets read/write access except user management
  const regionalPerms = [1, 2, 3, 4, 5, 6, 8];
  for (const permCode of regionalPerms) {
    await prisma.rolePermission.create({
      data: { code_role: roles[1].code, code_permission: permCode }
    });
  }

  // 4. Create Regions (10 regions of Cameroon)
  console.log('🗺️ Creating regions...');
  const regionsData = [
    { libelle: 'Adamaoua', abbreviation: 'AD', chef_lieu: 'Ngaoundéré' },
    { libelle: 'Centre', abbreviation: 'CE', chef_lieu: 'Yaoundé' },
    { libelle: 'Est', abbreviation: 'ES', chef_lieu: 'Bertoua' },
    { libelle: 'Extrême-Nord', abbreviation: 'EN', chef_lieu: 'Maroua' },
    { libelle: 'Littoral', abbreviation: 'LT', chef_lieu: 'Douala' },
    { libelle: 'Nord', abbreviation: 'NO', chef_lieu: 'Garoua' },
    { libelle: 'Nord-Ouest', abbreviation: 'NW', chef_lieu: 'Bamenda' },
    { libelle: 'Ouest', abbreviation: 'OU', chef_lieu: 'Bafoussam' },
    { libelle: 'Sud', abbreviation: 'SU', chef_lieu: 'Ebolowa' },
    { libelle: 'Sud-Ouest', abbreviation: 'SW', chef_lieu: 'Buea' }
  ];

  const regions = [];
  for (const regionData of regionsData) {
    const region = await prisma.region.create({
      data: {
        ...regionData,
        date_creation: new Date().toISOString(),
        code_createur: 'system'
      }
    });
    regions.push(region);
  }

  // 5. Create Departments
  console.log('🏛️ Creating departments...');
  const departmentsData = [
    // Centre region departments
    { libelle: 'Mfoundi', abbreviation: 'MFO', chef_lieu: 'Yaoundé', code_region: regions[1].code },
    { libelle: 'Lekié', abbreviation: 'LEK', chef_lieu: 'Monatélé', code_region: regions[1].code },
    { libelle: 'Mbam-et-Inoubou', abbreviation: 'MBI', chef_lieu: 'Bafia', code_region: regions[1].code },
    
    // Littoral region departments
    { libelle: 'Wouri', abbreviation: 'WOU', chef_lieu: 'Douala', code_region: regions[4].code },
    { libelle: 'Nkam', abbreviation: 'NKA', chef_lieu: 'Yabassi', code_region: regions[4].code },
    
    // Sud-Ouest region departments
    { libelle: 'Fako', abbreviation: 'FAK', chef_lieu: 'Limbe', code_region: regions[9].code },
    { libelle: 'Meme', abbreviation: 'MEM', chef_lieu: 'Kumba', code_region: regions[9].code },
    
    // Ouest region departments
    { libelle: 'Mifi', abbreviation: 'MIF', chef_lieu: 'Bafoussam', code_region: regions[7].code },
    { libelle: 'Haut-Nkam', abbreviation: 'HNK', chef_lieu: 'Bafang', code_region: regions[7].code }
  ];

  const departments = [];
  for (const deptData of departmentsData) {
    const dept = await prisma.departement.create({
      data: {
        ...deptData,
        date_creation: new Date().toISOString(),
        code_createur: 'system'
      }
    });
    departments.push(dept);
  }

  // 6. Create Arrondissements
  console.log('🏘️ Creating arrondissements...');
  const arrondissements = [];
  for (const dept of departments.slice(0, 5)) {
    for (let i = 1; i <= 2; i++) {
      const arr = await prisma.arrondissement.create({
        data: {
          libelle: `${dept.libelle} ${i}`,
          abbreviation: `${dept.abbreviation}${i}`,
          code_departement: dept.code,
          code_region: dept.code_region,
          date_creation: new Date().toISOString(),
          code_createur: 'system'
        }
      });
      arrondissements.push(arr);
    }
  }

  // 7. Create Bureau de Votes
  console.log('🗳️ Creating voting bureaus...');
  const bureauVotes = [];
  for (const arr of arrondissements) {
    for (let i = 1; i <= 3; i++) {
      const bureau = await prisma.bureauVote.create({
        data: {
          designation: `Bureau ${arr.libelle}-${i}`,
          description: `Bureau de vote ${i} de ${arr.libelle}`,
          latitude: Math.random() * 10 + 3,
          longitude: Math.random() * 15 + 8,
          altitude: Math.random() * 1000 + 200,
          data_filled: Math.random() > 0.3 ? 1 : 0,
          code_arrondissement: arr.code,
          effectif: BigInt(Math.floor(Math.random() * 800) + 200),
          date_creation: new Date().toISOString(),
          code_createur: 'system'
        }
      });
      bureauVotes.push(bureau);
    }
  }

  // 8. Create Candidates
  console.log('🤵 Creating candidates...');
  const candidatesData = [
    { noms_prenoms: 'Paul Biya' },
    { noms_prenoms: 'Maurice Kamto' },
    { noms_prenoms: 'Cabral Libii' },
    { noms_prenoms: 'Akere Muna' },
    { noms_prenoms: 'Joshua Osih' }
  ];

  const candidates = [];
  for (const candData of candidatesData) {
    const candidate = await prisma.candidat.create({
      data: {
        ...candData,
        date_creation: new Date().toISOString(),
        code_createur: 'system'
      }
    });
    candidates.push(candidate);
  }

  // 9. Create Political Parties
  console.log('🏛️ Creating political parties...');
  const partiesData = [
    { designation: 'RDPC', abbreviation: 'RDPC', coloration_bulletin: 'Vert', code_candidat: candidates[0].code },
    { designation: 'MRC', abbreviation: 'MRC', coloration_bulletin: 'Blanc', code_candidat: candidates[1].code },
    { designation: 'Univers', abbreviation: 'UNI', coloration_bulletin: 'Bleu', code_candidat: candidates[2].code },
    { designation: 'FPUP', abbreviation: 'FPUP', coloration_bulletin: 'Jaune', code_candidat: candidates[3].code },
    { designation: 'SDF', abbreviation: 'SDF', coloration_bulletin: 'Violet', code_candidat: candidates[4].code }
  ];

  const parties = [];
  for (const partyData of partiesData) {
    const party = await prisma.partiPolitique.create({
      data: {
        ...partyData,
        date_creation: new Date().toISOString(),
        code_createur: 'system'
      }
    });
    parties.push(party);
  }

  // 10. Create Users
  console.log('👤 Creating users...');
  const usersData = [
    { noms_prenoms: 'Admin Système', email: 'admin@elections.cm', username: 'admin', code_role: roles[0].code },
    { noms_prenoms: 'Jean Mballa', email: 'jean.mballa@elections.cm', username: 'jmballa', code_role: roles[2].code },
    { noms_prenoms: 'Marie Ngono', email: 'marie.ngono@elections.cm', username: 'mngono', code_role: roles[3].code },
    { noms_prenoms: 'Paul Atangana', email: 'paul.atangana@elections.cm', username: 'patangana', code_role: roles[3].code },
    { noms_prenoms: 'Grace Fombe', email: 'grace.fombe@elections.cm', username: 'gfombe', code_role: roles[4].code }
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.utilisateur.create({
      data: {
        ...userData,
        password: 'password123',
        contact: `+237 6${Math.floor(Math.random() * 90000000) + 10000000}`,
        adresse: `Yaoundé, Cameroun`,
        statut_vie: 1,
        date_creation: new Date().toISOString(),
        code_createur: 'system'
      }
    });
    users.push(user);
  }

  // 11. Create User Department Assignments
  console.log('🔗 Creating user assignments...');
  await prisma.utilisateurDepartement.create({
    data: { code_utilisateur: users[1].code, code_departement: departments[0].code }
  });
  await prisma.utilisateurDepartement.create({
    data: { code_utilisateur: users[2].code, code_departement: departments[3].code }
  });

  // 12. Create Participation Data
  console.log('📊 Creating participation data...');
  for (const dept of departments) {
    const nombreInscrit = Math.floor(Math.random() * 80000) + 40000;
    const nombreVotant = Math.floor(nombreInscrit * (0.65 + Math.random() * 0.25));
    const bulletinNul = Math.floor(nombreVotant * (0.02 + Math.random() * 0.03));
    
    await prisma.participationDepartement.create({
      data: {
        code_departement: dept.code,
        nombre_bureau_vote: Math.floor(Math.random() * 40) + 15,
        nombre_inscrit: nombreInscrit,
        nombre_votant: nombreVotant,
        nombre_enveloppe_urnes: nombreVotant,
        nombre_suffrages_valable: nombreVotant - bulletinNul,
        bulletin_nul: bulletinNul,
        suffrage_exprime: parseFloat((nombreVotant - bulletinNul).toFixed(2)),
        taux_participation: parseFloat(((nombreVotant / nombreInscrit) * 100).toFixed(2)),
        date_creation: new Date().toISOString()
      }
    });
  }

  // 13. Create Results Data
  console.log('🏆 Creating results data...');
  for (const dept of departments) {
    const participation = await prisma.participationDepartement.findUnique({
      where: { code_departement: dept.code }
    });
    
    if (participation) {
      const totalVotes = participation.suffrage_exprime || 0;
      let remainingVotes = totalVotes;
      
      for (let i = 0; i < parties.length; i++) {
        const party = parties[i];
        let votes: number;
        
        if (i === parties.length - 1) {
          votes = remainingVotes;
        } else {
          const basePercentage = party.abbreviation === 'RDPC' ? 0.45 : 0.15;
          votes = Math.floor(totalVotes * (basePercentage + Math.random() * 0.2));
          remainingVotes -= votes;
        }
        
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
        
        await prisma.resultatDepartement.create({
          data: {
            code_departement: dept.code,
            code_parti: party.code,
            nombre_vote: votes,
            pourcentage: parseFloat(percentage.toFixed(2)),
            date_creation: new Date().toISOString()
          }
        });
      }
    }
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📈 Created:`);
  console.log(`   - ${permissions.length} permissions`);
  console.log(`   - ${roles.length} roles`);
  console.log(`   - ${regions.length} regions`);
  console.log(`   - ${departments.length} departments`);
  console.log(`   - ${arrondissements.length} arrondissements`);
  console.log(`   - ${bureauVotes.length} voting bureaus`);
  console.log(`   - ${candidates.length} candidates`);
  console.log(`   - ${parties.length} political parties`);
  console.log(`   - ${users.length} users`);
  console.log(`   - Participation data for all departments`);
  console.log(`   - Results data for all departments`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });