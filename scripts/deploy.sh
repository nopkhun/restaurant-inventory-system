#!/bin/bash

# Restaurant Inventory System Deployment Script
set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update .env file with your production values!"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install it and try again."
    exit 1
fi

print_status "Pulling latest images..."
docker-compose pull

print_status "Stopping existing containers..."
docker-compose down

print_status "Starting new containers..."
docker-compose up -d

print_status "Waiting for services to be ready..."
sleep 30

print_status "Checking service health..."
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:3000"
    print_status "Database: localhost:5432"
else
    print_error "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

print_status "Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!"