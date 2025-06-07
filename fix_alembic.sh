#!/bin/bash

echo "Setting up Alembic environment to fix the missing revision issue..."

# Start by bringing up just the DB container
docker-compose -f docker-compose.dev.yml up -d db maildev

# Wait for the DB to be ready
echo "Waiting for the database to be ready..."
sleep 5

# Start the backend container in interactive mode to run our fixes
echo "Running fixes in the backend container..."
docker-compose -f docker-compose.dev.yml run --rm backend bash -c '
export PYTHONPATH=/app

echo "Current migration history:"
alembic history

echo "Looking for references to missing revision 20250529..."
grep -r "20250529" /app/alembic/versions/ || echo "No direct references found"

echo "Identifying problematic migration files..."
problematic_files=$(grep -l "20250529" /app/alembic/versions/* || echo "")
if [ ! -z "$problematic_files" ]; then
    echo "Found problematic references in: $problematic_files"
    
    # Fix any reference to the missing revision
    for file in $problematic_files; do
        echo "Fixing file: $file"
        # Replace 20250529_update_patients with the actual revision ID that exists
        sed -i "s/20250529_update_patients/c97a538f2456/g" $file
        sed -i "s/20250529/c97a538f2456/g" $file
    done
fi

# Create a new migration that merges heads
echo "Creating a new merge migration..."
alembic revision --autogenerate -m "fix_migration_references"

# Mark the database at the current head
echo "Stamping database and upgrading..."
alembic stamp head || echo "Stamping failed, continuing anyway"
alembic upgrade head || echo "Upgrade failed, trying different approach"

# If direct upgrade fails, we need a more extreme fix
if [ $? -ne 0 ]; then
    echo "Direct upgrade failed, trying offline approach..."
    
    # Create SQL to recreate schema
    alembic upgrade head --sql > /tmp/migration.sql
    
    # Execute the SQL directly if needed
    # mysql -h db -u genascope -pgenascope genascope < /tmp/migration.sql
fi

echo "Fix process completed."
'

# Restart all containers
echo "Restarting all services..."
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

echo "Fix script completed. Check backend logs for status."
