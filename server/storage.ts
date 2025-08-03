import { type Agent, type InsertAgent, type Task, type InsertTask, type Template, type InsertTemplate, type Execution, type InsertExecution, type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Agent operations
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Execution operations
  getExecutions(): Promise<Execution[]>;
  getExecution(id: string): Promise<Execution | undefined>;
  createExecution(execution: InsertExecution): Promise<Execution>;
  updateExecution(id: string, execution: Partial<Execution>): Promise<Execution | undefined>;

  // File operations
  getFiles(): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, file: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private agents: Map<string, Agent>;
  private tasks: Map<string, Task>;
  private templates: Map<string, Template>;
  private executions: Map<string, Execution>;
  private files: Map<string, File>;

  constructor() {
    this.agents = new Map();
    this.tasks = new Map();
    this.templates = new Map();
    this.executions = new Map();
    this.files = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data
    const sampleAgents: Agent[] = [
      {
        id: "1",
        role: "Senior Research Analyst",
        goal: "Conduct comprehensive market research and competitive analysis",
        backstory: "Expert analyst with 10+ years in market research and data analysis",
        model: "llama-3.3-70b",
        temperature: 70,
        maxIterations: 5,
        tools: ["web_search", "file_reader", "calculator"],
        status: "active",
        performanceScore: 94,
        tasksCompleted: 23,
        createdAt: new Date(),
      },
      {
        id: "2",
        role: "Content Creator",
        goal: "Create engaging marketing content and copy",
        backstory: "Creative professional specializing in digital marketing content",
        model: "llama-4-scout-17b-16e-instruct",
        temperature: 60,
        maxIterations: 3,
        tools: ["web_search", "file_reader"],
        status: "busy",
        performanceScore: 87,
        tasksCompleted: 18,
        createdAt: new Date(),
      },
      {
        id: "3",
        role: "Code Reviewer",
        goal: "Review code for best practices and security",
        backstory: "Senior developer with expertise in security and code quality",
        model: "llama-4-maverick-17b-128e-instruct",
        temperature: 20,
        maxIterations: 10,
        tools: ["code_interpreter", "file_reader"],
        status: "idle",
        performanceScore: 91,
        tasksCompleted: 31,
        createdAt: new Date(),
      },
      {
        id: "4",
        role: "Data Scientist",
        goal: "Analyze complex datasets and create predictive models",
        backstory: "PhD in Statistics with focus on machine learning and analytics",
        model: "llama-3.3-70b",
        temperature: 40,
        maxIterations: 8,
        tools: ["calculator", "code_interpreter", "file_reader"],
        status: "active",
        performanceScore: 96,
        tasksCompleted: 15,
        createdAt: new Date(),
      },
    ];

    const sampleTasks: Task[] = [
      {
        id: "1",
        name: "Competitive Analysis Report",
        description: "Analyze top 5 competitors in the market",
        expectedOutput: "Comprehensive PDF report with findings",
        agentId: "1",
        priority: "urgent",
        status: "in-progress",
        outputFormat: "PDF",
        progress: 73,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: null,
        additionalContext: "Focus on market positioning and pricing strategies",
      },
      {
        id: "2",
        name: "Social Media Content Strategy",
        description: "Create Q2 social media content strategy",
        expectedOutput: "Strategic content plan with recommendations",
        agentId: "2",
        priority: "high",
        status: "completed",
        outputFormat: "Markdown",
        progress: 100,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        additionalContext: null,
      },
      {
        id: "3",
        name: "Code Security Audit",
        description: "Review codebase for security vulnerabilities",
        expectedOutput: "Security audit report with recommendations",
        agentId: "3",
        priority: "medium",
        status: "pending",
        outputFormat: "JSON",
        progress: 0,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: null,
        additionalContext: "Include OWASP top 10 vulnerabilities",
      },
      {
        id: "4",
        name: "Customer Behavior Analysis",
        description: "Analyze customer transaction data",
        expectedOutput: "Data insights and predictions",
        agentId: "4",
        priority: "high",
        status: "in-progress",
        outputFormat: "CSV",
        progress: 45,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: null,
        additionalContext: "Focus on purchasing patterns and retention",
      },
    ];

    const sampleTemplates: Template[] = [
      {
        id: "1",
        name: "Research & Analysis Team",
        description: "Comprehensive research crew with market analyst, data researcher, and report writer",
        category: "Research",
        agentCount: 3,
        taskCount: 5,
        rating: 48,
        downloads: 1247,
        featured: true,
        author: "CrewAI Team",
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Content Creation Squad",
        description: "Marketing-focused crew with content strategist and copywriter",
        category: "Marketing",
        agentCount: 2,
        taskCount: 4,
        rating: 46,
        downloads: 892,
        featured: false,
        author: "Marketing Pro",
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Code Review Team",
        description: "Development crew with senior reviewer, security auditor, and QA specialist",
        category: "Development",
        agentCount: 3,
        taskCount: 6,
        rating: 49,
        downloads: 1456,
        featured: false,
        author: "DevOps Expert",
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4",
        name: "Data Science Pipeline",
        description: "Complete data science workflow with data engineer, analyst, ML engineer, and visualization specialist",
        category: "Data Science",
        agentCount: 4,
        taskCount: 8,
        rating: 47,
        downloads: 2103,
        featured: true,
        author: "Data Team",
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sampleFiles: File[] = [
      {
        id: "1",
        name: "Market Analysis Q4 2024",
        type: "Report",
        size: 2400000,
        downloads: 247,
        executionId: null,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: "2",
        name: "Content Strategy 2024",
        type: "Strategy",
        size: 1800000,
        downloads: 156,
        executionId: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "3",
        name: "Customer Data Analysis",
        type: "Data",
        size: 3200000,
        downloads: 89,
        executionId: null,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: "4",
        name: "Security Audit Report",
        type: "Code",
        size: 956000,
        downloads: 72,
        executionId: null,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];

    sampleAgents.forEach(agent => this.agents.set(agent.id, agent));
    sampleTasks.forEach(task => this.tasks.set(task.id, task));
    sampleTemplates.forEach(template => this.templates.set(template.id, template));
    sampleFiles.forEach(file => this.files.set(file.id, file));
  }

  // Agent operations
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = {
      ...insertAgent,
      id,
      model: insertAgent.model || "llama-3.3-70b",
      temperature: insertAgent.temperature || 70,
      maxIterations: insertAgent.maxIterations || 5,
      tools: insertAgent.tools || [],
      status: "idle",
      performanceScore: Math.floor(Math.random() * 20) + 80,
      tasksCompleted: 0,
      createdAt: new Date(),
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...updates };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      agentId: insertTask.agentId || null,
      priority: insertTask.priority || "medium",
      outputFormat: insertTask.outputFormat || "text",
      additionalContext: insertTask.additionalContext || null,
      status: "pending",
      progress: 0,
      createdAt: new Date(),
      completedAt: null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...insertTemplate,
      id,
      featured: insertTemplate.featured || false,
      downloads: 0,
      rating: 46,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  // Execution operations
  async getExecutions(): Promise<Execution[]> {
    return Array.from(this.executions.values());
  }

  async getExecution(id: string): Promise<Execution | undefined> {
    return this.executions.get(id);
  }

  async createExecution(insertExecution: InsertExecution): Promise<Execution> {
    const id = randomUUID();
    const execution: Execution = {
      ...insertExecution,
      id,
      verboseLogging: insertExecution.verboseLogging || true,
      enableMemory: insertExecution.enableMemory || false,
      agentCollaboration: insertExecution.agentCollaboration || true,
      status: "pending",
      output: null,
      duration: null,
      tokensUsed: 0,
      apiCalls: 0,
      cost: 0,
      createdAt: new Date(),
      completedAt: null,
    };
    this.executions.set(id, execution);
    return execution;
  }

  async updateExecution(id: string, updates: Partial<Execution>): Promise<Execution | undefined> {
    const execution = this.executions.get(id);
    if (!execution) return undefined;
    
    const updatedExecution = { ...execution, ...updates };
    this.executions.set(id, updatedExecution);
    return updatedExecution;
  }

  // File operations
  async getFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = {
      ...insertFile,
      id,
      executionId: insertFile.executionId || null,
      downloads: 0,
      createdAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
