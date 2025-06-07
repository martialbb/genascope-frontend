#!/bin/bash
# Migration preparation script for MySQL to PostgreSQL
# This script prepares the environment for the migration

set -e

echo "🚀 Preparing MySQL to PostgreSQL Migration for Genascope"
echo "========================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="migration_backups/$(date +%Y%m%d_%H%M%S)"
MYSQL_CONTAINER="genascope-frontend-db-1"
POSTGRES_VOLUME="genascope_postgres_data"

# Functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if MySQL container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER}$"; then
        log_warning "MySQL container '${MYSQL_CONTAINER}' not found. Make sure you're running from the correct directory."
    fi
    
    # Check required tools
    for tool in mysql mysqldump psql python3; do
        if ! command -v $tool &> /dev/null; then
            log_warning "$tool is not installed. You may need it for the migration."
        fi
    done
    
    log_info "Prerequisites check completed."
}

create_backup_directory() {
    log_info "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
}

backup_mysql_data() {
    log_info "Creating MySQL backup..."
    
    # Check if MySQL container is running
    if ! docker ps --format '{{.Names}}' | grep -q "^${MYSQL_CONTAINER}$"; then
        log_warning "MySQL container is not running. Starting it..."
        docker-compose -f docker-compose.dev.yml up -d db
        sleep 10
    fi
    
    # Create data backup
    log_info "Backing up MySQL data..."
    docker exec $MYSQL_CONTAINER mysqldump -u genascope -pgenascope genascope \
        --single-transaction --routines --triggers > "$BACKUP_DIR/genascope_data.sql"
    
    # Create schema backup
    log_info "Backing up MySQL schema..."
    docker exec $MYSQL_CONTAINER mysqldump -u genascope -pgenascope genascope \
        --no-data --routines --triggers > "$BACKUP_DIR/genascope_schema.sql"
    
    # Create a full backup (data + schema)
    log_info "Creating full MySQL backup..."
    docker exec $MYSQL_CONTAINER mysqldump -u genascope -pgenascope genascope \
        --single-transaction --routines --triggers --complete-insert > "$BACKUP_DIR/genascope_full.sql"
    
    log_info "MySQL backup completed successfully!"
}

create_postgres_volume() {
    log_info "Creating PostgreSQL Docker volume..."
    
    # Remove existing volume if it exists
    if docker volume ls -q | grep -q "^${POSTGRES_VOLUME}$"; then
        log_warning "PostgreSQL volume already exists. Removing it..."
        docker volume rm $POSTGRES_VOLUME 2>/dev/null || true
    fi
    
    # Create new volume
    docker volume create $POSTGRES_VOLUME
    log_info "PostgreSQL volume created: $POSTGRES_VOLUME"
}

prepare_migration_config() {
    log_info "Creating migration configuration..."
    
    cat > "$BACKUP_DIR/migration_config.yml" << EOF
mysql:
  host: localhost
  port: 3306
  user: genascope
  password: genascope
  database: genascope

postgresql:
  host: localhost
  port: 5432
  user: genascope
  password: genascope
  database: genascope

options:
  continue_on_error: false
  backup_before_migration: true
  validate_after_migration: true
EOF
    
    log_info "Migration configuration created: $BACKUP_DIR/migration_config.yml"
}

update_requirements() {
    log_info "Updating Python requirements for PostgreSQL..."
    
    if [ -f "backend/requirements.txt" ]; then
        cp backend/requirements.txt "$BACKUP_DIR/requirements.txt.backup"
    fi
    
    # Copy PostgreSQL requirements
    if [ -f "backend/requirements.postgresql.txt" ]; then
        cp backend/requirements.postgresql.txt backend/requirements.txt
        log_info "Updated requirements.txt with PostgreSQL dependencies"
    else
        log_warning "PostgreSQL requirements file not found. Please update manually."
    fi
}

create_migration_checklist() {
    log_info "Creating migration checklist..."
    
    cat > "$BACKUP_DIR/migration_checklist.md" << EOF
# PostgreSQL Migration Checklist

## Pre-Migration (Completed ✅)
- [x] Created backup directory: $BACKUP_DIR
- [x] Backed up MySQL data and schema
- [x] Created PostgreSQL Docker volume
- [x] Prepared migration configuration
- [x] Updated Python requirements

## Migration Steps (To Do)
- [ ] Stop current MySQL services: \`docker-compose -f docker-compose.dev.yml down\`
- [ ] Start PostgreSQL services: \`docker-compose -f docker-compose.postgresql.dev.yml up -d db\`
- [ ] Wait for PostgreSQL to be ready
- [ ] Install PostgreSQL requirements: \`pip install -r backend/requirements.txt\`
- [ ] Run Alembic migrations: \`cd backend && alembic upgrade head\`
- [ ] Run data migration script: \`python backend/scripts/migrate_to_postgresql.py --config $BACKUP_DIR/migration_config.yml\`
- [ ] Validate data migration
- [ ] Start full application: \`docker-compose -f docker-compose.postgresql.dev.yml up -d\`
- [ ] Test application functionality
- [ ] Update production configuration

## Rollback Plan (If Needed)
- [ ] Stop PostgreSQL services: \`docker-compose -f docker-compose.postgresql.dev.yml down\`
- [ ] Start MySQL services: \`docker-compose -f docker-compose.dev.yml up -d\`
- [ ] Restore requirements: \`cp $BACKUP_DIR/requirements.txt.backup backend/requirements.txt\`
- [ ] Reinstall MySQL requirements: \`pip install -r backend/requirements.txt\`

## Backup Location
All backups are stored in: $BACKUP_DIR
EOF
    
    log_info "Migration checklist created: $BACKUP_DIR/migration_checklist.md"
}

print_next_steps() {
    echo ""
    echo "🎉 Migration preparation completed successfully!"
    echo "=============================================="
    echo ""
    echo "📁 Backup location: $BACKUP_DIR"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review the migration checklist: $BACKUP_DIR/migration_checklist.md"
    echo "2. Stop current services: docker-compose -f docker-compose.dev.yml down"
    echo "3. Start PostgreSQL: docker-compose -f docker-compose.postgresql.dev.yml up -d db"
    echo "4. Run the migration script: python backend/scripts/migrate_to_postgresql.py --config $BACKUP_DIR/migration_config.yml"
    echo ""
    echo "⚠️  Important: Make sure to test everything thoroughly before production migration!"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    create_backup_directory
    backup_mysql_data
    create_postgres_volume
    prepare_migration_config
    update_requirements
    create_migration_checklist
    print_next_steps
}

# Run the script
main "$@"
