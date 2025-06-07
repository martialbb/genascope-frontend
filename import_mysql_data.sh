#!/bin/bash
# Import MySQL data backup into PostgreSQL
# This script converts MySQL INSERT statements to PostgreSQL format

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MYSQL_DATA_FILE="$SCRIPT_DIR/migration_backups/20250602_000401/genascope_data.sql"
POSTGRESQL_DATA_FILE="/tmp/postgresql_data.sql"

log_header "Converting MySQL Data to PostgreSQL Format"

log_info "Processing MySQL data dump..."

# Extract only the INSERT statements and convert them for PostgreSQL
cat "$MYSQL_DATA_FILE" | \
    # Remove MySQL-specific settings
    grep -v "^/\*!" | \
    # Remove MySQL-specific comments
    grep -v "^--" | \
    # Extract only INSERT statements
    grep "^INSERT INTO" | \
    # Convert MySQL backticks to PostgreSQL double quotes for table names
    sed 's/`\([^`]*\)`/"\1"/g' | \
    # Convert MySQL VALUES format to PostgreSQL format
    sed 's/INSERT INTO \("[^"]*"\) VALUES /INSERT INTO \1 VALUES /' > "$POSTGRESQL_DATA_FILE"

log_info "Converted MySQL data file created at: $POSTGRESQL_DATA_FILE"

log_header "Importing Data into PostgreSQL"

# Import the converted data into PostgreSQL
if docker-compose -f docker-compose.postgresql.dev.yml exec -T db psql -U genascope -d genascope < "$POSTGRESQL_DATA_FILE"; then
    log_info "Data import completed successfully!"
else
    log_error "Data import failed"
    exit 1
fi

# Clean up temporary file
rm -f "$POSTGRESQL_DATA_FILE"

log_header "Verifying Data Import"

# Check some tables to verify data was imported
echo "Checking imported data..."
docker-compose -f docker-compose.postgresql.dev.yml exec -T db psql -U genascope -d genascope -c "
    SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts
    UNION ALL
    SELECT 'users' as table_name, COUNT(*) as count FROM users  
    UNION ALL
    SELECT 'patients' as table_name, COUNT(*) as count FROM patients
    UNION ALL
    SELECT 'invites' as table_name, COUNT(*) as count FROM invites;
"

log_info "Data import verification completed!"
