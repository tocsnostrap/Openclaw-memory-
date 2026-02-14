"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabBar } from "@/components/ui/tab-bar";
import { StatusDot } from "@/components/ui/status";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import {
  Server,
  GitBranch,
  ClipboardList,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

interface ServerData {
  name: string;
  status: string;
  port: number;
  lastCheck: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: string;
  lastRun?: string;
  lastStatus?: string;
  consecutiveErrors: number;
}

interface Task {
  id: string;
  title: string;
  category: string;
  reasoning: string;
  nextAction: string;
  priority: string;
  effort: string;
  status: string;
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

const categoryEmojis: Record<string, string> = {
  Revenue: "💰",
  Product: "🎯",
  Community: "👥",
  Content: "📝",
  Operations: "⚙️",
  Clients: "🤝",
  Trading: "📈",
  Brand: "✨",
};

export default function OpsPage() {
  const [activeTab, setActiveTab] = useState("operations");
  const [servers, setServers] = useState<ServerData[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [observations, setObservations] = useState("");
  const [priorities, setPriorities] = useState("");

  const fetchData = async () => {
    try {
      const [sysRes, cronRes, tasksRes, obsRes, priRes] = await Promise.all([
        fetch("/api/system-state"),
        fetch("/api/cron-health"),
        fetch("/api/suggested-tasks"),
        fetch("/api/observations"),
        fetch("/api/priorities"),
      ]);

      const sysData = await sysRes.json();
      const cronData = await cronRes.json();
      const tasksData = await tasksRes.json();
      const obsData = await obsRes.json();
      const priData = await priRes.json();

      setServers(sysData.servers || []);
      setCronJobs(cronData.jobs || []);
      setTasks(tasksData.tasks || []);
      setObservations(obsData.observations || "");
      setPriorities(priData.priorities || "");
    } catch (error) {
      console.error("Failed to fetch ops data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "operations", label: "Operations", icon: <Server className="w-3.5 h-3.5" /> },
    { id: "tasks", label: "Tasks", icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: "calendar", label: "Calendar", icon: <Calendar className="w-3.5 h-3.5" /> },
  ];

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
          <p className="text-muted-foreground text-sm">System monitoring & task management</p>
        </div>
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "operations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Server Health */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Server Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                {servers.length ? (
                  <div className="space-y-2">
                    {servers.map((server, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <StatusDot status={server.status === "up" ? "healthy" : "unhealthy"} pulse={server.status === "up"} />
                          <span className="text-sm">{server.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>:{server.port}</span>
                          <span>{formatRelativeTime(server.lastCheck)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No server data</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Branch Status */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Branch Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" />
                  <span className="text-sm">main</span>
                  <Badge variant="success">Current</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Observations */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {observations || "No observations recorded"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Priorities */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {priorities || "No priorities set"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {activeTab === "tasks" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Suggested Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedTasks).length ? (
                <div className="space-y-6">
                  {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <span>{categoryEmojis[category] || "📋"}</span>
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium">{task.title}</h4>
                              <div className="flex gap-1">
                                <Badge variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "warning" : "secondary"}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline">{task.effort}</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{task.reasoning}</p>
                            <p className="text-xs text-primary">{task.nextAction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No suggested tasks</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "calendar" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Weekly Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-xs text-muted-foreground mb-2">{day}</p>
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded bg-primary/30" />
                      <div className="h-1 w-full rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Calendar integration with Convex coming soon
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
