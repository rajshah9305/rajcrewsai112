#!/bin/bash

echo "🚀 CrewAI Dashboard Setup Script"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔐 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your actual credentials:"
    echo "   - CEREBRAS_API_KEY: Get from https://cloud.cerebras.ai/"
    echo "   - DATABASE_URL: Your PostgreSQL connection string"
else
    echo "✅ .env file already exists"
fi

# Check if required environment variables are set
echo "🔍 Checking environment variables..."
if [ -f .env ]; then
    source .env
    
    if [ -z "$CEREBRAS_API_KEY" ] || [ "$CEREBRAS_API_KEY" = "your_cerebras_api_key_here" ]; then
        echo "⚠️  CEREBRAS_API_KEY not configured in .env"
    else
        echo "✅ CEREBRAS_API_KEY configured"
    fi
    
    if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "postgresql://username:password@localhost:5432/crewai_dashboard" ]; then
        echo "⚠️  DATABASE_URL not configured in .env"
    else
        echo "✅ DATABASE_URL configured"
    fi
fi

# Run TypeScript check
echo "🔧 Running TypeScript check..."
npm run check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript check failed - please fix the errors"
else
    echo "✅ TypeScript check passed"
fi

# Try to push database schema
echo "📊 Setting up database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "⚠️  Database setup failed - please check your DATABASE_URL"
else
    echo "✅ Database schema created successfully"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your actual credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:5000 in your browser"
echo ""
echo "For production deployment:"
echo "1. Run 'npm run build' to create production build"
echo "2. Run 'npm start' to start production server"
echo ""
echo "Need help? Check the README.md file or visit:"
echo "https://github.com/rajshah9305/Newercrewai"