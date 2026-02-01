"use client";

import { TypingTestPage } from "@/components/features/typing-test/TypingTestPage";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 flex-1">
      <TypingTestPage />
    </div>
  );
}