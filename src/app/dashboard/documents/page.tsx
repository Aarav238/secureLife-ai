"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocWithLead {
  id: string;
  leadId: string;
  fileName: string;
  processingStatus: string;
  documentType: string | null;
  provider: string | null;
  coverageAmount: number | null;
  premiumAmount: number | null;
  policyNumber: string | null;
  createdAt: string;
  lead: { id: string; name: string | null };
}

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string; borderColor: string }> = {
  pending: { label: "Pending", dotColor: "bg-amber-500", textColor: "text-amber-700", borderColor: "border-amber-200" },
  processing: { label: "Processing", dotColor: "bg-blue-500", textColor: "text-blue-700", borderColor: "border-blue-200" },
  completed: { label: "Completed", dotColor: "bg-green-500", textColor: "text-green-700", borderColor: "border-green-200" },
  failed: { label: "Failed", dotColor: "bg-red-500", textColor: "text-red-700", borderColor: "border-red-200" },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocWithLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Documents
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                All uploaded policy files across leads
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-slate-400">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <svg className="w-12 h-12 text-slate-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p className="text-lg font-semibold text-slate-700 mb-1">No documents yet</p>
                <p className="text-sm text-slate-400 mb-6 text-center max-w-sm">
                  Upload policy documents from a lead&apos;s detail page to see them here.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">File</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Lead</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Provider</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Policy #</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const status = statusConfig[doc.processingStatus] || statusConfig.pending;
                      return (
                        <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              <span className="font-medium text-slate-700 truncate max-w-[200px]">{doc.fileName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <Link href={`/dashboard/leads/${doc.leadId}`} className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                              {doc.lead?.name || "Unknown"}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{doc.documentType?.replace(/_/g, " ") || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-600">{doc.provider || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{doc.policyNumber || "—"}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="outline" className={cn("text-xs font-medium inline-flex items-center gap-1.5", status.textColor, status.borderColor)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", status.dotColor)} />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs tabular-nums">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
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
