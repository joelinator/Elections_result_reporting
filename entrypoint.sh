#!/bin/bash
set -e

# Set the correct port in postgresql.conf
echo "port = 5432" >> /usr/local/share/postgresql/postgresql.conf.sample
echo "listen_addresses = '*'" >> /usr/local/share/postgresql/postgresql.conf.sample

# Start PostgreSQL with the original entrypoint
exec docker-entrypoint.sh "$@"