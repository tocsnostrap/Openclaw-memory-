// Workspace API - reads from OpenClaw workspace filesystem
// Configure via WORKSPACE_PATH env var (default: ~/.openclaw/workspace/)

import fs from "fs";
import path from "path";

const DEFAULT_WORKSPACE = process.env.WORKSPACE_PATH || path.join(process.env.HOME || "/home/azureuser", ".openclaw", "workspace");

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
    const fullPath = path.join(DEFAULT_WORKSPACE, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return null;
}

function readMarkdownFile(filePath: string): string | null {
  try {
    const fullPath = path.join(DEFAULT_WORKSPACE, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return null;
}

function getDirectoryFiles(dirPath: string, extension?: string): string[] {
  try {
    const fullPath = path.join(DEFAULT_WORKSPACE, dirPath);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      if (extension) {
        return files.filter(f => f.endsWith(extension));
      }
      return files;
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }
  return [];
}

// API Route handlers
export async function getSystemState(): Promise<{ servers: Server[]; branch: string | null }> {
  const servers = readJsonFile<Server[]>("state/servers.json");
  const branchCheck = readJsonFile<{ branch: string }>("state/branch-check.json");
  return {
    servers: servers || [],
    branch: branchCheck?.branch || null,
  };
}

export async function getAgents(): Promise<Agent[]> {
  const registry = readJsonFile<{ agents: Agent[] }>("agents/registry.json");
  return registry?.agents || [];
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const agents = await getAgents();
  return agents.find(a => a.id === id) || null;
}

export async function getCronHealth(): Promise<{ jobs: CronJob[] }> {
  const crons = readJsonFile<CronJob[]>("state/crons.json");
  return { jobs: crons || [] };
}

export async function getRevenue(): Promise<RevenueData> {
  const revenue = readJsonFile<RevenueData>("state/revenue.json");
  return revenue || { current: 0, monthlyBurn: 0, net: 0, lastUpdated: new Date().toISOString() };
}

export async function getContentPipeline(): Promise<{ items: ContentItem[] }> {
  const queue = readMarkdownFile("content/queue.md");
  if (!queue) return { items: [] };
  
  // Parse markdown queue
  const items: ContentItem[] = [];
  const lines = queue.split("\n");
  let currentStatus: ContentItem["status"] = "draft";
  
  for (const line of lines) {
    if (line.includes("## Draft")) currentStatus = "draft";
    else if (line.includes("## Review")) currentStatus = "review";
    else if (line.includes("## Approved")) currentStatus = "approved";
    else if (line.includes("## Published")) currentStatus = "published";
    else if (line.startsWith("- ")) {
      items.push({
        id: items.length.toString(),
        title: line.slice(2),
        platform: "various",
        status: currentStatus,
        preview: "",
        createdAt: new Date().toISOString(),
      });
    }
  }
  
  return { items };
}

export async function getSuggestedTasks(): Promise<{ tasks: Task[] }> {
  const tasks = readJsonFile<Task[]>("state/suggested-tasks.json");
  return { tasks: tasks || [] };
}

export async function updateTaskStatus(taskId: string, status: Task["status"]): Promise<void> {
  const data = await getSuggestedTasks();
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    const fullPath = path.join(DEFAULT_WORKSPACE, "state/suggested-tasks.json");
    fs.writeFileSync(fullPath, JSON.stringify(data.tasks, null, 2));
  }
}

export async function getObservations(): Promise<string> {
  return readMarkdownFile("state/observations.md") || "No observations recorded.";
}

export async function getPriorities(): Promise<string> {
  return readMarkdownFile("shared-context/priorities.md") || "No priorities set.";
}

export async function getChatHistory(options?: { channel?: string; limit?: number }): Promise<{ messages: ChatMessage[] }> {
  const limit = options?.limit || 50;
  const sessionsDir = path.join(DEFAULT_WORKSPACE, "..", "agents", "main", "sessions");
  
  try {
    if (!fs.existsSync(sessionsDir)) return { messages: [] };
    
    const files = fs.readdirSync(sessionsDir)
      .filter(f => f.endsWith(".jsonl"))
      .sort()
      .slice(-10);
    
    const messages: ChatMessage[] = [];
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(sessionsDir, file), "utf-8");
      const lines = content.split("\n").filter(Boolean);
      
      for (const line of lines.slice(-20)) {
        try {
          const msg = JSON.parse(line);
          if (msg.role && msg.content) {
            messages.push({
              id: msg.id || Math.random().toString(),
              role: msg.role,
              content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
              channel: "telegram", // Would need proper detection
              timestamp: msg.timestamp || new Date().toISOString(),
            });
          }
        } catch {}
      }
    }
    
    return { messages: messages.slice(-limit) };
  } catch {
    return { messages: [] };
  }
}

export async function sendChatMessage(message: string): Promise<{ success: boolean }> {
  // Write to queue file that OpenClaw reads
  const queuePath = path.join(DEFAULT_WORKSPACE, "state", "message-queue.md");
  const timestamp = new Date().toISOString();
  const entry = `\n## ${timestamp}\n\n${message}\n`;
  
  try {
    fs.appendFileSync(queuePath, entry);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getClients(): Promise<{ clients: Client[] }> {
  const clientsDir = path.join(DEFAULT_WORKSPACE, "clients");
  const clients: Client[] = [];
  
  try {
    if (fs.existsSync(clientsDir)) {
      const files = fs.readdirSync(clientsDir).filter(f => f.endsWith(".md"));
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(clientsDir, file), "utf-8");
        const name = file.replace(".md", "");
        
        let status: Client["status"] = "prospect";
        if (content.includes("### Status")) {
          const match = content.match(/### Status\s*\n\s*(\w+)/);
          if (match) status = match[1] as Client["status"];
        }
        
        clients.push({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          status,
          contacts: [],
          lastInteraction: undefined,
          nextAction: undefined,
        });
      }
    }
  } catch (error) {
    console.error("Error reading clients:", error);
  }
  
  return { clients };
}

export async function getHealth(): Promise<{
  status: string;
  uptime: number;
  memoryUsage: number;
  workspace: string;
}> {
  const startTime = Date.now();
  
  return {
    status: "healthy",
    uptime: process.uptime() * 1000,
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    workspace: DEFAULT_WORKSPACE,
  };
}

export async function searchKnowledge(query: string): Promise<{ results: { file: string; content: string }[] }> {
  const results: { file: string; content: string }[] = [];
  const searchDir = DEFAULT_WORKSPACE;
  
  function searchFiles(dir: string, query: string, depth = 0) {
    if (depth > 3) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (item.startsWith(".")) continue;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchFiles(fullPath, query, depth + 1);
        } else if (stat.isFile() && (item.endsWith(".md") || item.endsWith(".txt") || item.endsWith(".json"))) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              file: path.relative(searchDir, fullPath),
              content: content.slice(0, 500),
            });
          }
        }
      }
    } catch {}
  }
  
  searchFiles(searchDir, query);
  return { results: results.slice(0, 10) };
}

export async function getEcosystem(): Promise<{ products: { slug: string; name: string; status: string; health: string }[] }> {
  const memoryDir = path.join(DEFAULT_WORKSPACE, "memory");
  const products: { slug: string; name: string; status: string; health: string }[] = [];
  
  // Read from memory files
  try {
    if (fs.existsSync(memoryDir)) {
      const files = fs.readdirSync(memoryDir).filter(f => f.endsWith(".md"));
      
      for (const file of files) {
        products.push({
          slug: file.replace(".md", ""),
          name: file.replace(".md", "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          status: "Active",
          health: "healthy",
        });
      }
    }
  } catch {}
  
  return { products };
}
