#!/bin/bash

# Exit on error
set -e

echo "🧪 Running all tests..."

# Function to run tests with coverage
run_tests() {
  local dir=$1
  local name=$2
  
  echo "\n🔍 Testing $name..."
  cd "$dir"
  
  # Check if test script exists
  if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    echo "Running tests in $name..."
    npm test -- --coverage
  else
    echo "No tests found in $name, skipping..."
  fi
  
  cd ..
}

# Run backend tests
run_tests "server" "backend"

# Run frontend tests
run_tests "client" "frontend"

echo "\n✅ All tests completed successfully!"

# Show test coverage summary
if [ -f "server/coverage/lcov.info" ]; then
  echo "\n📊 Backend Test Coverage:"
  grep -E '^.+\|.+\|.+%' server/coverage/lcov-report/index.html | head -n 1 | sed 's/<[^>]*>//g; s/ //g'
fi

if [ -f "client/coverage/lcov.info" ]; then
  echo "📊 Frontend Test Coverage:"
  grep -E '^.+\|.+\|.+%' client/coverage/lcov-report/index.html | head -n 1 | sed 's/<[^>]*>//g; s/ //g'
fi

echo "\nTo view detailed coverage reports, open in your browser:"
echo "- Backend: file://$(pwd)/server/coverage/lcov-report/index.html"
echo "- Frontend: file://$(pwd)/client/coverage/lcov-report/index.html"
