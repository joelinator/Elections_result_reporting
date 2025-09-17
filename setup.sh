#!/bin/bash

# Elections Result Reporting Application Setup Script
# Run this script from the Elections_result_reporting root directory

set -e

echo "🗳️  Elections Result Reporting Setup"
echo "======================================"

# Check if we're in the correct directory
if [ ! -d "election-app" ]; then
    echo "❌ Error: election-app directory not found!"
    echo "Please run this script from the Elections_result_reporting root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📁 Application directory: election-app"

# Start Docker services first
echo ""
echo "🐳 Starting Docker services..."
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
    echo "✅ Docker services started"
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    # Check if database is accessible
    echo "🔍 Checking database connection..."
    if docker-compose exec -T postgres pg_isready -U postgres.wvrsbnpxuhbxbljjyucv -d postgres; then
        echo "✅ Database is ready"
    else
        echo "❌ Database connection failed"
        exit 1
    fi
else
    echo "⚠️  docker-compose.yml not found, skipping Docker setup"
fi

# Navigate to application directory
cd election-app

echo ""
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
    echo "✅ NPM dependencies installed"
elif command -v yarn &> /dev/null; then
    yarn install
    echo "✅ Yarn dependencies installed"
elif command -v pnpm &> /dev/null; then
    pnpm install
    echo "✅ PNPM dependencies installed"
else
    echo "❌ No package manager found (npm, yarn, or pnpm)"
    exit 1
fi

echo ""
echo "🗃️  Setting up database..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in election-app directory"
    echo "Please create .env file with database connection string"
    exit 1
fi

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗃️  Setting up database schema..."
npx prisma db push

echo "📊 Seeding database with initial data..."
if [ -f "prisma/seed.sql" ]; then
    # Run the SQL seed file using docker exec
    echo "📥 Loading seed data..."
    cd ..
    docker-compose exec -T postgres psql -U postgres.wvrsbnpxuhbxbljjyucv -d postgres < election-app/prisma/seed.sql
    cd election-app
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Seed file not found, creating basic data..."
    # Alternative: create a basic seed using Prisma if SQL file doesn't exist
    cat > temp_seed.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating basic seed data...');
  
  // Create basic roles
  await prisma.role.createMany({
    data: [
      { libelle: 'Administrateur Système' },
      { libelle: 'Superviseur Départemental' },
      { libelle: 'Opérateur de Saisie' }
    ]
  });
  
  console.log('Basic seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF
    node temp_seed.js
    rm temp_seed.js
fi

echo ""
echo "🔧 Building application..."
npm run build

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   cd election-app"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at: http://localhost:3000"
echo "🗃️  Database admin (PgAdmin): http://localhost:8080"
echo "   Email: admin@election.com"
echo "   Password: admin123"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Login with the demo credentials"
echo ""
echo "🔗 Database connection string:"
echo "   DATABASE_URL=\"postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@localhost:6543/postgres\""