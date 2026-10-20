"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMedicine } from "@/context/MedicineContext";
import { FoodRestriction } from "@/data/restrictionsData";
import {
  ArrowLeft,
  AlertTriangle,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Coffee,
  Citrus,
  Milk,
  Wine,
  Sparkles,
  ChevronDown,
  X
} from "lucide-react";

export default function RestrictionsPage() {
  const { restrictions, showToast } = useMedicine();
  const [selectedDrug, setSelectedDrug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>("jeruk-bali");

  const categoryIcons: Record<string, React.ReactNode> = {
    fruit: <Citrus className="w-5 h-5 text-rose-500" />,
    drink: <Coffee className="w-5 h-5 text-amber-600" />,
    dairy: <Milk className="w-5 h-5 text-blue-500" />,
    alcohol: <Wine className="w-5 h-5 text-purple-600" />,
  };

  const filtered = restrictions.filter((item) => {
    const matchesDrug =
      selectedDrug === "all" ||
      item.relatedDrugs.some((d) => d.toLowerCase().includes(selectedDrug.toLowerCase()));
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDrug && matchesSearch;
  });

  return (
    <div className="flex-1 pb-6 select-none">
      {/* Top Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <Link
          href="/beranda"
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Pantangan Makanan & Minuman
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">
            Interaksi Nutrisi & Bioavailabilitas Obat
          </p>
        </div>
        <button
          onClick={() =>
            showToast("Bahan makanan tertentu dapat mengubah efektivitas penyerapan enzim hati", "info")
          }
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Info"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 my-2">
        <div className="bg-white/95 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200/80 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik makanan/minuman (cth: Jeruk Bali, Kopi, Susu)..."
            className="bg-transparent text-xs w-full focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs by Drug */}
      <div className="px-4 my-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedDrug("all")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
            selectedDrug === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white/80 text-slate-600 border border-slate-200"
          }`}
        >
          Semua Pantangan
        </button>
        <button
          onClick={() => setSelectedDrug("Simvastatin")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
            selectedDrug === "Simvastatin"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          Terkait Simvastatin
        </button>
        <button
          onClick={() => setSelectedDrug("Amlodipine")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
            selectedDrug === "Amlodipine"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          Terkait Amlodipine
        </button>
        <button
          onClick={() => setSelectedDrug("Omeprazole")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
            selectedDrug === "Omeprazole"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          Terkait Omeprazole
        </button>
      </div>

      {/* Contraindications List */}
      <div className="px-4 mt-3 space-y-2.5">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          const isWarning = item.severity === "warning";

          return (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-3.5 transition-all cursor-pointer ${
                isWarning ? "hover:border-rose-300" : "hover:border-amber-300"
              }`}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isWarning ? "bg-rose-100" : "bg-amber-100"
                    }`}
                  >
                    {categoryIcons[item.category] || <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Obat terpengaruh:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.relatedDrugs.join(", ")}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWarning
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {item.severityLabel}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Collapsible Detailed Explanation */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] space-y-2 animate-in fade-in duration-150">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {item.description}
                  </p>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                    <span className="font-bold text-slate-800 block mb-0.5">Mekanisme Medis:</span>
                    <span className="text-slate-600 leading-normal">
                      {item.scientificReason}
                    </span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200/80">
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      Alternatif Sehat Pengganti:
                    </span>
                    <span className="text-emerald-800 leading-normal">
                      {item.safeAlternative}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
