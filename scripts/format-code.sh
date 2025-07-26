#!/bin/bash

# Exit on error
set -e

echo "🎨 Formatting code with Prettier and ESLint..."

# Check if Prettier is installed
if ! command -v prettier &> /dev/null; then
  echo "Installing Prettier..."
  npm install --global prettier
fi

# Format JavaScript/TypeScript files
echo "📝 Formatting JavaScript/TypeScript files..."
prettier --write "**/*.{js,jsx,ts,tsx,json,css,scss,md,html}" --ignore-path .gitignore

# Format backend code
echo "🔧 Formatting backend code..."
cd server
npx prettier --write "**/*.js" --ignore-path ../.gitignore
npm run lint:fix
cd ..

# Format frontend code
echo "🎨 Formatting frontend code..."
cd client
npx prettier --write "**/*.{js,jsx,ts,tsx,css,scss,json,md,html}" --ignore-path ../.gitignore
npm run lint:fix
cd ..

echo "✨ Code formatting complete!"
