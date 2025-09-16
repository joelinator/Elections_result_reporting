# Database Setup and Seeding Guide

This guide explains how to populate your election database with synthetic test data.

## 🚀 Quick Setup (Recommended)

Run the automated setup script from the project root:

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

This script will:
1. Start Docker PostgreSQL database
2. Install dependencies in election-app directory
3. Set up Prisma schema
4. Seed the database with test data
5. Build the application

## 🗃️ Manual Database Setup

If you prefer manual setup or the script fails:

### 1. Start the Database
```bash
# From project root
docker-compose up -d
```

### 2. Install Dependencies
```bash
cd election-app
npm install
```

### 3. Setup Prisma
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Seed the Database

#### Option A: Using SQL seed file (Recommended)
```bash
# From project root
docker-compose exec -T postgres psql -U postgres.wvrsbnpxuhbxbljjyucv -d postgres < election-app/prisma/seed.sql
```

#### Option B: Using TypeScript seed script
```bash
cd election-app

# Install tsx for running TypeScript
npm install -D tsx

# Run the seed script
npx tsx prisma/seed.ts
```

## 📊 Seed Data Overview

The database will be populated with:

### 🌍 Geographic Data
- **4 Regions**: Adamaoua, Centre, Littoral, Sud-Ouest
- **3 Departments**: Wouri (Douala), Mfoundi (Yaoundé), Fako (Buea)
- **4 Arrondissements**: Douala 1er, Douala 2ème, Yaoundé 1er, Yaoundé 2ème
- **15+ Voting Bureaus**: Distributed across arrondissements

### 🎯 Political Data
- **3 Major Candidates**: Paul BIYA, Maurice KAMTO, Cabral LIBII
- **3 Political Parties**: RDPC, MRC, PCRN
- **Realistic Vote Counts**: Based on actual Cameroon election patterns

### 👥 User Data
- **4 User Roles**: Admin, Regional Coordinator, Departmental Supervisor, Data Entry Operator
- **3 Test Users**:
  - `admin` / `admin123` (System Administrator)
  - `jmballa` / `password123` (Wouri Supervisor)
  - `mngono` / `password123` (Mfoundi Supervisor)

### 📈 Participation Data
- **Realistic Statistics**: Voter turnout, ballot counts, participation rates
- **Department-level Data**: Complete participation data for 2 departments
- **Error Examples**: Some redressements (corrections) for demonstration

### 🏛️ Administrative Data
- **Commission Members**: Departmental electoral commission members
- **PV Documents**: Sample procès-verbal files
- **Territorial Assignments**: Users assigned to specific departments

## 🔍 Data Verification

After seeding, verify the data:

```bash
cd election-app

# Open Prisma Studio to browse data
npx prisma studio
```

Or check via database directly:
```bash
# Connect to database
docker-compose exec postgres psql -U postgres.wvrsbnpxuhbxbljjyucv -d postgres

# Check regions
SELECT * FROM region;

# Check departments with regions
SELECT d.libelle as department, r.libelle as region 
FROM departement d 
JOIN region r ON d.code_region = r.code;

# Check participation data
SELECT d.libelle, p.nombre_inscrit, p.nombre_votant, p.taux_participation 
FROM participation_departement p 
JOIN departement d ON p.code_departement = d.code;
```

## 🎯 Login Credentials

After seeding, you can login with:

### Administrator Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: System Administrator
- **Access**: Full system access

### Department Supervisors
- **Username**: `jmballa`
- **Password**: `password123`
- **Department**: Wouri (Douala)

- **Username**: `mngono`
- **Password**: `password123`
- **Department**: Mfoundi (Yaoundé)

## 🔄 Reset Database

To start fresh:

```bash
cd election-app

# Reset and reseed
npx prisma migrate reset --force

# Or manually clear and reseed
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Seed Script Errors
```bash
# Check database schema
npx prisma db pull

# Verify Prisma client is generated
npx prisma generate

# Run seed with verbose output
npx tsx prisma/seed.ts --verbose
```

### Missing Dependencies
```bash
# Install all required packages
npm install @prisma/client prisma tsx

# Regenerate Prisma client
npx prisma generate
```

## 📁 File Structure

```
election-app/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.sql          # SQL seed script
│   └── seed.ts           # TypeScript seed script
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   └── services/         # Business logic
└── package.json          # Dependencies and scripts
```

The seed data provides a realistic foundation for testing all aspects of the election reporting system, from data entry to result compilation and user management.