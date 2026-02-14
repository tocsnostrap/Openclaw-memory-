"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabBar } from "@/components/ui/tab-bar";
import { StatusDot } from "@/components/ui/status";
import {
  Bot,
  Brain,
  Cpu,
  Zap,
  ChevronRight,
  User,
  Settings,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  level: string;
  status: string;
  personality?: string;
  capabilities?: string[];
  rules?: string[];
}

interface Model {
  id: string;
  name: string;
  provider: string;
  costPer1k: number;
  context: number;
  routing: string;
}

const staggerChildren = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const levelColors: Record<string, string> = {
  L1: "bg-blue-500/20 text-blue-400",
  L2: "bg-purple-500/20 text-purple-400",
  L3: "bg-orange-500/20 text-orange-400",
  L4: "bg-red-500/20 text-red-400",
};

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState("agents");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 15000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "agents", label: "Agents", icon: <Bot className="w-3.5 h-3.5" /> },
    { id: "models", label: "Models", icon: <Brain className="w-3.5 h-3.5" /> },
  ];

  const models: Model[] = [
    { id: "minimax-m2.5", name: "MiniMax M2.5", provider: "OpenRouter", costPer1k: 0.2, context: 200000, routing: "default" },
    { id: "claude-3.5", name: "Claude 3.5", provider: "Anthropic", costPer1k: 3.0, context: 200000, routing: "reasoning" },
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", costPer1k: 2.5, context: 128000, routing: "general" },
    { id: "gemini-pro", name: "Gemini Pro", provider: "Google", costPer1k: 0.125, context: 1000000, routing: "fast" },
  ];

  return (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="text-muted-foreground text-sm">Agent registry & model inventory</p>
        </div>
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.length ? (
            agents.map((agent) => (
              <motion.div key={agent.id} variants={itemVariants}>
                <Card
                  className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{agent.name}</h3>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <StatusDot
                        status={agent.status === "active" ? "healthy" : agent.status === "error" ? "unhealthy" : "warning"}
                        pulse={agent.status === "active"}
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className={levelColors[agent.level] || ""}>
                        {agent.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{agent.model}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {agent.status}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-8 text-center">
                  <Bot className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground">No agents registered</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agents will appear when OpenClaw is running
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === "models" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Model Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Model</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Provider</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Cost/1k</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Context</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Routing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{model.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{model.provider}</td>
                        <td className="py-3 px-4 text-sm">${model.costPer1k.toFixed(3)}</td>
                        <td className="py-3 px-4 text-sm">{(model.context / 1000).toFixed(0)}K</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{model.routing}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    {selectedAgent.name}
                  </CardTitle>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Role</h4>
                  <p className="text-sm">{selectedAgent.role}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedAgent.model}</Badge>
                  <Badge variant="secondary">{selectedAgent.level}</Badge>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    <StatusDot
                      status={selectedAgent.status === "active" ? "healthy" : "warning"}
                      pulse={selectedAgent.status === "active"}
                    />
                    <span className="text-sm capitalize">{selectedAgent.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
