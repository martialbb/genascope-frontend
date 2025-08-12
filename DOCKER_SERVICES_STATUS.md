# 🐳 Docker Services Status Report

## ✅ Successfully Running Services

The following services from `docker-compose.postgresql.dev.yml` are now running:

### 📊 **PostgreSQL Database**
- **Container**: `genascope-frontend-db-1`
- **Image**: `pgvector/pgvector:pg15`
- **Port**: `5432:5432`
- **Status**: ✅ Healthy - Accepting connections
- **Credentials**:
  - Database: `genascope`
  - Username: `genascope`
  - Password: `genascope`

### 📁 **MinIO (File Storage)**
- **Container**: `genascope-minio`
- **Image**: `minio/minio:latest`
- **Ports**: 
  - API: `9000:9000`
  - Console: `9001:9001`
- **Status**: ✅ Healthy
- **Credentials**:
  - Username: `minioadmin`
  - Password: `minioadmin123`
- **Access**: http://localhost:9001

### 📧 **MailDev (Email Testing)**
- **Container**: `genascope-frontend-maildev-1`
- **Image**: `maildev/maildev`
- **Ports**:
  - SMTP: `1025:1025`
  - Web UI: `8025:1080`
- **Status**: ✅ Healthy
- **Web Interface**: http://localhost:8025

## ⚠️ Issues Encountered

### 🔴 **Backend Container**
- **Issue**: "Too many open files" error (common Docker Desktop on macOS issue)
- **Status**: ❌ Stopped due to errors
- **Solution**: Run backend locally or increase Docker Desktop file descriptor limits

### 🔴 **Frontend Container**
- **Issue**: Dependent on backend, also stopped
- **Status**: ❌ Stopped
- **Solution**: You can run the frontend locally using `npm run dev`

## 🚀 Next Steps

### Option 1: Run Backend & Frontend Locally
```bash
# Terminal 1 - Backend
cd ../genascope-backend
# Ensure you have the .env.local file configured for localhost:5432
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend  
cd /Users/martial-m1/genascope-frontend
npm run dev
```

### Option 2: Fix Docker Issues
```bash
# Increase Docker Desktop resources in Docker Desktop settings:
# - Memory: 8GB+
# - Disk: 64GB+
# - File descriptor limit: Increase in Docker Desktop advanced settings

# Then restart containers:
docker-compose -f docker-compose.postgresql.dev.yml up backend frontend -d
```

### Option 3: Use Alternative Compose File
```bash
# Try the regular compose file if it exists
docker-compose -f docker-compose.yml up -d
```

## 🔗 Service URLs

- **PostgreSQL**: `localhost:5432`
- **MinIO Console**: http://localhost:9001
- **MailDev Web UI**: http://localhost:8025
- **Backend** (when running): http://localhost:8000
- **Frontend** (when running): http://localhost:4321

## 💾 Data Persistence

- **PostgreSQL Data**: Stored in Docker volume `genascope_postgres_data`
- **MinIO Data**: Stored in Docker volume (internal)

All supporting services are ready for development! 🎉
