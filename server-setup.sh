#!/bin/bash

# Server Setup Script for Restaurant Inventory System
echo "🚀 Setting up Restaurant Inventory System on server..."

# Navigate to application directory
cd /opt

# Clone repository if not exists
if [ ! -d "restaurant-inventory-system" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/nopkhun/restaurant-inventory-system.git
fi

cd restaurant-inventory-system

# Setup environment file
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Please edit .env file with your production values:"
    echo "   - Database passwords"
    echo "   - JWT secrets"
    echo "   - API URLs"
fi

# Create necessary directories
mkdir -p logs
mkdir -p data/postgres

# Set permissions
chown -R $USER:$USER .

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with production values"
echo "2. Configure GitHub Secrets in repository"
echo "3. Push to main branch to trigger deployment"
echo ""
echo "🔧 Manual deployment command:"
echo "   ./scripts/deploy.sh"