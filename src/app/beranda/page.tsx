"use client";

import React from "react";
import Link from "next/link";
import { useMedicine } from "@/context/MedicineContext";
import {
  Camera,
  Pill,
  CalendarCheck,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Bell,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldAlert
} from "lucide-react";

export default function BerandaPage() {
  const { medicines, schedule, profile, restrictions, scanHistory, showToast } = useMedicine();

  const activeMedsCount = medicines.length;
  const dosesRemaining = schedule.filter(s => !s.taken).length;
  const restrictionsCount = restrictions.length;

  return (
    <div className="flex-1 pb-6">
      {/* Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
            <span className="font-extrabold text-sm">+</span>
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              MediLens <span className="text-ai-grad">AI</span>
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Asisten Medis Digital</p>
          </div>
        </div>
        <button
          onClick={() => showToast(`Halo ${profile.name}! Semua jadwal minum obat aktif terkontrol.`, "info")}
          className="w-9 h-9 rounded-full bg-white/90 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-xs transition-colors relative"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {dosesRemaining > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </div>

      {/* Greeting & Subtitle */}
      <div className="px-5 my-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Halo, {profile.name.split(" ")[0]} 👋
          </p>
          <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aktif Terlindungi
          </span>
        </div>
        <h2 className="text-sm font-bold text-slate-800 leading-snug mt-0.5">
          Pindai obat, pahami risiko, <br className="hidden xs:inline" />
          konsumsi dengan rasa aman.
        </h2>
      </div>

      {/* Hero Scan Banner */}
      <div className="px-5 my-3">
        <Link
          href="/scan"
          className="hero-scan-grad rounded-3xl p-4.5 text-white flex items-center justify-between gap-3 shadow-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
        >
          {/* Subtle Background Accent */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:bg-white/15 transition-all" />

          <div className="flex items-center gap-3.5 z-10">
            <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-md">
                <Camera className="w-5 h-5 stroke-[2.4]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] tracking-tight">Pindai Obat Sekaligus</span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
              </div>
              <p className="text-xs text-blue-100/90 leading-tight mt-0.5 max-w-[190px]">
                Kamera mendeteksi strip, blister, atau botol obat secara instan
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:translate-x-1 transition-transform z-10">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </Link>
      </div>

      {/* Quick Status Bar */}
      <div className="px-5 my-2">
        <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-around shadow-xs">
          <div className="text-center">
            <span className="text-[11px] text-slate-500 font-medium">Obat Aktif</span>
            <p className="text-base font-extrabold text-blue-600">{activeMedsCount}</p>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div className="text-center">
            <span className="text-[11px] text-slate-500 font-medium">Sisa Jadwal Hari Ini</span>
            <p className="text-base font-extrabold text-amber-600">{dosesRemaining}</p>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div className="text-center">
            <span className="text-[11px] text-slate-500 font-medium">Pantangan</span>
            <p className="text-base font-extrabold text-rose-500">{restrictionsCount}</p>
          </div>
        </div>
      </div>

      {/* 2x2 Feature Cards Grid */}
      <div className="px-5 my-3 grid grid-cols-2 gap-3">
        {/* Card 1: Daftar Obat */}
        <Link
          href="/drugs"
          className="glass-card rounded-2xl p-3.5 flex flex-col justify-between h-[124px] hover:border-blue-400/70 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              {activeMedsCount} Obat
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Daftar Obat
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Kabinet obat & informasi dosis</p>
          </div>
        </Link>

        {/* Card 2: Jadwal Konsumsi */}
        <Link
          href="/schedule"
          className="glass-card rounded-2xl p-3.5 flex flex-col justify-between h-[124px] hover:border-blue-400/70 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {dosesRemaining === 0 ? "Lengkap" : `${dosesRemaining} Sisa`}
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Jadwal Konsumsi
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Pengingat jam & checklist minum</p>
          </div>
        </Link>

        {/* Card 3: Profil Kesehatan */}
        <Link
          href="/profile"
          className="glass-card rounded-2xl p-3.5 flex flex-col justify-between h-[124px] hover:border-blue-400/70 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {profile.bloodType}
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Profil Pasien
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Riwayat alergi & kondisi medis</p>
          </div>
        </Link>

        {/* Card 4: Pantangan Makanan */}
        <Link
          href="/restrictions"
          className="glass-card rounded-2xl p-3.5 flex flex-col justify-between h-[124px] hover:border-blue-400/70 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {restrictionsCount} Peringatan
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Pantangan
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Makanan & minuman dihindari</p>
          </div>
        </Link>
      </div>

      {/* Riwayat Pindai Terakhir */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Riwayat Pindai Terakhir
          </h3>
          <Link href="/results" className="text-[11px] font-bold text-blue-600 hover:underline">
            Lihat Hasil Terakhir
          </Link>
        </div>

        <div className="space-y-2">
          {scanHistory.slice(0, 2).map((item) => (
            <Link
              key={item.id}
              href="/results"
              className="glass-card rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  item.status === 'caution' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                }`}>
                  {item.status === 'caution' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {item.drugNames.length} Obat Terdeteksi
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.summary}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
