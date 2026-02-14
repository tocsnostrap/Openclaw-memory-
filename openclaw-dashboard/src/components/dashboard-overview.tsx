"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot, StatusBadge } from "@/components/ui/status";
import { formatRelativeTime, formatCurrency, cn } from "@/lib/utils";
import {
  Server,
  Activity,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

interface SystemState {
  servers: { name: string; status: string; port: number; lastCheck: string }[];
  branch: string | null;
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

interface Revenue {
  current: number;
  monthlyBurn: number;
  net: number;
}

interface ContentItem {
  id: string;
  status: string;
}

const staggerChildren = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function DashboardOverview() {
  // Hardcoded data for now - working on API integration
  const systemState = {
    servers: [
      { name: "Gateway", status: "up", port: 18789, lastCheck: new Date().toISOString() },
      { name: "Browser", status: "up", port: 9222, lastCheck: new Date().toISOString() },
    ],
    branch: "main",
    sessions: 2,
    agents: 1,
    crons: 2,
  };
  
  const cronJobs = [
    {
      id: "1",
      name: "GitHub Push Hourly",
      schedule: "0 * * * *",
      status: "idle",
      lastRun: new Date().toISOString(),
      lastStatus: "success",
      consecutiveErrors: 0,
    },
    {
      id: "2",
      name: "Polymarket Report",
      schedule: "0 6 * * *",
      status: "idle",
      lastRun: "2026-02-14T06:00:00Z",
      lastStatus: "success",
      consecutiveErrors: 0,
    },
  ];
  
  const revenue = { current: 0, monthlyBurn: 0, net: 0 };
  const content: ContentItem[] = [];
  const lastUpdate = new Date();

  const healthyServers = systemState?.servers?.filter(s => s.status === "up").length || 0;
  const totalServers = systemState?.servers?.length || 0;
  const healthyCrons = cronJobs.filter(c => c.status === "running").length;
  const failedCrons = cronJobs.filter(c => c.consecutiveErrors > 0).length;
  const draftCount = content.filter(c => c.status === "draft").length;
  const reviewCount = content.filter(c => c.status === "review").length;
  const approvedCount = content.filter(c => c.status === "approved").length;
  const publishedCount = content.filter(c => c.status === "published").length;

  return (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground text-sm">OpenClaw AI Agent System</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3.5 h-3.5" />
          <span>AUTO 15S</span>
          <span>•</span>
          <span>Updated {formatRelativeTime(lastUpdate)}</span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div variants={itemVariants}>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Server className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Servers</p>
                <p className="text-lg font-semibold">2/2</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success/10">
                <Activity className="w-3.5 h-3.5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Crons</p>
                <p className="text-lg font-semibold">2/2</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <FileText className="w-3.5 h-3.5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Content</p>
                <p className="text-lg font-semibold">{approvedCount + publishedCount}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-error/10">
                <DollarSign className="w-3.5 h-3.5 text-error" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-semibold">{formatCurrency(revenue?.current || 0)}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* System Health */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemState?.servers?.length ? (
                <div className="space-y-2">
                  {systemState.servers.map((server, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <StatusDot
                          status={server.status === "up" ? "healthy" : "unhealthy"}
                          pulse={server.status === "up"}
                        />
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
                <p className="text-sm text-muted-foreground">No server data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cron Jobs */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Cron Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cronJobs.length ? (
                <div className="space-y-2">
                  {cronJobs.slice(0, 5).map((job, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <StatusDot
                          status={job.consecutiveErrors > 0 ? "unhealthy" : job.status === "running" ? "healthy" : "warning"}
                          pulse={job.status === "running"}
                        />
                        <span className="text-sm truncate max-w-[150px]">{job.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.consecutiveErrors > 0 && (
                          <AlertCircle className="w-3.5 h-3.5 text-error" />
                        )}
                        <span className="text-xs text-muted-foreground font-mono">{job.schedule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No cron jobs</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <span className="text-xl font-semibold text-success">
                    {formatCurrency(revenue?.current || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Burn</span>
                  <span className="text-lg font-medium text-warning">
                    {formatCurrency(revenue?.monthlyBurn || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-sm text-muted-foreground">Net</span>
                  <span className={cn(
                    "text-lg font-semibold",
                    (revenue?.net || 0) >= 0 ? "text-success" : "text-error"
                  )}>
                    {formatCurrency(revenue?.net || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Pipeline */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Content Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-semibold">{draftCount}</p>
                  <p className="text-xs text-muted-foreground">Draft</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 text-center">
                  <p className="text-2xl font-semibold text-warning">{reviewCount}</p>
                  <p className="text-xs text-muted-foreground">Review</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-center">
                  <p className="text-2xl font-semibold text-primary">{approvedCount}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10 text-center">
                  <p className="text-2xl font-semibold text-success">{publishedCount}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                  View Agents
                </button>
                <button className="p-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                  Open Chat
                </button>
                <button className="p-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                  Check Tasks
                </button>
                <button className="p-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                  View Code
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
