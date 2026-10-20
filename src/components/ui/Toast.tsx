"use client";

import React from "react";
import { useMedicine } from "@/context/MedicineContext";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export default function Toast() {
  const { toastInfo, hideToast } = useMedicine();

  if (!toastInfo.visible) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
  };

  const bgBorders = {
    info: "bg-slate-900/95 text-white border-slate-700",
    success: "bg-slate-900/95 text-white border-emerald-500/40",
    warning: "bg-slate-900/95 text-white border-amber-500/40",
    error: "bg-slate-900/95 text-white border-rose-500/40"
  };

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div
        className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-xl border backdrop-blur-md text-xs font-medium ${
          bgBorders[toastInfo.type]
        }`}
      >
        <div className="flex items-center gap-2">
          {icons[toastInfo.type]}
          <span className="leading-snug">{toastInfo.message}</span>
        </div>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
