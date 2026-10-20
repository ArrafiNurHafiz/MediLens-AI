"use client";

import React, { useState, useEffect } from "react";
import { Wifi, Battery } from "lucide-react";

interface StatusBarProps {
  dark?: boolean;
}

export default function StatusBar({ dark = false }: StatusBarProps) {
  const [time, setTime] = useState("09:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`w-full h-11 px-6 flex items-center justify-between text-xs font-semibold z-50 select-none ${
        dark ? "text-white/90 bg-transparent" : "text-slate-800 bg-transparent"
      }`}
    >
      {/* Time */}
      <span className="tracking-tight font-bold text-[13px]">{time}</span>

      {/* Dynamic Island Capsule */}
      <div className="w-24 h-4.5 bg-black rounded-full flex items-center justify-center gap-1.5 shadow-inner">
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40" />
      </div>

      {/* Status Icons */}
      <div className="flex items-center gap-1.5 text-[11px]">
        {/* Signal Bars */}
        <div className="flex items-end gap-0.5 h-2.5">
          <div className={`w-0.5 h-1 rounded-xs ${dark ? "bg-white" : "bg-slate-700"}`} />
          <div className={`w-0.5 h-1.5 rounded-xs ${dark ? "bg-white" : "bg-slate-700"}`} />
          <div className={`w-0.5 h-2 rounded-xs ${dark ? "bg-white" : "bg-slate-700"}`} />
          <div className={`w-0.5 h-2.5 rounded-xs ${dark ? "bg-white" : "bg-slate-700"}`} />
        </div>
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
        <Battery className="w-4 h-4 stroke-[2.5]" />
      </div>
    </div>
  );
}
