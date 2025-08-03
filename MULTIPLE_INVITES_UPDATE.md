# Multiple Chat Strategy Invites Update

## Overview
Updated the frontend to support sending multiple invites to the same patient with different chat strategies. Previously, the system prevented creating new invites when a patient had a pending invite.

## Changes Made

### 1. Type Definitions (`src/types/patients.ts`)
- **Added** chat strategy fields to `PatientInviteResponse`:
  - `chat_strategy_id?: string`
  - `chat_strategy_name?: string`

### 2. Patient Manager (`src/components/PatientManager.tsx`)
- **Removed** conditional logic that hid the invite button when `has_pending_invite` was true
- **Updated** invite status display:
  - "Invite Sent" → "Has Active Invites"
  - "No Active Invite" → "No Active Invites"
- **Updated** invite button tooltip: "Send Invite" → "Send New Invite"
- **Updated** modal title: "Send Patient Invite" → "Send New Patient Invite"
- **Added** explanatory note in invite modal: "You can send multiple invites with different chat strategies to the same patient."
- **Added** "Chat Strategy" column to invite history table
- **Enhanced** invite history to show chat strategy information

### 3. Bulk Invite Modal (`src/components/BulkInviteModal.tsx`)
- **Removed** filtering that excluded patients with pending invites
- **Updated** description to clarify multiple invites are allowed: "You can send multiple invites with different chat strategies to the same patient."

## Key Behavioral Changes

### Before
- ❌ Patients with pending invites couldn't receive new invites
- ❌ Invite button was hidden for patients with pending invites
- ❌ Bulk invite excluded patients with pending invites
- ❌ No chat strategy information in invite history

### After
- ✅ Patients can receive multiple invites with different chat strategies
- ✅ Invite button is always visible for all patients
- ✅ Bulk invite includes all patients regardless of pending invite status
- ✅ Chat strategy information displayed in invite history
- ✅ Clear messaging about multiple invite capability

## UI/UX Improvements
1. **Clear messaging** about multiple invite capability
2. **Consistent terminology** using "Active Invites" (plural)
3. **Enhanced invite history** with chat strategy information
4. **Improved tooltips** to clarify invite actions
5. **Better user guidance** with explanatory notes

## Testing Considerations
- Verify that patients with existing invites can receive new invites
- Test that different chat strategies can be selected for the same patient
- Confirm invite history displays chat strategy information correctly
- Check that bulk invite works for all patients regardless of pending status

## Backend Requirements
The backend should now return chat strategy information in invite responses:
- `chat_strategy_id` field in invite responses
- `chat_strategy_name` field in invite responses
- Support for multiple active invites per patient with different chat strategies
