#!/bin/bash

# Network Policy Testing Script
# Usage: ./test-network-policy.sh <environment>

set -e

ENVIRONMENT=${1:-dev}
NAMESPACE=$ENVIRONMENT

echo "🔒 Testing network policy for $ENVIRONMENT environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to test connectivity
test_connectivity() {
    local from_namespace=$1
    local target_service=$2
    local expected_result=$3
    local test_name=$4
    
    echo "📡 Testing: $test_name"
    echo "   From: $from_namespace namespace"
    echo "   To: $target_service"
    echo "   Expected: $expected_result"
    
    # Create test pod
    local pod_name="test-conn-$(date +%s)"
    kubectl run $pod_name \
        --image=curlimages/curl:latest \
        --restart=Never \
        --namespace=$from_namespace \
        -- curl -m 5 -s -o /dev/null -w "%{http_code}" \
        http://$target_service > /dev/null 2>&1 &
    
    # Wait for pod to be ready and then get result
    sleep 3
    local result=$(kubectl logs $pod_name -n $from_namespace 2>/dev/null || echo "TIMEOUT")
    
    # Clean up
    kubectl delete pod $pod_name -n $from_namespace >/dev/null 2>&1 || true
    
    if [[ "$expected_result" == "ALLOW" && "$result" == "200" ]]; then
        echo "   ✅ PASS - Connection allowed as expected"
    elif [[ "$expected_result" == "DENY" && ("$result" == "TIMEOUT" || "$result" == "" || "$result" =~ "timeout") ]]; then
        echo "   ✅ PASS - Connection blocked as expected"
    else
        echo "   ❌ FAIL - Got '$result', expected $expected_result"
    fi
    echo ""
}

# Get the service name
SERVICE_NAME="genascope-frontend-$ENVIRONMENT.$NAMESPACE.svc.cluster.local"

echo "🎯 Target service: $SERVICE_NAME"
echo ""

# Test 1: Ingress namespace should be able to connect
echo "Test 1: Ingress Controller Access"
test_connectivity "ingress" "$SERVICE_NAME" "ALLOW" "Ingress to Frontend"

# Test 2: Same namespace should be able to connect
echo "Test 2: Same Namespace Access"
test_connectivity "$NAMESPACE" "$SERVICE_NAME" "ALLOW" "Same Namespace to Frontend"

# Test 3: Different namespace should be blocked (unless specifically allowed)
echo "Test 3: Cross-Namespace Access (should be blocked)"
if kubectl get namespace kube-system >/dev/null 2>&1; then
    test_connectivity "kube-system" "$SERVICE_NAME" "DENY" "Unauthorized Namespace to Frontend"
else
    echo "   ⚠️  SKIP - kube-system namespace not available"
fi

# Test 4: Check if monitoring access is configured (for staging/prod)
if [[ "$ENVIRONMENT" != "dev" ]]; then
    echo "Test 4: Monitoring Access"
    if kubectl get namespace monitoring >/dev/null 2>&1; then
        test_connectivity "monitoring" "$SERVICE_NAME" "ALLOW" "Monitoring to Frontend"
    else
        echo "   ⚠️  SKIP - monitoring namespace not available"
    fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Network Policy Status:"
kubectl get networkpolicy -n $NAMESPACE -o wide

echo ""
echo "📊 Pod Status:"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=genascope-frontend

echo ""
echo "🌐 Service Status:"
kubectl get service -n $NAMESPACE -l app.kubernetes.io/name=genascope-frontend

echo ""
echo "✅ Network policy test completed for $ENVIRONMENT environment"
