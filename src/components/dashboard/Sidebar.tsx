"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
    exact: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "AI Chat",
    exact: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/dashboard/documents",
    label: "Documents",
    exact: false,
    subtitle: "Policy files",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col min-h-screen border-r border-slate-800/60">
      {/* Logo and branding */}
      <Link href="/" className="block p-6 border-b border-slate-800/60 cursor-pointer hover:bg-slate-900/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v6c0 5.25 3.75 10.13 9 11.25C17.25 23.13 21 18.25 21 13V7l-9-5z"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M12 6l-5 2.8v3.4c0 3 2.15 5.78 5 6.42 2.85-.64 5-3.42 5-6.42V8.8L12 6z"
                fill="url(#shieldInner)"
              />
              <defs>
                <linearGradient id="shieldInner" x1="7" y1="6" x2="17" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">
              SecureLife AI
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Lead Management
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:brightness-110"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  active
                    ? "text-white"
                    : "text-slate-500 group-hover:text-slate-300"
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.subtitle && (
                <span
                  className={cn(
                    "ml-auto text-[10px] rounded-full px-2 py-0.5 transition-colors duration-200",
                    active
                      ? "bg-indigo-500/40 text-indigo-100"
                      : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-400"
                  )}
                >
                  {item.subtitle}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="mx-4">
        <div className="border-t border-slate-800/60" />
      </div>

      {/* Bottom section */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xs font-bold tracking-wide text-white ring-2 ring-slate-800 flex-shrink-0">
            SL
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              Broker Portal
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              SecureLife Insurance
            </p>
          </div>
          <form action="/api/auth/logout" method="POST" className="ml-auto">
            <button
              type="submit"
              title="Sign out"
              className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
