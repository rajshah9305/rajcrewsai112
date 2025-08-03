# CrewAI Dashboard Pro - Enterprise Multi-Agent Workflow Manager

## Overview

CrewAI Dashboard Pro is a comprehensive, enterprise-grade React application for managing multi-agent AI workflows. The application provides real-time execution monitoring, agent management, task orchestration, template library, analytics dashboard, and file management capabilities. Built with modern web technologies, it delivers a professional UI/UX for managing complex AI agent collaborations with performance tracking and cost analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

### Completed Integration
- ✅ **Exclusive Cerebras AI Integration**: Successfully integrated all three Cerebras models (Llama 3.3 70B, Llama 4 Scout 17B, Llama 4 Maverick 17B)
- ✅ **Real AI Execution**: Added working Cerebras API endpoint with proper authentication and streaming support
- ✅ **Complete Application**: All 7 dashboard sections fully functional with real-time data
- ✅ **Database Integration**: PostgreSQL with Drizzle ORM for persistent storage
- ✅ **Production Ready**: Application ready for deployment with comprehensive documentation

### Project Status
- **Current State**: Production-ready CrewAI Dashboard with exclusive Cerebras AI integration
- **Next Steps**: Ready for GitHub upload and deployment
- **Performance**: All TypeScript errors resolved, application running smoothly on port 5000

## System Architecture

### Frontend Architecture
- **React 18 with Vite**: Modern React setup with fast development and build tooling
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework with custom design system and shadcn/ui components
- **Component Architecture**: Modular component structure with reusable UI components from shadcn/ui
- **State Management**: React hooks with local state management, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Animation**: Framer Motion for smooth UI animations and transitions

### Backend Architecture
- **Express.js Server**: Node.js server with Express framework
- **ESM Modules**: Modern ES module system throughout the stack
- **Development Setup**: Vite middleware integration for development with HMR support
- **Production Build**: esbuild bundling for optimized server deployment

### Data Storage Solutions
- **PostgreSQL Database**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Schema Design**: Well-structured tables for agents, tasks, and templates with relationships
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple
- **Memory Storage**: In-memory storage implementation for development/testing

### Database Schema Design
- **Agents Table**: Stores AI agent configurations including role, goal, backstory, model settings, and performance metrics
- **Tasks Table**: Task management with descriptions, priorities, assignments, and progress tracking
- **Templates Table**: Pre-built crew templates with ratings, categories, and configuration data
- **Relationships**: Foreign key relationships between agents and tasks for proper data integrity

### Authentication and Authorization
- **Session-based Authentication**: Traditional session management using PostgreSQL storage
- **Security Headers**: Proper security configuration for production deployment
- **Error Boundaries**: React error boundaries for graceful error handling and user experience

### UI/UX Design System
- **Mobile-First Design**: Responsive design optimized for all device sizes
- **Custom Theme**: Extended Tailwind configuration with custom CSS variables and color schemes
- **Component Library**: Comprehensive shadcn/ui component system with consistent styling
- **Dark Mode Support**: Built-in theme switching capabilities
- **Performance Optimized**: Lighthouse score target of 95+ with proper asset optimization

### Development Workflow
- **Hot Module Replacement**: Fast development iteration with Vite HMR
- **TypeScript Integration**: Full type checking with path aliases and proper module resolution
- **Build System**: Separate client and server build processes for optimal deployment
- **Code Quality**: ESLint and TypeScript strict mode for code quality assurance

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching for API calls
- **wouter**: Lightweight routing library for single-page application navigation
- **framer-motion**: Animation library for smooth UI transitions and interactions

### Database and ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver
- **drizzle-orm**: Type-safe ORM for database operations and migrations
- **drizzle-zod**: Schema validation integration between Drizzle and Zod
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Component Libraries
- **@radix-ui/react-***: Comprehensive suite of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional className utility for dynamic styling
- **cmdk**: Command palette component for search and navigation

### Form and Validation
- **@hookform/resolvers**: React Hook Form integration with validation libraries
- **react-hook-form**: Performant forms library with minimal re-renders
- **zod**: TypeScript-first schema validation library

### Data Visualization
- **recharts**: React charting library for analytics dashboard and data visualization
- **embla-carousel-react**: Touch-friendly carousel component for template browsing

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for better debugging
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling
- **esbuild**: Fast JavaScript bundler for production server builds

### Utility Libraries
- **date-fns**: Modern date utility library for timestamp formatting and manipulation
- **nanoid**: Compact URL-safe unique string ID generator
- **tailwind-merge**: Utility for merging Tailwind CSS classes intelligently

### Build and Development
- **vite**: Next-generation frontend build tool with fast HMR
- **tsx**: TypeScript execution environment for development server
- **postcss**: CSS post-processor with Tailwind CSS and Autoprefixer plugins