"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabBar } from "@/components/ui/tab-bar";
import { formatRelativeTime } from "@/lib/utils";
import {
  Mail,
  Users,
  MessageSquare,
  Bell,
  Phone,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  status: string;
  contacts: { name: string; email?: string; phone?: string }[];
  lastInteraction?: string;
  nextAction?: string;
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

const statusColumns = [
  { id: "prospect", label: "Prospect", color: "bg-white/10" },
  { id: "contacted", label: "Contacted", color: "bg-blue-500/20" },
  { id: "meeting", label: "Meeting", color: "bg-purple-500/20" },
  { id: "proposal", label: "Proposal", color: "bg-warning/20" },
  { id: "active", label: "Active", color: "bg-success/20" },
];

export default function CommsPage() {
  const [activeTab, setActiveTab] = useState("comms");
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const tabs = [
    { id: "comms", label: "Comms", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "crm", label: "CRM", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  const getClientsByStatus = (status: string) =>
    clients.filter((client) => client.status === status);

  const recentMessages = [
    { from: "Telegram", message: "Check the BTC chart", time: "5m ago" },
    { from: "Discord", message: "Thanks for the update!", time: "1h ago" },
    { from: "Telegram", message: "Polymarket briefing received", time: "2h ago" },
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
          <h1 className="text-2xl font-semibold tracking-tight">Comms</h1>
          <p className="text-muted-foreground text-sm">Communications & CRM</p>
        </div>
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "comms" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Messages */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMessages.map((msg, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{msg.from}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-sm truncate">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm">System healthy</span>
                    <span className="text-xs text-muted-foreground ml-auto">Now</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-sm">Cron job completed</span>
                    <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">New chat message</span>
                    <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {activeTab === "crm" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Client Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="flex gap-3 min-w-max pb-4">
                  {statusColumns.map((column) => (
                    <div key={column.id} className="w-48 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase">
                          {column.label}
                        </h3>
                        <Badge variant="secondary">
                          {getClientsByStatus(column.id).length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {getClientsByStatus(column.id).map((client) => (
                          <Card key={client.id} className="cursor-pointer hover:border-primary/30">
                            <CardContent className="p-3">
                              <h4 className="text-sm font-medium truncate">{client.name}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                {client.contacts[0] && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {getClientsByStatus(column.id).length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">No clients</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
