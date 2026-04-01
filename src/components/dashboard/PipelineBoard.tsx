"use client";

import { LeadCard } from "./LeadCard";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

const PIPELINE_COLUMNS = [
  { status: "NEW", label: "New", color: "bg-slate-400" },
  { status: "QUALIFYING", label: "Qualifying", color: "bg-blue-500" },
  { status: "QUALIFIED", label: "Qualified", color: "bg-indigo-500" },
  { status: "DOCUMENTS_PENDING", label: "Docs Pending", color: "bg-amber-500" },
  { status: "DOCUMENTS_UPLOADED", label: "Docs Uploaded", color: "bg-teal-500" },
  { status: "ANALYSIS_READY", label: "Analysis Ready", color: "bg-emerald-500" },
  { status: "REVIEWED", label: "Reviewed", color: "bg-purple-500" },
  { status: "CLOSED_WON", label: "Won", color: "bg-green-500" },
  { status: "CLOSED_LOST", label: "Lost", color: "bg-red-500" },
];

const KEY_STAGES = new Set(["NEW", "QUALIFYING", "QUALIFIED", "CLOSED_WON"]);

export function PipelineBoard({ leads }: { leads: Lead[] }) {
  const activeStatuses = new Set(leads.map((l) => l.status));
  const columnsToShow = PIPELINE_COLUMNS.filter(
    (col) => activeStatuses.has(col.status) || KEY_STAGES.has(col.status)
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1">
      {columnsToShow.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.status);
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-[300px] bg-white border border-slate-200/80 rounded-xl shadow-sm"
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2 h-2 rounded-full ${col.color} ring-2 ring-offset-1 ring-${col.color.replace("bg-", "")}/20`}
                />
                <h3 className="font-semibold text-sm text-slate-700 tracking-tight">
                  {col.label}
                </h3>
                <span className="ml-auto text-[11px] font-medium text-slate-500 bg-slate-100 min-w-[24px] text-center px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
            </div>
            <ScrollArea className="max-h-[calc(100vh-280px)]">
              <div className="p-2.5 space-y-2">
                {columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                {columnLeads.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <svg
                        className="w-4 h-4 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      No leads
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
