"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatSession {
  leadId: string;
  name: string | null;
  primaryInterest: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  createdAt: string;
}

const QUICK_SUGGESTIONS = [
  "I need health insurance",
  "Review my existing policy",
  "Compare insurance plans",
];

const STORAGE_KEY = "securelife-chat";

interface PersistedChat {
  leadId: string | null;
  sessionId: string;
  pendingHistory: Array<{ role: "user" | "assistant"; content: string }> | null;
}

function loadPersistedState(): PersistedChat {
  if (typeof window === "undefined")
    return { leadId: null, sessionId: `session-${Date.now()}`, pendingHistory: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.leadId || parsed.sessionId) return {
        leadId: parsed.leadId || null,
        sessionId: parsed.sessionId || `session-${Date.now()}`,
        pendingHistory: parsed.pendingHistory || null,
      };
    }
  } catch {}
  return {
    leadId: null,
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    pendingHistory: null,
  };
}

function persistState(leadId: string | null, sessionId: string, pendingHistory: Array<{ role: "user" | "assistant"; content: string }> | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ leadId, sessionId, pendingHistory }));
  } catch {}
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [pendingHistory, setPendingHistory] = useState<Array<{ role: "user" | "assistant"; content: string }> | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Initialize from localStorage + load messages if returning ──
  useEffect(() => {
    const persisted = loadPersistedState();
    setLeadId(persisted.leadId);
    setSessionId(persisted.sessionId);
    setPendingHistory(persisted.pendingHistory || null);

    if (persisted.leadId) {
      fetch(`/api/chat/${persisted.leadId}`)
        .then((res) => res.json())
        .then((msgs: Array<{ id: string; role: string; content: string; createdAt: string }>) => {
          if (Array.isArray(msgs)) {
            setMessages(
              msgs.map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                createdAt: new Date(m.createdAt),
              }))
            );
          }
        })
        .catch(console.error)
        .finally(() => setInitialized(true));
    } else {
      if (persisted.pendingHistory && persisted.pendingHistory.length > 0) {
        setMessages(
          persisted.pendingHistory.map((m, i) => ({
            id: `pending-${i}`,
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt: new Date(),
          }))
        );
      }
      setInitialized(true);
    }
  }, []);

  // ── Load chat history sessions ──
  const loadSessions = useCallback(() => {
    fetch("/api/chat/history")
      .then((res) => res.json())
      .then((data: ChatSession[]) => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── Persist state changes ──
  useEffect(() => {
    if (sessionId) persistState(leadId, sessionId, pendingHistory);
  }, [leadId, sessionId, pendingHistory]);

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // ── Auto-resize textarea ──
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "48px";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }, [input]);

  // ── Switch to a previous chat session ──
  const switchSession = async (targetLeadId: string) => {
    try {
      const res = await fetch(`/api/chat/${targetLeadId}`);
      const msgs = await res.json();
      if (Array.isArray(msgs)) {
        setMessages(
          msgs.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt: new Date(m.createdAt),
          }))
        );
        setLeadId(targetLeadId);
        setPendingHistory(null);
        persistState(targetLeadId, sessionId, null);
        setHistoryOpen(false);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  // ── Start a new chat ──
  const startNewChat = () => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setMessages([]);
    setLeadId(null);
    setSessionId(newSessionId);
    setPendingHistory(null);
    persistState(null, newSessionId, null);
    setHistoryOpen(false);
    loadSessions();
  };

  // ── Send message ──
  const sendMessage = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      let currentLeadId = leadId;
      let res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: currentLeadId,
          message: trimmed,
          pendingHistory: currentLeadId ? undefined : (pendingHistory ?? undefined),
        }),
      });

      if (res.status === 404 && currentLeadId) {
        currentLeadId = null;
        setLeadId(null);
        setPendingHistory(null);
        persistState(null, sessionId, null);
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: null, message: trimmed }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!currentLeadId && data.leadId) {
        setLeadId(data.leadId);
        setPendingHistory(null);
        loadSessions();
      } else if (!data.leadId && data.pendingHistory) {
        setPendingHistory(data.pendingHistory);
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I apologize, but I'm unable to connect right now. Please try again in a moment.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!initialized) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-indigo-500"
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
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* ── Chat History Sidebar ── */}
      <div
        className={cn(
          "flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden",
          historyOpen ? "w-72" : "w-0"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Chat History
          </h3>
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
          >
            <svg
              width="14"
              height="14"
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
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8 px-4">
              No previous chats
            </p>
          ) : (
            <div className="py-1">
              {sessions.map((s) => (
                <button
                  key={s.leadId}
                  onClick={() => switchSession(s.leadId)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-slate-50 transition-colors cursor-pointer",
                    s.leadId === leadId
                      ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                      : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {s.name || "New conversation"}
                    </span>
                  </div>
                  {s.primaryInterest && (
                    <p className="text-[11px] text-indigo-600 font-medium mb-0.5">
                      {s.primaryInterest}
                    </p>
                  )}
                  {s.lastMessage && (
                    <p className="text-xs text-slate-400 truncate">
                      {s.lastMessage}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-300 mt-1 tabular-nums">
                    {new Date(s.lastMessageAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col flex-1 bg-slate-50 min-w-0">
        {/* Header */}
        <div className="relative flex-shrink-0">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />
          <div className="bg-slate-950 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* History toggle */}
                <button
                  onClick={() => {
                    setHistoryOpen(!historyOpen);
                    if (!historyOpen) loadSessions();
                  }}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Chat history"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </button>

                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L4 6V12C4 16.42 7.42 20.74 12 22C16.58 20.74 20 16.42 20 12V6L12 2Z"
                      fill="white"
                      fillOpacity="0.95"
                    />
                    <path
                      d="M10 12L12 14L16 10"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white text-[15px] font-semibold tracking-tight">
                    SecureLife Insurance Advisor
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    AI-powered insurance consultation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* New chat button */}
                <button
                  onClick={startNewChat}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="New chat"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-400 text-xs font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth bg-gradient-to-b from-slate-50 to-white">
          <div className="px-6 py-6 max-w-3xl mx-auto min-h-full flex flex-col">
            {/* Welcome state */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-6">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2L4 6V12C4 16.42 7.42 20.74 12 22C16.58 20.74 20 16.42 20 12V6L12 2Z"
                      fill="white"
                      fillOpacity="0.95"
                    />
                    <path
                      d="M10 12L12 14L16 10"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Welcome to SecureLife
                </h3>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
                  I&apos;m your personal insurance advisor. Tell me about your
                  coverage needs and I&apos;ll help you find the right plan.
                </p>

                <div className="flex flex-wrap justify-center gap-2.5">
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
                        hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700
                        transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {sessions.length > 0 && (
                  <button
                    onClick={() => {
                      setHistoryOpen(true);
                      loadSessions();
                    }}
                    className="mt-6 text-xs text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 8v4l3 3" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    View previous conversations
                  </button>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.createdAt}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 2L9 9H2L7.5 13.5L5.5 21L12 16.5L18.5 21L16.5 13.5L22 9H15L12 2Z"
                        fill="white"
                        fillOpacity="0.9"
                      />
                    </svg>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 resize-none min-h-[48px] max-h-[140px] rounded-xl border border-slate-200
                bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                transition-all duration-200"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700
                disabled:bg-slate-300 disabled:opacity-100
                flex items-center justify-center p-0 flex-shrink-0
                shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
