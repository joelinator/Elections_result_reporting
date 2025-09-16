#!/bin/bash

# Setup script for Elections Result Reporting Application
echo "🚀 Setting up Elections Result Reporting Application..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory structure
if [ ! -d "election-app" ]; then
    print_error "election-app directory not found. Please run this script from the project root directory"
    exit 1
fi

# Navigate to the election-app directory
cd election-app

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in election-app directory"
    exit 1
fi

# 1. Install dependencies
print_status "Installing Node.js dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# 2. Check if Docker is running
print_status "Checking Docker status..."
if docker info > /dev/null 2>&1; then
    print_success "Docker is running"
else
    print_warning "Docker is not running. Please start Docker first."
    echo "Run: sudo systemctl start docker"
    exit 1
fi

# 3. Start PostgreSQL database
print_status "Starting PostgreSQL database..."
cd ..
if docker-compose up -d; then
    print_success "PostgreSQL database started"
    sleep 5  # Wait for database to be ready
else
    print_error "Failed to start database"
    exit 1
fi

cd election-app

# 4. Generate Prisma client
print_status "Generating Prisma client..."
if npx prisma generate; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# 5. Push database schema
print_status "Setting up database schema..."
if npx prisma db push; then
    print_success "Database schema created"
else
    print_error "Failed to create database schema"
    exit 1
fi

# 6. Seed database with test data
print_status "Seeding database with test data..."
if npx prisma db seed; then
    print_success "Database seeded successfully"
else
    print_warning "Database seeding failed, but you can continue without test data"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Test Credentials:"
echo "   Username: admin"
echo "   Password: password123"
echo ""
echo "🔗 Available Commands:"
echo "   npm run dev          - Start development server"
echo "   npm run db:studio    - Open Prisma Studio"
echo "   npm run db:seed      - Reseed database"
echo "   npm run db:reset     - Reset database"
echo ""
echo "🌐 URLs:"
echo "   Application:  http://localhost:3000"
echo "   Prisma Studio: http://localhost:5555"
echo "   PgAdmin:      http://localhost:8080"
echo ""
echo "🚀 Ready to start development!"
echo "   Run: npm run dev"