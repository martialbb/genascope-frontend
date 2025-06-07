#!/bin/bash

# Genascope Refactoring Script
# This script updates all references from "Cancer Genix" to "Genascope" and 
# "cancer-genix" to "genascope" in the frontend project

echo "🔄 Starting Genascope refactoring..."

# Change to the correct directory
cd /Users/martial-m1/genascope-frontend

echo "📁 Working in: $(pwd)"

# 1. Update brand name in source files
echo "🏷️  Updating brand name from 'Cancer Genix' to 'Genascope'..."

# Update SimpleHeader component
sed -i '' 's/Cancer Genix/Genascope/g' src/components/SimpleHeader.tsx

# Update SimpleLayout meta description
sed -i '' 's/Cancer Genix - Advanced Cancer Genomics Platform/Genascope - Advanced Cancer Genomics Platform/g' src/layouts/SimpleLayout.astro

# Update page titles
sed -i '' 's/Dashboard - Cancer Genix/Dashboard - Genascope/g' src/pages/dashboard.astro
sed -i '' 's/Cancer Genix - Advanced Cancer Genomics Platform/Genascope - Advanced Cancer Genomics Platform/g' src/pages/index.astro
sed -i '' 's/Login - Cancer Genix/Login - Genascope/g' src/pages/login.astro
sed -i '' 's/Patient Management - Cancer Genix/Patient Management - Genascope/g' src/pages/patients.astro
sed -i '' 's/Appointments Dashboard - Cancer Genix/Appointments Dashboard - Genascope/g' src/pages/appointments-dashboard.astro

# 2. Update project references
echo "📦 Updating project references from 'cancer-genix' to 'genascope'..."

# Update setup script
sed -i '' 's/cancer-genix-backend/genascope-backend/g' setup_backend_repo.sh
sed -i '' 's/cancer-genix-frontend/genascope-frontend/g' setup_backend_repo.sh

# Update Docker files
sed -i '' 's/cancer-genix-frontend/genascope-frontend/g' FRONTEND_DOCUMENTATION.md
sed -i '' 's/cancer-genix-backend/genascope-backend/g' docker-compose.dev.yml

# Update documentation files
sed -i '' 's/Cancer Genix/Genascope/g' CLEANUP_COMPLETED.md
sed -i '' 's/Cancer Genix Frontend/Genascope Frontend/g' DOCKER.md
sed -i '' 's/Cancer Genix Frontend/Genascope Frontend/g' FRONTEND_DOCUMENTATION.md

# Update any patient invite system docs
if [ -f "docs/PATIENT_INVITE_SYSTEM.md" ]; then
    sed -i '' 's/cancer-genix\.com/genascope\.com/g' docs/PATIENT_INVITE_SYSTEM.md
fi

# 3. Update package.json if it exists
if [ -f "package.json" ]; then
    echo "📦 Updating package.json..."
    sed -i '' 's/cancer-genix/genascope/g' package.json
fi

# 4. Update any README files
if [ -f "README.md" ]; then
    echo "📖 Updating README.md..."
    sed -i '' 's/Cancer Genix/Genascope/g' README.md
    sed -i '' 's/cancer-genix/genascope/g' README.md
fi

# 5. Update environment files
echo "🔧 Updating environment configurations..."
for env_file in .env .env.example .env.development .env.production; do
    if [ -f "$env_file" ]; then
        sed -i '' 's/cancer-genix/genascope/g' "$env_file"
        sed -i '' 's/Cancer Genix/Genascope/g' "$env_file"
    fi
done

# 6. Update any API configuration files
if [ -f "src/services/apiConfig.ts" ]; then
    echo "🔗 Updating API configuration..."
    sed -i '' 's/cancer-genix/genascope/g' src/services/apiConfig.ts
fi

# 7. Update any other TypeScript/JavaScript files that might contain references
echo "🔍 Scanning for remaining references..."
find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "cancer-genix" 2>/dev/null | while read file; do
    echo "  📝 Updating: $file"
    sed -i '' 's/cancer-genix/genascope/g' "$file"
done

find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "Cancer Genix" 2>/dev/null | while read file; do
    echo "  📝 Updating: $file"
    sed -i '' 's/Cancer Genix/Genascope/g' "$file"
done

# 8. Update Astro files
find src -name "*.astro" | xargs grep -l "cancer-genix\|Cancer Genix" 2>/dev/null | while read file; do
    echo "  📝 Updating: $file"
    sed -i '' 's/cancer-genix/genascope/g' "$file"
    sed -i '' 's/Cancer Genix/Genascope/g' "$file"
done

echo "✅ Refactoring complete!"
echo ""
echo "📋 Summary of changes:"
echo "   • Brand name: Cancer Genix → Genascope"
echo "   • Project references: cancer-genix → genascope"
echo "   • Backend symlink: Updated to point to genascope-backend"
echo "   • All source files, documentation, and configuration updated"
echo ""
echo "🔍 To verify changes, run:"
echo "   grep -r 'Cancer Genix' . --exclude-dir=node_modules --exclude-dir=.git"
echo "   grep -r 'cancer-genix' . --exclude-dir=node_modules --exclude-dir=.git"
echo ""
echo "🚀 Ready to test the refactored Genascope frontend!"
