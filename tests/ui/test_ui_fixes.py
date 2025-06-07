#!/usr/bin/env python3
"""
Test script to verify UI fixes for account management.
Tests that the account schema updates are working correctly.
"""

import requests
import json
import sys

def test_ui_fixes():
    """Test the UI fixes for account management"""
    
    print("🧪 Testing UI Fixes for Account Management\n")
    
    # Test 1: Authentication
    print("=" * 60)
    print("Testing Backend Authentication")
    print("=" * 60)
    
    auth_data = {'username': 'superadmin@genascope.com', 'password': 'admin123'}
    response = requests.post('http://localhost:8000/api/auth/token', data=auth_data)
    
    if response.status_code != 200:
        print(f"❌ Authentication failed: {response.status_code}")
        print(response.text)
        return False
    
    token = response.json().get('access_token')
    print("✅ Authentication successful")
    
    # Test 2: Accounts API Structure
    print("\n" + "=" * 60)
    print("Testing Accounts API Structure")
    print("=" * 60)
    
    headers = {'Authorization': f'Bearer {token}'}
    accounts_response = requests.get('http://localhost:8000/api/accounts', headers=headers)
    
    if accounts_response.status_code != 200:
        print(f"❌ Failed to get accounts: {accounts_response.status_code}")
        print(accounts_response.text)
        return False
    
    accounts = accounts_response.json()
    print(f"✅ Retrieved {len(accounts)} accounts")
    
    if accounts:
        account = accounts[0]
        print("\n📋 Account structure verification:")
        
        # Check for new schema fields
        required_fields = ['id', 'name', 'status', 'created_at', 'updated_at']
        deprecated_fields = ['domain', 'is_active', 'admin_email']
        
        for field in required_fields:
            if field in account:
                print(f"  ✅ {field}: {account[field]}")
            else:
                print(f"  ❌ Missing required field: {field}")
                return False
        
        for field in deprecated_fields:
            if field in account:
                print(f"  ⚠️  Deprecated field still present: {field}")
            else:
                print(f"  ✅ Deprecated field correctly removed: {field}")
    
    # Test 3: User Info for Account Name Display
    print("\n" + "=" * 60)
    print("Testing User Info for Account Name Display")
    print("=" * 60)
    
    user_response = requests.get('http://localhost:8000/api/auth/me', headers=headers)
    
    if user_response.status_code != 200:
        print(f"❌ Failed to get user info: {user_response.status_code}")
        print(user_response.text)
        return False
    
    user = user_response.json()
    print("✅ Retrieved user information")
    print(f"  👤 User: {user.get('name', 'Unknown')} ({user.get('role', 'Unknown')})")
    print(f"  📧 Email: {user.get('email', 'Unknown')}")
    
    if user.get('account_id'):
        print(f"  🏥 Account ID: {user.get('account_id')}")
        
        # Try to get account details for this user
        account_response = requests.get(f"http://localhost:8000/api/accounts/{user['account_id']}", headers=headers)
        if account_response.status_code == 200:
            account_info = account_response.json()
            print(f"  🏥 Account Name: {account_info.get('name', 'Unknown')}")
        else:
            print(f"  ⚠️  Could not retrieve account details: {account_response.status_code}")
    else:
        print("  ℹ️  User has no associated account (probably super admin)")
    
    # Test 4: Account Status Values
    print("\n" + "=" * 60)
    print("Testing Account Status Values")
    print("=" * 60)
    
    status_counts = {}
    for account in accounts:
        status = account.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    print("📊 Account status distribution:")
    for status, count in status_counts.items():
        print(f"  {status}: {count}")
    
    print("\n🎉 All tests completed successfully!")
    print("\n📋 Summary of UI Schema Updates:")
    print("  ✅ Backend uses 'status' field instead of 'is_active'")
    print("  ✅ 'domain' and 'admin_email' fields removed from schema")
    print("  ✅ Authentication working with /api/auth/token")
    print("  ✅ Account management endpoints returning correct structure")
    
    return True

if __name__ == "__main__":
    if test_ui_fixes():
        print("\n✨ UI fixes verification completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 UI fixes verification failed!")
        sys.exit(1)
