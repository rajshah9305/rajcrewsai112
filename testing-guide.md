# CrewAI Dashboard Testing Guide

## 🧪 Manual Testing Checklist

### **Environment Setup Testing**
- [ ] `.env` file created with proper values
- [ ] Database connection works
- [ ] Cerebras API key is valid
- [ ] All dependencies installed without errors
- [ ] TypeScript compilation passes (`npm run check`)

### **Application Startup Testing**
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Application loads at `http://localhost:5000`
- [ ] No console errors in browser developer tools
- [ ] All UI components render correctly
- [ ] Navigation between tabs works

### **Database Testing**
- [ ] Database schema creates successfully (`npm run db:push`)
- [ ] Can create agents through the UI
- [ ] Can create tasks through the UI
- [ ] Can view templates
- [ ] Data persists after page refresh

### **API Endpoint Testing**

#### **Agents API**
```bash
# Create an agent
curl -X POST http://localhost:5000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "role": "Data Analyst",
    "goal": "Analyze test data",
    "backstory": "Expert in data analysis",
    "model": "llama-3.3-70b"
  }'

# Get all agents
curl http://localhost:5000/api/agents

# Get specific agent
curl http://localhost:5000/api/agents/{agent_id}
```

#### **Tasks API**
```bash
# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Task",
    "description": "Test task description",
    "expectedOutput": "Analysis results",
    "priority": "high"
  }'

# Get all tasks
curl http://localhost:5000/api/tasks
```

#### **Health Check**
```bash
# Check application health
curl http://localhost:5000/health
```

### **Cerebras AI Integration Testing**
- [ ] AI models are accessible in agent creation form
- [ ] Can select different Cerebras models
- [ ] Temperature and iteration controls work
- [ ] Agent creation with Cerebras models succeeds

### **UI/UX Testing**
- [ ] All 7 main sections are accessible (Dashboard, Agents, Tasks, Templates, Execution, Analytics, Files)
- [ ] Forms submit correctly
- [ ] Error messages display appropriately
- [ ] Loading states work properly
- [ ] Mobile responsiveness works
- [ ] Dark/light theme switching (if implemented)

### **Performance Testing**
- [ ] Page load time under 3 seconds
- [ ] Navigation is smooth
- [ ] No memory leaks in browser
- [ ] API responses under 1 second
- [ ] Large lists render efficiently

### **Error Handling Testing**
- [ ] Invalid form submissions show errors
- [ ] Network errors are handled gracefully
- [ ] Missing environment variables show proper errors
- [ ] Database connection failures are handled
- [ ] Invalid API requests return proper error codes

### **Build and Production Testing**
```bash
# Test production build
npm run build

# Test production server
npm start

# Verify production optimizations
# - Check bundle sizes
# - Verify minification
# - Check source maps are not included
```

## 🚨 Common Issues and Solutions

### **1. Environment Variable Issues**
```bash
# Symptoms: App crashes on startup, "DATABASE_URL not found" errors
# Solution: Copy .env.example to .env and configure variables
cp .env.example .env
# Edit .env with your actual values
```

### **2. Database Connection Issues**
```bash
# Symptoms: "Failed to connect to database" errors
# Solutions:
# 1. Check DATABASE_URL format
# 2. Ensure PostgreSQL is running
# 3. Test connection manually:
npm run db:push
```

### **3. Cerebras API Issues**
```bash
# Symptoms: "Cerebras API error", "Invalid API key"
# Solutions:
# 1. Verify API key in .env
# 2. Check Cerebras Cloud dashboard for q