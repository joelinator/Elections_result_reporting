# PostgreSQL Docker Setup for Elections App

This directory contains Docker configuration for running a PostgreSQL database that matches your application's connection requirements.

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start the PostgreSQL database
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs postgres

# Stop the database
docker-compose down

# Stop and remove all data (destructive)
docker-compose down -v
```

### Option 2: Using Docker directly

```bash
# Build the custom PostgreSQL image
docker build -f Dockerfile.postgres -t election-postgres .

# Run the container
docker run -d \
  --name election_postgres \
  -e POSTGRES_USER=postgres.wvrsbnpxuhbxbljjyucv \
  -e POSTGRES_PASSWORD=Joelinator543. \
  -e POSTGRES_DB=postgres \
  -p 6543:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  election-postgres

# Check container status
docker ps

# View logs
docker logs election_postgres

# Stop container
docker stop election_postgres

# Remove container
docker rm election_postgres
```

## 🔗 Connection Details

After starting the database, you can connect using:

```
DATABASE_URL="postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@localhost:6543/postgres"
```

## 🛠 Management Tools

### PgAdmin (Web Interface)
- URL: http://localhost:8080
- Email: admin@election.com
- Password: admin123

### Command Line Access
```bash
# Connect to the database using psql
docker exec -it election_postgres psql -U postgres.wvrsbnpxuhbxbljjyucv -d postgres

# Or using docker-compose
docker-compose exec postgres psql -U postgres.wvrsbnpxuhbxbljjyucv -d postgres
```

## 📁 Files Structure

- `docker-compose.yml` - Main orchestration file
- `Dockerfile.postgres` - Custom PostgreSQL image
- `entrypoint.sh` - Custom startup script
- `init.sql` - Database initialization script

## 🧪 Testing Connection

1. Start the database:
   ```bash
   docker-compose up -d
   ```

2. Test connection:
   ```bash
   # Using psql
   psql "postgresql://postgres.wvrsbnpxuhbxbljjyucv:Joelinator543.@localhost:6543/postgres"
   
   # Using your application
   cd election-app
   npx prisma db pull
   ```

## 🔧 Troubleshooting

### Database won't start
```bash
# Check logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Connection refused
```bash
# Verify port is available
netstat -an | grep 6543

# Check if container is running
docker ps
```

### Permission issues
```bash
# Reset volumes and restart
docker-compose down -v
docker-compose up -d
```

## 📊 Performance Configuration

The database is configured with optimized settings:
- Max connections: 100
- Shared buffers: 256MB
- Effective cache size: 1GB
- Maintenance work mem: 64MB

## 🔒 Security Notes

- Change default passwords in production
- Use environment files for sensitive data
- Configure proper network security
- Enable SSL for production deployments

## 🗃 Data Persistence

Data is persisted in Docker volumes:
- `postgres_data`: Database files
- `pgadmin_data`: PgAdmin configuration

To backup data:
```bash
# Create backup
docker exec election_postgres pg_dump -U postgres.wvrsbnpxuhbxbljjyucv postgres > backup.sql

# Restore backup
docker exec -i election_postgres psql -U postgres.wvrsbnpxuhbxbljjyucv postgres < backup.sql
```