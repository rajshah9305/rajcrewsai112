# CrewAI Dashboard Pro - Enterprise Multi-Agent Workflow Manager

A comprehensive, enterprise-grade React application for managing multi-agent AI workflows with exclusive Cerebras AI integration. Built with modern web technologies for professional AI agent collaboration with real-time execution monitoring and performance analytics.

## 🚀 Features

### Core Functionality
- **7 Main Dashboard Sections**: Dashboard, Agents, Tasks, Templates, Execution, Analytics, Files
- **Real-time Execution Monitoring**: Live workflow execution with step-by-step progress tracking
- **Performance Analytics**: Comprehensive metrics including token usage, API calls, and cost analysis
- **Agent Management**: Create, configure, and monitor AI agents with custom roles and goals
- **Task Orchestration**: Assign and track tasks across multiple agents with priority management
- **Template Library**: Pre-built crew templates for common use cases
- **File Management**: Generated files with preview, download, and organization capabilities

### AI Integration
- **Exclusive Cerebras AI Models**:
  - Llama 3.3 70B (General purpose, balanced performance)
  - Llama 4 Scout 17B (Fast inference, optimized for quick responses)
  - Llama 4 Maverick 17B (Extended context, complex reasoning)
- **Real-time AI Execution**: Direct integration with Cerebras Cloud API
- **Streaming Support**: Real-time response streaming for live feedback
- **Custom Agent Personalities**: Configurable roles, goals, backstories, and model preferences

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui components for modern UI design
- **Framer Motion** for smooth animations and transitions
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing

### Backend
- **Express.js** server with TypeScript support
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** with Neon serverless for scalable data storage
- **Session-based Authentication** with secure session management
- **Cerebras Cloud SDK** for AI model integration

### Development Tools
- **ESBuild** for fast server bundling
- **Hot Module Replacement** for instant development feedback
- **TypeScript** strict mode for code quality
- **Comprehensive Error Handling** with user-friendly error boundaries

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Cerebras API key

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/rajshah9305/Newercrewai.git
cd Newercrewai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file with the following variables:
```env
CEREBRAS_API_KEY=your_cerebras_api_key_here
DATABASE_URL=your_postgresql_connection_string
```

### 4. Database Setup
The application uses Drizzle ORM with PostgreSQL. The schema will be automatically created when you start the application.

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🎯 Usage Guide

### Creating Agents
1. Navigate to the **Agents** tab
2. Fill in the agent creation form with:
   - Role (e.g., "Senior Marketing Analyst")
   - Goal (e.g., "Analyze market trends and competitor strategies")
   - Backstory (agent's background and expertise)
   - Choose a Cerebras AI model
   - Configure temperature and iteration settings
   - Select available tools
3. Click "Create Agent"

### Running Workflows
1. Go to the **Execution** tab
2. Configure execution settings
3. Click "Start Execution" to run a live AI workflow
4. Monitor real-time progress in the execution console
5. View generated results and performance metrics

### Managing Tasks
1. Access the **Tasks** tab
2. Create new tasks with:
   - Task name and description
   - Expected output format
   - Agent assignment
   - Priority level
   - Additional context
3. Track task progress and completion status

### Analytics Dashboard
- View execution trends over time
- Monitor token usage and API costs
- Analyze agent performance metrics
- Track file generation statistics

## 🏗️ Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── pages/          # Application pages
├── server/                 # Express.js backend
│   ├── cerebras.ts         # Cerebras AI integration
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── components.json         # shadcn/ui configuration
```

## 🔧 Configuration

### Cerebras AI Models
The application supports three Cerebras models with different characteristics:

- **llama-3.3-70b**: Best for complex reasoning and comprehensive analysis
- **llama-4-scout-17b-16e-instruct**: Optimized for speed and quick responses
- **llama-4-maverick-17b-128e-instruct**: Extended context window for complex tasks

### Agent Configuration
- **Temperature**: Controls response creativity (0-100)
- **Max Iterations**: Maximum number of reasoning steps
- **Tools**: Available tools for agent use (web search, file reader, calculator, code interpreter)

## 🛡️ Security

- Session-based authentication with PostgreSQL storage
- Environment variable protection for API keys
- Input validation using Zod schemas
- CORS protection and security headers
- Error boundary protection for graceful failure handling

## 📊 Performance

- **Lighthouse Score**: Target 95+ for optimal performance
- **Hot Module Replacement**: Sub-second development updates
- **Optimized Builds**: ESBuild for fast production bundles
- **Efficient Caching**: TanStack Query for smart data management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `replit.md`
- Review the API documentation in the code comments

## 🎉 Acknowledgments

- Built with Replit's modern development stack
- Powered by Cerebras AI for fast inference
- UI components from shadcn/ui
- Icons from Lucide React

---

**Built with ❤️ for the future of AI agent collaboration**