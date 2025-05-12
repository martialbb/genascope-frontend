#!/bin/zsh

# Create new backend repository
echo "🔧 Setting up cancer-genix-backend repository"

# Ask for directory location
echo "Where would you like to create the backend repository? (default: ../cancer-genix-backend)"
read backend_dir
backend_dir=${backend_dir:-"../cancer-genix-backend"}

# Create directory
mkdir -p "$backend_dir"
cd "$backend_dir"

# Initialize git
echo "🔄 Initializing git repository"
git init

# Create basic directory structure
echo "📁 Creating directory structure"
mkdir -p app/{api,models,schemas,services,core,db,tests/{api,services}}
mkdir -p alembic

# Create main.py
echo "📄 Creating main FastAPI application file"
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CancerGenix API",
    description="Backend API for CancerGenix chat application",
    version="0.1.0",
)

# Configure CORS - update with your frontend URL when deployed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4321"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
EOF

# Create README.md
echo "📝 Creating README.md"
cat > README.md << 'EOF'
# CancerGenix Backend

This is the backend repository for the CancerGenix application, built with FastAPI and Python.

## 🔄 Related Repositories

This project is part of a multi-repository architecture:
- Backend (this repo): API server for the CancerGenix application
- Frontend: [cancer-genix-frontend](https://github.com/martialbb/cancer-genix-frontend) - Astro/React UI

## 🚀 Project Setup

```sh
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
.\venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                 | Action                                           |
| :---------------------- | :----------------------------------------------- |
| `uvicorn app.main:app --reload` | Start development server at `localhost:8000` |
| `pytest`                | Run tests                                        |
| `alembic upgrade head`  | Run database migrations                          |

## 🔌 Frontend Connection

This backend is designed to work with the [cancer-genix-frontend](https://github.com/martialbb/cancer-genix-frontend) repository.

Make sure to configure CORS in `app/main.py` to allow requests from your frontend application.
EOF

# Create requirements.txt
echo "📋 Creating requirements.txt"
cat > requirements.txt << 'EOF'
fastapi>=0.103.1
uvicorn>=0.23.2
sqlalchemy>=2.0.20
alembic>=1.12.0
pydantic>=2.3.0
pydantic-settings>=2.0.3
python-jose[cryptography]>=3.3.0
passlib>=1.7.4
python-multipart>=0.0.6
pymysql>=1.1.0
pytest>=7.4.2
httpx>=0.25.0
python-dotenv>=1.0.0
joblib>=1.3.2
pandas>=2.1.0
numpy>=1.26.0
EOF

# Create .env.example
echo "🔒 Creating .env.example"
cat > .env.example << 'EOF'
# Database Configuration
DATABASE_URI=mysql+pymysql://user:password@localhost/cancergenix
# For SQLite during development:
# DATABASE_URI=sqlite:///./app.db

# Security
SECRET_KEY=generate_a_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# CORS Settings
CORS_ORIGINS=["http://localhost:3000","http://localhost:4321"]

# Lab Integration
LAB_API_KEY=your_lab_api_key
LAB_API_URL=https://lab-api-url.com
EOF

# Create .gitignore
echo "🙈 Creating .gitignore"
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
ENV/

# Environment Variables
.env

# Database
*.db
*.sqlite3

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
EOF

# Create Dockerfile
echo "🐳 Creating Dockerfile"
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Create docker-compose.yml
echo "🐙 Creating docker-compose.yml"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - DATABASE_URI=mysql+pymysql://user:password@db/cancergenix
    depends_on:
      - db
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: mysql:8.0
    ports:
      - "3307:3306"
    environment:
      - MYSQL_DATABASE=cancergenix
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
      - MYSQL_ROOT_PASSWORD=rootpassword
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
EOF

echo "✨ Backend repository structure created successfully!"
echo "Next steps:"
echo "1. cd $backend_dir"
echo "2. Create a virtual environment: python -m venv venv"
echo "3. Activate the environment: source venv/bin/activate"
echo "4. Install dependencies: pip install -r requirements.txt"
echo "5. Start the development server: uvicorn app.main:app --reload"
echo "6. Create a GitHub repository and push your code"
echo ""
echo "GitHub commands:"
echo "git add ."
echo "git commit -m 'Initial backend setup'"
echo "git remote add origin https://github.com/martialbb/cancer-genix-backend.git"
echo "git branch -M main"
echo "git push -u origin main"
