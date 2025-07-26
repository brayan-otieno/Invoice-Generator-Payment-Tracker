#!/bin/sh

# Check if required environment variables are set
if [ -z "$REACT_APP_API_URL" ]; then
  echo "Error: REACT_APP_API_URL is not set"
  exit 1
fi

# Check if the API is responding
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$REACT_APP_API_URL/health")

if [ "$API_RESPONSE" != "200" ]; then
  echo "Error: API is not responding correctly (Status: $API_RESPONSE)"
  exit 1
fi

# Check if the frontend is serving the index page
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")

if [ "$FRONTEND_RESPONSE" != "200" ]; then
  echo "Error: Frontend is not serving the application (Status: $FRONTEND_RESPONSE)"
  exit 1
fi

echo "Health check passed successfully"
exit 0
