"use client";

import { cn } from "@/lib/utils";
import { StreamingMarkdown } from "./StreamingMarkdown";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn("flex gap-3 max-w-[75%]", isUser && "flex-row-reverse")}
      >
        {/* Assistant avatar */}
        {!isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L9 9H2L7.5 13.5L5.5 21L12 16.5L18.5 21L16.5 13.5L22 9H15L12 2Z"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed shadow-sm",
            isUser
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <StreamingMarkdown text={content} isStreaming={isStreaming} />
          )}
          {timestamp && (
            <p
              className={cn(
                "text-[10px] mt-1.5 select-none",
                isUser ? "text-indigo-200" : "text-slate-400"
              )}
            >
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
