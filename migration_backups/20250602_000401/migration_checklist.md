# PostgreSQL Migration Checklist

## Pre-Migration (Completed ✅)
- [x] Created backup directory: migration_backups/20250602_000401
- [x] Backed up MySQL data and schema
- [x] Created PostgreSQL Docker volume
- [x] Prepared migration configuration
- [x] Updated Python requirements

## Migration Steps (To Do)
- [ ] Stop current MySQL services: `docker-compose -f docker-compose.dev.yml down`
- [ ] Start PostgreSQL services: `docker-compose -f docker-compose.postgresql.dev.yml up -d db`
- [ ] Wait for PostgreSQL to be ready
- [ ] Install PostgreSQL requirements: `pip install -r backend/requirements.txt`
- [ ] Run Alembic migrations: `cd backend && alembic upgrade head`
- [ ] Run data migration script: `python backend/scripts/migrate_to_postgresql.py --config migration_backups/20250602_000401/migration_config.yml`
- [ ] Validate data migration
- [ ] Start full application: `docker-compose -f docker-compose.postgresql.dev.yml up -d`
- [ ] Test application functionality
- [ ] Update production configuration

## Rollback Plan (If Needed)
- [ ] Stop PostgreSQL services: `docker-compose -f docker-compose.postgresql.dev.yml down`
- [ ] Start MySQL services: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Restore requirements: `cp migration_backups/20250602_000401/requirements.txt.backup backend/requirements.txt`
- [ ] Reinstall MySQL requirements: `pip install -r backend/requirements.txt`

## Backup Location
All backups are stored in: migration_backups/20250602_000401
