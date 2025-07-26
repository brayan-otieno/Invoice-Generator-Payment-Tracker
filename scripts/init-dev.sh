#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Invoice Generator & Payment Tracker development environment..."

# Check for required tools
for cmd in node npm git docker docker-compose; do
  if ! command -v $cmd &> /dev/null; then
    echo "❌ Error: $cmd is required but not installed."
    exit 1
  fi
done

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
  echo "❌ Error: Node.js 16 or higher is required. Current version: $(node -v)"
  exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Set up backend
cd server
echo "🔧 Setting up backend..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📄 Creating .env file for backend..."
  cp .env.example .env
  echo "ℹ️ Please update the .env file with your configuration."
fi

# Set up frontend
cd ../client
echo "🖥️  Setting up frontend..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📄 Creating .env file for frontend..."
  cp .env.example .env
  echo "ℹ️ Please update the .env file with your configuration."
fi

# Generate SSL certificates if they don't exist
cd ..
if [ ! -f "nginx/ssl/localhost.crt" ] || [ ! -f "nginx/ssl/localhost.key" ]; then
  echo "🔐 Generating SSL certificates..."
  mkdir -p nginx/ssl
  ./scripts/generate-ssl.sh
  echo "ℹ️ SSL certificates generated. You may need to trust the certificate in your OS."
fi

# Build Docker containers
echo "🐳 Building Docker containers..."
docker-compose build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application in development mode, run:"
echo "  npm run dev"
echo ""
echo "Or start with Docker:"
echo "  docker-compose up"
echo ""
echo "The application will be available at:"
echo "  - Frontend: https://localhost:3000"
echo "  - Backend API: https://localhost:5000"
echo "  - MongoDB: mongodb://localhost:27017"
echo "  - MongoDB UI: http://localhost:8081"
echo ""
echo "Happy coding! 🎉"
