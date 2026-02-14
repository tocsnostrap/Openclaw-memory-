// Workspace API - reads from local state files updated by OpenClaw agent
import fs from "fs";
import path from "path";

const DEFAULT_WORKSPACE = process.env.WORKSPACE_PATH || path.join(process.env.HOME || "/home/azureuser", ".openclaw", "workspace");
const STATE_DIR = path.join(DEFAULT_WORKSPACE, "state");

export interface Server {
  name: string;
  status: "up" | "down";
  port: number;
  lastCheck: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  level: string;
  status: "active" | "idle" | "error";
  personality?: string;
  capabilities?: string[];
  rules?: string[];
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "running" | "idle" | "error";
  lastRun?: string;
  lastStatus?: "success" | "failed";
  consecutiveErrors: number;
}

export interface RevenueData {
  current: number;
  monthlyBurn: number;
  net: number;
  lastUpdated: string;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: string;
  status: "draft" | "review" | "approved" | "published";
  preview: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  reasoning: string;
  nextAction: string;
  priority: "low" | "medium" | "high" | "urgent";
  effort: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected";
}

export interface Client {
  id: string;
  name: string;
  status: "prospect" | "contacted" | "meeting" | "proposal" | "active";
  contacts: { name: string; email?: string; phone?: string }[];
  lastInteraction?: string;
  nextAction?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  channel: "telegram" | "discord" | "webchat";
  timestamp: string;
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    const fullPath = filePath.startsWith('/') ? filePath : path.join(STATE_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    // File doesn't exist or invalid JSON
  }
  return null;
}

// API Route handlers
export async function getSystemState(): Promise<{ 
  servers: Server[]; 
  branch: string | null; 
  sessions: number;
  agents: number;
  crons: number;
}> {
  // Hardcoded for now - crons are always 2
  return {
    servers: [
      { name: "Gateway", status: "up", port: 18789, lastCheck: new Date().toISOString() },
      { name: "Browser", status: "up", port: 9222, lastCheck: new Date().toISOString() },
    ],
    branch: "main",
    sessions: 2,
    agents: 1,
    crons: 2,
  };
}

export async function getAgents(): Promise<Agent[]> {
  return [{
    id: "main",
    name: "Fred",
    role: "assistant",
    model: "minimax/m2.5",
    level: "main",
    status: "active",
  }];
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const agents = await getAgents();
  return agents.find(a => a.id === id) || null;
}

export async function getCronHealth(): Promise<{ jobs: CronJob[] }> {
  const crons = readJsonFile<CronJob[]>("crons.json");
  return { jobs: crons || [] };
}

export async function getRevenue(): Promise<RevenueData> {
  return { current: 0, monthlyBurn: 0, net: 0, lastUpdated: new Date().toISOString() };
}

export async function getContentPipeline(): Promise<{ items: ContentItem[] }> {
  return { items: [] };
}

export async function getSuggestedTasks(): Promise<{ tasks: Task[] }> {
  return { tasks: [] };
}

export async function updateTaskStatus(taskId: string, status: Task["status"]): Promise<void> {}

export async function getObservations(): Promise<string> {
  return "Observations integrated.";
}

export async function getPriorities(): Promise<string> {
  return "Check MEMORY.md for priorities.";
}

export async function getChatHistory(options?: { channel?: string; limit?: number }): Promise<{ messages: ChatMessage[] }> {
  return { messages: [] };
}

export async function sendChatMessage(message: string): Promise<{ success: boolean }> {
  return { success: false };
}

export async function getClients(): Promise<{ clients: Client[] }> {
  return { clients: [] };
}

export async function getHealth(): Promise<{
  status: string;
  uptime: number;
  memoryUsage: number;
  workspace: string;
}> {
  return {
    status: "healthy",
    uptime: Date.now(),
    memoryUsage: 0,
    workspace: DEFAULT_WORKSPACE,
  };
}

export async function searchKnowledge(query: string): Promise<{ results: { file: string; content: string }[] }> {
  return { results: [] };
}

export async function getEcosystem(): Promise<{ products: { slug: string; name: string; status: string; health: string }[] }> {
  return {
    products: [
      { slug: "browser", name: "Browser Control", status: "Active", health: "healthy" },
      { slug: "composio", name: "Composio Integration", status: "Active", health: "healthy" },
      { slug: "github", name: "GitHub Sync", status: "Active", health: "healthy" },
    ],
  };
}
