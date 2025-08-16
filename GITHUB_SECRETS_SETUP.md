# 🔐 GitHub Environment Configuration Guide

This guide walks you through setting up the required environment variables and secrets for your GitHub environments.

## 📋 Required Configuration per Environment

| Environment | Type | Name | Purpose | Example Value |
|-------------|------|------|---------|---------------|
| **dev** | Secret | `FLY_API_TOKEN` | Fly.io deployment token | `fo1_xxxxx...` |
| **dev** | Variable | `BACKEND_URL` | Development backend URL | `https://genascope-backend.fly.dev/` |
| **staging** | Secret | `FLY_API_TOKEN` | Fly.io deployment token | `fo1_xxxxx...` |
| **staging** | Variable | `BACKEND_URL` | Staging backend URL | `https://genascope-backend-staging.fly.dev` |
| **prod** | Secret | `FLY_API_TOKEN` | Fly.io deployment token | `fo1_xxxxx...` |
| **prod** | Variable | `BACKEND_URL` | Production backend URL | `https://genascope-backend-prod.fly.dev` |

## 🚀 Step-by-Step Setup

### 1. Get Your Fly.io API Token

```bash
# Login to Fly.io
flyctl auth login

# Create a deploy token (recommended for CI/CD)
flyctl tokens create deploy

# Or get your existing token
flyctl auth token
```

### 2. Setup GitHub Environments

1. **Navigate to your repository** on GitHub
2. **Go to Settings** → **Environments**
3. **Create or edit each environment**:

#### Development Environment (`dev`)
1. Click **"New environment"** or select existing `dev`
2. **Add Environment Secret**:
   - Name: `FLY_API_TOKEN`
   - Value: Your Fly.io deploy token
3. **Add Environment Variable**:
   - Name: `BACKEND_URL` 
   - Value: `https://genascope-backend.fly.dev/`

#### Staging Environment (`staging`)
1. Click **"New environment"** or select existing `staging`
2. **Add Environment Secret**:
   - Name: `FLY_API_TOKEN`
   - Value: Your Fly.io deploy token
3. **Add Environment Variable**:
   - Name: `BACKEND_URL`
   - Value: `https://genascope-backend-staging.fly.dev`

#### Production Environment (`prod`)
1. Click **"New environment"** or select existing `prod`
2. **Add Environment Secret**:
   - Name: `FLY_API_TOKEN`
   - Value: Your Fly.io deploy token
3. **Add Environment Variable**:
   - Name: `BACKEND_URL`
   - Value: `https://genascope-backend-prod.fly.dev`

### 3. Understanding Environment Variables vs Secrets

**Environment Variables** (`vars.BACKEND_URL`):
- ✅ **Visible in logs** - Good for debugging
- ✅ **Non-sensitive data** - URLs, feature flags, etc.
- ✅ **Easier to manage** - Can be viewed and edited easily

**Environment Secrets** (`secrets.FLY_API_TOKEN`):
- 🔒 **Encrypted storage** - Secure for API tokens
- 🔒 **Hidden in logs** - Sensitive data protection
- 🔒 **Access controlled** - Only available during workflow execution

### 4. Verify Setup

You can verify your configuration is working by:

1. **Creating a test PR** → Should trigger dev deployment
2. **Checking GitHub Actions logs** for variable/secret availability
3. **Testing manual deployment**:
   ```bash
   # Test with custom backend URL
   PUBLIC_API_URL=https://your-backend.fly.dev npm run deploy:dev
   ```

## 🔒 Security Best Practices

- ✅ **Use environment variables** for non-sensitive configuration (URLs, feature flags)
- ✅ **Use environment secrets** for sensitive data (API tokens, passwords)
- ✅ **Use deploy tokens** instead of personal tokens for CI/CD
- ✅ **Rotate tokens regularly**
- ✅ **Use different Fly.io accounts** for different environments if needed
- ✅ **Monitor token usage** in Fly.io dashboard

## 🛠️ Troubleshooting

### Secret Not Found
```
Error: No access token available. Please login with 'flyctl auth login'
```
**Solution**: Check that `FLY_API_TOKEN` is set in the correct environment

### Wrong Backend URL
```
Network Error: Cannot connect to backend
```
**Solution**: Verify `BACKEND_URL` secret matches your actual backend deployment

### Token Permissions
```
Error: This token does not have the required permissions
```
**Solution**: Use a deploy token with proper permissions:
```bash
flyctl tokens create deploy --expiry 8760h  # 1 year expiry
```

## 📝 Environment URLs Reference

Update these URLs to match your actual backend deployments:

```bash
# Development
BACKEND_URL=https://genascope-backend.fly.dev/

# Staging  
BACKEND_URL=https://genascope-backend-staging.fly.dev

# Production
BACKEND_URL=https://genascope-backend-prod.fly.dev
```

## ✅ Verification Checklist

- [ ] Created `dev`, `staging`, and `prod` environments in GitHub
- [ ] Added `FLY_API_TOKEN` secret to each environment
- [ ] Added `BACKEND_URL` secret to each environment
- [ ] Verified backend URLs are accessible
- [ ] Tested deployment with a sample PR
- [ ] Confirmed GitHub Actions logs show successful secret access

Once all secrets are configured, your deployments will automatically use the environment-specific backend URLs!
