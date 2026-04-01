"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; dotColor: string; className: string }> = {
  NEW: {
    label: "New",
    dotColor: "bg-slate-400",
    className: "border-slate-200 text-slate-600",
  },
  QUALIFYING: {
    label: "Qualifying",
    dotColor: "bg-blue-500",
    className: "border-blue-200 text-blue-700",
  },
  QUALIFIED: {
    label: "Qualified",
    dotColor: "bg-indigo-500",
    className: "border-indigo-200 text-indigo-700",
  },
  DOCUMENTS_PENDING: {
    label: "Docs Pending",
    dotColor: "bg-amber-500",
    className: "border-amber-200 text-amber-700",
  },
  DOCUMENTS_UPLOADED: {
    label: "Docs Uploaded",
    dotColor: "bg-teal-500",
    className: "border-teal-200 text-teal-700",
  },
  ANALYSIS_READY: {
    label: "Analysis Ready",
    dotColor: "bg-emerald-500",
    className: "border-emerald-200 text-emerald-700",
  },
  REVIEWED: {
    label: "Reviewed",
    dotColor: "bg-purple-500",
    className: "border-purple-200 text-purple-700",
  },
  CLOSED_WON: {
    label: "Won",
    dotColor: "bg-green-500",
    className: "border-green-200 text-green-800",
  },
  CLOSED_LOST: {
    label: "Lost",
    dotColor: "bg-red-500",
    className: "border-red-200 text-red-700",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.NEW;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium inline-flex items-center gap-1.5",
        config.className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </Badge>
  );
}
