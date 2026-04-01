"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthNavLinks() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/chat"
          className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          AI Chat
        </Link>
        <div className="h-9 w-24 rounded-lg bg-slate-800/50 animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/chat"
          className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          AI Chat
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </Link>
        <div className="hidden sm:flex items-center gap-2 ml-1">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/10">
            {user.email?.charAt(0).toUpperCase() || "B"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/chat"
        className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
      >
        AI Chat
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
      >
        Broker Login
      </Link>
    </div>
  );
}
