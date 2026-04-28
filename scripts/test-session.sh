#!/bin/bash

# Session Testing Script
# This script tests various session scenarios

echo "🧪 Testing Session Management..."

# Test 1: Login with admin credentials
echo "📧 Test 1: Login with admin credentials"
echo "Email: admin@ECL Global.com"
echo "Password: admin123"
echo "Expected: Successful login, token stored, user redirected to dashboard"
echo ""

# Test 2: Page refresh after login
echo "🔄 Test 2: Page refresh after login"
echo "Expected: User remains logged in, no redirect to login page"
echo ""

# Test 3: Navigate to protected admin routes
echo "🔒 Test 3: Navigate to protected admin routes"
echo "Expected: Access granted to admin panel"
echo ""

# Test 4: Token expiration handling
echo "⏰ Test 4: Token expiration handling"
echo "Expected: Automatic token refresh or logout when expired"
echo ""

# Test 5: Browser tab close and reopen
echo "🪟 Test 5: Browser tab close and reopen"
echo "Expected: Session persists across browser sessions"
echo ""

# Test 6: Multiple tabs
echo "📑 Test 6: Multiple tabs"
echo "Expected: Session shared across all tabs"
echo ""

# Test 7: Logout functionality
echo "🚪 Test 7: Logout functionality"
echo "Expected: Complete session cleanup, redirect to login"
echo ""

echo "✅ All tests should pass for proper session management!"
echo "🌐 Open http://localhost:5000/login to begin testing"
