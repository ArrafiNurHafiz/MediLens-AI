"use client";

import React from "react";
import { usePathname } from "next/navigation";
import StatusBar from "@/components/layout/StatusBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast from "@/components/ui/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dark screens: /scan and /analyzing
  const isDarkScreen = pathname === "/scan" || pathname === "/analyzing";

  return (
    <div className="min-h-screen bg-slate-900/10 sm:py-6 flex flex-col items-center justify-center">
      {/* Mobile Device Frame */}
      <div
        className={`w-full max-w-md sm:h-[860px] sm:max-h-[92vh] sm:rounded-[42px] sm:shadow-2xl sm:ring-8 sm:ring-slate-800/15 flex flex-col relative overflow-hidden transition-colors ${
          isDarkScreen
            ? "bg-slate-950 text-white"
            : "bg-gradient-to-b from-[#ebf3ff] via-[#f6f9ff] to-[#eef4ff] text-slate-800"
        }`}
      >
        {/* Device Status Bar */}
        <StatusBar dark={isDarkScreen} />

        {/* Global Toast */}
        <Toast />

        {/* Main Content Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
