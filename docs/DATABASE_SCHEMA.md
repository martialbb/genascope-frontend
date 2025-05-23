# Genascope Database Schema Documentation

This document provides a detailed overview of the Genascope database schema, including table structures, relationships, and data types.

## Overview

The Genascope database is designed to support the following key features:
- User and account management with role-based permissions
- Patient data storage and management
- Chat-based risk assessment session tracking
- Patient invitation system
- Eligibility analysis results
- Lab test ordering and results

## Table Definitions

### Account

Represents an organization using the Genascope platform.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Organization name |
| status | ENUM | Account status: 'active', 'inactive', 'suspended' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| subscription_tier | VARCHAR(50) | Subscription level |
| max_users | INTEGER | Maximum allowed users |

#### Indexes
- `PRIMARY KEY (id)`

### User

Represents users of the system with various roles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | User email (unique) |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| role | ENUM | User role: 'super_admin', 'account_admin', 'clinician', 'office_staff' |
| account_id | UUID | Foreign key to Account |
| status | ENUM | User status: 'active', 'inactive', 'invited', 'suspended' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| last_login | TIMESTAMP | Last login timestamp |

#### Indexes
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (email)`
- `INDEX (account_id)`

#### Relationships
- `FOREIGN KEY (account_id) REFERENCES Account(id)`

### Patient

Stores patient information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| account_id | UUID | Foreign key to Account |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(20) | Phone number |
| date_of_birth | DATE | Date of birth |
| provider_id | UUID | Foreign key to User (clinician) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| status | ENUM | Patient status: 'active', 'inactive', 'archived' |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (account_id)`
- `INDEX (provider_id)`
- `INDEX (email)`

#### Relationships
- `FOREIGN KEY (account_id) REFERENCES Account(id)`
- `FOREIGN KEY (provider_id) REFERENCES User(id)`

### ChatSession

Tracks interactive risk assessment chat sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_id | UUID | Foreign key to Patient |
| status | ENUM | Session status: 'in_progress', 'completed', 'abandoned' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| completed_at | TIMESTAMP | Completion timestamp |
| source | VARCHAR(50) | How session was initiated: 'invite', 'direct', 'provider' |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (patient_id)`

#### Relationships
- `FOREIGN KEY (patient_id) REFERENCES Patient(id)`

### ChatQuestion

Pre-defined questions for the risk assessment chat.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| text | TEXT | Question text |
| question_type | VARCHAR(50) | Question type: 'multiple_choice', 'text', 'yes_no', 'number' |
| options | JSON | Possible answers for multiple choice questions |
| next_question_logic | JSON | Logic for determining next question based on answer |
| category | VARCHAR(100) | Question category |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| is_active | BOOLEAN | Whether question is active |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (category)`

### ChatAnswer

Stores answers from risk assessment sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to ChatSession |
| question_id | INTEGER | Foreign key to ChatQuestion |
| answer | TEXT | Patient's answer |
| created_at | TIMESTAMP | Creation timestamp |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (session_id)`
- `INDEX (question_id)`

#### Relationships
- `FOREIGN KEY (session_id) REFERENCES ChatSession(id)`
- `FOREIGN KEY (question_id) REFERENCES ChatQuestion(id)`

### Invite

Manages patient invitations to complete risk assessments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_id | UUID | Foreign key to Patient (nullable) |
| email | VARCHAR(255) | Patient's email |
| first_name | VARCHAR(100) | Patient's first name |
| last_name | VARCHAR(100) | Patient's last name |
| token | VARCHAR(255) | Unique invitation token |
| provider_id | UUID | Foreign key to User who created invite |
| status | ENUM | Invite status: 'pending', 'completed', 'expired' |
| created_at | TIMESTAMP | Creation timestamp |
| expires_at | TIMESTAMP | Expiration timestamp |
| completed_at | TIMESTAMP | When invite was used |

#### Indexes
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (token)`
- `INDEX (patient_id)`
- `INDEX (provider_id)`
- `INDEX (email)`

#### Relationships
- `FOREIGN KEY (patient_id) REFERENCES Patient(id)`
- `FOREIGN KEY (provider_id) REFERENCES User(id)`

### EligibilityResult

Stores results of eligibility analysis based on risk assessment.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_id | UUID | Foreign key to Patient |
| session_id | UUID | Foreign key to ChatSession |
| is_eligible | BOOLEAN | Overall eligibility flag |
| nccn_eligible | BOOLEAN | NCCN guideline eligibility |
| tc_score | DECIMAL | Tyrer-Cuzick model score |
| factors | JSON | Risk factors that contributed to eligibility |
| created_at | TIMESTAMP | Creation timestamp |
| provider_reviewed | BOOLEAN | Whether a provider has reviewed the results |
| provider_id | UUID | Provider who reviewed the results (nullable) |
| review_notes | TEXT | Provider's notes on eligibility |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (patient_id)`
- `INDEX (session_id)`
- `INDEX (provider_id)`

#### Relationships
- `FOREIGN KEY (patient_id) REFERENCES Patient(id)`
- `FOREIGN KEY (session_id) REFERENCES ChatSession(id)`
- `FOREIGN KEY (provider_id) REFERENCES User(id)`

### LabOrder

Tracks genetic test orders.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_id | UUID | Foreign key to Patient |
| provider_id | UUID | Foreign key to User who ordered the test |
| eligibility_result_id | UUID | Foreign key to EligibilityResult |
| test_type | VARCHAR(100) | Type of genetic test ordered |
| lab_id | VARCHAR(100) | External lab identifier |
| status | ENUM | Order status: 'ordered', 'processing', 'completed', 'cancelled' |
| ordered_at | TIMESTAMP | When the test was ordered |
| external_order_id | VARCHAR(255) | Order ID in external lab system |
| insurance_information | JSON | Insurance details for billing |
| notes | TEXT | Clinical notes related to the order |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (patient_id)`
- `INDEX (provider_id)`
- `INDEX (eligibility_result_id)`
- `INDEX (external_order_id)`

#### Relationships
- `FOREIGN KEY (patient_id) REFERENCES Patient(id)`
- `FOREIGN KEY (provider_id) REFERENCES User(id)`
- `FOREIGN KEY (eligibility_result_id) REFERENCES EligibilityResult(id)`

### LabResult

Stores genetic test results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to LabOrder |
| status | ENUM | Result status: 'pending', 'available', 'reviewed' |
| result_data | JSON | Structured test results |
| raw_result | TEXT | Raw data from lab |
| received_at | TIMESTAMP | When results were received |
| reviewed_at | TIMESTAMP | When provider reviewed results |
| reviewer_id | UUID | Foreign key to User who reviewed results |
| clinical_significance | VARCHAR(100) | Clinical interpretation of results |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (order_id)`
- `INDEX (reviewer_id)`

#### Relationships
- `FOREIGN KEY (order_id) REFERENCES LabOrder(id)`
- `FOREIGN KEY (reviewer_id) REFERENCES User(id)`

### Appointments

Represents scheduled appointments between patients and clinicians.

| Column             | Type         | Description                                 |
|--------------------|--------------|---------------------------------------------|
| id                 | UUID         | Primary key                                 |
| patient_id         | UUID         | Foreign key to Patient                      |
| clinician_id       | UUID         | Foreign key to User (clinician)             |
| date               | DATE         | Appointment date                            |
| time               | TIME         | Appointment time                            |
| date_time          | DATETIME     | Combined date and time (legacy/compat)      |
| appointment_type   | VARCHAR(20)  | 'virtual' or 'in-person'                    |
| status             | VARCHAR(20)  | 'scheduled', 'completed', etc.              |
| notes              | TEXT         | Optional notes                              |
| confirmation_code  | VARCHAR(10)  | Unique confirmation code                    |
| created_at         | DATETIME     | Creation timestamp                          |
| updated_at         | DATETIME     | Last update timestamp                       |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (patient_id)`
- `INDEX (clinician_id)`
- `INDEX (date)`

#### Relationships
- `FOREIGN KEY (patient_id) REFERENCES Patient(id)`
- `FOREIGN KEY (clinician_id) REFERENCES User(id)`

### RecurringAvailability

Defines recurring availability patterns for clinicians.

| Column         | Type   | Description                                 |
|----------------|--------|---------------------------------------------|
| id             | UUID   | Primary key                                 |
| clinician_id   | UUID   | Foreign key to User (clinician)             |
| day_of_week    | INT    | 0=Monday, 6=Sunday                          |
| time           | TIME   | Time of day                                 |
| start_date     | DATE   | Start date of recurrence                    |
| end_date       | DATE   | End date of recurrence                      |
| valid_until    | DATE   | Last valid date                             |
| days_of_week   | TEXT   | JSON-encoded list of days                   |
| time_slots     | TEXT   | JSON-encoded list of time slots             |
| created_at     | DATETIME | Creation timestamp                        |
| updated_at     | DATETIME | Last update timestamp                     |

#### Indexes
- `PRIMARY KEY (id)`
- `INDEX (clinician_id)`

#### Relationships
- `FOREIGN KEY (clinician_id) REFERENCES User(id)`

---

## Alembic Migrations & Schema Sync
- All model fields are now kept in sync with the database using Alembic migrations.
- If you encounter a migration error (e.g., missing columns, multiple heads), see the Troubleshooting Guide.
- Manual schema changes may be required if migrations fail; always update both the model and the DB.

## Common Queries

### Patient Risk Assessment Status

```sql
SELECT 
    p.id, 
    p.first_name, 
    p.last_name, 
    cs.status AS chat_status, 
    er.is_eligible 
FROM 
    Patient p
LEFT JOIN 
    ChatSession cs ON p.id = cs.patient_id AND cs.status = 'completed'
LEFT JOIN 
    EligibilityResult er ON p.id = er.patient_id
WHERE 
    p.provider_id = :provider_id
ORDER BY 
    cs.completed_at DESC;
```

### Pending Invitations

```sql
SELECT 
    i.id, 
    i.email, 
    i.first_name, 
    i.last_name, 
    i.created_at, 
    i.expires_at,
    u.first_name as provider_first_name,
    u.last_name as provider_last_name
FROM 
    Invite i
JOIN 
    User u ON i.provider_id = u.id
WHERE 
    i.status = 'pending' 
    AND i.expires_at > CURRENT_TIMESTAMP
    AND u.account_id = :account_id
ORDER BY 
    i.created_at DESC;
```

### Lab Test Order Status

```sql
SELECT 
    lo.id, 
    p.first_name, 
    p.last_name, 
    lo.test_type, 
    lo.status, 
    lo.ordered_at,
    lr.status AS result_status
FROM 
    LabOrder lo
JOIN 
    Patient p ON lo.patient_id = p.id
LEFT JOIN 
    LabResult lr ON lo.id = lr.order_id
WHERE 
    p.account_id = :account_id
ORDER BY 
    lo.ordered_at DESC;
```

## Database Schema Migrations

Migrations are managed using Alembic. Key migration files include:

1. `versions/001_initial_schema.py` - Base tables (Account, User, Patient)
2. `versions/002_chat_system.py` - Chat session tables
3. `versions/003_invite_system.py` - Patient invitation system
4. `versions/004_eligibility_analysis.py` - Eligibility results
5. `versions/005_lab_integration.py` - Lab orders and results
6. `versions/006_appointments.py` - Appointments and availability

To apply migrations:

```bash
# In the backend repository
alembic upgrade head
```

To create a new migration:

```bash
# In the backend repository
alembic revision -m "description_of_changes"
```
