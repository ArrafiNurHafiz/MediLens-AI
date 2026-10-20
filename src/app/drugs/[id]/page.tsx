"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMedicine } from "@/context/MedicineContext";
import {
  ArrowLeft,
  Heart,
  Volume2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  Pill,
  Info
} from "lucide-react";

export default function DrugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { medicines, showToast } = useMedicine();
  const [activeTab, setActiveTab] = useState<"info" | "interactions" | "restrictions" | "schedule">("info");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const drugId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const currentDrug = medicines.find(
    (m) => m.id.toLowerCase() === drugId?.toLowerCase()
  ) || medicines[0];

  const handleVoiceRead = () => {
    if (!('speechSynthesis' in window)) {
      showToast("Browser tidak mendukung Text-to-Speech", "error");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      showToast("Panduan suara dijeda", "info");
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `Detail Obat ${currentDrug.name}. Fungsi obat: ${currentDrug.indication}. Tanggal kedaluwarsa ${currentDrug.expiryDate}, status ${currentDrug.statusLabel}. Aturan pakai: ${currentDrug.instructions}. Waktu dianjurkan pukul ${currentDrug.recommendedTime} ${currentDrug.timingLabel}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      showToast(`Membacakan panduan ${currentDrug.name}...`, "info");
    };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 pb-6 select-none">
      {/* Dark Navy Top Header */}
      <div className="bg-[#111c38] text-white rounded-b-3xl px-5 pt-3 pb-5 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-extrabold tracking-tight">Detail Obat (Paspor Medis)</h1>
            <p className="text-[11px] text-blue-200">{currentDrug.bpomNumber}</p>
          </div>
          <button
            onClick={() => {
              setIsFavorite(!isFavorite);
              showToast(
                !isFavorite ? "Disimpan ke Obat Favorit" : "Dihapus dari Favorit",
                "info"
              );
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isFavorite
                ? "bg-rose-500/20 text-rose-400"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            aria-label="Favorit"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Medicine Identity Card */}
      <div className="px-4 mt-3">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <Pill className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              {currentDrug.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{currentDrug.genericName}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  currentDrug.status === "caution"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {currentDrug.status === "caution" ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {currentDrug.statusLabel}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {currentDrug.form}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Reader Trigger Card */}
      <div className="px-4 mt-3">
        <button
          onClick={handleVoiceRead}
          className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all shadow-sm ${
            isSpeaking
              ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
              : "bg-white/90 border border-blue-200 text-blue-700 hover:bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isSpeaking ? "bg-white text-indigo-600" : "bg-blue-100 text-blue-600"
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold">
                {isSpeaking ? "Sedang Membacakan Panduan..." : "Dengar Panduan Suara"}
              </p>
              <p className={`text-[10.5px] ${isSpeaking ? "text-indigo-100" : "text-slate-500"}`}>
                Web Speech AI membaca dosis dan aturan pakai
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold underline">
            {isSpeaking ? "Jeda" : "Putar"}
          </span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-4 mt-3">
        <div className="bg-white/90 rounded-full p-1 flex text-[11px] font-bold border border-white shadow-xs">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-1 rounded-full transition-all ${
              activeTab === "info"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            Informasi
          </button>
          <button
            onClick={() => router.push("/interactions")}
            className="flex-1 py-1 rounded-full text-slate-500 hover:text-blue-600"
          >
            Interaksi
          </button>
          <button
            onClick={() => router.push("/restrictions")}
            className="flex-1 py-1 rounded-full text-slate-500 hover:text-blue-600"
          >
            Pantangan
          </button>
          <button
            onClick={() => router.push("/schedule")}
            className="flex-1 py-1 rounded-full text-slate-500 hover:text-blue-600"
          >
            Jadwal
          </button>
        </div>
      </div>

      {/* Tab Content: Detail Informasi */}
      <div className="px-4 mt-3 space-y-3">
        {/* Verification Status Pill */}
        <div className="glass-card rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Verifikasi BPOM & Exp Date</span>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {currentDrug.expiryDate} (Aman)
          </span>
        </div>

        {/* Indication */}
        <div className="glass-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Fungsi & Indikasi Medis</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {currentDrug.indication}
          </p>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Aturan Pakai & Waktu Minum</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {currentDrug.instructions}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Waktu: {currentDrug.recommendedTime} WIB
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentDrug.timingLabel}
            </span>
          </div>
        </div>

        {/* Side Effects */}
        <div className="glass-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Potensi Efek Samping Ringan</span>
          </div>
          <ul className="space-y-1">
            {currentDrug.sideEffects.map((effect, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Precautions */}
        <div className="rounded-2xl p-3.5 bg-rose-50 border border-rose-200 text-rose-900">
          <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Peringatan Penting Farmasis</span>
          </div>
          <p className="text-xs text-rose-800/90 leading-relaxed">
            {currentDrug.precautions}
          </p>
        </div>
      </div>
    </div>
  );
}
