"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Analysis {
  id: string;
  summary: string;
  coverageGaps: Array<{ area: string; description: string; severity: string }>;
  potentialSavings: Array<{
    area: string;
    estimatedSaving: string;
    description: string;
  }>;
  riskFlags: Array<{ flag: string; severity: string; description: string }>;
  recommendations: Array<{
    action: string;
    priority: string;
    rationale: string;
  }>;
  overallScore: number | null;
}

interface AnalysisPanelProps {
  leadId: string;
  analysis: Analysis | null;
  hasDocuments: boolean;
  onAnalysisGenerated: () => void;
}

const severityConfig: Record<string, { dotColor: string; textColor: string; borderColor: string; leftBorder: string }> = {
  low: {
    dotColor: "bg-blue-500",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    leftBorder: "border-l-blue-400",
  },
  medium: {
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    leftBorder: "border-l-amber-400",
  },
  high: {
    dotColor: "bg-orange-500",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    leftBorder: "border-l-orange-400",
  },
  critical: {
    dotColor: "bg-red-500",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    leftBorder: "border-l-red-500",
  },
};

const priorityConfig: Record<string, { dotColor: string; textColor: string; borderColor: string }> = {
  immediate: {
    dotColor: "bg-red-500",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  "short-term": {
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  "long-term": {
    dotColor: "bg-blue-500",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
};

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "stroke-emerald-500", text: "text-emerald-600" };
    if (s >= 60) return { stroke: "stroke-blue-500", text: "text-blue-600" };
    if (s >= 40) return { stroke: "stroke-amber-500", text: "text-amber-600" };
    return { stroke: "stroke-red-500", text: "text-red-600" };
  };

  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-100"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", color.stroke)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", color.text)}>{score}</span>
        <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity, config }: {
  severity: string;
  config: Record<string, { dotColor: string; textColor: string; borderColor: string }>;
}) {
  const c = config[severity] || { dotColor: "bg-slate-400", textColor: "text-slate-600", borderColor: "border-slate-200" };
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium inline-flex items-center gap-1.5",
        c.textColor,
        c.borderColor
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dotColor)} />
      {severity}
    </Badge>
  );
}

export function AnalysisPanel({
  leadId,
  analysis,
  hasDocuments,
  onAnalysisGenerated,
}: AnalysisPanelProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/analysis/${leadId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate analysis");
      onAnalysisGenerated();
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <ChartIcon className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">
            AI Analysis
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-xs mb-5">
            {hasDocuments
              ? "Generate an AI-powered analysis of this lead's insurance portfolio and coverage."
              : "Upload and extract documents first to generate an analysis."}
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 cursor-pointer"
          >
            {generating ? (
              <>
                <LoaderIcon className="w-4 h-4" />
                Generating Analysis...
              </>
            ) : (
              <>
                <SparkleIcon className="w-4 h-4" />
                Generate Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      {analysis.overallScore != null && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <ScoreRing score={analysis.overallScore} />
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Insurance Health Score
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overall assessment of coverage adequacy and optimization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {analysis.summary}
          </p>
        </CardContent>
      </Card>

      {/* Coverage Gaps */}
      {analysis.coverageGaps?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Coverage Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {analysis.coverageGaps.map((gap, i) => {
              const sev = severityConfig[gap.severity];
              return (
                <div key={i} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm text-slate-700">
                      {gap.area}
                    </span>
                    <SeverityBadge severity={gap.severity} config={severityConfig} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {gap.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Potential Savings */}
      {analysis.potentialSavings?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {analysis.potentialSavings.map((saving, i) => (
              <div
                key={i}
                className="border border-emerald-100 bg-emerald-50/30 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm text-slate-700">
                    {saving.area}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {saving.estimatedSaving}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {saving.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Risk Flags */}
      {analysis.riskFlags?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {analysis.riskFlags.map((risk, i) => {
              const sev = severityConfig[risk.severity] || severityConfig.medium;
              return (
                <div
                  key={i}
                  className={cn(
                    "border border-slate-200 rounded-lg p-3 border-l-[3px]",
                    sev.leftBorder
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm text-slate-700">
                      {risk.flag}
                    </span>
                    <SeverityBadge severity={risk.severity} config={severityConfig} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {risk.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm text-slate-700">
                    {rec.action}
                  </span>
                  <SeverityBadge severity={rec.priority} config={priorityConfig} />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {rec.rationale}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Regenerate */}
      <div className="flex justify-center pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
          className="gap-1.5 text-slate-600 cursor-pointer"
        >
          {generating ? (
            <>
              <LoaderIcon className="w-3.5 h-3.5" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshIcon className="w-3.5 h-3.5" />
              Regenerate Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
