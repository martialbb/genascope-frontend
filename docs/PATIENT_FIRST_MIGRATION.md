# Migrating to Patient-First Invite System

## Overview

This document describes the steps required to migrate from the original invite-first approach to the new patient-first approach in the Genascope platform.

## Why This Migration?

The original invite system created patient records after users accepted invites. The new approach:

1. Creates patient records first, allowing for better data management and integration with clinic systems
2. Enables bulk patient imports through CSV or API integrations
3. Links chat histories directly to patient records from the beginning
4. Maintains HIPAA compliance with proper patient data management
5. Provides a more complete view of the patient journey

## Migration Steps

### 1. Database Migration

Run the following Alembic migrations in order:

```bash
cd backend
python -m alembic upgrade 20250527_create_patients  # Create patients table
python -m alembic upgrade 20250528_update_invites   # Add patient_id to invites
python -m alembic upgrade 20250529_update_patients  # Add user_id to patients
```

### 2. Data Migration

The data migration script will create patient records for all existing invites and link them together.

```bash
cd backend
python scripts/migrate_invites_to_patients.py
```

### 3. Final Database Update

After data migration is complete, run the final migration to make patient_id non-nullable:

```bash
cd backend
python -m alembic upgrade 20250530_finalize_invites
```

### 4. Update Code to Latest Version

Update the codebase with the new patient-first approach:

1. Patient model with associated schemas and repositories
2. Updated invite flow that requires pre-created patient records
3. New patient management endpoints
4. Bulk import capabilities for patients
5. Updated frontend components to work with the new flow

### 5. Frontend Updates

The frontend must be updated to:

1. Create patients before sending invites
2. Display patient records in the dashboard
3. Support bulk patient imports
4. Link invites to existing patients

## New Patient Management Endpoints

### Create Patients

```
POST /api/patients
```

Creates a new patient record.

### Bulk Create Patients

```
POST /api/patients/bulk
```

Creates multiple patient records at once.

### Import Patients from CSV

```
POST /api/patients/import-csv
```

Uploads a CSV file with patient data and imports them as patient records.

### Get Patients

```
GET /api/patients
```

Retrieves a list of patients with filtering options.

## New Invite Flow

1. Create a patient record (or import patients in bulk)
2. Generate an invite for a specific patient
3. When user accepts the invite, they're linked to the pre-created patient record

## Rollback Plan

If issues arise during migration, you can roll back to the previous system by:

1. Reverting the database changes with `alembic downgrade`
2. Rolling back to the previous codebase version

## Support

For assistance with migration, contact support@genascope.example.com.
