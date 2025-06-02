# Technical Implementation Guide: Patient-First Invite System (Updated June 2025)

## Overview

This document provides technical details for developers implementing the patient-first invite system. It covers API endpoints, database schema changes, and implementation strategies for both backend and frontend components. This guide has been updated to reflect recent improvements and fixes implemented in June 2025.

## Recent Technical Improvements (June 2025)

### Database & Schema Enhancements
- **Foreign Key Constraints**: Improved cascade deletion handling for user-patient relationships
- **Null Value Handling**: Enhanced schema validation for optional fields like clinician_id
- **Account Relationships**: Fixed account_id mismatch issues in user management

### API Endpoint Improvements
- **Invite System**: Resolved null clinician_id handling in invite generation
- **User Management**: Enhanced CRUD operations with proper error handling
- **Authentication**: Strengthened JWT validation and role-based access

### Frontend Integration
- **API Health Monitoring**: Real-time status checking for all endpoints
- **Error Recovery**: Graceful fallback to mock data when APIs are unavailable
- **User Experience**: Improved error messages and validation feedback

## Database Schema Changes

### New Tables

1. **patients**
   ```sql
   CREATE TABLE patients (
     id VARCHAR(36) PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     first_name VARCHAR(100) NOT NULL,
     last_name VARCHAR(100) NOT NULL,
     phone VARCHAR(20),
     external_id VARCHAR(100),
     date_of_birth DATE,
     notes TEXT,
     status VARCHAR(20) NOT NULL DEFAULT 'active',
     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     clinician_id VARCHAR(36),
     account_id VARCHAR(36),
     user_id VARCHAR(36) UNIQUE,
     FOREIGN KEY (clinician_id) REFERENCES users(id) ON DELETE SET NULL,
     FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
   );
   ```

### Modified Tables

1. **invites**
   ```sql
   ALTER TABLE invites
   ADD COLUMN patient_id VARCHAR(36),
   ADD FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
   ```

## API Endpoints

### Patient Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/` | GET | List patients with filtering |
| `/api/patients/` | POST | Create a new patient |
| `/api/patients/{patient_id}` | GET | Get a specific patient |
| `/api/patients/{patient_id}` | PUT | Update a patient |
| `/api/patients/{patient_id}` | DELETE | Delete a patient |
| `/api/patients/bulk` | POST | Create multiple patients |
| `/api/patients/import-csv` | POST | Import patients from CSV |

### Invite Management (Updated)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate_invite` | POST | Create invite for existing patient |
| `/api/bulk_invite` | POST | Create invites for multiple patients |

## Implementation Steps

### Backend Implementation

1. **Create Models**:
   - Patient model with appropriate fields and relationships
   - Update Invite model to reference patient records

2. **Create Migrations**:
   - Migration for creating patients table
   - Migration for modifying invites table
   - Data migration scripts

3. **Create Services and Repositories**:
   - PatientRepository for data access
   - PatientService for business logic
   - Update InviteService to work with patient records

4. **Create API Endpoints**:
   - Patient CRUD operations
   - Bulk import capabilities
   - Update invite endpoints

### Frontend Implementation

1. **Create Components**:
   - PatientManager for listing and creating patients
   - Import functionality for bulk operations
   - Updated invite forms

2. **Update Existing Components**:
   - Dashboard to show patient status
   - Invite creation to use pre-created patients

3. **Create Routes**:
   - Patient management page
   - Update invite workflow

## Data Migration Strategy

1. **Run Schema Migrations**:
   ```bash
   python -m alembic upgrade 20250527_create_patients
   python -m alembic upgrade 20250528_update_invites
   python -m alembic upgrade 20250529_update_patients
   ```

2. **Run Data Migration Scripts**:
   ```bash
   python scripts/migrate_invites_to_patients.py
   python scripts/link_chats_to_patients.py
   ```

3. **Finalize Schema Changes**:
   ```bash
   python -m alembic upgrade 20250530_finalize_invites
   ```

## Testing Strategy

1. **Unit Tests**:
   - Patient repository and service tests
   - Updated invite service tests

2. **Integration Tests**:
   - API endpoint tests for patient operations
   - Updated invite endpoint tests

3. **End-to-End Tests**:
   - Patient creation and management workflow
   - Invite creation and acceptance flow

## Error Handling

1. **Patient Creation**:
   - Check for duplicate emails
   - Validate required fields

2. **Invite Process**:
   - Check for existing pending invites
   - Verify patient exists before creating invite

## Security Considerations

1. **Access Control**:
   - Only clinicians and admins can create/view patients
   - Implement proper filtering by account and clinician

2. **Data Protection**:
   - Apply HIPAA-compliant data storage practices
   - Encrypt sensitive patient information

## Deployment Notes

1. **Database Backup**:
   - Create a full backup before running migrations
   - Test migration process in staging environment first

2. **Runtime Considerations**:
   - Check for concurrent operations during migration
   - Schedule migration during low-traffic periods

## Support and Troubleshooting

Contact the development team with any issues at dev@genascope.example.com
