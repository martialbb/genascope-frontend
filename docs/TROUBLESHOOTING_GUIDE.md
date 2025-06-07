# Genascope Troubleshooting Guide

This guide addresses common issues that developers and users may encounter when working with the Genascope application.

## Table of Contents
1. [Frontend Issues](#frontend-issues)
2. [Backend Issues](#backend-issues)
3. [Authentication Problems](#authentication-problems)
4. [API Connection Issues](#api-connection-issues)
5. [Database Issues](#database-issues)
6. [Patient Invite System](#patient-invite-system)
7. [Lab Integration Issues](#lab-integration-issues)

## Frontend Issues

### Application Not Loading

**Symptom**: Blank page or browser error when accessing the application.

**Possible Causes & Solutions**:
1. **Environment Variables Missing**
   - Check that `.env` file exists with proper variables
   - Ensure `PUBLIC_API_URL` and `PUBLIC_BASE_URL` are correctly set

2. **JavaScript Errors**
   - Check browser console for errors
   - Look for missing dependencies in the console log

3. **Build Issues**
   - Try rebuilding with `npm run build`
   - Clear the `.astro` cache directory

### Components Not Rendering Correctly

**Symptom**: UI components appear broken or with unexpected styling.

**Possible Causes & Solutions**:
1. **CSS Issues**
   - Make sure Tailwind CSS is properly configured
   - Check for conflicting CSS rules

2. **React Component Errors**
   - Check for React rendering errors in console
   - Verify props are being passed correctly to components

### Slow Performance

**Symptom**: Application is sluggish or unresponsive.

**Possible Causes & Solutions**:
1. **Large Bundle Size**
   - Consider code-splitting for better performance
   - Use the Astro build analyzer to identify large packages

2. **API Slowness**
   - Check network tab for slow API responses
   - Implement loading states for better user experience

## Backend Issues

### API Not Responding

**Symptom**: API calls timeout or return 500 errors.

**Possible Causes & Solutions**:
1. **Backend Service Down**
   - Check if FastAPI service is running
   - Verify logs for Python exceptions

2. **Database Connectivity**
   - Ensure database connection strings are correct
   - Check database service is running

3. **Resource Limitations**
   - Check CPU/memory usage on backend server
   - Look for memory leaks or heavy processing

### Invalid JSON Responses

**Symptom**: Frontend receives invalid JSON or unexpected data structures.

**Possible Causes & Solutions**:
1. **Pydantic Model Changes**
   - Ensure frontend types match backend Pydantic models
   - Check for API version mismatch

2. **Serialization Issues**
   - Look for datetime or complex object serialization problems
   - Verify JSON encoders are handling all data types

## Authentication Problems

### Unable to Login

**Symptom**: Login form submits but authentication fails.

**Possible Causes & Solutions**:
1. **Invalid Credentials**
   - Verify email and password are correct
   - Check if user account is active

2. **JWT Issues**
   - Check JWT token expiration and validation
   - Ensure `SECRET_KEY` is consistent across environments

3. **CORS Configuration**
   - Verify CORS settings allow requests from frontend origin
   - Check for browser console errors related to CORS

### Token Expiration

**Symptom**: User is suddenly logged out or sees authentication errors.

**Possible Causes & Solutions**:
1. **Short JWT Lifespan**
   - Check token expiration time configuration
   - Implement token refresh mechanism

2. **Invalid Token Storage**
   - Ensure tokens are correctly stored in localStorage/sessionStorage
   - Verify token format is preserved during storage

## API Connection Issues

### CORS Errors

**Symptom**: Browser console shows Cross-Origin Resource Sharing errors.

**Possible Causes & Solutions**:
1. **Backend CORS Configuration**
   - Ensure `CORS_ORIGINS` includes frontend URL
   - Check preflight request handling in FastAPI

2. **Proxy Issues**
   - If using a development proxy, ensure it's correctly configured
   - Verify API URL does not have trailing slashes causing path issues

### Network Errors

**Symptom**: API calls fail with network errors.

**Possible Causes & Solutions**:
1. **API URL Misconfiguration**
   - Double-check the `PUBLIC_API_URL` environment variable
   - Ensure the backend service is accessible from the frontend

2. **SSL/TLS Issues**
   - Verify certificate validity for HTTPS connections
   - Check for mixed content warnings

## Database Issues

### Migration Problems

**Symptom**: Application fails with database schema errors.

**Possible Causes & Solutions**:
1. **Outdated Schema**
   - Run latest migrations: `alembic upgrade head`
   - Check migration version in database against expected version

2. **Inconsistent Data**
   - Look for constraint violations in database logs
   - Run data validation scripts to identify problematic records

### Connection Pool Exhaustion

**Symptom**: Database errors under load, connection timeouts.

**Possible Causes & Solutions**:
1. **Limited Connection Pool**
   - Increase database connection pool size
   - Check for leaked connections not being returned to pool

2. **Long-Running Transactions**
   - Look for transactions that aren't properly committed/rolled back
   - Optimize query performance to reduce transaction duration

## Database Schema Mismatches

**Symptom**: Alembic migration errors, missing columns, or model/DB mismatches.

**Possible Causes & Solutions**:
1. **Alembic Multiple Heads**
   - Run `alembic heads` to see all heads.
   - Create a merge migration if needed.
2. **Missing Columns**
   - Update the SQLAlchemy model and create a new Alembic migration.
   - If migration fails, manually add the column using SQL (see DATABASE_SCHEMA.md for structure).
3. **Manual Schema Sync**
   - If migrations are out of sync, manually update the DB and model, then mark the migration as applied.

## Test Failures Due to Model/DB Mismatch

**Symptom**: Tests fail with errors like `TypeError: ... is an invalid keyword argument` or `AttributeError: ... has no attribute ...`.

**Possible Causes & Solutions**:
1. **Model and DB Out of Sync**
   - Ensure all model fields exist in the DB (see DATABASE_SCHEMA.md).
   - Re-run migrations or manually add missing columns.
2. **Repository/Service/Model Mismatch**
   - Update all layers to use the same field names and types.
3. **Resetting the Database**
   - If all else fails, reset the DB and re-apply all migrations.

## Patient Invite System

### UUID Validation Errors in Invite Responses

**Symptom**: Pydantic validation errors stating "Input should be a valid string" when creating or listing invites.

**Cause**: Invite response schemas expect string values for `invite_id` but receive UUID objects from the database.

**Solution**:
1. Convert UUID objects to strings in invite API responses:
   ```python
   return PatientInviteResponse(
       invite_id=str(invite.id),  # Convert UUID to string
       # ... other fields
   )
   ```
2. Check all instances in `/backend/app/api/invites.py` where `PatientInviteResponse` is constructed
3. Ensure consistent string conversion for all UUID fields

### Email Validation Errors During Invite Creation

**Symptom**: HTTPException with "Invalid patient email" when creating invites.

**Cause**: Patient records with null, empty, or invalid email addresses.

**Solution**:
1. Add email validation in `InviteService.create_invite()`:
   ```python
   if not patient.email or patient.email in ["unknown@example.com", "test@example.com"]:
       raise HTTPException(
           status_code=400,
           detail="Patient email is required and must be valid for invite creation"
       )
   ```
2. Update patient records to have valid email addresses before creating invites
3. Filter out patients with invalid emails in invite creation scripts

### Role-Based Access Control Issues

**Symptom**: Users seeing invites from other accounts or unauthorized access errors.

**Cause**: Insufficient access control filtering in invite list endpoints.

**Solution**:
1. Implement proper role-based filtering:
   - Super admin: Access to all invites across accounts
   - Admin: Access to invites within their account only
   - Clinician: Access to only their own created invites
2. Add account filtering in invite repository methods
3. Verify user account association before granting access

### Test Data Conflicts

**Symptom**: "Patient already has a pending invite" errors during testing.

**Cause**: Previous test invites still marked as pending in the database.

**Solution**:
1. Expire old test invites before creating new ones:
   ```sql
   UPDATE invites SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW();
   ```
2. Use unique email addresses for test patients
3. Implement cleanup scripts for test environments

### Invite Links Not Working

**Symptom**: Patients cannot access the application via invite links.

**Possible Causes & Solutions**:
1. **Expired Tokens**
   - Check token expiration settings
   - Verify token validation logic

2. **Missing Patient Records**
   - Ensure patient data was properly saved when invite was created
   - Check database for the invite record

3. **URL Construction**
   - Verify frontend URL concatenation is correct
   - Check for URL encoding issues with special characters

### Email Delivery Issues

**Symptom**: Patients report not receiving invite emails.

**Possible Causes & Solutions**:
1. **Email Service Configuration**
   - Check email service credentials and configuration in `.env` file
   - Verify `EMAIL_ENABLED` is set to `true`
   - Confirm SMTP credentials (`SMTP_SERVER`, `SMTP_USERNAME`, `SMTP_PASSWORD`) are correct
   - Verify email sending logs for errors

2. **Spam Filtering**
   - Ensure emails are not being marked as spam
   - Add appropriate SPF and DKIM records
   
3. **Implementation Issues**
   - Check if email service is properly integrated in `create_invite` and `resend_invite` methods
   - Verify that invite objects have all required fields for email generation
   - Run the `update_env.sh` script to ensure all required variables are set

## Lab Integration Issues

### Test Orders Not Reaching Lab

**Symptom**: Lab orders submitted but not appearing in lab systems.

**Possible Causes & Solutions**:
1. **Integration Configuration**
   - Verify lab API credentials and endpoints
   - Check for changes in lab API contract

2. **Payload Format Issues**
   - Ensure test order format matches lab requirements
   - Look for missing required fields

### Results Not Appearing

**Symptom**: Lab tests completed but results not showing in application.

**Possible Causes & Solutions**:
1. **Webhook Configuration**
   - Verify lab callback URLs are correctly configured
   - Check webhook security settings

2. **Result Processing Errors**
   - Look for exceptions in result processing logic
   - Verify result data structure matches expected format
