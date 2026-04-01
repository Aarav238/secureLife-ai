"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PipelineBoard } from "@/components/dashboard/PipelineBoard";
import { Card, CardContent } from "@/components/ui/card";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  primaryInterest: string | null;
  status: string;
  qualificationScore: number | null;
  source: string | null;
  createdAt: string;
  documents: { id: string }[];
  analysis: { id: string; overallScore: number | null } | null;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(
    (l) => !["NEW", "QUALIFYING"].includes(l.status)
  ).length;
  const closedWon = leads.filter((l) => l.status === "CLOSED_WON").length;
  const avgScore =
    leads.filter((l) => l.qualificationScore != null).length > 0
      ? Math.round(
          leads
            .filter((l) => l.qualificationScore != null)
            .reduce((sum, l) => sum + (l.qualificationScore || 0), 0) /
            leads.filter((l) => l.qualificationScore != null).length
        )
      : 0;

  const statCards = [
    {
      label: "Total Leads",
      value: totalLeads,
      textColor: "text-slate-800",
      bgColor: "bg-slate-100",
      borderColor: "border-l-slate-400",
      iconColor: "text-slate-600",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Qualified",
      value: qualifiedLeads,
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-l-indigo-500",
      iconColor: "text-indigo-600",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Closed Won",
      value: closedWon,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-l-emerald-500",
      iconColor: "text-emerald-600",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: "Avg Score",
      value: avgScore,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-l-amber-500",
      iconColor: "text-amber-600",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Pipeline Overview
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage and track your insurance leads
              </p>
            </div>

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Chat
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map((stat) => (
              <Card
                key={stat.label}
                className={`border-l-4 ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
              >
                <CardContent className="flex items-center gap-4 py-5 px-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.bgColor} ${stat.iconColor}`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-0.5 ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pipeline Board */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg
                className="animate-spin h-8 w-8 text-indigo-500 mb-4"
                viewBox="0 0 24 24"
                fill="none"
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
              <p className="text-sm font-medium text-slate-400">
                Loading leads...
              </p>
            </div>
          ) : leads.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 px-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-5">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" y1="10" x2="15" y2="10" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-slate-700 mb-1">
                  No leads yet
                </p>
                <p className="text-sm text-slate-400 mb-6 text-center max-w-sm">
                  Start a conversation in the chat to create and qualify your
                  first insurance lead.
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Start a Chat
                </Link>
              </CardContent>
            </Card>
          ) : (
            <PipelineBoard leads={leads} />
          )}
        </div>
      </main>
    </div>
  );
}
