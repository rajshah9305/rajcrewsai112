import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ChartLine,
  ListTodo,
  LayersIcon,
  PlayCircle,
  BarChart3,
  Folder,
  Menu,
  Bell,
  UserCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Rocket,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  FileText,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Agent, Task, Template, File, InsertAgent, InsertTask } from "@shared/schema";

// Using types from shared schema

const CrewAIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [executionSteps, setExecutionSteps] = useState<string[]>([]);
  const [executionMetrics, setExecutionMetrics] = useState({
    duration: 0,
    tokensUsed: 0,
    apiCalls: 0,
    cost: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const executionTimer = useRef<NodeJS.Timeout | null>(null);
  const executionStartTime = useRef<number>(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/templates'],
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['/api/files'],
  });

  // Mutations
  const createAgentMutation = useMutation({
    mutationFn: (data: InsertAgent) => fetch('/api/agents', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({ title: "Agent created successfully!", description: "Your new agent is ready for tasks." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create agent", variant: "destructive" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: InsertTask) => fetch('/api/tasks', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task created successfully!", description: "Your new task has been added to the queue." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    },
  });

  const downloadFileMutation = useMutation({
    mutationFn: (fileId: string) => fetch(`/api/files/${fileId}/download`, { 
      method: 'POST' 
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({ title: "Download started!", description: "File download has been initiated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to download file", variant: "destructive" });
    },
  });

  // Sample analytics data - keep this static for demo
  const analyticsData = [
    { month: "Oct", executions: 45, cost: 12.50 },
    { month: "Nov", executions: 68, cost: 18.75 },
    { month: "Dec", executions: 82, cost: 22.40 },
    { month: "Jan", executions: 95, cost: 24.73 },
  ];

  const costBreakdown = [
    { name: "Llama 3.3 70B", value: 45, color: "#3b82f6" },
    { name: "Llama 4 Scout 17B", value: 35, color: "#10b981" },
    { name: "Llama 4 Maverick 17B", value: 20, color: "#f59e0b" },
  ];
  // No longer needed - data comes from API

  // Data now comes from API queries above

  const handleCreateAgent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newAgent: InsertAgent = {
      role: formData.get("role") as string,
      goal: formData.get("goal") as string,
      backstory: formData.get("backstory") as string,
      model: formData.get("model") as string || "llama-3.3-70b",
      temperature: parseInt(formData.get("temperature") as string) || 70,
      maxIterations: parseInt(formData.get("maxIterations") as string) || 5,
      tools: [],
    };
    createAgentMutation.mutate(newAgent);
    event.currentTarget.reset();
  };

  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTask: InsertTask = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      expectedOutput: formData.get("expectedOutput") as string,
      agentId: formData.get("agentId") as string,
      priority: formData.get("priority") as "urgent" | "high" | "medium" | "low",
      outputFormat: formData.get("outputFormat") as string,
      additionalContext: formData.get("additionalContext") as string,
    };
    createTaskMutation.mutate(newTask);
    event.currentTarget.reset();
  };

  const startExecution = async () => {
    if (isExecuting || !Array.isArray(agents) || agents.length === 0) return;

    setIsExecuting(true);
    setExecutionOutput("");
    setExecutionSteps([]);
    setExecutionMetrics({ duration: 0, tokensUsed: 0, apiCalls: 0, cost: 0 });
    executionStartTime.current = Date.now();

    const firstAgent = (agents as Agent[])[0];
    const taskDescription = "Generate a comprehensive market analysis report with key findings, competitive landscape assessment, and strategic recommendations for business growth.";

    try {
      // Update steps
      setExecutionSteps(["Initializing Cerebras AI connection...", "Loading agent configuration...", "Executing workflow with " + firstAgent.model + "..."]);
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: firstAgent.id,
          taskDescription,
          model: firstAgent.model
        })
      });

      if (!response.ok) {
        throw new Error('Execution failed');
      }

      const result = await response.json();
      
      setExecutionSteps(prev => [...prev, "Processing results from " + result.model + "...", "Execution completed successfully!"]);
      setExecutionOutput(result.result);
      
      const duration = Math.floor((Date.now() - executionStartTime.current) / 1000);
      setExecutionMetrics({
        duration,
        tokensUsed: result.tokensUsed || 0,
        apiCalls: 1,
        cost: (result.tokensUsed || 0) * 0.0001,
      });

      toast({ 
        title: "Execution completed!", 
        description: `Task completed using ${result.model} model with ${result.tokensUsed} tokens.` 
      });

    } catch (error) {
      console.error('Execution error:', error);
      setExecutionSteps(prev => [...prev, "Execution failed - Please check your Cerebras API key"]);
      setExecutionOutput("Error: Failed to execute task with Cerebras AI. Please ensure your Cerebras API key is properly configured in the environment variables.");
      toast({ 
        title: "Execution failed", 
        description: "Please ensure your Cerebras API key is properly configured.",
        variant: "destructive"
      });
    }

    setIsExecuting(false);
  };

  const stopExecution = () => {
    setIsExecuting(false);
    if (executionTimer.current) {
      clearInterval(executionTimer.current);
    }
    toast({ title: "Execution stopped", description: "Workflow execution has been terminated." });
  };

  const generateBusinessContent = () => {
    return `

## Market Analysis Executive Summary

Based on comprehensive market research and competitive analysis, our AI-driven research has identified significant opportunities in the current market landscape. The analysis covers key market segments, competitive positioning, and strategic recommendations for sustainable growth.

### Key Findings:
- Market size projected to grow 24% annually over next 3 years
- Competitive gap identified in mid-market segment  
- Customer acquisition costs decreased 18% year-over-year
- Digital transformation initiatives showing 32% ROI improvement

### Strategic Recommendations:
Focus on digital-first customer experience, leverage AI-powered personalization, and establish strategic partnerships in emerging markets. Priority should be given to product development in the identified gap areas while maintaining competitive pricing strategies.

`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700";
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in-progress": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-gray-100 text-gray-700";
      case "active": return "bg-green-100 text-green-700";
      case "busy": return "bg-orange-100 text-orange-700";
      case "idle": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "report": return "📄";
      case "strategy": return "📋";
      case "data": return "📊";
      case "code": return "💻";
      default: return "📄";
    }
  };

  const tabItems = [
    { id: "dashboard", label: "Dashboard", icon: ChartLine },
    { id: "agents", label: "Agents", icon: Bot, badge: Array.isArray(agents) ? agents.length : 0 },
    { id: "tasks", label: "Tasks", icon: ListTodo, badge: Array.isArray(tasks) ? tasks.length : 0 },
    { id: "templates", label: "Templates", icon: LayersIcon },
    { id: "execution", label: "Execution", icon: PlayCircle, badge: isExecuting ? "Live" : null },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "files", label: "Files", icon: Folder, badge: Array.isArray(files) ? files.length : 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CrewAI Dashboard Pro</h1>
                <p className="text-blue-100 text-sm">Enterprise Multi-Agent Workflow Manager</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">System Online</span>
              </div>
              <div className="h-6 w-px bg-white bg-opacity-30"></div>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-10">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-10">
                <UserCircle className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-[88px] z-30">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent w-full justify-start overflow-x-auto">
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="flex items-center space-x-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none whitespace-nowrap"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant={item.badge === "Live" ? "destructive" : "secondary"} className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Dashboard Content */}
            <TabsContent value="dashboard" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Welcome Section */}
                <div className="lg:col-span-2">
                  <Card className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 mb-6">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-2">Welcome to CrewAI Dashboard Pro</h2>
                      <p className="text-blue-100 mb-4">
                        Manage your multi-agent AI workflows with enterprise-grade tools and real-time monitoring.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="secondary" size="sm" onClick={() => setActiveTab("agents")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Agent
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setActiveTab("execution")}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Execution
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm">Total Executions</p>
                            <p className="text-2xl font-bold text-gray-900">247</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Rocket className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-green-600">+12.4%</span>
                          <span className="text-gray-500 ml-1">vs last week</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900">94.2%</p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-green-600">+2.1%</span>
                          <span className="text-gray-500 ml-1">vs last week</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm">Avg Duration</p>
                            <p className="text-2xl font-bold text-gray-900">2m 34s</p>
                          </div>
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                          <span className="text-red-600">-8.2%</span>
                          <span className="text-gray-500 ml-1">vs last week</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm">Total Cost</p>
                            <p className="text-2xl font-bold text-gray-900">$24.73</p>
                          </div>
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-green-600">+5.3%</span>
                          <span className="text-gray-500 ml-1">vs last week</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Market Analysis Report completed</p>
                          <p className="text-xs text-gray-500">Research Agent • 2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Play className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Content Creation Squad started</p>
                          <p className="text-xs text-gray-500">Marketing Team • 5 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New agent "Data Scientist" created</p>
                          <p className="text-xs text-gray-500">Development Team • 12 minutes ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("agents")}>
                        <Bot className="h-4 w-4 mr-3" />
                        Create New Agent
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("tasks")}>
                        <ListTodo className="h-4 w-4 mr-3" />
                        Add New Task
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("execution")}>
                        <Play className="h-4 w-4 mr-3" />
                        Start Execution
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("templates")}>
                        <LayersIcon className="h-4 w-4 mr-3" />
                        Browse Templates
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">AI Models</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-600">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Execution Engine</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-600">Running</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">File Storage</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-600">Available</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Analytics</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-600">Processing</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Agents Content */}
            <TabsContent value="agents" className="mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                  <Card className="sticky top-32">
                    <CardHeader>
                      <CardTitle>Create New Agent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateAgent} className="space-y-4">
                        <div>
                          <Label htmlFor="role">Role *</Label>
                          <Input name="role" placeholder="e.g., Senior Marketing Analyst" required />
                        </div>
                        <div>
                          <Label htmlFor="goal">Goal *</Label>
                          <Input name="goal" placeholder="e.g., Analyze market trends and competitor strategies" required />
                        </div>
                        <div>
                          <Label htmlFor="backstory">Backstory *</Label>
                          <Textarea name="backstory" placeholder="Describe the agent's background and expertise..." rows={3} required />
                        </div>
                        <div>
                          <Label htmlFor="model">Cerebras AI Model</Label>
                          <Select name="model" defaultValue="llama-3.3-70b">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="llama-3.3-70b">Llama 3.3 70B</SelectItem>
                              <SelectItem value="llama-4-scout-17b-16e-instruct">Llama 4 Scout 17B</SelectItem>
                              <SelectItem value="llama-4-maverick-17b-128e-instruct">Llama 4 Maverick 17B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="temperature">Temperature: 0.7</Label>
                          <Slider name="temperature" defaultValue={[70]} max={100} step={10} className="mt-2" />
                        </div>
                        <div>
                          <Label htmlFor="maxIterations">Max Iterations</Label>
                          <Input name="maxIterations" type="number" min="1" max="20" defaultValue="5" />
                        </div>
                        <div>
                          <Label>Tools</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="web_search" />
                              <Label htmlFor="web_search" className="text-sm">Web Search</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="file_reader" />
                              <Label htmlFor="file_reader" className="text-sm">File Reader</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="calculator" />
                              <Label htmlFor="calculator" className="text-sm">Calculator</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="code_interpreter" />
                              <Label htmlFor="code_interpreter" className="text-sm">Code Interpreter</Label>
                            </div>
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Agent
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="xl:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Active Agents ({Array.isArray(agents) ? agents.length : 0})</h3>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="Search agents..." className="w-48" />
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array.isArray(agents) && agents.map((agent: Agent) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Bot className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{agent.role}</h4>
                                  <Badge className={getStatusColor(agent.status)}>
                                    {agent.status}
                                  </Badge>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{agent.backstory}</p>
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Performance Score</span>
                                <span className="font-medium text-green-600">{agent.performanceScore}%</span>
                              </div>
                              <Progress value={agent.performanceScore} className="h-1.5" />
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>ListTodo: {agent.tasksCompleted}</span>
                              <span>Model: {agent.model}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ListTodo Content */}
            <TabsContent value="tasks" className="mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                  <Card className="sticky top-32">
                    <CardHeader>
                      <CardTitle>Create New Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Task Name *</Label>
                          <Input name="name" placeholder="e.g., Market Analysis Report" required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea name="description" placeholder="Describe what needs to be accomplished..." rows={3} required />
                        </div>
                        <div>
                          <Label htmlFor="expectedOutput">Expected Output *</Label>
                          <Textarea name="expectedOutput" placeholder="Describe the expected deliverable..." rows={2} required />
                        </div>
                        <div>
                          <Label htmlFor="agentId">Assigned Agent</Label>
                          <Select name="agentId">
                            <SelectTrigger>
                              <SelectValue placeholder="Select an agent..." />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(agents) && agents.map((agent: Agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select name="priority" defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="outputFormat">Output Format</Label>
                          <Select name="outputFormat" defaultValue="text">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="markdown">Markdown</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Task
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="xl:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">All Tasks ({Array.isArray(tasks) ? tasks.length : 0})</h3>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="all-priorities">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-priorities">All Priorities</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all-status">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-status">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.isArray(tasks) && tasks.map((task: Task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">{task.name}</h4>
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                  <Badge className={getStatusColor(task.status)}>
                                    {task.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>
                                    <Bot className="h-3 w-3 inline mr-1" />
                                    {Array.isArray(agents) ? (agents as Agent[]).find(a => a.id === task.agentId)?.role || "Unassigned" : "Loading..."}
                                  </span>
                                  <span>
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {task.status === "completed" ? "Completed" : "Due soon"}
                                  </span>
                                  <span>
                                    <FileText className="h-3 w-3 inline mr-1" />
                                    {task.outputFormat}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium">{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Templates Content */}
            <TabsContent value="templates" className="mt-6">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Crew Templates</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Search templates..." className="w-full sm:w-48" />
                    <Select defaultValue="all-categories">
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Save Current
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.isArray(templates) && templates.map((template: Template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{template.category}</Badge>
                            {template.featured && (
                              <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm text-gray-600">{template.rating}</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Agents</span>
                            <span className="font-medium">{template.agentCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">ListTodo</span>
                            <span className="font-medium">{template.taskCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Downloads</span>
                            <span className="font-medium">{template.downloads.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>By {template.author}</span>
                          <span>Updated 2 days ago</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Load Template
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Execution Content */}
            <TabsContent value="execution" className="mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                  <Card className="sticky top-32">
                    <CardHeader>
                      <CardTitle>Execution Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="description">Project Description *</Label>
                        <Textarea
                          placeholder="Describe your project or the topic you want the crew to work on..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label>Model Selection</Label>
                        <Select defaultValue="llama-3.3-70b">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llama-3.3-70b">Llama 3.3 70B (Default)</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="claude-3">Claude-3</SelectItem>
                            <SelectItem value="mistral-large">Mistral Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Process Type</Label>
                        <Select defaultValue="sequential">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sequential">Sequential</SelectItem>
                            <SelectItem value="hierarchical">Hierarchical</SelectItem>
                            <SelectItem value="parallel">Parallel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Max Iterations</Label>
                        <Input type="number" min="1" max="20" defaultValue="10" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="verbose" defaultChecked />
                          <Label htmlFor="verbose" className="text-sm">Verbose Logging</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="memory" />
                          <Label htmlFor="memory" className="text-sm">Enable Memory</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="collaboration" defaultChecked />
                          <Label htmlFor="collaboration" className="text-sm">Agent Collaboration</Label>
                        </div>
                      </div>
                      {!isExecuting ? (
                        <Button onClick={startExecution} className="w-full bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Start Execution
                        </Button>
                      ) : (
                        <Button onClick={stopExecution} className="w-full bg-red-600 hover:bg-red-700">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Execution
                        </Button>
                      )}

                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Live Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-medium">{formatDuration(executionMetrics.duration)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tokens Used</span>
                            <span className="font-medium">{executionMetrics.tokensUsed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">API Calls</span>
                            <span className="font-medium">{executionMetrics.apiCalls}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Estimated Cost</span>
                            <span className="font-medium">${executionMetrics.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="xl:col-span-2">
                  <Card>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle>Live Execution</CardTitle>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className={`text-sm ${isExecuting ? 'text-green-600' : 'text-gray-600'}`}>
                              {isExecuting ? 'Running' : 'Ready'}
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="min-h-96">
                        {executionOutput || executionSteps.length > 0 ? (
                          <div className="space-y-4">
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                              {executionSteps.map((step, index) => (
                                <div key={index} className="mb-1">
                                  [{new Date().toLocaleTimeString()}] {step}
                                </div>
                              ))}
                            </div>
                            {executionOutput && (
                              <div className="prose prose-sm max-w-none bg-white border rounded-lg p-6">
                                <pre className="whitespace-pre-wrap">{executionOutput}</pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-12">
                            <PlayCircle className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                            <p className="text-lg font-medium">Ready to Start Execution</p>
                            <p className="text-sm">Configure your settings and click "Start Execution" to begin.</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-6 mt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Activity Log</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {executionSteps.length > 0 ? (
                            executionSteps.map((step, index) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
                                <span>{step}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">No activity yet...</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Content */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Rocket className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="text-green-600 text-sm font-medium">+12.4%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">247</h3>
                        <p className="text-gray-500 text-sm">Total Executions</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <span className="text-green-600 text-sm font-medium">+2.1%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">94.2%</h3>
                        <p className="text-gray-500 text-sm">Success Rate</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-600" />
                          </div>
                          <span className="text-red-600 text-sm font-medium">-8.2%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">2m 34s</h3>
                        <p className="text-gray-500 text-sm">Avg Duration</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-purple-600" />
                          </div>
                          <span className="text-green-600 text-sm font-medium">+5.3%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">$24.73</h3>
                        <p className="text-gray-500 text-sm">Total Cost</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Execution Trends (Last 4 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="executions"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ fill: "#3b82f6" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={costBreakdown}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {costBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Agent Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.isArray(agents) && agents.map((agent: Agent) => (
                        <div key={agent.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Bot className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{agent.role}</p>
                              <p className="text-xs text-gray-500">{agent.tasksCompleted} tasks</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-blue-600">{agent.performanceScore}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${agent.performanceScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Tokens</span>
                        <span className="text-sm font-medium">2.4M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">API Calls</span>
                        <span className="text-sm font-medium">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Files Generated</span>
                        <span className="text-sm font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Avg Response Time</span>
                        <span className="text-sm font-medium">1.2s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Peak Usage Hour</span>
                        <span className="text-sm font-medium">2-3 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Most Used Model</span>
                        <span className="text-sm font-medium">Llama 3.3</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Files Content */}
            <TabsContent value="files" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generated Files ({Array.isArray(files) ? files.length : 0})</h3>
                <div className="flex items-center space-x-3">
                  <Select defaultValue="all-types">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                      <SelectItem value="strategies">Strategies</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Search files..." className="w-48" />
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.isArray(files) && files.map((file: File) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-4xl">{getFileIcon(file.type)}</div>
                          <Checkbox />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1 truncate">{file.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">
                          {file.type} • {formatFileSize(file.size)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'}</span>
                          <span>{file.downloads} downloads</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-500">Showing 1-{Array.isArray(files) ? files.length : 0} of {Array.isArray(files) ? files.length : 0} files</div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </nav>

      {/* Floating Action Button */}
      <AnimatePresence>
        {(activeTab === "agents" || activeTab === "tasks") && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="w-14 h-14 rounded-full shadow-lg"
              onClick={() => {
                if (activeTab === "agents") {
                  toast({ title: "Quick agent creation", description: "Agent creation form is ready above." });
                } else {
                  toast({ title: "Quick task creation", description: "Task creation form is ready above." });
                }
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrewAIDashboard;
