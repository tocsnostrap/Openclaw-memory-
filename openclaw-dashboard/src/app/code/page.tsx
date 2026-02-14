"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  GitBranch,
  GitCommit,
  Folder,
  ExternalLink,
  RefreshCw,
  Circle,
} from "lucide-react";

interface Repo {
  name: string;
  branch: string;
  lastCommit: string;
  dirty: number;
  language?: string;
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

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
};

export default function CodePage() {
  const [repos, setRepos] = useState<Repo[]>([]);

  // Demo repos for display
  const demoRepos: Repo[] = [
    {
      name: "openclaw-dashboard",
      branch: "main",
      lastCommit: "feat: Add dashboard components",
      dirty: 0,
      language: "TypeScript",
    },
    {
      name: "steel-playwright",
      branch: "main",
      lastCommit: "chore: Update dependencies",
      dirty: 2,
      language: "TypeScript",
    },
    {
      name: "polymarket-bot",
      branch: "develop",
      lastCommit: "feat: Add flash crash strategy",
      dirty: 1,
      language: "Python",
    },
  ];

  useEffect(() => {
    setRepos(demoRepos);
  }, []);

  return (
    <motion.div
      variants={staggerChildren}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Code</h1>
          <p className="text-muted-foreground text-sm">Code pipeline & repositories</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Repositories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-primary" />
                        <h4 className="font-medium truncate">{repo.name}</h4>
                      </div>
                      {repo.dirty > 0 && (
                        <Badge variant="warning">{repo.dirty} dirty</Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        <span>{repo.branch}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GitCommit className="w-3 h-3" />
                        <span className="truncate">{repo.lastCommit}</span>
                      </div>
                      {repo.language && (
                        <div className="flex items-center gap-2">
                          <Circle
                            className="w-2 h-2 fill-current"
                            style={{ color: languageColors[repo.language] || "gray" }}
                          />
                          <span className="text-muted-foreground">{repo.language}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end mt-3 pt-3 border-t border-white/5">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{repos.length}</p>
            <p className="text-xs text-muted-foreground">Repositories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">
              {repos.filter((r) => r.branch === "main").length}
            </p>
            <p className="text-xs text-muted-foreground">On Main</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-warning">
              {repos.reduce((acc, r) => acc + r.dirty, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Dirty Files</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">2</p>
            <p className="text-xs text-muted-foreground">Languages</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
