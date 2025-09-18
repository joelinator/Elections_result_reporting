# Election Database Seed Data

This document describes the comprehensive test data created by the Prisma seed script for the Election Result Reporting system.

## 📊 Data Overview

### Geographic Structure
- **6 Regions**: Adamaoua, Centre, Littoral, Sud-Ouest, Nord-Ouest, Sud
- **8 Departments**: Wouri, Mungo, Mfoundi, Lekié, Fako, Meme, Mezam, Vina
- **4 Arrondissements**: Douala 1er, Douala 2ème, Yaoundé 1er, Yaoundé 2ème
- **3 Voting Bureaus**: Akwa Nord, Bonanjo, Centre Ville

### User Roles & Access
- **11 Different Roles**: From Administrateur to Opérateur de Saisie
- **7 Test Users**: Covering all major role types
- **Department Assignments**: Testing single and multiple department access

### Election Data
- **3 Political Parties**: RDPC, MRC, PCRN
- **3 Candidates**: Paul BIYA, Maurice KAMTO, Cabral LIBII
- **6 Department Participation Records**: Realistic voter turnout data
- **4 Arrondissement Participation Records**: Detailed local data
- **18 Election Results**: Results for all departments and parties
- **3 Commission Records**: Departmental electoral commissions
- **3 PV Records**: Sample official reports

## 🔑 Test User Credentials

| Username | Password | Role | Department Access | Test Scenario |
|----------|----------|------|-------------------|---------------|
| `admin` | `admin123` | Administrateur Système | All | Full system access |
| `jmballa` | `password123` | Scrutateur Départemental | Wouri only | Single department access |
| `mngono` | `password123` | Scrutateur Départemental | Mfoundi only | Single department access |
| `pfon` | `password123` | Scrutateur Départemental | Fako + Meme | Multiple departments |
| `atchoupou` | `password123` | Validateur | None | Validation workflow |
| `dkamga` | `password123` | Observateur | None | Read-only access |
| `gmbianda` | `password123` | Superviseur Régionale | None | Regional oversight |

## 🧪 Test Scenarios

### 1. Department-Based Access Control
- **Test**: Login as `jmballa` (Scrutateur Départemental - Wouri)
- **Expected**: Can access Administration menu but only see Wouri data
- **API Test**: `GET /api/participation-arrondissement` should only return Wouri arrondissements

### 2. Multiple Department Access
- **Test**: Login as `pfon` (Scrutateur Départemental - Fako + Meme)
- **Expected**: Can see data from both Fako and Meme departments
- **API Test**: `GET /api/participation-departement` should return both departments

### 3. Role-Based Menu Access
- **Test**: Login as different users
- **Expected**:
  - `admin`: Full access to all menus
  - `scrutateur-departementale`: Access to Administration + Submission
  - `validateur`: Only Validation menu
  - `observateur`: Only Dashboard + Synthesis + Reports

### 4. Data Filtering by Department
- **Test**: API calls with different user tokens
- **Expected**: Results filtered by user's assigned departments

### 5. Election Results Variation
- **RDPC Strongholds**: Wouri (59.05%), Lekié (60.44%)
- **Opposition Strongholds**: Mfoundi (49.75% vs 35.23%), Meme (47.06% vs 41.18%)
- **Mixed Results**: Mungo, Fako (balanced competition)

## 📈 Participation Data

### Department Participation Rates
| Department | Registered Voters | Voters | Participation Rate |
|------------|------------------|--------|-------------------|
| Wouri | 450,000 | 285,000 | 63.33% |
| Mungo | 320,000 | 205,000 | 64.06% |
| Mfoundi | 380,000 | 245,000 | 64.47% |
| Lekié | 280,000 | 180,000 | 64.29% |
| Fako | 250,000 | 160,000 | 64.00% |
| Meme | 220,000 | 140,000 | 63.64% |

### Realistic Election Metrics
- **Voting Bureaus**: 55-125 per department
- **Valid Ballots**: 95-98% of total votes
- **Null Ballots**: 1-2% of total votes
- **Participation Rate**: 63-64% (realistic for Cameroonian elections)

## 🏛️ Political Landscape

### Party Performance by Department
- **RDPC**: Strongest in Wouri (59.05%) and Lekié (60.44%)
- **MRC**: Strongest in Mfoundi (35.23%) and Meme (41.18%)
- **PCRN**: Consistent 8-12% across all departments

### Electoral Commissions
- **Wouri Commission**: Jean MBALLA (Scrutateur)
- **Mfoundi Commission**: Marie NGONO (Scrutateur)
- **Fako Commission**: Paul FON (Scrutateur)

## 🔧 API Testing

### Test Department Filtering
```bash
# Test as jmballa (Wouri only)
curl -H "Authorization: Bearer <JWT_TOKEN>" \
     "http://localhost:3000/api/participation-arrondissement"

# Test as pfon (Fako + Meme)
curl -H "Authorization: Bearer <JWT_TOKEN>" \
     "http://localhost:3000/api/participation-departement"
```

### Test Access Control
```bash
# Should return 403 for unauthorized department
curl -X POST -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"code_arrondissement": 999}' \
     "http://localhost:3000/api/participation-arrondissement"
```

## 📋 Database Reset Commands

```bash
# 1. Stop and remove containers
docker-compose down
docker volume rm elections_result_reporting_postgres_data

# 2. Create .env file
cd api-crud
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@localhost:6543/postgres?schema=public"
JWT_SECRET="your-secret-key"
EOF

# 3. Start database
cd ..
docker-compose up -d postgres
sleep 10

# 4. Reset and seed
cd api-crud
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 🎯 Key Testing Points

1. **Authentication**: JWT token extraction and validation
2. **Authorization**: Role-based access control
3. **Data Filtering**: Department-based data isolation
4. **Menu Access**: Role-based UI navigation
5. **CRUD Operations**: Create/Read/Update/Delete with department restrictions
6. **Error Handling**: 403 errors for unauthorized access
7. **Multi-Department Users**: Users assigned to multiple departments

This comprehensive seed data provides realistic test scenarios for all major features of the election reporting system, with particular focus on the department-based access control for scrutateur-departementale users.
