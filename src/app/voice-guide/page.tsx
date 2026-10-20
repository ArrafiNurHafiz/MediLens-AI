"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMedicine } from "@/context/MedicineContext";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Headphones,
  CheckCircle2,
  Pill,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function VoiceGuidePage() {
  const router = useRouter();
  const { profile, medicines, showToast } = useMedicine();

  const [speechRate, setSpeechRate] = useState<number>(profile.settings.speechRate || 1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<number>(0);

  const topics = [
    {
      id: 0,
      title: "Ringkasan Lengkap Hari Ini",
      subtitle: "3 Obat, status keamanan & jadwal",
      text: `Halo ${profile.name.split(" ")[0]}! Saya MediLens AI. Berdasarkan hasil pindai tiga obat Anda: Pertama, Amlodipine 5 miligram untuk menurunkan tekanan darah tinggi, status aman, diminum pagi hari sesudah makan. Kedua, Omeprazole 20 miligram untuk lambung, diminum sebelum makan. Ketiga, Simvastatin 20 miligram untuk kolesterol. Perhatian: Beri jeda waktu minimal 2 jam antara Omeprazole dan Simvastatin, serta hindari konsumsi bersama buah jeruk bali, kopi, atau susu.`,
      icon: Pill
    },
    {
      id: 1,
      title: "Detail Amlodipine 5 mg",
      subtitle: "Dosis, indikasi tensi & aturan pakai",
      text: `Detail Obat Amlodipine Besylate 5 miligram. Fungsi obat: Menurunkan tekanan darah tinggi dengan merelaksasi pembuluh darah. Tanggal kedaluwarsa 12 Desember 2026, status aman. Aturan pakai: 1 tablet 1 kali sehari setelah makan di pagi hari pukul 7. Jangan menghentikan konsumsi secara mendadak.`,
      icon: CheckCircle2
    },
    {
      id: 2,
      title: "Peringatan Pantangan Makanan",
      subtitle: "Jeruk bali, kafein kopi & susu",
      text: `Peringatan pantangan makanan penting: Jangan mengonsumsi buah jeruk bali atau grapefruit selama meminum Simvastatin, karena dapat memicu nyeri otot berat dan kerusakan ginjal. Selain itu, batasi konsumsi kopi berlebih dan beri jeda 2 jam sebelum atau sesudah minum obat.`,
      icon: AlertTriangle
    },
    {
      id: 3,
      title: "Jadwal Minum Obat Lengkap",
      subtitle: "Pagi, siang, dan malam",
      text: `Jadwal konsumsi obat Anda hari ini: Pukul 7 pagi, Amlodipine 5 miligram setelah makan. Pukul 10 pagi, Omeprazole 20 miligram sebelum makan. Dan pukul 8 malam sebelum tidur, Simvastatin 20 miligram setelah makan malam.`,
      icon: Clock
    }
  ];

  const currentTopic = topics[selectedTopic];

  const speakCurrentText = () => {
    if (!("speechSynthesis" in window)) {
      showToast("Browser Anda tidak mendukung Web Speech API", "error");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      showToast("Panduan suara dijeda", "info");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentTopic.text);
    utterance.lang = "id-ID";
    utterance.rate = speechRate;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      setIsSpeaking(true);
      showToast(`MediLens AI sedang membacakan: ${currentTopic.title}`, "info");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    showToast(`Kecepatan suara diatur ke ${rate}x`, "info");
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(currentTopic.text);
        utterance.lang = "id-ID";
        utterance.rate = rate;
        utterance.pitch = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className={`flex-1 pb-6 select-none flex flex-col justify-between ${isSpeaking ? "playing-audio" : ""}`}>
      {/* Top Header */}
      <div>
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Panduan Suara AI
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Aksesibilitas Ramah Lansia & Pasien
            </p>
          </div>
          <button
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
            }}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Hentikan Suara"
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>

        {/* 3D Robot Avatar with Headphones */}
        <div className="flex flex-col items-center px-6 pt-2 text-center">
          <div className="relative mb-3">
            <div
              className={`absolute -inset-4 rounded-full blur-xl transition-all duration-300 ${
                isSpeaking
                  ? "bg-gradient-to-tr from-blue-500/50 via-purple-500/50 to-pink-500/50 scale-110"
                  : "bg-blue-400/20"
              }`}
            />
            {/* 3D Avatar SVG */}
            <svg viewBox="0 0 140 130" className="w-32 h-28 relative drop-shadow-xl">
              <defs>
                <linearGradient id="headPhoneBand" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="robotBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#dbeafe" />
                </linearGradient>
                <linearGradient id="visorScreen" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* Headphone Arch */}
              <path
                d="M 22 68 C 22 22, 118 22, 118 68"
                fill="none"
                stroke="url(#headPhoneBand)"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Headphone Cups */}
              <rect x="12" y="52" width="14" height="28" rx="7" fill="#6366f1" />
              <rect x="114" y="52" width="14" height="28" rx="7" fill="#6366f1" />

              {/* Robot Head Body */}
              <rect
                x="26"
                y="38"
                width="88"
                height="68"
                rx="28"
                fill="url(#robotBody)"
                stroke="#ffffff"
                strokeWidth="2.5"
              />

              {/* Visor Screen */}
              <rect
                x="33"
                y="49"
                width="74"
                height="40"
                rx="18"
                fill="url(#visorScreen)"
                stroke="#38bdf8"
                strokeWidth="1.2"
              />

              {/* Animated Visor Eyes */}
              <ellipse
                cx="54"
                cy="68"
                rx={isSpeaking ? "8" : "6"}
                ry={isSpeaking ? "7" : "5"}
                fill="#38bdf8"
                className={isSpeaking ? "animate-pulse" : ""}
              />
              <ellipse
                cx="86"
                cy="68"
                rx={isSpeaking ? "8" : "6"}
                ry={isSpeaking ? "7" : "5"}
                fill="#38bdf8"
                className={isSpeaking ? "animate-pulse" : ""}
              />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Halo, {profile.name.split(" ")[0]}!
            </h2>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-[260px] leading-snug mt-0.5">
            Saya MediLens AI. Ketuk tombol putar untuk mendengarkan panduan obat dengan jelas.
          </p>

          {/* Sound Wave Spectrum Visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-10 my-2">
            {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 1.3, 0.7, 0.9, 0.4].map((scale, idx) => (
              <div
                key={idx}
                className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-indigo-500 wave-bar transition-all"
                style={{
                  height: isSpeaking ? `${24 * scale}px` : "6px",
                  animationDelay: `${idx * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* Speed Selector Pills */}
          <div className="bg-white/80 rounded-full p-1 border border-slate-200/80 shadow-xs flex items-center gap-1 text-[11px] font-bold">
            <button
              onClick={() => handleRateChange(0.75)}
              className={`px-3 py-1 rounded-full transition-all ${
                speechRate === 0.75
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              0.75x (Lansia)
            </button>
            <button
              onClick={() => handleRateChange(1.0)}
              className={`px-3 py-1 rounded-full transition-all ${
                speechRate === 1.0
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              1.0x (Normal)
            </button>
            <button
              onClick={() => handleRateChange(1.25)}
              className={`px-3 py-1 rounded-full transition-all ${
                speechRate === 1.25
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              1.25x (Cepat)
            </button>
          </div>
        </div>

        {/* Topic Selector List */}
        <div className="px-4 mt-4 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Pilih Materi Pembacaan:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {topics.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTopic(t.id);
                    if (isSpeaking) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    }
                  }}
                  className={`text-left p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-blue-50/90 border-blue-400 shadow-xs"
                      : "bg-white/80 border-slate-200/70 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-xs font-bold leading-tight line-clamp-1 ${
                        isSelected ? "text-blue-900" : "text-slate-800"
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {t.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Play / Pause Voice Control Bar */}
      <div className="px-5 pt-3">
        <button
          onClick={speakCurrentText}
          className="w-full py-4 rounded-3xl btn-primary-grad font-bold text-sm flex items-center justify-center gap-3 shadow-xl transition-all duration-200 active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {isSpeaking ? (
              <Pause className="w-4 h-4 fill-white text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            )}
          </div>
          <span>
            {isSpeaking ? "Jeda Pembacaan Suara" : `Putar Suara: ${currentTopic.title}`}
          </span>
        </button>
      </div>
    </div>
  );
}
