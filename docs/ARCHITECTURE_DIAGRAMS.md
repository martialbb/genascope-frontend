# CancerGenix Architecture Diagrams

## System Architecture

```
┌─────────────────┐        ┌─────────────────┐         ┌─────────────────┐
│                 │        │                 │         │                 │
│  Web Browser    │◄─────►│  Frontend        │◄───────►│  Backend API    │
│  (User)         │        │  (Astro + React)│         │  (FastAPI)      │
│                 │        │                 │         │                 │
└─────────────────┘        └─────────────────┘         └────────┬────────┘
                                                               │
                                                               │
                                                      ┌────────▼────────┐
                                                      │                 │
                                                      │  Database       │
                                                      │  (PostgreSQL)   │
                                                      │                 │
                                                      └─────────────────┘
```

## Authentication Flow

```
┌─────────┐          ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│         │          │             │          │             │          │             │
│  User   │───1─────►│  Login Form │───2─────►│  Backend    │───3─────►│  Database   │
│         │          │             │          │             │          │             │
└─────────┘          └─────────────┘          └──────┬──────┘          └─────────────┘
                                                     │
                                                     │
                                                     4
                                                     │
                                                     │
                     ┌─────────────┐          ┌──────▼──────┐
                     │             │          │             │
                     │  Frontend   │◄───5─────┤  JWT Token  │
                     │             │          │             │
                     └─────────────┘          └─────────────┘

1. User submits login credentials
2. Frontend sends credentials to backend
3. Backend validates credentials against database
4. Backend generates JWT token
5. Token returned to frontend and stored for subsequent requests
```

## Patient Invite Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │       │             │
│  Provider   │──1───►│  Invite     │──2───►│  Backend    │──3───►│  Database   │
│             │       │  Form       │       │  API        │       │             │
└─────────────┘       └─────────────┘       └──────┬──────┘       └─────────────┘
                                                   │
                                                   │
                                                   4
                                                   │
                                                   ▼
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│             │       │             │       │              │
│  Patient    │◄──6───┤  Email      │◄──5───┤  Invite URL  │
│             │       │  Service    │       │              │
└─────────────┘       └─────────────┘       └──────────────┘
       │
       │
       7
       │
       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│  Risk       │──8───►│  Risk       │──9───►│  Eligibility │
│  Assessment │       │  Analysis   │       │  Result     │
└─────────────┘       └─────────────┘       └─────────────┘

1. Provider fills invitation form with patient details
2. Form data sent to backend API
3. Invitation data stored in database
4. Unique invite URL with token generated
5. Email service triggered with invite URL
6. Email sent to patient
7. Patient clicks link and completes risk assessment
8. Assessment data sent to risk analysis engine
9. Eligibility results generated and presented
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
