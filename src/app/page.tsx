"use client";

import { FlowProvider } from "@/components/flow/FlowContext";
import FlowContainer from "@/components/flow/FlowContainer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <FlowProvider>
        <FlowContainer />
      </FlowProvider>
    </main>
  );
}
