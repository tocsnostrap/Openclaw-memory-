"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import {
  FileText,
  Check,
  X,
  Eye,
  Edit,
  Plus,
  Clock,
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  status: "draft" | "review" | "approved" | "published";
  preview: string;
  createdAt: string;
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
  { id: "draft", label: "Draft", color: "bg-white/10" },
  { id: "review", label: "Review", color: "bg-warning/20" },
  { id: "approved", label: "Approved", color: "bg-primary/20" },
  { id: "published", label: "Published", color: "bg-success/20" },
];

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content-pipeline");
      const data = await res.json();
      setContent(data.items || []);
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  };

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, 15000);
    return () => clearInterval(interval);
  }, []);

  const getContentByStatus = (status: string) =>
    content.filter((item) => item.status === status);

  return (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
          <p className="text-muted-foreground text-sm">Content pipeline management</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          New Draft
        </Button>
      </div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusColumns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground uppercase">
                  {column.label}
                </h3>
                <Badge variant="secondary">
                  {getContentByStatus(column.id).length}
                </Badge>
              </div>
              <div className="space-y-2">
                {getContentByStatus(column.id).map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:border-primary/30">
                    <CardContent className="p-3">
                      <h4 className="text-sm font-medium truncate">{item.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{item.platform}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      {column.id === "review" && (
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-success">
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-error">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
