"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabBar } from "@/components/ui/tab-bar";
import {
  Search,
  BookOpen,
  Grid3X3,
  ExternalLink,
  FileText,
  Package,
} from "lucide-react";

interface SearchResult {
  file: string;
  content: string;
}

interface EcosystemProduct {
  slug: string;
  name: string;
  status: string;
  health: string;
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

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("knowledge");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [ecosystem, setEcosystem] = useState<EcosystemProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const tabs = [
    { id: "knowledge", label: "Knowledge", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "ecosystem", label: "Ecosystem", icon: <Grid3X3 className="w-3.5 h-3.5" /> },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/knowledge?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const fetchEcosystem = async () => {
      try {
        // This would need an API endpoint
        setEcosystem([]);
      } catch (error) {
        console.error("Failed to fetch ecosystem:", error);
      }
    };
    fetchEcosystem();
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
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge</h1>
          <p className="text-muted-foreground text-sm">Knowledge base & ecosystem</p>
        </div>
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "knowledge" && (
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search knowledge base..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((result, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{result.file}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">No results found</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {activeTab === "ecosystem" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products & Apps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ecosystem.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ecosystem.map((product) => (
                    <Card key={product.slug} className="cursor-pointer hover:border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{product.name}</h4>
                          <Badge
                            variant={product.status === "Active" ? "success" : "secondary"}
                          >
                            {product.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{product.health}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Grid3X3 className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground">No ecosystem products found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Products will appear when memory files are created
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
