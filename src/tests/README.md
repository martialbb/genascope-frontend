# Frontend Tests

This directory contains frontend-specific tests for the Genascope application.

## Directory Structure

### Unit Tests (`unit/`)
- `test-api-transformation.js` - Tests API data transformation functions
- `test-transformation.mjs` - Node.js compatible transformation service tests

### Integration Tests (`integration/`)
- `test-frontend-api.js` - Tests frontend API integration with backend services

### End-to-End Tests (`e2e/`)
- UI and workflow tests using Playwright

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run specific test file
node src/tests/unit/test-transformation.mjs
```

### Integration Tests  
```bash
# Run integration tests
npm run test:integration

# Test specific API integration
node src/tests/integration/test-frontend-api.js
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed
```

## Test Files Description

### `test-api-transformation.js`
Tests the transformation of backend API responses to frontend-compatible data structures. Focuses on:
- Patient invite data transformation
- Field mapping and validation
- Mock data processing

### `test-frontend-api.js`  
Integration test that verifies the frontend API service correctly communicates with the backend:
- Authentication token handling
- API endpoint calls
- Response data transformation
- Error handling

### `test-transformation.mjs`
Node.js module test for the API service transformation functions:
- Direct function testing
- Mock environment setup
- Service isolation testing
