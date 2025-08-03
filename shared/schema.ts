import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(),
  goal: text("goal").notNull(),
  backstory: text("backstory").notNull(),
  model: text("model").notNull().default("llama-3.3-70b"),
  temperature: integer("temperature").notNull().default(70), // stored as 0-100 for slider
  maxIterations: integer("max_iterations").notNull().default(5),
  tools: jsonb("tools").notNull().default([]),
  status: text("status").notNull().default("idle"), // idle, active, busy
  performanceScore: integer("performance_score").notNull().default(85),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  expectedOutput: text("expected_output").notNull(),
  agentId: varchar("agent_id").references(() => agents.id),
  priority: text("priority").notNull().default("medium"), // urgent, high, medium, low
  status: text("status").notNull().default("pending"), // pending, in-progress, completed
  outputFormat: text("output_format").notNull().default("text"),
  additionalContext: text("additional_context"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  agentCount: integer("agent_count").notNull(),
  taskCount: integer("task_count").notNull(),
  rating: integer("rating").notNull().default(46), // stored as 46 for 4.6 rating
  downloads: integer("downloads").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  author: text("author").notNull(),
  config: jsonb("config").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const executions = pgTable("executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  model: text("model").notNull(),
  processType: text("process_type").notNull(),
  maxIterations: integer("max_iterations").notNull(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  output: text("output"),
  duration: integer("duration"), // in seconds
  tokensUsed: integer("tokens_used").notNull().default(0),
  apiCalls: integer("api_calls").notNull().default(0),
  cost: integer("cost").notNull().default(0), // in cents
  verboseLogging: boolean("verbose_logging").notNull().default(true),
  enableMemory: boolean("enable_memory").notNull().default(false),
  agentCollaboration: boolean("agent_collaboration").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // report, strategy, data, code, etc.
  size: integer("size").notNull(), // in bytes
  downloads: integer("downloads").notNull().default(0),
  executionId: varchar("execution_id").references(() => executions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  status: true,
  performanceScore: true,
  tasksCompleted: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  progress: true,
  status: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloads: true,
  rating: true,
});

export const insertExecutionSchema = createInsertSchema(executions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  status: true,
  output: true,
  duration: true,
  tokensUsed: true,
  apiCalls: true,
  cost: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  downloads: true,
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Execution = typeof executions.$inferSelect;
export type InsertExecution = z.infer<typeof insertExecutionSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
