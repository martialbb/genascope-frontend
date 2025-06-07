#!/bin/bash

echo "Fixing Alembic migration issues..."

# Enter the backend container
docker-compose -f docker-compose.dev.yml exec backend bash -c '
set -e
cd /app

# Print the current migration history
echo "Current migration history:"
export PYTHONPATH=/app
alembic history

# Check if the problematic migration exists
echo "Checking for problematic migrations..."
if grep -r "20250529" alembic/versions/; then
  echo "Found problematic migration references to 20250529"
  
  # List all migration files
  echo "Migration files:"
  ls -la alembic/versions/
  
  # Look for the missing migration specifically
  grep -r "20250529_update_patients" alembic/versions/ || echo "Migration not found"
fi

# Handle multiple heads by creating a new merge migration
echo "Creating a merge migration to handle multiple heads..."
alembic revision --autogenerate -m "merge_heads_fix"

# Stamp the database to a working revision
echo "Stamping database to a working revision..."
alembic stamp head

# Try to upgrade
echo "Attempting to upgrade the database..."
alembic upgrade head

echo "Migration fix complete."
'

echo "Script completed. Check the output for any errors."
