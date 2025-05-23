\
# End-to-End UI Test Case Scenarios

## 1. Introduction

This document outlines test case scenarios for manually testing the application's user interface (UI) and core functionalities from an end-to-end perspective. These tests are designed to be executed by a human tester interacting with the live application.

## 2. Prerequisites

*   The application (frontend and backend) must be running and accessible via a web browser.
*   The database must be populated with the necessary test users.
*   Ensure you have a stable internet connection.

## 3. Test User Credentials

Use the following credentials for testing different roles. Replace passwords if they have been changed.

| Role          | Email                | Password         | User ID            |
|---------------|----------------------|------------------|--------------------|
| Patient       | `patient@test.com`   | `PatientPass123!`| `test-patient-1`   |
| Clinician     | `clinician@test.com` | `TestPass123!`   | `test-clinician-1` |
| Admin         | `admin@test.com`     | `AdminPass123!`  | `test-admin-1`     |
| Super Admin   | `superuser@test.com` | `SuperPass123!`  | `test-superuser-1` |
| Lab Tech      | `labtech@test.com`   | `LabTechPass123!`| `test-labtech-1`   |

## 4. Test Case Scenarios

For each test case:
*   **Test Case ID**: Unique identifier for the test case.
*   **Role**: The user role performing the test.
*   **Objective**: What the test aims to verify.
*   **Steps**: Detailed steps to execute the test.
*   **Expected Result**: The anticipated outcome if the test is successful.
*   **Actual Result**: (To be filled by the tester)
*   **Status**: (Pass/Fail - To be filled by thetester)
*   **Notes**: (Any observations or issues - To be filled by the tester)

---

### 4.1. General Authentication

| Test Case ID | Role    | Objective                                  | Steps                                                                                                                               | Expected Result                                                                                                | Actual Result | Status | Notes |
|--------------|---------|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------------|--------|-------|
| TC_AUTH_001  | Any     | Verify successful login with valid credentials | 1. Navigate to the login page. <br> 2. Enter valid email for a specific role. <br> 3. Enter valid password. <br> 4. Click "Login". | User is redirected to the role-specific dashboard/home page. A success message might be shown.                 |               |        |       |
| TC_AUTH_002  | Any     | Verify failed login with invalid password  | 1. Navigate to the login page. <br> 2. Enter valid email. <br> 3. Enter an invalid password. <br> 4. Click "Login".                   | An error message is displayed indicating invalid credentials. User remains on the login page.                  |               |        |       |
| TC_AUTH_003  | Any     | Verify failed login with invalid email     | 1. Navigate to the login page. <br> 2. Enter an invalid/non-existent email. <br> 3. Enter any password. <br> 4. Click "Login".        | An error message is displayed indicating invalid credentials or user not found. User remains on the login page. |               |        |       |
| TC_AUTH_004  | Any     | Verify successful logout                   | 1. Log in as any user. <br> 2. Locate and click the "Logout" button/link.                                                            | User is logged out and redirected to the login page or public home page.                                       |               |        |       |

---

### 4.2. Patient Role Scenarios

| Test Case ID | Role    | Objective                                      | Steps                                                                                                                                                                                             | Expected Result                                                                                                                                  | Actual Result | Status | Notes |
|--------------|---------|------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------|-------|
| TC_PAT_001   | Patient | View personal profile information              | 1. Log in as Patient. <br> 2. Navigate to the "Profile" or "My Account" section.                                                                                                                  | Patient's personal details (name, email, etc.) are displayed correctly.                                                                          |               |        |       |
| TC_PAT_002   | Patient | View upcoming appointments                     | 1. Log in as Patient. <br> 2. Navigate to the "Appointments" or "My Appointments" section. <br> 3. Check for a list/calendar of upcoming appointments.                                             | Any scheduled upcoming appointments for the patient are displayed with correct details (clinician, date, time, type).                            |               |        |       |
| TC_PAT_003   | Patient | Book a new appointment                         | 1. Log in as Patient. <br> 2. Navigate to "Book Appointment" or similar. <br> 3. Select a clinician (if applicable). <br> 4. Choose an available date and time slot. <br> 5. Confirm the booking. | Appointment is successfully booked. A confirmation message is shown. The new appointment appears in the "Upcoming Appointments" list.          |               |        |       |
| TC_PAT_004   | Patient | Cancel an existing appointment                 | 1. Log in as Patient. <br> 2. Go to "Upcoming Appointments". <br> 3. Select an appointment to cancel. <br> 4. Confirm cancellation (if a reason is required, provide one).                         | The appointment is marked as canceled. It might move to a "Past Appointments" or "Canceled Appointments" section. Confirmation is shown.        |               |        |       |
| TC_PAT_005   | Patient | View past appointments                         | 1. Log in as Patient. <br> 2. Navigate to "Appointments" and look for a "Past" or "History" tab/section.                                                                                         | A list of completed or past canceled appointments is displayed.                                                                                  |               |        |       |
| TC_PAT_006   | Patient | Access chat functionality (if available)       | 1. Log in as Patient. <br> 2. Find a "Chat" or "Messages" link, possibly associated with a clinician or appointment. <br> 3. Attempt to send a message.                                          | Chat interface loads. Patient can send and receive messages if the feature is implemented.                                                       |               |        |       |

---

### 4.3. Clinician Role Scenarios

| Test Case ID | Role      | Objective                                       | Steps                                                                                                                                                                                             | Expected Result                                                                                                                                   | Actual Result | Status | Notes |
|--------------|-----------|-------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------|-------|
| TC_CLI_001   | Clinician | View clinician dashboard                        | 1. Log in as Clinician.                                                                                                                                                                           | Dashboard displays relevant information (e.g., upcoming appointments, summary statistics, notifications).                                       |               |        |       |
| TC_CLI_002   | Clinician | Manage availability (set/update)                | 1. Log in as Clinician. <br> 2. Navigate to "Availability" or "Schedule Management". <br> 3. Select dates/times to mark as available or unavailable. <br> 4. Save changes.                         | Availability is updated in the system. Patients should see these changes when trying to book.                                                     |               |        |       |
| TC_CLI_003   | Clinician | View scheduled appointments (calendar/list)     | 1. Log in as Clinician. <br> 2. Navigate to "Appointments" or "Calendar".                                                                                                                        | All appointments scheduled with this clinician are displayed correctly with patient details, date, time, and status.                              |               |        |       |
| TC_CLI_004   | Clinician | View a specific patient's details/history       | 1. Log in as Clinician. <br> 2. From an appointment or patient list, select a patient. <br> 3. Navigate to their profile or medical record section.                                                 | Clinician can view the selected patient's relevant information (e.g., past appointments, notes, test results if applicable).                      |               |        |       |
| TC_CLI_005   | Clinician | Add notes to an appointment/consultation        | 1. Log in as Clinician. <br> 2. Select an ongoing or past appointment. <br> 3. Find an option to "Add Notes" or "Edit Consultation Details". <br> 4. Enter notes and save.                           | Notes are saved and associated with the appointment/patient record.                                                                               |               |        |       |
| TC_CLI_006   | Clinician | Access chat functionality with a patient        | 1. Log in as Clinician. <br> 2. Find a "Chat" or "Messages" link, possibly associated with a patient or appointment. <br> 3. Attempt to send a message to a patient.                               | Chat interface loads. Clinician can send and receive messages with patients if the feature is implemented.                                        |               |        |       |

---

### 4.4. Admin Role Scenarios

| Test Case ID | Role  | Objective                                      | Steps                                                                                                                                                                                                                            | Expected Result                                                                                                                                                              | Actual Result | Status | Notes |
|--------------|-------|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------|-------|
| TC_ADM_001   | Admin | View admin dashboard                           | 1. Log in as Admin.                                                                                                                                                                                                              | Admin dashboard displays overview statistics, quick links to management sections, etc.                                                                                       |               |        |       |
| TC_ADM_002   | Admin | User Management: View list of users            | 1. Log in as Admin. <br> 2. Navigate to "User Management" or "Users". <br> 3. Filter by role (Patient, Clinician, etc.) if available.                                                                                             | A list of users is displayed with relevant details (name, email, role, status).                                                                                              |               |        |       |
| TC_ADM_003   | Admin | User Management: Create a new user (e.g., Clinician) | 1. Log in as Admin. <br> 2. Go to "User Management". <br> 3. Click "Add User" or similar. <br> 4. Fill in required details (name, email, role, temporary password). <br> 5. Save the new user.                               | New user is created successfully and appears in the user list. The new user should be able to log in.                                                                        |               |        |       |
| TC_ADM_004   | Admin | User Management: Edit an existing user's details | 1. Log in as Admin. <br> 2. Go to "User Management". <br> 3. Select a user to edit. <br> 4. Modify some details (e.g., phone number, deactivate account). <br> 5. Save changes.                                                  | User's details are updated. If deactivated, the user should not be able to log in.                                                                                           |               |        |       |
| TC_ADM_005   | Admin | Appointment Management: View all appointments  | 1. Log in as Admin. <br> 2. Navigate to "Appointments Management" or "All Appointments". <br> 3. Filter/sort appointments (e.g., by date, clinician, status).                                                                  | A comprehensive list of all appointments in the system is displayed. Filtering and sorting work as expected.                                                               |               |        |       |
| TC_ADM_006   | Admin | Patient Invite Management: Send an invite      | 1. Log in as Admin. <br> 2. Navigate to "Patient Invites" or similar. <br> 3. Enter patient's email and any other required details. <br> 4. Send invite.                                                                         | An invitation email is sent to the patient. The invite appears in a list of pending invites.                                                                                 |               |        |       |
| TC_ADM_007   | Admin | Patient Invite Management: View invite status  | 1. Log in as Admin. <br> 2. Go to "Patient Invites".                                                                                                                                                                            | List of sent invites is displayed with their status (e.g., pending, accepted, expired).                                                                                      |               |        |       |

---

### 4.5. Super Admin Role Scenarios

*Super Admin typically has all Admin functionalities plus system-level configurations. Tests here should focus on Super Admin specific features if any, otherwise, re-test critical Admin functions.*

| Test Case ID | Role        | Objective                                        | Steps                                                                                                                                                                                             | Expected Result                                                                                                                                                                 | Actual Result | Status | Notes |
|--------------|-------------|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------|-------|
| TC_SADM_001  | Super Admin | Verify access to all Admin functionalities       | 1. Log in as Super Admin. <br> 2. Navigate through various Admin sections (User Management, Appointment Management, etc.). <br> 3. Perform a simple action in each (e.g., view a list).           | Super Admin can access and perform actions in all areas accessible to a regular Admin.                                                                                          |               |        |       |
| TC_SADM_002  | Super Admin | System Configuration: View/Edit (if applicable)  | 1. Log in as Super Admin. <br> 2. Navigate to "System Settings" or "Configurations". <br> 3. View existing settings. <br> 4. (If safe) Modify a minor, non-critical setting and save. Revert if needed. | Super Admin can view system configurations. Editing (if performed) reflects correctly. (This is highly dependent on what system settings are exposed in the UI).             |               |        |       |
| TC_SADM_003  | Super Admin | Manage Admin Users: Create new Admin (if applicable) | 1. Log in as Super Admin. <br> 2. Navigate to a section for managing Admin users (if distinct from general user management). <br> 3. Attempt to create a new user with Admin role.                 | If Super Admins can create other Admins, this action should be successful. The new Admin should have appropriate permissions.                                                   |               |        |       |

---

### 4.6. Lab Tech Role Scenarios

| Test Case ID | Role     | Objective                                      | Steps                                                                                                                                                                                             | Expected Result                                                                                                                                  | Actual Result | Status | Notes |
|--------------|----------|------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------|-------|
| TC_LAB_001   | Lab Tech | View lab dashboard / assigned tests            | 1. Log in as Lab Tech.                                                                                                                                                                            | Dashboard shows relevant information, such as pending test orders or recent activity.                                                            |               |        |       |
| TC_LAB_002   | Lab Tech | View details of a specific test order          | 1. Log in as Lab Tech. <br> 2. From a list of test orders, select one.                                                                                                                            | Details of the test order are displayed (e.g., patient ID, clinician who ordered, test type, date ordered).                                      |               |        |       |
| TC_LAB_003   | Lab Tech | Input/Upload test results for an order         | 1. Log in as Lab Tech. <br> 2. Select a test order that requires results. <br> 3. Find an option to "Enter Results" or "Upload Report". <br> 4. Input data or upload a file. <br> 5. Save results. | Test results are successfully saved and associated with the correct patient and test order. Clinician/Patient may be notified (if implemented). |               |        |       |
| TC_LAB_004   | Lab Tech | Mark a test as completed/processed             | 1. Log in as Lab Tech. <br> 2. After entering results for a test, update its status to "Completed" or "Processed".                                                                                 | The status of the test order is updated in the system.                                                                                           |               |        |       |

---

This list is a starting point and should be expanded based on the specific features and complexity of your application. Remember to update "Actual Result" and "Status" for each test case as you perform the testing.
