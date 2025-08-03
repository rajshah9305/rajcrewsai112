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
  Edit,
  Save,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
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

  // Filter data based on search query
  const filteredAgents = agents.filter((agent: Agent) =>
    agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.goal?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter((task: Task) =>
    task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const deleteAgentMutation = useMutation({
    mutationFn: (agentId: string) => fetch(`/api/agents/${agentId}`, { 
      method: 'DELETE' 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({ title: "Agent deleted successfully!", description: "The agent has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete agent", variant: "destructive" });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) => 
      fetch(`/api/agents/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) 
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({ title: "Agent updated successfully!", description: "Changes have been saved." });
      setEditingAgent(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update agent", variant: "destructive" });
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

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => fetch(`/api/tasks/${taskId}`, { 
      method: 'DELETE' 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task deleted successfully!", description: "The task has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => 
      fetch(`/api/tasks/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) 
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task updated successfully!", description: "Changes have been saved." });
      setEditingTask(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
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

  // Sample analytics data
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

  // Selection handlers
  const handleAgentSelection = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(id => id !== agentId));
    }
  };

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAllAgents = (checked: boolean) => {
    if (checked) {
      setSelectedAgents(agents.map((agent: Agent) => agent.id));
    } else {
      setSelectedAgents([]);
    }
  };

  const handleSelectAllTasks = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map((task: Task) => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleDeleteSelectedAgents = () => {
    selectedAgents.forEach(agentId => {
      deleteAgentMutation.mutate(agentId);
    });
    setSelectedAgents([]);
  };

  const handleDeleteSelectedTasks = () => {
    selectedTasks.forEach(taskId => {
      deleteTaskMutation.mutate(taskId);
    });
    setSelectedTasks([]);
  };

  const handleCreateAgent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newAgent: InsertAgent = {
      name: formData.get("name") as string,
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

    const agentsToExecute = selectedAgents.length > 0 
      ? agents.filter((agent: Agent) => selectedAgents.includes(agent.id))
      : [agents[0]];

    const firstAgent = agentsToExecute[0] as Agent;
    const taskDescription = "Generate a comprehensive market analysis report with key findings, competitive landscape assessment, and strategic recommendations for business growth.";

    try {
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
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="CrewAI Logo" className="h-8" />
            <div>
              <h1 className="text-xl font-bold">CrewAI Dashboard Pro</h1>
              <p className="text-blue-100 text-sm">Enterprise Multi-Agent Workflow Manager</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white text-opacity-70" />
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-10">
              <UserCircle className="h-5 w-5" />
            </Button>
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

            {/* Main Content with Sidebar */}
            <div className="flex mt-6">
              <div className="flex-1 pr-6">
                {/* Dashboard Content */}
                <TabsContent value="dashboard" className="mt-0 space-y-6">
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
                  </div>
                </TabsContent>

                {/* Agents Content */}
                <TabsContent value="agents" className="mt-0">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-1">
                      <Card className="sticky top-32">
                        <CardHeader>
                          <CardTitle>Create New Agent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleCreateAgent} className="space-y-4">
                            <div>
                              <Label htmlFor="name">Agent Name *</Label>
                              <Input name="name" placeholder="e.g., Marketing Analyst Agent" required />
                            </div>
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
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold text-gray-900">Active Agents ({Array.isArray(agents) ? agents.length : 0})</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={selectedAgents.length === agents.length && agents.length > 0}
                              onCheckedChange={handleSelectAllAgents}
                            />
                            <Label className="text-sm">Select All</Label>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4" />
                          </Button>
                          {selectedAgents.length > 0 && (
                            <Button variant="destructive" size="sm" onClick={handleDeleteSelectedAgents}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete ({selectedAgents.length})
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAgents.map((agent: Agent) => (
                          <Card key={agent.id} className="relative">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-lg font-semibold flex items-center">
                                <Checkbox
                                  checked={selectedAgents.includes(agent.id)}
                                  onCheckedChange={(checked) => handleAgentSelection(agent.id, checked as boolean)}
                                  className="mr-2"
                                />
                                {agent.name}
                              </CardTitle>
                              <Badge className={getStatusColor(agent.status || "active")}>
                                {agent.status || "active"}
                              </Badge>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{agent.role}</p>
                              <p className="text-xs text-gray-600 mt-2">{agent.backstory}</p>
                              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                                <span><ListTodo className="inline-block h-3 w-3 mr-1" /> Tasks: {agent.tasks?.length || 0}</span>
                                <span><Bot className="inline-block h-3 w-3 mr-1" /> Model: {agent.model}</span>
                              </div>
                              <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => setEditingAgent(agent.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteAgentMutation.mutate(agent.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tasks Content */}
                <TabsContent value="tasks" className="mt-0">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-1">
                      <Card className="sticky top-32">
                        <CardHeader>
                          <CardTitle>Add New Task</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                              <Label htmlFor="name">Task Name *</Label>
                              <Input name="name" placeholder="e.g., Competitive Analysis Report" required />
                            </div>
                            <div>
                              <Label htmlFor="description">Description *</Label>
                              <Textarea name="description" placeholder="Detailed description of the task..." rows={3} required />
                            </div>
                            <div>
                              <Label htmlFor="expectedOutput">Expected Output *</Label>
                              <Input name="expectedOutput" placeholder="e.g., A 5-page report in PDF format" required />
                            </div>
                            <div>
                              <Label htmlFor="agentId">Assign Agent *</Label>
                              <Select name="agentId" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an agent" />
                                </SelectTrigger>
                                <SelectContent>
                                  {agents.map((agent: Agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                      {agent.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="priority">Priority *</Label>
                              <Select name="priority" defaultValue="medium" required>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="outputFormat">Output Format</Label>
                              <Input name="outputFormat" placeholder="e.g., PDF, JSON, Markdown" />
                            </div>
                            <div>
                              <Label htmlFor="additionalContext">Additional Context</Label>
                              <Textarea name="additionalContext" placeholder="Any additional information or resources..." rows={2} />
                            </div>
                            <Button type="submit" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Task
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="xl:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold text-gray-900">Active Tasks ({Array.isArray(tasks) ? tasks.length : 0})</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={selectedTasks.length === tasks.length && tasks.length > 0}
                              onCheckedChange={handleSelectAllTasks}
                            />
                            <Label className="text-sm">Select All</Label>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4" />
                          </Button>
                          {selectedTasks.length > 0 && (
                            <Button variant="destructive" size="sm" onClick={handleDeleteSelectedTasks}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete ({selectedTasks.length})
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTasks.map((task: Task) => (
                          <Card key={task.id} className="relative">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-lg font-semibold flex items-center">
                                <Checkbox
                                  checked={selectedTasks.includes(task.id)}
                                  onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                                  className="mr-2"
                                />
                                {task.name}
                              </CardTitle>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              <p className="text-xs text-gray-600 mt-2">Expected: {task.expectedOutput}</p>
                              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                                <span><Bot className="inline-block h-3 w-3 mr-1" /> Agent: {agents.find(a => a.id === task.agentId)?.name || "N/A"}</span>
                                <span><FileText className="inline-block h-3 w-3 mr-1" /> Format: {task.outputFormat || "Any"}</span>
                              </div>
                              <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => setEditingTask(task.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteTaskMutation.mutate(task.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Templates Content */}
                <TabsContent value="templates" className="mt-0">
                  <h2 className="text-2xl font-bold mb-4">AI Workflow Templates</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template: Template) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <CardTitle>{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                            <span><Bot className="inline-block h-3 w-3 mr-1" /> Agents: {template.agents.length}</span>
                            <span><ListTodo className="inline-block h-3 w-3 mr-1" /> Tasks: {template.tasks.length}</span>
                          </div>
                          <Button className="w-full mt-4">Use Template</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Execution Content */}
                <TabsContent value="execution" className="mt-0">
                  <h2 className="text-2xl font-bold mb-4">Workflow Execution</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Execute New Workflow</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="selectAgent">Select Agent(s)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agents to run" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map((agent: Agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="taskDescription">Task Description</Label>
                        <Textarea id="taskDescription" placeholder="Describe the task for the selected agent(s)..." rows={4} />
                      </div>
                      <div className="flex space-x-4">
                        <Button onClick={startExecution} disabled={isExecuting}>
                          <Play className="h-4 w-4 mr-2" /> Start Execution
                        </Button>
                        <Button onClick={stopExecution} disabled={!isExecuting} variant="outline">
                          <Pause className="h-4 w-4 mr-2" /> Stop Execution
                        </Button>
                      </div>
                      {isExecuting && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Execution Progress:</h4>
                          <Progress value={(executionSteps.length / 3) * 100} className="w-full" />
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {executionSteps.map((step, index) => (
                              <p key={index}>{step}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {executionOutput && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-md text-sm font-mono whitespace-pre-wrap">
                          {executionOutput}
                        </div>
                      )}
                      {executionMetrics.duration > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">Duration:</p>
                            <p>{formatDuration(executionMetrics.duration)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Tokens Used:</p>
                            <p>{executionMetrics.tokensUsed}</p>
                          </div>
                          <div>
                            <p className="font-semibold">API Calls:</p>
                            <p>{executionMetrics.apiCalls}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Estimated Cost:</p>
                            <p>${executionMetrics.cost.toFixed(4)}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Content */}
                <TabsContent value="analytics" className="mt-0">
                  <h2 className="text-2xl font-bold mb-4">Analytics & Reporting</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Execution Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analyticsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="executions" stroke="#8884d8" />
                            <Line type="monotone" dataKey="cost" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Model Cost Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={costBreakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {costBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Files Content */}
                <TabsContent value="files" className="mt-0">
                  <h2 className="text-2xl font-bold mb-4">Generated Files</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {files.map((file: File) => (
                      <Card key={file.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <span className="mr-2 text-xl">{getFileIcon(file.type)}</span>
                            {file.name}
                          </CardTitle>
                          <Badge variant="outline">{file.type}</Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Size: {formatFileSize(file.size)}</p>
                          <p className="text-xs text-gray-600 mt-1">Generated: {new Date(file.createdAt).toLocaleDateString()}</p>
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => downloadFileMutation.mutate(file.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>

              {/* Right Sidebar */}
              <aside className="w-80 hidden lg:block">
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

                <Card className="mt-6">
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

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">New agent created</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Task completed</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">System update</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </Tabs>
        </div>
      </nav>
    </div>
  );
};

export default CrewAIDashboard;

