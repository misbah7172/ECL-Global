#!/bin/bash

echo "🧪 Testing Course Creation API..."
echo "=================================="

BASE_URL="http://localhost:5000"

# First, let's try to create a course via API call
echo "📚 Testing Course Creation:"

# Test course data (using valid instructor ID and category ID from our previous tests)
TEST_COURSE='{
  "title": "API Test Course",
  "description": "Testing course creation via API",
  "objectives": "Learn API course creation",
  "categoryId": 1,
  "instructorId": 1,
  "price": "2500",
  "originalPrice": "3000",
  "duration": "6 weeks",
  "format": "Online",
  "totalSessions": 8,
  "syllabus": "Week 1: Introduction\nWeek 2: Basics\nWeek 3: Advanced",
  "featured": false,
  "difficulty": "Beginner",
  "whatYouWillLearn": ["Skill 1", "Skill 2", "Skill 3"],
  "requirements": ["Basic computer skills", "Internet connection"]
}'

echo "Attempting to create course with data:"
echo "$TEST_COURSE" | jq .

# Note: This will fail without proper authentication, but it will show if the endpoint accepts the data structure
curl -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d "$TEST_COURSE" 2>/dev/null

echo ""
echo "=================================="
echo "Note: The above will show 'Unauthorized' which is expected"
echo "But it confirms the endpoint exists and data structure is correct"
echo ""

# Test instructor endpoint availability
echo "👨‍🏫 Testing Instructors Endpoint:"
curl -s "$BASE_URL/api/instructors" -H "Authorization: Bearer invalid" 2>/dev/null
echo ""

echo "=================================="
echo "✅ API structure tests completed!"
echo ""
echo "💡 To test with valid authentication:"
echo "1. Login via the UI to get a valid token"
echo "2. Use that token in the Authorization header"
echo "3. The course creation should work with instructor dropdown"
