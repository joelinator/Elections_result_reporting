-- Initial database setup script
-- This script runs when the PostgreSQL container is first created

-- Create any additional databases if needed
-- CREATE DATABASE election_db;

-- Create any initial tables or configurations
-- You can add your schema here or let Prisma handle it

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE postgres TO "postgres.wvrsbnpxuhbxbljjyucv";

-- Optional: Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";