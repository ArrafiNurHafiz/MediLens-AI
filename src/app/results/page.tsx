"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMedicine } from "@/context/MedicineContext";
import {
  ArrowLeft,
  Share2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Volume2,
  Calendar,
  AlertCircle,
  FileCheck,
  Pill
} from "lucide-react";

export default function AnalysisResultsPage() {
  const router = useRouter();
  const { medicines, showToast } = useMedicine();
  const [activeTab, setActiveTab] = useState<"summary" | "interactions" | "schedule">("summary");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Laporan Analisis MediLens AI",
        text: "Hasil deteksi 3 obat: Amlodipine 5mg, Simvastatin 20mg, Omeprazole 20mg. Jadwal & interaksi aman.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      showToast("Tautan laporan berhasil disalin ke clipboard", "success");
    }
  };

  return (
    <div className="flex-1 pb-6 select-none">
      {/* Dark Navy Header Card */}
      <div className="bg-[#111c38] text-white rounded-b-3xl px-5 pt-3 pb-5 shadow-lg">
        <div className="flex items-center justify-between">
          <Link
            href="/scan"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Kembali ke Pindai"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-extrabold tracking-tight">Hasil Analisis</h1>
            <p className="text-xs text-blue-200">
              {medicines.length} Obat terdeteksi secara otomatis
            </p>
          </div>
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Bagikan Laporan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="px-4 mt-3">
        <div className="bg-white/90 rounded-full p-1 flex text-xs font-bold shadow-xs border border-white">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 py-1.5 rounded-full transition-all ${
              activeTab === "summary"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-blue-600"
            }`}
          >
            Ringkasan
          </button>
          <Link
            href="/interactions"
            className="flex-1 py-1.5 rounded-full text-center text-slate-600 hover:text-blue-600"
          >
            Interaksi
          </Link>
          <Link
            href="/schedule"
            className="flex-1 py-1.5 rounded-full text-center text-slate-600 hover:text-blue-600"
          >
            Jadwal
          </Link>
        </div>
      </div>

      {/* Security Status Alert Banner */}
      <div className="px-4 mt-3">
        <div className="rounded-2xl p-3.5 bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold">1 Interaksi Memerlukan Perhatian</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-200 text-amber-900">
                Jeda 2 Jam
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-tight mt-1">
              Beri jeda minimal 2 jam antara <strong>Omeprazole</strong> dan{" "}
              <strong>Simvastatin</strong>. Hindari konsumsi bersama buah jeruk bali.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Detected Medicine Cards */}
      <div className="px-4 mt-4 space-y-2.5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Daftar Obat Terdeteksi ({medicines.length})
          </h3>
          <span className="text-[11px] text-slate-500">Klik untuk melihat paspor obat</span>
        </div>

        {medicines.map((med) => {
          const isCaution = med.status === "caution";
          return (
            <Link
              key={med.id}
              href={`/drugs/${med.id}`}
              className="glass-card rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-blue-400/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCaution
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  <Pill className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {med.name}
                    </h4>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    {med.form} • {med.timingLabel}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Kedaluwarsa: {med.expiryDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                    isCaution
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {isCaution ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {med.statusLabel}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-2.5">
        <Link
          href="/voice-guide"
          className="rounded-2xl p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md hover:brightness-105 transition-all"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold">Dengar Panduan Suara</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Link>

        <Link
          href="/restrictions"
          className="rounded-2xl p-3 bg-white border border-slate-200 text-slate-800 flex items-center justify-between shadow-xs hover:border-amber-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Cek Pantangan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Bottom Main CTA */}
      <div className="px-4 mt-4">
        <Link
          href="/drugs/amlodipine"
          className="w-full py-3.5 rounded-full btn-primary-grad font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
        >
          <span>Buka Paspor & Detail Obat Lengkap</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
