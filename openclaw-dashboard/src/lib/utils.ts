import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "healthy":
    case "up":
    case "active":
    case "running":
    case "success":
      return "text-success";
    case "unhealthy":
    case "down":
    case "error":
    case "failed":
      return "text-error";
    case "warning":
    case "pending":
    case "degraded":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status.toLowerCase()) {
    case "healthy":
    case "up":
    case "active":
    case "running":
    case "success":
      return "bg-success/20 text-success";
    case "unhealthy":
    case "down":
    case "error":
    case "failed":
      return "bg-error/20 text-error";
    case "warning":
    case "pending":
    case "degraded":
      return "bg-warning/20 text-warning";
    default:
      return "bg-muted text-muted-foreground";
  }
}
