# CrewAI Dashboard Environment Variables
# Copy this file to .env and fill in your actual values

# Cerebras AI API Key (Required)
# Get your API key from: https://cloud.cerebras.ai/
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Database Connection (Required)
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://username:password@localhost:5432/crewai_dashboard

# Application Environment
NODE_ENV=development

# Server Configuration
PORT=5000

# Session Secret (Generate a random string)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# CORS Settings (if needed)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000