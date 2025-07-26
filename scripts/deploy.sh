#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENV=""
PLATFORM="vercel"
BUILD_FRONTEND=true
BUILD_BACKEND=true
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env=*)
      ENV="${1#*=}"
      shift
      ;;
    --platform=*)
      PLATFORM="${1#*=}"
      shift
      ;;
    --no-frontend)
      BUILD_FRONTEND=false
      shift
      ;;
    --no-backend)
      BUILD_BACKEND=false
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate environment
if [ -z "$ENV" ]; then
  echo -e "${YELLOW}No environment specified. Using 'development' as default.${NC}"
  ENV="development"
fi

# Validate platform
case $PLATFORM in
  vercel|netlify|docker|all)
    # Valid platform
    ;;
  *)
    echo -e "${YELLOW}Invalid platform: $PLATFORM. Using 'vercel' as default.${NC}"
    PLATFORM="vercel"
    ;;
esac

echo -e "\n🚀 Starting deployment for ${GREEN}$ENV${NC} environment on ${GREEN}$PLATFORM${NC}..."

# Function to check for uncommitted changes
check_git_status() {
  if [ "$FORCE" = false ] && [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes. Use --force to deploy anyway.${NC}"
    exit 1
  fi
}

# Function to deploy to Vercel
deploy_vercel() {
  echo -e "\n🌐 Deploying to Vercel..."
  
  if [ "$BUILD_FRONTEND" = true ]; then
    echo "Building frontend for Vercel..."
    cd client
    npm run build
    cd ..
    
    echo "Deploying frontend..."
    vercel --prod
  fi
  
  if [ "$BUILD_BACKEND" = true ]; then
    echo "Deploying backend..."
    cd server
    vercel --prod
    cd ..
  fi
}

# Function to deploy to Netlify
deploy_netlify() {
  echo -e "\n🌐 Deploying to Netlify..."
  
  if [ "$BUILD_FRONTEND" = true ]; then
    echo "Building frontend for Netlify..."
    cd client
    npm run build
    
    echo "Deploying frontend..."
    netlify deploy --prod
    cd ..
  fi
}

# Function to build and push Docker images
deploy_docker() {
  echo -e "\n🐳 Building and pushing Docker images..."
  
  # Login to Docker Hub if needed
  if [ "$ENV" = "production" ]; then
    echo "Logging in to Docker Hub..."
    docker login
  fi
  
  # Build and push images
  if [ "$BUILD_BACKEND" = true ]; then
    echo "Building backend Docker image..."
    docker build -t invoice-generator-backend:latest -f Dockerfile .
    
    if [ "$ENV" = "production" ]; then
      echo "Pushing backend image to registry..."
      # Replace with your actual Docker Hub username
      docker tag invoice-generator-backend:latest yourusername/invoice-generator-backend:latest
      docker push yourusername/invoice-generator-backend:latest
    fi
  fi
  
  if [ "$BUILD_FRONTEND" = true ]; then
    echo "Building frontend Docker image..."
    docker build -t invoice-generator-frontend:latest -f client/Dockerfile ./client
    
    if [ "$ENV" = "production" ]; then
      echo "Pushing frontend image to registry..."
      # Replace with your actual Docker Hub username
      docker tag invoice-generator-frontend:latest yourusername/invoice-generator-frontend:latest
      docker push yourusername/invoice-generator-frontend:latest
    fi
  fi
  
  echo -e "\n✅ Docker images built successfully!"
  
  if [ "$ENV" = "local" ]; then
    echo -e "\n🏃 Starting containers locally..."
    docker-compose up -d
  fi
}

# Main deployment logic
case $PLATFORM in
  vercel)
    deploy_vercel
    ;;
  netlify)
    deploy_netlify
    ;;
  docker)
    deploy_docker
    ;;
  all)
    deploy_vercel
    deploy_netlify
    deploy_docker
    ;;
esac

echo -e "\n✨ Deployment to ${GREEN}$PLATFORM${NC} completed successfully!"

# Show deployment summary
echo -e "\n📋 Deployment Summary:"
echo "- Environment: $ENV"
echo "- Platform: $PLATFORM"
echo "- Frontend Built: $BUILD_FRONTEND"
echo "- Backend Built: $BUILD_BACKEND"

if [ "$PLATFORM" = "docker" ] && [ "$ENV" = "local" ]; then
  echo -e "\n🌐 Application should be available at: http://localhost:3000"
  echo "🔌 API should be available at: http://localhost:5000"
  echo "📊 MongoDB UI available at: http://localhost:8081"
fi

echo -e "\n✅ Deployment process completed!"
