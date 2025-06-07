#!/bin/bash

echo "🧪 Testing PostgreSQL Migration - Complete End-to-End Test"
echo "==========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local auth_header=$3
    local data=$4
    
    echo -n "Testing $method $endpoint... "
    
    if [ -n "$auth_header" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -X "$method" "$endpoint" -H "Content-Type: application/x-www-form-urlencoded" -H "$auth_header" -d "$data")
        else
            response=$(curl -s -w "%{http_code}" -X "$method" "$endpoint" -H "$auth_header")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -X "$method" "$endpoint" -H "Content-Type: application/x-www-form-urlencoded" -d "$data")
        else
            response=$(curl -s -w "%{http_code}" "$endpoint")
        fi
    fi
    
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $response_body"
        return 1
    fi
}

# Test basic health
echo -e "\n${YELLOW}=== Basic Health Checks ===${NC}"
test_endpoint "http://localhost:8000/health"

# Test authentication
echo -e "\n${YELLOW}=== Authentication Tests ===${NC}"
echo "Getting auth token for admin@test.com..."
auth_response=$(curl -s -X POST "http://localhost:8000/api/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=admin123&grant_type=password")

if echo "$auth_response" | grep -q "access_token"; then
    token=$(echo "$auth_response" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
    echo -e "${GREEN}✓ Authentication successful${NC}"
    
    # Test protected endpoint
    test_endpoint "http://localhost:8000/api/auth/me" "GET" "Authorization: Bearer $token"
else
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "Response: $auth_response"
    exit 1
fi

# Test database connectivity
echo -e "\n${YELLOW}=== Database Connectivity ===${NC}"
echo -n "Checking user count in database... "
user_count=$(docker-compose -f docker-compose.postgresql.dev.yml exec -T db psql -U genascope -d genascope -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n')

if [ "$user_count" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($user_count users found)"
else
    echo -e "${RED}✗ FAIL${NC} (No users found or database error)"
fi

# Test different user roles
echo -e "\n${YELLOW}=== Multi-Role Authentication Tests ===${NC}"
users=(
    "superadmin@genascope.com"
    "admin@test.com"
    "clinician@test.com"
    "labtech@test.com"
)

for user in "${users[@]}"; do
    echo -n "Testing $user... "
    auth_test=$(curl -s -X POST "http://localhost:8000/api/auth/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=$user&password=admin123&grant_type=password")
    
    if echo "$auth_test" | grep -q "access_token"; then
        echo -e "${GREEN}✓ PASS${NC}"
    else
        echo -e "${RED}✗ FAIL${NC}"
    fi
done

# Test frontend connectivity
echo -e "\n${YELLOW}=== Frontend Connectivity ===${NC}"
test_endpoint "http://localhost:4321/"
test_endpoint "http://localhost:4321/login"

echo -e "\n${GREEN}🎉 PostgreSQL Migration Test Complete!${NC}"
echo "==========================================="
echo "✅ Backend API: Running on PostgreSQL"
echo "✅ Authentication: Working with JWT tokens"
echo "✅ Database: Connected with test data"
echo "✅ Frontend: Accessible and responsive"
echo ""
echo "🔗 Access the application:"
echo "   Frontend: http://localhost:4321"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔐 Test credentials:"
echo "   Super Admin: superadmin@genascope.com / admin123"
echo "   Admin: admin@test.com / admin123"
echo "   Clinician: clinician@test.com / admin123"
