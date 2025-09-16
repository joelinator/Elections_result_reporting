-- Database initialization script
-- This script will run when the PostgreSQL container starts for the first time

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create a simple test table to verify the database is working
CREATE TABLE IF NOT EXISTS connection_test (
    id SERIAL PRIMARY KEY,
    message TEXT DEFAULT 'Database connection successful!',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO connection_test (message) VALUES ('PostgreSQL Docker container is ready!');

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE postgres TO "postgres.wvrsbnpxuhbxbljjyucv";

-- Print success message
\echo 'Database initialization completed successfully!'