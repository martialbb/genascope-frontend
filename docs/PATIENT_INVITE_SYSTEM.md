# Patient Invite System Documentation

## Overview

The Patient Invite System allows clinicians to send email invitations to patients for registering in the Cancer-Genix platform.
When a clinician creates an invite, the system:

1. Creates a new invite record in the database
2. Generates a unique invite token
3. Sends an email to the patient with a link to complete registration
4. Tracks the status of the invite (pending, accepted, expired, revoked)

## Configuration

The system requires proper configuration for both database storage and email functionality.

### Required Environment Variables

Make sure these are properly set in your `.env` file:

```
# Frontend URL (used for invite links)
FRONTEND_URL=http://localhost:4321

# Email Configuration
SMTP_SERVER=your-smtp-server
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@genascope.com
EMAIL_ENABLED=true
```

You can run the `scripts/update_env.sh` script to check for missing variables.

### Important Notes

1. **Email Delivery**: By default, email sending is disabled (`EMAIL_ENABLED=false`). Set to `true` to enable sending emails.
2. **Frontend URL**: The system uses `FRONTEND_URL` to generate invite links. Make sure it's set to your actual frontend URL.
3. **SMTP Configuration**: Valid SMTP credentials are required for email delivery.

## Testing the System

1. Login as a clinician or admin
2. Navigate to the Patient Management section
3. Generate a new invite by providing patient information
4. The system will create an invite and send an email (if enabled)
5. Check email for invitation link
6. Open the link to complete registration

### Local Testing Without Email Server

If you don't have an SMTP server for testing, the system will log email information to the console. Check the server logs to see the email content and invite URL.

## Troubleshooting

### Common Issues

1. **No emails are sent**: Check if `EMAIL_ENABLED` is set to `true` and SMTP credentials are correct.
2. **Wrong invite URL**: Verify that `FRONTEND_URL` is set correctly.
3. **Database errors**: Check if the `invites` table was created properly.

For more help, see the main [Troubleshooting Guide](/docs/TROUBLESHOOTING_GUIDE.md).
