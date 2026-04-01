"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  primaryInterest: string | null;
  status: string;
  qualificationScore: number | null;
  source: string | null;
  createdAt: string;
  documents: { id: string }[];
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "QUALIFYING", label: "Qualifying" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "DOCUMENTS_PENDING", label: "Docs Pending" },
  { value: "DOCUMENTS_UPLOADED", label: "Docs Uploaded" },
  { value: "ANALYSIS_READY", label: "Analysis Ready" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "CLOSED_WON", label: "Won" },
  { value: "CLOSED_LOST", label: "Lost" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.primaryInterest?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                All Leads
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {filtered.length} lead{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
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
              New Chat
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                placeholder="Search by name, email, or interest..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
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
              <p className="text-sm text-slate-400">Loading leads...</p>
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <svg
                  className="w-12 h-12 text-slate-300 mb-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-sm text-slate-500">No leads match your filters</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Name
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Contact
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Interest
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Score
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Docs
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="font-medium text-slate-800 hover:text-indigo-600 transition-colors"
                          >
                            {lead.name || "Unknown Lead"}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {lead.email || lead.phone || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {lead.primaryInterest || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          {lead.qualificationScore != null ? (
                            <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {lead.qualificationScore}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 tabular-nums">
                          {lead.documents.length}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs tabular-nums">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
