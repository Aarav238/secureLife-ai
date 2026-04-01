"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect, type ReactNode } from "react";

interface Props {
  text: string;
  isStreaming?: boolean;
}

// ── Sanitizer: close unclosed code fences during streaming ──
function sanitizeStream(text: string, isStreaming: boolean): string {
  if (!isStreaming) return text;

  const lines = text.split("\n");
  let inCode = false;
  let fence = "";

  for (const line of lines) {
    const match = line.match(/^(`{3,}|~{3,})/);
    if (match) {
      if (!inCode) {
        inCode = true;
        fence = match[1];
      } else if (line.startsWith(fence)) {
        inCode = false;
        fence = "";
      }
    }
  }

  return inCode ? text + "\n" + fence : text;
}

// ── Code block with copy button ──
function CodeBlock({
  lang,
  code,
  isStreaming,
}: {
  lang: string;
  code: string;
  isStreaming: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700/50">
        <span className="text-[11px] font-mono text-slate-400">
          {lang || "code"}
        </span>
        {!isStreaming && (
          <button
            onClick={copy}
            className="text-[11px] px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={lang || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Blinking cursor ──
function BlinkingCursor() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-block w-[2px] h-[1em] align-text-bottom ml-0.5"
      style={{
        background: visible ? "currentColor" : "transparent",
        transition: "background 0.1s",
      }}
    />
  );
}

export function StreamingMarkdown({ text, isStreaming = false }: Props) {
  return (
    <div className="streaming-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const lang = /language-(\w+)/.exec(className || "")?.[1] ?? "";
            const code = String(children).replace(/\n$/, "");

            // Inline code: no language class and no newlines
            const isInline =
              !className && !String(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[13px] font-mono text-slate-700"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock lang={lang} code={code} isStreaming={isStreaming} />
            );
          },

          p({ children }: { children?: ReactNode }) {
            return (
              <p className="my-2 leading-relaxed">
                {children}
                {isStreaming && <BlinkingCursor />}
              </p>
            );
          },

          a({ href, children }: { href?: string; children?: ReactNode }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline hover:text-indigo-700"
              >
                {children}
              </a>
            );
          },

          ul({ children }: { children?: ReactNode }) {
            return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
          },

          ol({ children }: { children?: ReactNode }) {
            return (
              <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
            );
          },

          li({ children }: { children?: ReactNode }) {
            return <li className="leading-relaxed">{children}</li>;
          },

          blockquote({ children }: { children?: ReactNode }) {
            return (
              <blockquote className="border-l-3 border-slate-300 pl-4 my-3 text-slate-600 italic">
                {children}
              </blockquote>
            );
          },

          h1({ children }: { children?: ReactNode }) {
            return (
              <h1 className="text-xl font-semibold mt-5 mb-2">{children}</h1>
            );
          },
          h2({ children }: { children?: ReactNode }) {
            return (
              <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>
            );
          },
          h3({ children }: { children?: ReactNode }) {
            return (
              <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
            );
          },

          table({ children }: { children?: ReactNode }) {
            return (
              <div className="my-3 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">{children}</table>
              </div>
            );
          },
          thead({ children }: { children?: ReactNode }) {
            return <thead className="bg-slate-50">{children}</thead>;
          },
          th({ children }: { children?: ReactNode }) {
            return (
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b border-slate-200">
                {children}
              </th>
            );
          },
          td({ children }: { children?: ReactNode }) {
            return (
              <td className="px-3 py-2 border-b border-slate-100 text-slate-700">
                {children}
              </td>
            );
          },

          hr() {
            return <hr className="my-4 border-slate-200" />;
          },

          strong({ children }: { children?: ReactNode }) {
            return (
              <strong className="font-semibold text-slate-900">{children}</strong>
            );
          },
        }}
      >
        {sanitizeStream(text, isStreaming)}
      </ReactMarkdown>
    </div>
  );
}
