"use client";

import { useEffect, useState, use } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LeadDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  age: number | null;
  city: string | null;
  occupation: string | null;
  status: string;
  qualificationScore: number | null;
  monthlyBudget: number | null;
  existingPolicies: number | null;
  primaryInterest: string | null;
  urgency: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
  conversations: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    processingStatus: string;
    documentType: string | null;
    provider: string | null;
    coverageAmount: number | null;
    premiumAmount: number | null;
    policyNumber: string | null;
    extractedData: Record<string, unknown> | null;
  }>;
  analysis: {
    id: string;
    summary: string;
    coverageGaps: Array<{
      area: string;
      description: string;
      severity: string;
    }>;
    potentialSavings: Array<{
      area: string;
      estimatedSaving: string;
      description: string;
    }>;
    riskFlags: Array<{
      flag: string;
      severity: string;
      description: string;
    }>;
    recommendations: Array<{
      action: string;
      priority: string;
      rationale: string;
    }>;
    overallScore: number | null;
  } | null;
}

const STATUSES = [
  "NEW",
  "QUALIFYING",
  "QUALIFIED",
  "DOCUMENTS_PENDING",
  "DOCUMENTS_UPLOADED",
  "ANALYSIS_READY",
  "REVIEWED",
  "CLOSED_WON",
  "CLOSED_LOST",
];

/* ------------------------------------------------------------------ */
/*  Inline SVG icon components                                        */
/* ------------------------------------------------------------------ */

function IconArrowLeft({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
      />
    </svg>
  );
}

function IconMail({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

function IconPhone({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

function IconUser({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

function IconMapPin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

function IconBriefcase({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function IconShield({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

function IconCurrency({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
      />
    </svg>
  );
}

function IconDocument({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function IconClock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function IconTarget({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function IconChart({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    </svg>
  );
}

function IconChat({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
      />
    </svg>
  );
}

function IconUpload({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function IconBot({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

function IconSpinner({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-spin`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Info field helper                                                  */
/* ------------------------------------------------------------------ */

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">
          {value != null && value !== "" ? String(value) : (
            <span className="text-slate-400 font-normal">&mdash;</span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score ring component                                               */
/* ------------------------------------------------------------------ */

function ScoreRing({
  score,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "text-indigo-500",
}: {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800">{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          / {max}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      setLead(data);
    } catch (err) {
      console.error("Failed to fetch lead:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const deleteLead = async () => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    } finally {
      setDeleting(false);
    }
  };

  const updateStatus = async (newStatus: string | null) => {
    if (!newStatus) return;
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLead();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <IconSpinner className="w-8 h-8 text-indigo-500" />
            <p className="text-sm text-slate-400 font-medium">
              Loading lead details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* Not found state */
  if (!lead) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <IconUser className="w-6 h-6 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700">
              Lead not found
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              The lead you are looking for does not exist or has been removed.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="mt-4">
                <IconArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {/* ── Header ────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
                >
                  <IconArrowLeft className="w-4 h-4" />
                </Button>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
                    {lead.name || "Unknown Lead"}
                  </h1>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Created{" "}
                  {new Date(lead.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  via{" "}
                  <span className="font-medium text-slate-600">
                    {lead.source || "unknown"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={lead.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-52 bg-white shadow-sm cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={deleteLead}
                  disabled={deleting}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 shrink-0 cursor-pointer"
                  title="Delete lead"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* ── 3-column grid ─────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ── Left column (2/3) ──────────────────────────── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Lead Information Card */}
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                    <IconUser className="w-4 h-4 text-indigo-500" />
                    Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-x-8 md:grid-cols-3 lg:grid-cols-4">
                    <InfoField
                      icon={<IconMail className="w-4 h-4" />}
                      label="Email"
                      value={lead.email}
                    />
                    <InfoField
                      icon={<IconPhone className="w-4 h-4" />}
                      label="Phone"
                      value={lead.phone}
                    />
                    <InfoField
                      icon={<IconUser className="w-4 h-4" />}
                      label="Age"
                      value={lead.age}
                    />
                    <InfoField
                      icon={<IconMapPin className="w-4 h-4" />}
                      label="City"
                      value={lead.city}
                    />
                    <InfoField
                      icon={<IconBriefcase className="w-4 h-4" />}
                      label="Occupation"
                      value={lead.occupation}
                    />
                    <InfoField
                      icon={<IconShield className="w-4 h-4" />}
                      label="Primary Interest"
                      value={lead.primaryInterest}
                    />
                    <InfoField
                      icon={<IconCurrency className="w-4 h-4" />}
                      label="Monthly Budget"
                      value={
                        lead.monthlyBudget != null
                          ? `₹${lead.monthlyBudget.toLocaleString("en-IN")}`
                          : null
                      }
                    />
                    <InfoField
                      icon={<IconDocument className="w-4 h-4" />}
                      label="Existing Policies"
                      value={lead.existingPolicies}
                    />
                    <InfoField
                      icon={<IconClock className="w-4 h-4" />}
                      label="Urgency"
                      value={lead.urgency}
                    />
                    <InfoField
                      icon={<IconTarget className="w-4 h-4" />}
                      label="Qualification Score"
                      value={
                        lead.qualificationScore != null
                          ? `${lead.qualificationScore} / 100`
                          : null
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="conversation">
                <TabsList className="bg-white border border-slate-200/80 shadow-sm">
                  <TabsTrigger
                    value="conversation"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 cursor-pointer"
                  >
                    <IconChat className="w-4 h-4 mr-1.5" />
                    Conversation ({lead.conversations.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 cursor-pointer"
                  >
                    <IconDocument className="w-4 h-4 mr-1.5" />
                    Documents ({lead.documents.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="analysis"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 cursor-pointer"
                  >
                    <IconChart className="w-4 h-4 mr-1.5" />
                    Analysis
                  </TabsTrigger>
                </TabsList>

                {/* Conversation tab */}
                <TabsContent value="conversation" className="mt-4">
                  <Card className="border-slate-200/80 shadow-sm">
                    <CardContent className="p-0">
                      <ScrollArea className="max-h-[560px]">
                        {lead.conversations.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                              <IconChat className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="mt-3 text-sm font-medium text-slate-500">
                              No conversation yet
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Messages will appear here once the lead starts
                              chatting.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {lead.conversations.map((msg) => (
                              <div
                                key={msg.id}
                                className="group px-5 py-4 transition-colors hover:bg-slate-50/50"
                              >
                                <div className="flex items-center gap-2.5 mb-2">
                                  {msg.role === "user" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                      <IconUser className="w-3 h-3" />
                                      Lead
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                                      <IconBot className="w-3 h-3" />
                                      AI Advisor
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(msg.createdAt).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap pl-[2px]">
                                  {msg.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents tab */}
                <TabsContent value="documents" className="mt-4">
                  <DocumentUpload
                    leadId={lead.id}
                    documents={lead.documents}
                    onUpload={fetchLead}
                  />
                </TabsContent>

                {/* Analysis tab */}
                <TabsContent value="analysis" className="mt-4">
                  <AnalysisPanel
                    leadId={lead.id}
                    analysis={lead.analysis}
                    hasDocuments={lead.documents.some(
                      (d) => d.processingStatus === "completed"
                    )}
                    onAnalysisGenerated={fetchLead}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Right column (1/3) ─────────────────────────── */}
            <div className="space-y-5">
              {/* Quick Actions */}
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Link href="/chat" className="block">
                    <Button
                      className="w-full justify-start gap-2.5 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
                      size="sm"
                    >
                      <IconChat className="w-4 h-4" />
                      Start Chat
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 shadow-sm cursor-pointer"
                    size="sm"
                    onClick={() => {
                      const tabEl = document.querySelector(
                        '[data-state][value="documents"]'
                      ) as HTMLElement | null;
                      tabEl?.click();
                      document
                        .querySelector('[value="documents"]')
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <IconUpload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>

              {/* Qualification Score */}
              {lead.qualificationScore != null && (
                <Card className="border-slate-200/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <IconTarget className="w-4 h-4 text-indigo-500" />
                      Qualification Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center py-2">
                      <ScoreRing
                        score={lead.qualificationScore}
                        color="text-indigo-500"
                      />
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      {lead.urgency && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-500">
                            <IconClock className="w-3.5 h-3.5" />
                            Urgency
                          </span>
                          <span className="font-medium capitalize text-slate-700">
                            {lead.urgency}
                          </span>
                        </div>
                      )}
                      {lead.existingPolicies != null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-500">
                            <IconDocument className="w-3.5 h-3.5" />
                            Existing Policies
                          </span>
                          <span className="font-medium text-slate-700">
                            {lead.existingPolicies}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Insurance Score */}
              {lead.analysis?.overallScore != null && (
                <Card className="border-slate-200/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <IconShield className="w-4 h-4 text-emerald-500" />
                      Insurance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center py-2">
                      <ScoreRing
                        score={lead.analysis.overallScore}
                        color="text-emerald-500"
                      />
                    </div>
                    <p className="mt-2 text-center text-xs text-slate-400">
                      Overall Insurance Health
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {lead.notes && (
                <Card className="border-slate-200/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {lead.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
