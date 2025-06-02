# Genascope Architecture Diagrams (Updated June 2025)

## System Architecture Overview

```
┌─────────────────┐        ┌─────────────────┐         ┌─────────────────┐
│                 │        │                 │         │                 │
│  Web Browser    │◄─────►│  Frontend        │◄───────►│  Backend API    │
│  (Multi-role)   │        │  (Astro + React)│         │  (FastAPI)      │
│                 │        │  Port: 4321     │         │  Port: 8000     │
└─────────────────┘        └─────────────────┘         └────────┬────────┘
                                    │                           │
                                    │                           │
                                    │                  ┌────────▼────────┐
                                    │                  │                 │
                                    │                  │  MySQL Database │
                                    │                  │  Port: 3306     │
                                    │                  │                 │
                                    │                  └─────────────────┘
                                    │
                           ┌────────▼────────┐
                           │                 │
                           │  MailDev        │
                           │  (Email Test)   │
                           │  Port: 1080     │
                           └─────────────────┘
```

## Enhanced Authentication Flow

```
┌─────────┐          ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│         │          │             │          │             │          │             │
│  User   │───1─────►│  Login Form │───2─────►│  Backend    │───3─────►│  Database   │
│         │          │             │          │  /api/auth/ │          │  users      │
└─────────┘          └─────────────┘          │  token      │          │  table      │
    ▲                                         └──────┬──────┘          └─────────────┘
    │                                                │
    │                                                │
    │                                                4 (JWT + Role)
    8 (Role-based                                    │
    redirect)                                        │
    │                ┌─────────────┐          ┌──────▼──────┐
    │                │             │          │             │
    └────────────────┤  Frontend   │◄───5─────┤  JWT Token  │
                     │  + Role     │          │  + Role     │
                     │  Routing    │          │  Validation │
                     └──────┬──────┘          └─────────────┘
                            │
                            6 (Store token + user)
                            │
                            ▼
                     ┌─────────────┐
                     │             │
                     │ localStorage│
                     │ + Session   │
                     │ Management  │
                     └─────────────┘

1. User submits credentials (email/password)
2. Frontend sends POST to /api/auth/token
3. Backend validates against users table with role checking
4. JWT token generated with user ID, email, and role
5. Token returned with user profile data
6. Frontend stores token and user data in localStorage
7. Subsequent requests include Authorization: Bearer {token}
8. Frontend routes user to role-appropriate dashboard
```

## User Management & Administration Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │       │             │
│  Admin      │──1───►│  Edit User  │──2───►│  Backend    │──3───►│  Database   │
│  User       │       │  Form       │       │  /api/users │       │  Validation │
└─────────────┘       └─────────────┘       │  /{id}      │       └──────┬──────┘
                              ▲             └──────┬──────┘              │
                              │                    │                     │
                              │                    4 (Success/Error)     │
                              │                    │                     │
                              7 (Update UI)        │                     │
                              │                    ▼                     │
                              │             ┌─────────────┐              │
                              │             │             │              │
                              └─────────────┤  Response   │              │
                                            │  Handler    │              │
                                            └─────────────┘              │
                                                                         │
                                            ┌─────────────┐              │
                                            │             │              │
                                            │  Cascade    │◄─────────────┘
                                            │  Delete     │  5 (If delete)
                                            │  Logic      │
                                            └─────────────┘

Recent Fixes Applied:
- Account ID mismatch resolution (users.account_id = 'test-account-001')
- Foreign key constraint handling for user deletion
- Enhanced cascade deletion for patient_profiles
- Import path corrections for admin layouts
```

## Enhanced Patient Invite Flow (Fixed June 2025)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │       │             │
│  Clinician  │──1───►│  Invite     │──2───►│  Backend    │──3───►│  Database   │
│  /Admin     │       │  Form       │       │  /api/      │       │  invites    │
└─────────────┘       └─────────────┘       │  invites    │       │  patients   │
                                            └──────┬──────┘       └──────┬──────┘
                                                   │                     │
                                                   │                     │
                                                   4 (Generate URL)      │
                                                   │                     │
                                                   ▼                     │
┌─────────────┐       ┌─────────────┐       ┌──────────────┐            │
│             │       │             │       │              │            │
│  Patient    │◄──6───┤  Email      │◄──5───┤  Invite URL  │            │
│             │       │  Service    │       │  + Token     │            │
└─────────────┘       │  (MailDev)  │       └──────────────┘            │
       │              └─────────────┘                                   │
       │                                                                │
       │                                                                │
       7 (Click invite)                                                 │
       │                                                                │
       ▼                                                                │
┌─────────────┐       ┌─────────────┐       ┌─────────────┐            │
│             │       │             │       │             │            │
│  Risk       │──8───►│  Risk       │──9───►│  Eligibility │            │
│  Assessment │       │  Analysis   │       │  Result     │            │
│  Chat       │       │  Engine     │       │  + Actions  │            │
└─────────────┘       └─────────────┘       └─────────────┘            │
                                                                        │
                                            ┌─────────────┐             │
                                            │             │             │
                                            │  Null Check │◄────────────┘
                                            │  for        │  10 (Fixed)
                                            │  clinician_ │
                                            │  id         │
                                            └─────────────┘

Recent Fixes Applied:
1. Null clinician_id handling - prevents "User not found" errors
2. Provider name fallback - "No Provider Assigned" for null clinicians  
3. Schema validation fix - empty string instead of null for provider_id
4. Email service integration with MailDev for testing
5. API health monitoring shows ✅ Available status
```

## API Health Monitoring System

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│  Admin      │──1───►│  Frontend   │──2───►│  API Health │
│  Dashboard  │       │  Monitor    │       │  Check      │
└─────────────┘       └──────┬──────┘       └──────┬──────┘
       ▲                     │                     │
       │                     │                     │
       │                     3 (Every 30s)        │
       │                     │                     │
       │                     ▼                     │
       │              ┌─────────────┐              │
       │              │             │              │
       │              │  Status     │              4
       │              │  Display    │              │
       │              │  Component  │              │
       │              └─────────────┘              │
       │                     ▲                     │
       │                     │                     │
       7 (✅/❌ Status)       │                     ▼
       │                     │              ┌─────────────┐
       │                     │              │             │
       └─────────────────────┘              │  Endpoint   │
                             6 (Update UI)  │  Tests:     │
                                            │  - /invites │
                                            │  - /users   │
                                            │  - /auth    │
                                            │  - /patients│
                                            └──────┬──────┘
                                                   │
                                                   │
                                                   5 (Results)
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │             │
                                            │  Fallback   │
                                            │  to Mock    │
                                            │  Data       │
                                            └─────────────┘

Status Indicators:
- ✅ Available: All endpoints responding correctly
- ❌ Unavailable: API issues detected, using mock data
- 🔄 Checking: Health check in progress
```

## Risk Assessment Chat Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│  Patient    │──1───►│  Chat       │──2───►│  Backend    │
│             │       │  Interface  │       │  API        │
└─────────────┘       └─────────────┘       └──────┬──────┘
                           ▲                       │
                           │                       │
                           5                       3
                           │                       │
                           │                       ▼
                      ┌────┴────────┐       ┌──────────────┐
                      │             │       │              │
                      │  Next       │◄──4───┤  Decision    │
                      │  Question   │       │  Engine      │
                      │             │       │              │
                      └─────────────┘       └──────────────┘

1. Patient answers question in chat interface
2. Answer sent to backend API
3. Answer processed by decision engine
4. Next appropriate question determined based on current answer
5. New question displayed to patient
```

## Lab Test Ordering Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │       │             │
│  Provider   │──1───►│  Lab Order  │──2───►│  Backend    │──3───►│  Lab        │
│             │       │  Form       │       │  API        │       │  Integration│
└─────────────┘       └─────────────┘       └──────┬──────┘       └──────┬──────┘
                                                   │                     │
                                                   │                     │
                                                   4                     5
                                                   │                     │
                                                   ▼                     ▼
                      ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
                      │             │       │              │       │             │
                      │  Order      │◄──6───┤  Lab Test    │◄──7───┤  Lab        │
                      │  Status     │       │  Results     │       │  Processing │
                      │             │       │              │       │             │
                      └─────────────┘       └──────────────┘       └─────────────┘

1. Provider fills in lab test order form
2. Order information sent to backend API
3. Backend sends order to external lab system
4. Order confirmation stored in database
5. Lab processes the test
6. Results received and stored in system
7. Lab sends results back to application
```

## Account Management Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│  Admin      │──1───►│  Create     │──2───►│  Backend    │
│             │       │  Account    │       │  API        │
└─────────────┘       └─────────────┘       └──────┬──────┘
                                                   │
                                                   │
                                                   3
                                                   │
                                                   ▼
                      ┌─────────────┐       ┌──────────────┐
                      │             │       │              │
                      │  Account    │◄──4───┤  Email       │
                      │  Admin      │       │  Notification│
                      │             │       │              │
                      └──────┬──────┘       └──────────────┘
                             │
                             │
                             5
                             │
                             ▼
                      ┌─────────────┐       ┌─────────────┐
                      │             │       │             │
                      │  Create     │──6───►│  User       │
                      │  User       │       │  Account    │
                      │             │       │             │
                      └─────────────┘       └─────────────┘

1. Super admin creates a new organization account
2. Account details sent to backend API
3. Account created in database
4. Account admin receives notification
5. Account admin logs in and creates users
6. New user accounts created in the system
```

## Backend Layering and Database Sync

- The backend is structured in API, service, repository, and model layers.
- All models are registered and kept in sync with the database using Alembic migrations.
- The `appointments` and `recurring_availability` tables now include all fields required by the code and tests (see Database Schema doc).
- When adding new fields, always:
  1. Update the SQLAlchemy model.
  2. Create and apply an Alembic migration.
  3. Update tests and repositories as needed.

## Test and Coverage Workflow
- All backend API, service, and repository code is now covered by tests (pytest + pytest-cov).
- Run tests with Docker Compose: `docker compose -f docker-compose.dev.yml exec backend pytest --cov`
- If you encounter test failures due to schema mismatches, see the Troubleshooting Guide.

## Database Schema

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│ Account             │      │ User                │      │ Patient             │
├─────────────────────┤      ├─────────────────────┤      ├─────────────────────┤
│ id: UUID (PK)       │◄────►│ id: UUID (PK)       │◄────►│ id: UUID (PK)       │
│ name: String        │      │ email: String       │      │ first_name: String   │
│ status: Enum        │      │ role: Enum          │      │ last_name: String    │
│ created_at: DateTime│      │ account_id: UUID (FK)│      │ email: String       │
│ updated_at: DateTime│      │ created_at: DateTime │      │ provider_id: UUID(FK)│
└─────────────────────┘      └─────────────────────┘      └──────────┬──────────┘
                                                                     │
                                                                     │
        ┌─────────────────────┐      ┌─────────────────────┐        │
        │ ChatSession         │      │ ChatAnswer          │        │
        ├─────────────────────┤      ├─────────────────────┤        │
        │ id: UUID (PK)       │◄────►│ id: UUID (PK)       │        │
        │ patient_id: UUID(FK)│◄─────┤ session_id: UUID(FK)│        │
        │ status: Enum        │      │ question_id: Int    │        │
        │ created_at: DateTime│      │ answer: String      │        │
        └─────────────────────┘      │ created_at: DateTime│        │
                                     └─────────────────────┘        │
                                                                    │
                                                                    │
        ┌─────────────────────┐      ┌─────────────────────┐        │
        │ Invite              │      │ EligibilityResult   │        │
        ├─────────────────────┤      ├─────────────────────┤        │
        │ id: UUID (PK)       │      │ id: UUID (PK)       │        │
        │ patient_id: UUID(FK)│◄─────┤ patient_id: UUID(FK)│◄───────┘
        │ token: String       │      │ is_eligible: Bool   │
        │ status: Enum        │      │ factors: JSON       │
        │ expires_at: DateTime│      │ created_at: DateTime│
        └─────────────────────┘      └─────────────────────┘


        ┌─────────────────────┐      ┌─────────────────────┐
        │ LabOrder            │      │ LabResult           │
        ├─────────────────────┤      ├─────────────────────┤
        │ id: UUID (PK)       │◄────►│ id: UUID (PK)       │
        │ patient_id: UUID(FK)│      │ order_id: UUID(FK)  │
        │ provider_id: UUID(FK)│      │ status: Enum        │
        │ test_type: Enum     │      │ result_data: JSON   │
        │ status: Enum        │      │ received_at: DateTime│
        │ created_at: DateTime│      └─────────────────────┘
        └─────────────────────┘
```
