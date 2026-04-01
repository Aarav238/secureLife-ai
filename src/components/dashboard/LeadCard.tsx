"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import Link from "next/link";

interface LeadCardProps {
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    primaryInterest: string | null;
    status: string;
    qualificationScore: number | null;
    source: string | null;
    createdAt: string;
    documents: { id: string }[];
  };
}

const STATUS_ACCENT: Record<string, string> = {
  NEW: "border-l-slate-400",
  QUALIFYING: "border-l-blue-400",
  QUALIFIED: "border-l-indigo-500",
  DOCUMENTS_PENDING: "border-l-amber-400",
  DOCUMENTS_UPLOADED: "border-l-teal-400",
  ANALYSIS_READY: "border-l-emerald-500",
  REVIEWED: "border-l-purple-500",
  CLOSED_WON: "border-l-green-500",
  CLOSED_LOST: "border-l-red-400",
};

export function LeadCard({ lead }: LeadCardProps) {
  const accentClass = STATUS_ACCENT[lead.status] || "border-l-slate-300";

  return (
    <Link href={`/dashboard/leads/${lead.id}`} className="block group relative">
      <Card
        className={`border border-slate-200/80 border-l-[3px] ${accentClass} bg-white transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer group-hover:translate-y-[-1px] transition-transform`}
      >
        {/* Delete button - visible on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!confirm("Are you sure you want to delete this lead?")) return;
            fetch(`/api/leads/${lead.id}`, { method: "DELETE" }).then((res) => {
              if (res.ok) window.location.reload();
            });
          }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity duration-150
            bg-white border border-slate-200 text-slate-400
            hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
          title="Delete lead"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <CardContent className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-[13px] text-slate-800 truncate leading-snug">
              {lead.name || "Unknown Lead"}
            </h3>
            <StatusBadge status={lead.status} />
          </div>

          {lead.email && (
            <p className="text-xs text-slate-500 truncate mb-2">{lead.email}</p>
          )}

          {lead.primaryInterest && (
            <div className="flex items-center gap-1.5 mb-3">
              <svg
                className="w-3 h-3 text-slate-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
              <span className="text-xs text-slate-600 truncate">
                {lead.primaryInterest}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {lead.qualificationScore != null && (
                <span className="inline-flex items-center text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {lead.qualificationScore}
                </span>
              )}
              {lead.documents.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <svg
                    className="w-3 h-3 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  {lead.documents.length}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 tabular-nums">
              {new Date(lead.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
