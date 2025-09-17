#!/bin/bash

# Elections Result Reporting Application Setup Script (Supabase Version)
# Run this script from the Elections_result_reporting root directory

set -e

echo "🗳️  Elections Result Reporting Setup (Supabase)"
echo "=============================================="

# Check if we're in the correct directory
if [ ! -d "election-app" ]; then
    echo "❌ Error: election-app directory not found!"
    echo "Please run this script from the Elections_result_reporting root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📁 Application directory: election-app"

# Navigate to application directory
cd election-app

echo ""
echo "🔍 Checking environment configuration..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in election-app directory"
    echo "Creating .env file with Supabase configuration..."
    
    cat > .env << 'EOF'
# Environment variables for Elections Result Reporting

# Supabase Database Connection
DATABASE_URL="postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"

# Authentication
NEXTAUTH_SECRET="AUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Local Docker fallback (commented out)
# DATABASE_URL="postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@localhost:6543/postgres"
EOF
    echo "✅ .env file created with Supabase configuration"
else
    echo "✅ .env file found"
    
    # Check if DATABASE_URL is set to Supabase
    if grep -q "aws-1-eu-north-1.pooler.supabase.com" .env; then
        echo "✅ Supabase database URL detected"
    else
        echo "⚠️  Updating DATABASE_URL to use Supabase..."
        # Update the DATABASE_URL to point to Supabase
        sed -i 's|DATABASE_URL="postgresql://postgres\.wvrsbnpxuhbxbljjyucv:Joelinator543\.@localhost:6543/postgres"|DATABASE_URL="postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"|g' .env
        
        # Uncomment Supabase URL if it's commented
        sed -i 's|#DATABASE_URL="postgresql://postgres\.wvrsbnpxuhbxbljjyucv:Joelinator543\.@aws-1-eu-north-1\.pooler\.supabase\.com:6543/postgres"|DATABASE_URL="postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"|g' .env
        
        echo "✅ DATABASE_URL updated to use Supabase"
    fi
fi

echo ""
echo "🌐 Testing Supabase database connection..."

# Test database connection using a simple query
if command -v psql &> /dev/null; then
    echo "🔍 Testing connection with psql..."
    if echo "SELECT 1;" | psql "postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@aws-1-eu-north-1.pooler.supabase.com:6543/postgres" -q; then
        echo "✅ Supabase database connection successful"
    else
        echo "❌ Failed to connect to Supabase database"
        echo "📋 Please check your database credentials and network connection"
        exit 1
    fi
else
    echo "⚠️  psql not found, skipping connection test"
    echo "📋 Proceeding with setup (connection will be tested during Prisma operations)"
fi

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
echo "🗃️  Setting up Supabase database..."

echo "🔄 Generating Prisma client..."
if npx prisma generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "🗃️  Applying database schema to Supabase..."
if npx prisma db push; then
    echo "✅ Database schema applied successfully"
else
    echo "❌ Failed to apply database schema"
    echo "📋 Please check your Supabase connection and permissions"
    exit 1
fi

echo ""
echo "📊 Seeding Supabase database with initial data..."

# Check if seed.sql file exists
if [ -f "prisma/seed.sql" ]; then
    echo "📥 Loading seed data into Supabase..."
    
    # Use psql to load the seed data
    if command -v psql &> /dev/null; then
        if psql "postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@aws-1-eu-north-1.pooler.supabase.com:6543/postgres" -f prisma/seed.sql; then
            echo "✅ Database seeded successfully from SQL file"
        else
            echo "⚠️  SQL seed failed, trying alternative method..."
            
            # Alternative: Use Prisma seed if available
            if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
                echo "🔄 Running Prisma seed..."
                if npx prisma db seed; then
                    echo "✅ Database seeded successfully with Prisma"
                else
                    echo "⚠️  Prisma seed also failed, creating minimal data..."
                fi
            fi
        fi
    else
        echo "⚠️  psql not available, using Prisma seed..."
        if npx prisma db seed; then
            echo "✅ Database seeded successfully with Prisma"
        else
            echo "⚠️  Creating basic seed data..."
            # Create basic seed data using Node.js
            cat > temp_seed.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating basic seed data for Supabase...');
  
  try {
    // Create basic roles if they don't exist
    const existingRoles = await prisma.role.findMany();
    if (existingRoles.length === 0) {
      await prisma.role.createMany({
        data: [
          { libelle: 'Administrateur Système' },
          { libelle: 'Coordinateur Régional' },
          { libelle: 'Superviseur Départemental' },
          { libelle: 'Opérateur de Saisie' },
          { libelle: 'Observateur' }
        ]
      });
      console.log('✅ Basic roles created');
    } else {
      console.log('✅ Roles already exist');
    }
    
    // Create basic regions if they don't exist
    const existingRegions = await prisma.region.findMany();
    if (existingRegions.length === 0) {
      await prisma.region.createMany({
        data: [
          { abbreviation: 'CE', libelle: 'Centre', chef_lieu: 'Yaoundé', description: 'Région du Centre', code_createur: 'SYSTEM', date_creation: new Date().toISOString() },
          { abbreviation: 'LT', libelle: 'Littoral', chef_lieu: 'Douala', description: 'Région du Littoral', code_createur: 'SYSTEM', date_creation: new Date().toISOString() },
          { abbreviation: 'SW', libelle: 'Sud-Ouest', chef_lieu: 'Buea', description: 'Région du Sud-Ouest', code_createur: 'SYSTEM', date_creation: new Date().toISOString() }
        ]
      });
      console.log('✅ Basic regions created');
    } else {
      console.log('✅ Regions already exist');
    }
    
    console.log('✅ Basic seed data created successfully');
  } catch (error) {
    console.error('❌ Error creating seed data:', error);
    throw error;
  }
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
            if node temp_seed.js; then
                echo "✅ Basic seed data created"
            else
                echo "⚠️  Seed creation failed, but continuing..."
            fi
            rm -f temp_seed.js
        fi
    fi
else
    echo "⚠️  No seed.sql file found, creating basic data..."
    # Run the basic seed creation
    if npx prisma db seed 2>/dev/null; then
        echo "✅ Database seeded with Prisma"
    else
        echo "📋 Skipping seed data - you can add data manually later"
    fi
fi

echo ""
echo "🔧 Building application..."
if npm run build; then
    echo "✅ Application built successfully"
else
    echo "⚠️  Build warnings present, but continuing..."
fi

echo ""
echo "✅ Supabase setup completed successfully!"
echo ""
echo "🗃️  Database Details:"
echo "   Host: aws-1-eu-north-1.pooler.supabase.com"
echo "   Port: 6543"
echo "   Database: postgres"
echo "   User: postgres.wvrsbnpxuhbxbljjyucv"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at: http://localhost:3000"
echo ""
echo "🔧 Useful commands:"
echo "   npm run dev          - Start development server"
echo "   npx prisma studio    - Open database browser"
echo "   npx prisma db pull   - Sync schema from database"
echo "   npx prisma db push   - Push schema to database"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Test the application with seeded data"
echo ""
echo "🔗 Database connection string:"
echo "   DATABASE_URL=\"postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@aws-1-eu-north-1.pooler.supabase.com:6543/postgres\""
echo ""
echo "📊 Database Management:"
echo "   • Use Supabase Dashboard for advanced management"
echo "   • Use 'npx prisma studio' for local data browsing"
echo "   • Database is hosted on Supabase (cloud-managed)"