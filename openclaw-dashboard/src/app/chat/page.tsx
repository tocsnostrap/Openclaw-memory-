"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabBar } from "@/components/ui/tab-bar";
import { formatRelativeTime, cn } from "@/lib/utils";
import {
  MessageSquare,
  Terminal,
  Send,
  Mic,
  Hash,
  AtSign,
  Globe,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  channel: "telegram" | "discord" | "webchat";
  timestamp: string;
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

const channelIcons = {
  telegram: <AtSign className="w-3 h-3" />,
  discord: <Hash className="w-3 h-3" />,
  webchat: <Globe className="w-3 h-3" />,
};

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat-history?limit=50");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      await fetch("/api/chat-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      setInput("");
      await fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const tabs = [
    { id: "chat", label: "Chat", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "command", label: "Command", icon: <Terminal className="w-3.5 h-3.5" /> },
  ];

  const commands = [
    { cmd: "/status", desc: "System status" },
    { cmd: "/agents", desc: "List agents" },
    { cmd: "/reload", desc: "Reload config" },
    { cmd: "/memory", desc: "Search memory" },
    { cmd: "/health", desc: "Health check" },
  ];

  return (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="show"
      className="h-[calc(100vh-8rem)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
          <p className="text-muted-foreground text-sm">Communicate with your agent</p>
        </div>
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100%-4rem)]">
          {/* Sessions Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <button className="w-full p-2 rounded-lg bg-primary/10 text-left text-sm flex items-center gap-2">
                  <AtSign className="w-3.5 h-3.5 text-primary" />
                  Telegram
                </button>
                <button className="w-full p-2 rounded-lg text-left text-sm text-muted-foreground hover:bg-white/5 flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  Discord
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Area */}
          <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-white/10 rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={cn(
                            "flex items-center gap-2 mt-1 text-[10px]",
                            msg.role === "user" ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                          )}
                        >
                          {channelIcons[msg.channel]}
                          <span>{formatRelativeTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">No messages yet</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                  <Button size="icon" variant="ghost">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button size="icon" onClick={sendMessage} disabled={isSending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {activeTab === "command" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Quick Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {commands.map((cmd) => (
                  <button
                    key={cmd.cmd}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-primary">{cmd.cmd}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{cmd.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
