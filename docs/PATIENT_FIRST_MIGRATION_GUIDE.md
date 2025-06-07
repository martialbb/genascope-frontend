# Patient-First Invite System Migration Guide

## Overview

This guide outlines the transition from the old email-based invite system to the new patient-first invite system. The new approach creates patient records first, then allows sending invites to those patients, providing better tracking, analytics, and a more streamlined experience.

## Key Changes

1. **Patient Record Creation**: 
   - Patient records are now created before sending invites
   - Patients can be created individually or via bulk import

2. **Invite Flow Changes**:
   - Invites are now linked to existing patient records
   - Multiple invites can be tracked per patient
   - Better status tracking (pending, accepted, expired, revoked)

3. **API Changes**:
   - New patient management endpoints
   - Updated invite endpoints that require patient_id
   - New bulk import options for patients

4. **Frontend Interface Updates**:
   - New Patient Management section
   - Streamlined invite workflow from patient records
   - Better visibility of invite statuses

## Migration Steps

### Backend Migration

1. **Database Updates**:
   - Added patient table with relationships to users and invites
   - Added invite status tracking and patient_id foreign key
   - Created migration scripts to transform existing invites to link with patients

2. **API Updates**:
   - Added `/api/patients` endpoints for CRUD operations
   - Modified `/api/generate_invite` to require patient_id
   - Updated invite verification to check patient status

### Frontend Migration

1. **Component Updates**:
   - Added PatientManager component for patient record management
   - Updated invite dialogs to work with patient records
   - Created bulk import interface for patient data

2. **User Interface Changes**:
   - Added Patient Management section to the navigation
   - Updated invitation workflow to select from existing patients
   - Enhanced status display for invites

### Data Migration

For existing data, a migration script is provided to:
1. Create patient records for all previous invite recipients
2. Link existing invites to the newly created patient records
3. Update invite statuses to match the new system

## Technical Implementation Notes

### Patient Data Structure

```typescript
interface Patient {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: PatientStatus;
  external_id?: string;
  clinician_id?: string;
  account_id?: string;
  clinician_name?: string;
  date_of_birth?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  has_pending_invite: boolean;
}
```

### Invite Data Structure

```typescript
interface PatientInviteRequest {
  patient_id: string;
  provider_id: string;
  send_email?: boolean;
  custom_message?: string;
  expiry_days?: number;
}
```

### Migration Script Usage

Run the migration script:

```bash
# From the project root
python -m backend.app.scripts.migrate_invites_to_patient_first
```

## Testing Recommendations

1. Test creating new patients individually
2. Test bulk importing patients via CSV
3. Test sending invites to the new patient records
4. Verify invite statuses are correctly tracked
5. Test the full user registration flow with the new invite system
6. Validate all migrated data for consistency

## Rollback Plan

If issues are encountered:
1. Keep both systems running in parallel during initial deployment
2. Implement feature flag to switch between old and new invite systems
3. Maintain database compatibility with both approaches during the transition period

For assistance or questions about this migration, contact the development team.
