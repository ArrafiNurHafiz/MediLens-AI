"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMedicine } from "@/context/MedicineContext";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Calendar,
  Share2,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function InteractionsPage() {
  const { interactions, showToast } = useMedicine();
  const [filterSeverity, setFilterSeverity] = useState<"all" | "safe" | "caution">("all");

  const filtered = interactions.filter((item) => {
    if (filterSeverity === "all") return true;
    return item.severity === filterSeverity;
  });

  return (
    <div className="flex-1 pb-6 select-none">
      {/* Top Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <Link
          href="/results"
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Kembali ke Hasil"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Interaksi Antar-Obat
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">
            Analisis Kompatibilitas Farmakologi
          </p>
        </div>
        <button
          onClick={() => {
            showToast("Ringkasan interaksi disalin untuk konsultasi dokter", "success");
          }}
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Bagikan"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 my-2 flex items-center gap-2">
        <button
          onClick={() => setFilterSeverity("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            filterSeverity === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-white"
          }`}
        >
          Semua ({interactions.length})
        </button>
        <button
          onClick={() => setFilterSeverity("caution")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
            filterSeverity === "caution"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Perlu Jeda ({interactions.filter((i) => i.severity === "caution").length})
        </button>
        <button
          onClick={() => setFilterSeverity("safe")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
            filterSeverity === "safe"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Aman ({interactions.filter((i) => i.severity === "safe").length})
        </button>
      </div>

      {/* Interaction Cards */}
      <div className="px-4 mt-3 space-y-3">
        {filtered.map((item) => {
          const isCaution = item.severity === "caution";
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 border transition-all ${
                isCaution
                  ? "bg-amber-50/70 border-amber-200/90 shadow-xs"
                  : "bg-emerald-50/60 border-emerald-200/80 shadow-xs"
              }`}
            >
              {/* Header Pair */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900">
                    {item.drugAName.split(" ")[0]}
                  </span>
                  <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-900">
                    {item.drugBName.split(" ")[0]}
                  </span>
                </div>
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                    isCaution
                      ? "bg-amber-200 text-amber-900"
                      : "bg-emerald-200 text-emerald-900"
                  }`}
                >
                  {isCaution ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {item.badge}
                </span>
              </div>

              {/* Title & Timing */}
              <h3 className="text-xs font-bold text-slate-800 leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                Rekomendasi Waktu: {item.timeSpacing}
              </p>

              {/* Mechanism */}
              <div className="mt-2 text-[11px] text-slate-600 leading-relaxed bg-white/70 rounded-xl p-2.5 border border-white">
                <p className="font-semibold text-slate-700 mb-0.5">Penjelasan Farmakologis:</p>
                <p>{item.mechanism}</p>
              </div>

              {/* Action Recommendation */}
              <div className="mt-2 text-[11px] text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-800">Saran Konsumsi:</p>
                <p>{item.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shortcut to Schedule */}
      <div className="px-4 mt-4">
        <Link
          href="/schedule"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>Lihat Penyesuaian Jadwal Aman Teratur</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
