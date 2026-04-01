"use client";

import { useState, useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  insuredName: string | null;
  extractedData: Record<string, unknown> | null;
}

interface DocumentUploadProps {
  leadId: string;
  documents: Document[];
  onUpload: () => void;
}

const statusConfig: Record<
  string,
  { label: string; dotColor: string; textColor: string; bgColor: string; borderColor: string; icon: string }
> = {
  pending: {
    label: "Pending",
    dotColor: "bg-amber-400",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200/60",
    icon: "clock",
  },
  processing: {
    label: "Processing",
    dotColor: "bg-blue-400",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200/60",
    icon: "spinner",
  },
  completed: {
    label: "Completed",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200/60",
    icon: "check",
  },
  failed: {
    label: "Failed",
    dotColor: "bg-red-400",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200/60",
    icon: "x",
  },
};

function FileTypeIcon({ fileName, className = "w-10 h-10" }: { fileName: string; className?: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const isPdf = ext === "pdf";
  return (
    <div className={cn("relative shrink-0", className)}>
      <svg viewBox="0 0 40 48" fill="none" className="w-full h-full">
        <path d="M4 0h22l14 14v30a4 4 0 01-4 4H4a4 4 0 01-4-4V4a4 4 0 014-4z" className="fill-white" />
        <path d="M4 0h22l14 14v30a4 4 0 01-4 4H4a4 4 0 01-4-4V4a4 4 0 014-4z" className="stroke-slate-200" strokeWidth="1.5" />
        <path d="M26 0v10a4 4 0 004 4h10" className="stroke-slate-200" strokeWidth="1.5" />
        <rect x="4" y="30" width="32" height="14" rx="2" className={isPdf ? "fill-red-500" : "fill-indigo-500"} />
        <text x="20" y="41" textAnchor="middle" className="fill-white font-bold" style={{ fontSize: "8px", fontFamily: "var(--font-sans)" }}>
          {ext.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-500">Uploading...</span>
        <span className="text-xs font-semibold text-indigo-600 tabular-nums">{progress}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ExtractedField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="group flex items-start gap-2.5 py-2">
      {icon && <div className="mt-0.5 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0">{icon}</div>}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export interface DocumentUploadHandle {
  openUploadDialog: () => void;
}

export const DocumentUpload = forwardRef<DocumentUploadHandle, DocumentUploadProps>(function DocumentUpload({
  leadId,
  documents,
  onUpload,
}, ref) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    openUploadDialog: () => setDialogOpen(true),
  }));

  const resetDialog = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadProgress(0);
    setDragOver(false);
  };

  // Simulate progress during upload
  useEffect(() => {
    if (!uploading) return;
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [uploading]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("leadId", leadId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setDialogOpen(false);
      resetDialog();
      onUpload();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }, [leadId, onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800 font-heading flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          Documents
          {documents.length > 0 && (
            <span className="text-xs font-normal text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
              {documents.length}
            </span>
          )}
        </h3>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-xs gap-2 cursor-pointer shadow-sm shadow-indigo-200/50 hover:shadow-indigo-300/50 transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Upload
        </Button>
      </div>

      {/* ── Upload Dialog ─────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (uploading) return;
          setDialogOpen(open);
          if (!open) resetDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Upload Document</DialogTitle>
            <DialogDescription>
              Upload an insurance document for AI-powered data extraction.
            </DialogDescription>
          </DialogHeader>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={handleDrop}
            onClick={() => !selectedFile && !uploading && fileInputRef.current?.click()}
            className={cn(
              "relative mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
              uploading
                ? "border-indigo-300 bg-indigo-50/50 pointer-events-none"
                : dragOver
                  ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                  : selectedFile
                    ? "border-emerald-300 bg-gradient-to-b from-emerald-50/80 to-white"
                    : "border-slate-200 bg-gradient-to-b from-slate-50 to-white hover:border-indigo-300 hover:from-indigo-50/40 cursor-pointer"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center py-8 px-6">
              {selectedFile ? (
                <>
                  <FileTypeIcon fileName={selectedFile.name} className="w-12 h-14" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatSize(selectedFile.size)}</p>
                  {uploading ? (
                    <UploadProgress progress={Math.round(uploadProgress)} />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21h5v-5" />
                      </svg>
                      Change file
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200",
                    dragOver ? "bg-indigo-100 scale-110" : "bg-slate-100"
                  )}>
                    <svg className={cn("w-6 h-6 transition-colors", dragOver ? "text-indigo-500" : "text-slate-400")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    {dragOver ? "Drop your file here" : "Drag & drop your file here"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    or <span className="text-indigo-500 font-medium">click to browse</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-4">
                    {["PDF", "DOC", "DOCX"].map((type) => (
                      <span key={type} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 tracking-wide">
                        {type}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 mt-1 p-2.5 rounded-lg bg-red-50 border border-red-100">
              <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-xs text-red-700">{uploadError}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => { setDialogOpen(false); resetDialog(); }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedFile || uploading}
              onClick={() => selectedFile && handleUpload(selectedFile)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 cursor-pointer min-w-[100px] shadow-sm shadow-indigo-200/50"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Uploading
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Document list ─────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mb-4">
              <svg className="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">No documents yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload insurance policies to get AI-powered insights</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDialogOpen(true)}
              className="mt-4 gap-2 cursor-pointer text-xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Upload your first document
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc, index) => {
              const status = statusConfig[doc.processingStatus] || statusConfig.pending;
              const isCompleted = doc.processingStatus === "completed";
              const isFailed = doc.processingStatus === "failed";
              const isPending = doc.processingStatus === "pending";
              const isProcessing = doc.processingStatus === "processing";

              return (
                <div
                  key={doc.id}
                  className={cn(
                    "p-4 transition-colors",
                    index === 0 && "rounded-t-xl",
                    index === documents.length - 1 && "rounded-b-xl",
                    isCompleted && "hover:bg-slate-50/50"
                  )}
                >
                  {/* File header row */}
                  <div className="flex items-start gap-3">
                    <FileTypeIcon fileName={doc.fileName} className="w-9 h-11" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {doc.fileName}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold inline-flex items-center gap-1.5 shrink-0 rounded-md",
                            status.textColor,
                            status.borderColor,
                            status.bgColor
                          )}
                        >
                          {isProcessing ? (
                            <svg className="animate-spin w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                          ) : (
                            <span className={cn("w-1.5 h-1.5 rounded-full", status.dotColor)} />
                          )}
                          {status.label}
                        </Badge>
                      </div>

                      {/* Document type tag */}
                      {doc.documentType && (
                        <span className="inline-flex items-center mt-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 tracking-wide">
                          {doc.documentType.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pending → Extract button */}
                  {isPending && (
                    <div className="mt-3 ml-12">
                      <Button
                        size="sm"
                        onClick={() => handleExtract(doc.id)}
                        disabled={extracting === doc.id}
                        className="bg-indigo-600 hover:bg-indigo-700 text-xs gap-2 cursor-pointer shadow-sm shadow-indigo-200/50"
                      >
                        {extracting === doc.id ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Extracting...
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
                            </svg>
                            Extract with AI
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Completed → Extracted data card */}
                  {isCompleted && doc.extractedData && (
                    <div className="mt-3 ml-12 rounded-lg bg-slate-50/80 border border-slate-100 p-3">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                        {doc.insuredName && (
                          <ExtractedField
                            label="Policy Holder"
                            value={doc.insuredName}
                            icon={
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                              </svg>
                            }
                          />
                        )}
                        {doc.provider && (
                          <ExtractedField
                            label="Provider"
                            value={doc.provider}
                            icon={
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                              </svg>
                            }
                          />
                        )}
                        {doc.policyNumber && (
                          <ExtractedField
                            label="Policy #"
                            value={doc.policyNumber}
                            icon={
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                              </svg>
                            }
                          />
                        )}
                        {doc.coverageAmount != null && doc.coverageAmount > 0 && (
                          <ExtractedField
                            label="Coverage"
                            value={doc.coverageAmount.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })}
                            icon={
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                              </svg>
                            }
                          />
                        )}
                        {doc.premiumAmount != null && doc.premiumAmount > 0 && (
                          <ExtractedField
                            label="Premium"
                            value={doc.premiumAmount.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })}
                            icon={
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                              </svg>
                            }
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Failed → Retry */}
                  {isFailed && (
                    <div className="mt-3 ml-12 flex items-center gap-3 p-2.5 rounded-lg bg-red-50/50 border border-red-100/60">
                      <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="text-xs text-red-600 flex-1">Extraction failed</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExtract(doc.id)}
                        disabled={extracting === doc.id}
                        className="text-xs gap-1.5 border-red-200 text-red-700 hover:bg-red-100/50 cursor-pointer h-7"
                      >
                        {extracting === doc.id ? (
                          <>
                            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                            Retrying
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                            </svg>
                            Retry
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
