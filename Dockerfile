# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root dependencies
RUN npm install -g npm@latest
RUN npm install -g concurrently

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy source code
WORKDIR /app
COPY . .

# Build client
WORKDIR /app/client
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/server /app/server
COPY --from=builder /app/client/build /app/client/build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose ports
EXPOSE 5000

# Set working directory to server
WORKDIR /app/server

# Install production dependencies
RUN npm ci --only=production

# Start the application
CMD ["node", "server.js"]
