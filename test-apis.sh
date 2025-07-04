#!/bin/bash

echo "🧪 Testing API Endpoints..."
echo "==============================="

BASE_URL="http://localhost:5000"

# Test Categories
echo "📂 Testing Categories:"
curl -s "$BASE_URL/api/categories" | jq length
echo ""

# Test All Courses
echo "📚 Testing All Courses:"
curl -s "$BASE_URL/api/courses" | jq length
echo ""

# Test Free Courses
echo "🆓 Testing Free Courses:"
curl -s "$BASE_URL/api/courses?free=true" | jq length
echo ""

# Test Featured Courses  
echo "⭐ Testing Featured Courses:"
curl -s "$BASE_URL/api/courses?featured=true" | jq length
echo ""

# Test Study Abroad Services
echo "✈️ Testing Study Abroad Services:"
curl -s "$BASE_URL/api/study-abroad-services" | jq length
echo ""

# Test Programming Courses
echo "💻 Testing Programming Courses:"
curl -s "$BASE_URL/api/courses?categoryId=1" | jq length
echo ""

# Test Digital Marketing Courses
echo "📱 Testing Digital Marketing Courses:"
curl -s "$BASE_URL/api/courses?categoryId=2" | jq length
echo ""

echo "==============================="
echo "✅ All tests completed!"
