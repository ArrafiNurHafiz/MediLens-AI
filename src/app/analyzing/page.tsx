"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMedicine } from "@/context/MedicineContext";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function AnalyzingPage() {
  const router = useRouter();
  const { showToast } = useMedicine();

  const steps = [
    { id: 1, title: "Mendeteksi objek obat", desc: "Computer vision menemukan 3 kemasan obat" },
    { id: 2, title: "Mengekstrak teks & Exp Date", desc: "OCR membaca merek, dosis, dan kedaluwarsa" },
    { id: 3, title: "Mencari kandungan aktif", desc: "Verifikasi zat aktif dengan database BPOM" },
    { id: 4, title: "Menganalisis interaksi obat", desc: "Mengevaluasi kombinasi farmakologis" },
    { id: 5, title: "Menyusun rekomendasi jadwal", desc: "Menghitung jeda konsumsi yang aman" },
    { id: 6, title: "Menyiapkan panduan suara", desc: "Sintesis audio ramah lansia siap diputar" },
  ];

  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedCount((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [steps.length]);

  const isAllDone = completedCount >= steps.length;

  useEffect(() => {
    if (isAllDone) {
      showToast("Analisis AI Selesai! 3 Obat terverifikasi.", "success");
      const redirectTimer = setTimeout(() => {
        router.push("/results");
      }, 700);
      return () => clearTimeout(redirectTimer);
    }
  }, [isAllDone, router, showToast]);

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-4 pb-8 select-none">
      {/* Top Section with AI Orb */}
      <div className="flex flex-col items-center">
        {/* Pulsating Glowing AI Orb */}
        <div className="relative my-4">
          <div className="w-28 h-28 rounded-full ai-orb bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-1 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-blue-500/30 via-indigo-950 to-slate-950 flex items-center justify-center border-2 border-white/60 relative overflow-hidden">
              <svg viewBox="0 0 80 80" className="w-14 h-14">
                <rect x="18" y="20" width="32" height="36" rx="4" fill="none" stroke="#e0f2fe" strokeWidth="2.5" />
                <line x1="24" y1="30" x2="44" y2="30" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="24" y1="38" x2="38" y2="38" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="42" y="38" width="22" height="11" rx="5.5" transform="rotate(-30 42 38)" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                <circle cx="34" cy="54" r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title & Progress % */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isAllDone ? "Analisis Selesai!" : "Menganalisis..."}
            </h2>
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
          </div>
          <p className="text-xs text-slate-500">
            {isAllDone
              ? "Semua data obat telah dipetakan"
              : `Langkah ${Math.min(completedCount + 1, steps.length)} dari ${steps.length}`}
          </p>
          {/* Progress Bar */}
          <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 6 Step Checklist */}
        <div className="w-full space-y-3 px-1">
          {steps.map((step, idx) => {
            const isCompleted = idx < completedCount;
            const isCurrent = idx === completedCount;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all ${
                  isCompleted
                    ? "bg-white/80 border border-emerald-100 shadow-xs"
                    : isCurrent
                    ? "bg-blue-50/90 border border-blue-200 shadow-xs scale-[1.01]"
                    : "opacity-45"
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-xs font-bold ${
                      isCompleted
                        ? "text-slate-800"
                        : isCurrent
                        ? "text-blue-900"
                        : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immediate Skip Button */}
      <div className="w-full pt-4">
        <button
          onClick={() => router.push("/results")}
          className="w-full py-3 rounded-full btn-primary-grad font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <span>{isAllDone ? "Buka Hasil Analisis" : "Lewati & Buka Hasil Segera"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
