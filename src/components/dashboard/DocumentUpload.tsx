"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  fileName: string;
  processingStatus: string;
  documentType: string | null;
  provider: string | null;
  coverageAmount: number | null;
  premiumAmount: number | null;
  policyNumber: string | null;
  extractedData: Record<string, unknown> | null;
}

interface DocumentUploadProps {
  leadId: string;
  documents: Document[];
  onUpload: () => void;
}

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string; borderColor: string }> = {
  pending: {
    label: "Pending",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  processing: {
    label: "Processing",
    dotColor: "bg-blue-500",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  completed: {
    label: "Completed",
    dotColor: "bg-green-500",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  failed: {
    label: "Failed",
    dotColor: "bg-red-500",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

function FileIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

export function DocumentUpload({
  leadId,
  documents,
  onUpload,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("leadId", leadId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      onUpload();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExtract = async (docId: string) => {
    setExtracting(docId);
    try {
      const res = await fetch(`/api/documents/${docId}/extract`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Extraction failed");
      onUpload();
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setExtracting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-base">Documents</CardTitle>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-1.5 cursor-pointer"
            >
              {uploading ? (
                <>
                  <LoaderIcon className="w-3.5 h-3.5" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-3.5 h-3.5" />
                  Upload PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <FileIcon className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">
              No documents uploaded yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const status = statusConfig[doc.processingStatus] || statusConfig.pending;
              return (
                <div
                  key={doc.id}
                  className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {doc.fileName}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium inline-flex items-center gap-1.5 shrink-0",
                        status.textColor,
                        status.borderColor
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", status.dotColor)} />
                      {status.label}
                    </Badge>
                  </div>

                  {doc.processingStatus === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleExtract(doc.id)}
                      disabled={extracting === doc.id}
                      className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-xs gap-1.5 cursor-pointer"
                    >
                      {extracting === doc.id ? (
                        <>
                          <LoaderIcon className="w-3.5 h-3.5" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <SparkleIcon className="w-3.5 h-3.5" />
                          Extract Data with AI
                        </>
                      )}
                    </Button>
                  )}

                  {doc.processingStatus === "completed" && doc.extractedData && (
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-slate-200 pt-3">
                      {doc.provider && (
                        <div>
                          <span className="text-slate-400 font-medium">Provider</span>
                          <p className="text-slate-700 font-medium">{doc.provider}</p>
                        </div>
                      )}
                      {doc.documentType && (
                        <div>
                          <span className="text-slate-400 font-medium">Type</span>
                          <p className="text-slate-700 font-medium">
                            {doc.documentType.replace(/_/g, " ")}
                          </p>
                        </div>
                      )}
                      {doc.policyNumber && (
                        <div>
                          <span className="text-slate-400 font-medium">Policy #</span>
                          <p className="text-slate-700 font-medium">{doc.policyNumber}</p>
                        </div>
                      )}
                      {doc.coverageAmount && (
                        <div>
                          <span className="text-slate-400 font-medium">Coverage</span>
                          <p className="text-slate-700 font-medium">
                            {doc.coverageAmount.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      )}
                      {doc.premiumAmount && (
                        <div>
                          <span className="text-slate-400 font-medium">Premium</span>
                          <p className="text-slate-700 font-medium">
                            {doc.premiumAmount.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {doc.processingStatus === "failed" && (
                    <p className="mt-2 text-xs text-red-600">
                      Extraction failed. Please try uploading the document again.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
