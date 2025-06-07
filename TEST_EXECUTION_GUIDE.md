# Test Execution Guide

This guide provides comprehensive instructions for running all tests in the Genascope project, organized by category and purpose.

## 📁 Test Directory Structure

```
backend/app/tests/
├── integration/
│   ├── api/                    # API endpoint tests
│   ├── invite_system/          # Invite system integration tests
│   ├── repositories/           # Repository integration tests
│   ├── security/               # Security and access control tests
│   └── services/               # Service layer integration tests
├── unit/
│   ├── api/                    # Unit tests for API endpoints
│   ├── repositories/           # Repository unit tests
│   └── services/               # Service layer unit tests
├── e2e/                        # End-to-end tests
├── scripts/                    # Test utility scripts
└── fixtures/                   # Test data and fixtures

tests/ui/                       # Frontend UI tests
```

## 🧪 Running Tests by Category

### 1. Unit Tests

Run all unit tests:
```bash
cd backend
python -m pytest app/tests/unit/ -v
```

Run specific unit test categories:
```bash
# Service layer tests
python -m pytest app/tests/unit/services/ -v

# Repository tests
python -m pytest app/tests/unit/repositories/ -v

# API unit tests
python -m pytest app/tests/unit/api/ -v
```

### 2. Integration Tests

Run all integration tests:
```bash
cd backend
python -m pytest app/tests/integration/ -v
```

Run specific integration test categories:
```bash
# API integration tests
python -m pytest app/tests/integration/api/ -v

# Invite system tests
python -m pytest app/tests/integration/invite_system/ -v

# Security tests
python -m pytest app/tests/integration/security/ -v

# Service integration tests
python -m pytest app/tests/integration/services/ -v

# Repository integration tests
python -m pytest app/tests/integration/repositories/ -v
```

### 3. End-to-End Tests

```bash
cd backend
python -m pytest app/tests/e2e/ -v
```

### 4. Frontend UI Tests

```bash
# Run Playwright tests
npm run test:ui

# Or directly with Playwright
npx playwright test tests/ui/
```

## 🔐 Invite System Testing

### Security Testing
```bash
# Run invite security tests
python -m pytest backend/app/tests/integration/invite_system/test_invite_security.py -v

# Or run the comprehensive security script
cd backend
python app/tests/scripts/verify_invite_security.py
```

### Invite Creation Testing
```bash
# Run invite creation tests
python -m pytest backend/app/tests/integration/invite_system/test_new_patient_invite.py -v

# Or use the creation script
cd backend
python app/tests/scripts/create_test_invites.py
```

## 🛠️ Test Setup and Utilities

### 1. Check Test Users
```bash
cd backend
python app/tests/scripts/check_test_users.py
```

### 2. Create Test Data
```bash
cd backend
# Create test invites
python app/tests/scripts/create_test_invites_clean.py

# Debug specific issues
python app/tests/scripts/debug_invite_test.py
python app/tests/scripts/debug_clinician_error.py
```

### 3. Password Testing
```bash
cd backend
python app/tests/scripts/test_password.py
python app/tests/scripts/generate_hash.py
```

## 📊 Running Comprehensive Test Suites

### All Backend Tests
```bash
cd backend
python -m pytest app/tests/ -v --tb=short
```

### All Backend Tests with Coverage
```bash
cd backend
python -m pytest app/tests/ --cov=app --cov-report=html --cov-report=term -v
```

### Specific Test Files
```bash
cd backend
# Run a specific test file
python -m pytest app/tests/integration/invite_system/test_invite_security.py::InviteSecurityTester::test_invites_list_access -v

# Run tests matching a pattern
python -m pytest app/tests/ -k "invite" -v

# Run tests by marker (if defined)
python -m pytest app/tests/ -m "security" -v
```

## 🔍 Test Configuration

### Environment Setup
Ensure your test environment is properly configured:

```bash
# Backend environment
cd backend
cp .env.example .env  # Configure with test database
source .venv/bin/activate
pip install -r requirements.txt

# Frontend environment
npm install
```

### Database Setup for Testing
```bash
# Use a separate test database
export DATABASE_URL="postgresql://user:password@localhost/genascope_test"

# Run migrations
cd backend
alembic upgrade head
```

## 🚦 Test Execution Best Practices

### 1. Pre-Test Checklist
- [ ] Backend server is running (for integration tests)
- [ ] Database is accessible and migrations are up to date
- [ ] Test users exist in the database
- [ ] Environment variables are properly configured

### 2. Test Data Management
- Use the scripts in `backend/app/tests/scripts/` to create test data
- Clean up test data between test runs when necessary
- Expire old invites before creating new test invites

### 3. Debugging Failed Tests
```bash
# Run with detailed output
python -m pytest app/tests/path/to/test.py -v -s

# Run with pdb on failure
python -m pytest app/tests/path/to/test.py --pdb

# Run only failed tests from last run
python -m pytest app/tests/ --lf
```

## 📝 Test Report Generation

### Coverage Reports
```bash
cd backend
python -m pytest app/tests/ --cov=app --cov-report=html
# Open htmlcov/index.html in browser

# Terminal coverage report
python -m pytest app/tests/ --cov=app --cov-report=term-missing
```

### JUnit XML Reports
```bash
cd backend
python -m pytest app/tests/ --junitxml=test-results.xml
```

## 🔧 Common Issues and Solutions

### 1. Database Connection Issues
- Ensure PostgreSQL is running and accessible
- Check DATABASE_URL in .env file
- Verify test database exists and migrations are applied

### 2. Authentication Errors in Tests
- Run `python app/tests/scripts/check_test_users.py` to verify test users exist
- Check if test user passwords are correct
- Ensure JWT_SECRET_KEY is set in environment

### 3. Invite Test Failures
- Expire old pending invites: `UPDATE invites SET status = 'expired' WHERE status = 'pending';`
- Ensure patients have valid email addresses
- Check role-based access control is working correctly

### 4. Frontend Test Issues
- Ensure Playwright browsers are installed: `npx playwright install`
- Check if frontend server is running for E2E tests
- Verify test selectors match current UI components

## 📚 Additional Resources

- **API Documentation**: `/openapi.json` - OpenAPI schema for all endpoints
- **Database Schema**: `/docs/DATABASE_SCHEMA.md` - Complete database documentation
- **Security Guide**: `/backend/app/tests/integration/security/README.md` - Security testing details
- **Troubleshooting**: `/docs/TROUBLESHOOTING_GUIDE.md` - Common issues and solutions
