"use client";

import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "healthy" | "unhealthy" | "warning" | "unknown";
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ status, pulse = false, className }: StatusDotProps) {
  const colors = {
    healthy: "bg-success",
    unhealthy: "bg-error",
    warning: "bg-warning",
    unknown: "bg-muted",
  };

  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full",
          colors[status]
        )}
      />
      {pulse && status === "healthy" && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full",
            colors[status],
            "animate-ping opacity-75"
          )}
        />
      )}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  let variant: "success" | "warning" | "destructive" | "secondary" = "secondary";

  if (["up", "active", "running", "healthy", "success", "approved"].some(s => normalized.includes(s))) {
    variant = "success";
  } else if (["down", "error", "failed", "unhealthy", "destructive"].some(s => normalized.includes(s))) {
    variant = "destructive";
  } else if (["warning", "degraded", "pending"].some(s => normalized.includes(s))) {
    variant = "warning";
  }

  const { Badge } = require("@/components/ui/badge");
  return (
    <Badge variant={variant} className={className}>
      <StatusDot status={variant === "success" ? "healthy" : variant === "destructive" ? "unhealthy" : "warning"} />
      <span className="ml-1.5 capitalize">{status}</span>
    </Badge>
  );
}
