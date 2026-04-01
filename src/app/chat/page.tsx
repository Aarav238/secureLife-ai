"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function ChatPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
