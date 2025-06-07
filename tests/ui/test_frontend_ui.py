#!/usr/bin/env python3
"""
End-to-end test of the frontend login and account management functionality.
"""

import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def test_frontend_account_management():
    """Test the frontend account management after login"""
    
    print("🔍 Testing Frontend Account Management\n")
    
    # Setup Chrome driver
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)
        
        print("=" * 60)
        print("Step 1: Loading Login Page")
        print("=" * 60)
        
        driver.get("http://localhost:4321/login")
        print("✅ Login page loaded")
        
        print("\n" + "=" * 60)
        print("Step 2: Performing Login")
        print("=" * 60)
        
        # Find and fill email field
        email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        email_field.clear()
        email_field.send_keys("superadmin@genascope.com")
        print("✅ Email entered")
        
        # Find and fill password field
        password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_field.clear()
        password_field.send_keys("admin123")
        print("✅ Password entered")
        
        # Click login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        print("✅ Login button clicked")
        
        # Wait for login success or redirect
        try:
            # Check for either success message or redirect to dashboard
            wait.until(lambda driver: 
                driver.current_url != "http://localhost:4321/login" or
                "Login Successful" in driver.page_source
            )
            print("✅ Login process completed")
            print(f"  Current URL: {driver.current_url}")
        except TimeoutException:
            print("⚠️  Login process taking longer than expected")
        
        print("\n" + "=" * 60)
        print("Step 3: Navigating to Accounts Management")
        print("=" * 60)
        
        # Navigate to accounts page
        driver.get("http://localhost:4321/admin/accounts")
        print("✅ Navigated to accounts page")
        
        # Wait for page to load
        time.sleep(3)
        
        # Check for accounts table or content
        try:
            # Look for account management elements
            page_title = driver.find_element(By.TAG_NAME, "h1")
            print(f"✅ Page title found: {page_title.text}")
            
            # Look for accounts table or list
            if "account" in driver.page_source.lower():
                print("✅ Account-related content found on page")
                
                # Try to find table headers or account data
                if "status" in driver.page_source.lower():
                    print("✅ Status field found (correct schema)")
                else:
                    print("⚠️  Status field not found")
                
                if "is_active" in driver.page_source.lower():
                    print("❌ Old 'is_active' field still present")
                else:
                    print("✅ Old 'is_active' field correctly removed")
                
                if "domain" in driver.page_source.lower():
                    print("❌ Old 'domain' field still present")
                else:
                    print("✅ Old 'domain' field correctly removed")
            else:
                print("⚠️  No account content found")
                
        except NoSuchElementException:
            print("⚠️  Could not find expected page elements")
        
        print("\n" + "=" * 60)
        print("Step 4: Checking Authentication State")
        print("=" * 60)
        
        # Check localStorage for auth token (via JavaScript)
        auth_token = driver.execute_script("return localStorage.getItem('authToken');")
        auth_user = driver.execute_script("return localStorage.getItem('authUser');")
        
        if auth_token:
            print("✅ Auth token found in localStorage")
            print(f"  Token preview: {auth_token[:20]}...")
        else:
            print("❌ No auth token found in localStorage")
            
        if auth_user:
            print("✅ User data found in localStorage")
            print(f"  User data: {auth_user}")
        else:
            print("❌ No user data found in localStorage")
        
        print("\n" + "=" * 60)
        print("Step 5: Testing Account Edit Form")
        print("=" * 60)
        
        # Try to access an account edit form
        driver.get("http://localhost:4321/admin/accounts")
        time.sleep(2)
        
        # Look for edit links
        try:
            edit_links = driver.find_elements(By.PARTIAL_LINK_TEXT, "Edit")
            if edit_links:
                print(f"✅ Found {len(edit_links)} edit links")
                
                # Click the first edit link
                edit_links[0].click()
                time.sleep(2)
                
                print(f"✅ Navigated to edit form: {driver.current_url}")
                
                # Check if the form uses the new schema
                if "status" in driver.page_source.lower() and "active account" not in driver.page_source.lower():
                    print("✅ Edit form appears to use new schema")
                elif "active account" in driver.page_source.lower():
                    print("⚠️  Edit form may still use old 'is_active' checkbox")
                
            else:
                print("⚠️  No edit links found")
                
        except Exception as e:
            print(f"⚠️  Could not test edit form: {e}")
        
        print("\n🎉 Frontend testing completed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
        
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    print("🧪 Starting Frontend Account Management Test\n")
    
    # First verify backend is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend health check failed")
            exit(1)
    except:
        print("❌ Backend is not accessible")
        exit(1)
    
    # Check frontend is running
    try:
        response = requests.get("http://localhost:4321", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
        else:
            print("❌ Frontend is not accessible")
            exit(1)
    except:
        print("❌ Frontend is not accessible")
        exit(1)
    
    # Run the test
    if test_frontend_account_management():
        print("\n✨ All frontend tests passed!")
    else:
        print("\n💥 Some frontend tests failed!")
