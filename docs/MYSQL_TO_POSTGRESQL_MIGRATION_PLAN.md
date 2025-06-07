# MySQL to PostgreSQL Migration Plan for Genascope

## Executive Summary

This document outlines a comprehensive plan to migrate the Genascope application from MySQL 8.0 to PostgreSQL. The migration includes database schema conversion, data migration, configuration updates, and testing procedures.

## Current State Analysis

### Current MySQL Setup
- **Database Engine**: MySQL 8.0
- **Driver**: PyMySQL (mysql+pymysql://)
- **ORM**: SQLAlchemy 2.0.20+ with Alembic migrations
- **Environment**: Docker containers with persistent volumes
- **Schema**: 13+ tables including users, patients, chat sessions, appointments, lab orders, etc.

### Key Database Features in Use
- UUID primary keys (stored as VARCHAR(36))
- Enum types
- JSON columns for structured data
- Foreign key relationships
- Timestamps with `CURRENT_TIMESTAMP` and `ON UPDATE CURRENT_TIMESTAMP`
- Boolean columns
- TEXT and VARCHAR columns
- DateTime columns

## Migration Strategy

### Phase 1: Pre-Migration Preparation (1-2 weeks)

#### 1.1 Environment Setup
- [ ] Install PostgreSQL development environment
- [ ] Update Docker configurations for PostgreSQL
- [ ] Install Python PostgreSQL adapter (psycopg2)
- [ ] Set up PostgreSQL test database

#### 1.2 Schema Analysis and Conversion Planning
- [ ] Document all MySQL-specific features used
- [ ] Identify data types that need conversion
- [ ] Plan PostgreSQL equivalents for MySQL features
- [ ] Create schema mapping document

#### 1.3 Backup and Safety Measures
- [ ] Create complete MySQL database backup
- [ ] Document current schema structure
- [ ] Set up staging environment for testing
- [ ] Create rollback procedures

### Phase 2: Configuration Updates (3-5 days)

#### 2.1 Database Driver Updates
**Update requirements.txt:**
```python
# Remove
pymysql>=1.1.0

# Add
psycopg2-binary>=2.9.7
# or for production: psycopg2>=2.9.7
```

#### 2.2 Connection String Updates
**Current MySQL connection:**
```python
DATABASE_URI=mysql+pymysql://user:password@db:3306/genascope
```

**New PostgreSQL connection:**
```python
DATABASE_URI=postgresql://user:password@db:5432/genascope
```

#### 2.3 Docker Configuration Updates

**Update docker-compose.yml:**
```yaml
  db:
    image: postgres:15-alpine
    ports:
      - "${DB_PORT:-5432}:5432"
    environment:
      - POSTGRES_DB=genascope
      - POSTGRES_USER=${DB_USER:-user}
      - POSTGRES_PASSWORD=${DB_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
    external: true
    name: genascope_postgres_data
```

**Update docker-compose.dev.yml:**
```yaml
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=genascope
      - POSTGRES_USER=genascope
      - POSTGRES_PASSWORD=genascope
    volumes:
      - genascope-data:/var/lib/postgresql/data
    networks:
      - genascope-network
```

### Phase 3: Schema Migration (1-2 weeks)

#### 3.1 Data Type Conversions

| MySQL Type | PostgreSQL Type | Notes |
|------------|-----------------|-------|
| VARCHAR(36) | UUID | For UUID fields, use native UUID type |
| DATETIME | TIMESTAMP | PostgreSQL timestamp handling |
| BOOLEAN | BOOLEAN | Direct mapping |
| JSON | JSONB | JSONB for better performance |
| TEXT | TEXT | Direct mapping |
| ENUM | Custom ENUM | Create PostgreSQL ENUM types |

#### 3.2 MySQL-Specific Feature Conversions

**1. Auto-increment UUIDs**
```sql
-- MySQL: VARCHAR(36) with application-generated UUIDs
-- PostgreSQL: Native UUID with uuid-ossp extension

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update table definitions to use UUID type
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;
```

**2. Timestamp Defaults**
```sql
-- MySQL: CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- PostgreSQL: Use triggers for updated_at

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to each table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

**3. Boolean Defaults**
```sql
-- MySQL: server_default=sa.text('1') or ('0')
-- PostgreSQL: server_default=sa.text('true') or ('false')
```

#### 3.3 New Alembic Migration Scripts

Create new migration files for PostgreSQL-specific changes:

**Migration: Convert to PostgreSQL**
```python
"""Convert schema for PostgreSQL compatibility

Revision ID: postgresql_conversion
Create Date: 2024-01-XX XX:XX:XX.XXXXXX
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Convert UUID columns
    op.execute('ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID')
    op.execute('ALTER TABLE accounts ALTER COLUMN id TYPE UUID USING id::UUID')
    # ... (repeat for all UUID columns)
    
    # Create updated_at trigger function
    op.execute('''
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    ''')
    
    # Apply triggers to tables with updated_at
    tables_with_updated_at = [
        'users', 'accounts', 'patients', 'chat_sessions', 
        'chat_answers', 'invites', 'appointments', 'lab_orders', 'lab_results'
    ]
    
    for table in tables_with_updated_at:
        op.execute(f'''
            CREATE TRIGGER update_{table}_updated_at 
                BEFORE UPDATE ON {table} 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
        ''')
    
    # Update JSON columns to JSONB
    op.alter_column('chat_questions', 'options', 
                   type_=postgresql.JSONB())
    op.alter_column('chat_questions', 'next_question_logic', 
                   type_=postgresql.JSONB())
    # ... (repeat for other JSON columns)

def downgrade():
    # Downgrade operations (for rollback)
    pass
```

### Phase 4: Data Migration (2-3 days)

#### 4.1 Data Export from MySQL
```bash
# Export data using mysqldump
mysqldump -h localhost -P 3306 -u genascope -p genascope \
  --no-create-info --complete-insert --single-transaction \
  --routines --triggers > genascope_data.sql

# Export schema structure for reference
mysqldump -h localhost -P 3306 -u genascope -p genascope \
  --no-data --routines --triggers > genascope_schema.sql
```

#### 4.2 Data Transformation Script
Create Python script to transform MySQL data for PostgreSQL:

```python
# scripts/migrate_data.py
import pymysql
import psycopg2
import uuid
from datetime import datetime

def migrate_data():
    # Connect to MySQL source
    mysql_conn = pymysql.connect(
        host='localhost', port=3306,
        user='genascope', password='genascope',
        database='genascope'
    )
    
    # Connect to PostgreSQL target
    pg_conn = psycopg2.connect(
        host='localhost', port=5432,
        user='genascope', password='genascope',
        database='genascope'
    )
    
    # Migrate each table
    migrate_accounts(mysql_conn, pg_conn)
    migrate_users(mysql_conn, pg_conn)
    migrate_patients(mysql_conn, pg_conn)
    # ... continue for all tables
    
    mysql_conn.close()
    pg_conn.close()

def migrate_accounts(mysql_conn, pg_conn):
    mysql_cursor = mysql_conn.cursor()
    pg_cursor = pg_conn.cursor()
    
    mysql_cursor.execute("SELECT * FROM accounts")
    
    for row in mysql_cursor.fetchall():
        # Transform data as needed
        account_id = uuid.UUID(row[0])  # Convert string to UUID
        # ... process other fields
        
        pg_cursor.execute("""
            INSERT INTO accounts (id, name, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (account_id, row[1], row[2], row[3], row[4]))
    
    pg_conn.commit()
```

#### 4.3 Data Validation
```python
# scripts/validate_migration.py
def validate_migration():
    # Compare record counts
    # Validate data integrity
    # Check foreign key relationships
    # Verify data types
    pass
```

### Phase 5: Application Updates (3-5 days)

#### 5.1 SQLAlchemy Model Updates

**Update models for PostgreSQL:**
```python
# app/models/user.py
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True)
    # ... other fields
    
    # Use JSONB for better PostgreSQL performance
    metadata = Column(JSONB, nullable=True)
```

#### 5.2 Alembic Configuration Updates

**Update alembic/env.py:**
```python
from app.core.config import settings
from sqlalchemy import engine_from_config

# Use PostgreSQL-specific features
config.set_main_option("sqlalchemy.url", settings.DATABASE_URI)

# Enable UUID support
target_metadata = Base.metadata

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Enable UUID extension
        connection.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
        
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()
```

#### 5.3 Query Updates

**PostgreSQL-specific query optimizations:**
```python
# Use JSONB operators for better performance
from sqlalchemy.dialects.postgresql import JSONB

# Old MySQL JSON query
# session.query(ChatQuestion).filter(
#     ChatQuestion.options.contains('"option1"')
# )

# New PostgreSQL JSONB query
session.query(ChatQuestion).filter(
    ChatQuestion.options.op('?')('option1')
)

# Use PostgreSQL array operators
session.query(User).filter(
    User.id.in_(user_ids)  # More efficient with PostgreSQL
)
```

### Phase 6: Testing and Validation (1-2 weeks)

#### 6.1 Unit Tests
- [ ] Update database fixtures for PostgreSQL
- [ ] Test all CRUD operations
- [ ] Validate JSON/JSONB operations
- [ ] Test UUID handling

#### 6.2 Integration Tests
- [ ] Test complete user workflows
- [ ] Validate chat session functionality
- [ ] Test appointment booking
- [ ] Verify lab order processing

#### 6.3 Performance Testing
- [ ] Compare query performance MySQL vs PostgreSQL
- [ ] Test concurrent connections
- [ ] Validate transaction handling

#### 6.4 Data Integrity Tests
```python
# tests/test_migration.py
def test_data_integrity():
    # Verify all records migrated
    assert mysql_user_count == postgres_user_count
    
    # Verify relationships maintained
    for user in users:
        assert user.account_id is not None
        assert user.account.users.count() > 0
    
    # Verify JSON data preserved
    for question in questions:
        assert question.options is not None
        assert isinstance(question.options, dict)
```

### Phase 7: Deployment (1 week)

#### 7.1 Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run full migration process
- [ ] Perform comprehensive testing
- [ ] Validate performance

#### 7.2 Production Migration Plan

**Migration Timeline (Recommended: Weekend)**

**Friday Evening:**
1. Announce maintenance window
2. Create final MySQL backup
3. Stop write operations to database

**Saturday:**
1. Export final MySQL data
2. Set up PostgreSQL instance
3. Run migration scripts
4. Validate data integrity
5. Update application configuration
6. Deploy updated application

**Sunday:**
1. Perform final testing
2. Monitor application performance
3. Resolve any issues
4. Resume normal operations

#### 7.3 Rollback Plan

**If migration fails:**
1. Stop PostgreSQL application
2. Restore MySQL backup
3. Revert application to MySQL configuration
4. Resume operations on MySQL
5. Analyze failure and plan retry

### Phase 8: Post-Migration Tasks (1 week)

#### 8.1 Monitoring and Optimization
- [ ] Monitor PostgreSQL performance
- [ ] Optimize queries if needed
- [ ] Tune PostgreSQL configuration
- [ ] Update backup procedures

#### 8.2 Documentation Updates
- [ ] Update deployment documentation
- [ ] Update development setup guides
- [ ] Document PostgreSQL-specific features
- [ ] Update troubleshooting guides

#### 8.3 Team Training
- [ ] Train team on PostgreSQL differences
- [ ] Update development workflows
- [ ] Document best practices

## Risk Assessment and Mitigation

### High-Risk Areas
1. **Data Loss**: Comprehensive backups and validation
2. **Downtime**: Scheduled maintenance window
3. **Performance**: Thorough testing and optimization
4. **Application Errors**: Staged deployment and testing

### Mitigation Strategies
1. **Multiple Backups**: MySQL + file system + cloud backups
2. **Staged Approach**: Dev → Staging → Production
3. **Rollback Plan**: Tested and documented procedures
4. **Monitoring**: Real-time monitoring during migration

## Success Criteria

1. **Data Integrity**: 100% data preservation
2. **Functionality**: All features working as before
3. **Performance**: Equal or better performance
4. **Zero Data Loss**: Complete data migration
5. **Minimal Downtime**: < 4 hours maintenance window

## Timeline Summary

| Phase | Duration | Key Activities |
|-------|----------|----------------|
| 1. Preparation | 1-2 weeks | Setup, analysis, backups |
| 2. Configuration | 3-5 days | Update configs, Docker |
| 3. Schema Migration | 1-2 weeks | Convert schema, create migrations |
| 4. Data Migration | 2-3 days | Export, transform, import data |
| 5. Application Updates | 3-5 days | Update models, queries |
| 6. Testing | 1-2 weeks | Unit, integration, performance tests |
| 7. Deployment | 1 week | Staging and production deployment |
| 8. Post-Migration | 1 week | Monitoring, optimization, documentation |

**Total Estimated Duration: 6-10 weeks**

## Resource Requirements

### Technical Resources
- PostgreSQL 15+ server
- Development and staging environments
- Backup storage (2x current database size)
- Monitoring tools

### Human Resources
- Backend developer (full-time)
- DevOps engineer (part-time)
- QA engineer (testing phase)
- Database administrator (consultation)

## Conclusion

This migration plan provides a comprehensive approach to transitioning from MySQL to PostgreSQL while minimizing risks and ensuring data integrity. The phased approach allows for thorough testing and validation at each step, with clear rollback procedures if issues arise.

The key to success is thorough preparation, comprehensive testing, and having a solid rollback plan. PostgreSQL offers improved performance for complex queries, better JSON handling with JSONB, and advanced features that will benefit the Genascope application in the long term.
