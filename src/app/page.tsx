"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Volume2 } from "lucide-react";

export default function SplashOnboarding() {
  return (
    <div className="relative flex-1 flex flex-col justify-between px-6 pt-6 pb-8 text-center overflow-hidden">
      {/* Decorative Floating Pill Shapes */}
      <div className="absolute w-14 h-7 rounded-full bg-pink-300/35 rotate-45 top-16 -left-3 blur-xs pointer-events-none" />
      <div className="absolute w-12 h-6 rounded-full bg-blue-300/40 -rotate-12 top-10 right-6 blur-xs pointer-events-none" />
      <div className="absolute w-16 h-8 rounded-full bg-purple-300/30 rotate-12 top-48 -right-4 blur-xs pointer-events-none" />
      <div className="absolute w-14 h-7 rounded-full bg-cyan-300/35 -rotate-45 bottom-32 -left-2 blur-xs pointer-events-none" />

      {/* Main Hero Header */}
      <div className="flex flex-col items-center pt-8">
        {/* 3D Glowing Cross Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-500/40 via-indigo-400/30 to-purple-500/40 blur-xl animate-pulse" />
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-white/95 to-blue-50/90 p-2 shadow-xl border border-white relative flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-16 h-16 drop-shadow-md">
              <defs>
                <linearGradient id="crossGrad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="45%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
                <linearGradient id="crossGrad2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              {/* Vertical bar */}
              <rect x="28" y="10" width="24" height="60" rx="12" fill="url(#crossGrad1)" />
              {/* Horizontal bar */}
              <rect x="10" y="28" width="60" height="24" rx="12" fill="url(#crossGrad2)" opacity="0.95" />
              {/* Inner lens dot */}
              <circle cx="40" cy="40" r="7" fill="#ffffff" opacity="0.9" />
              <circle cx="40" cy="40" r="3.5" fill="#2563eb" />
            </svg>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-1.5 justify-center mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            MediLens <span className="text-ai-grad">AI</span>
          </h1>
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>

        {/* Tagline */}
        <p className="text-slate-600 text-sm font-medium max-w-[270px] leading-relaxed">
          Asisten Pintar Keamanan Obat untuk Semua
        </p>

        {/* Feature Highlights Pills */}
        <div className="w-full mt-8 space-y-2.5 text-left max-w-[320px]">
          <div className="glass-card rounded-2xl p-3 flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Pindai Multi-Obat Sekaligus</p>
              <p className="text-[11px] text-slate-500">Kamera cerdas mendeteksi beberapa strip obat atau resep</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Deteksi Interaksi & Pantangan</p>
              <p className="text-[11px] text-slate-500">Cegah risiko benturan obat dan makanan terlarang</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Volume2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Panduan Suara Ramah Lansia</p>
              <p className="text-[11px] text-slate-500">Membacakan dosis, aturan pakai, dan jadwal minum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full pt-6">
        <Link
          href="/beranda"
          className="w-full py-3.5 rounded-full btn-primary-grad font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          <span>Mulai Sekarang</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
        <Link
          href="/beranda"
          className="inline-block mt-3 text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors"
        >
          Lewati ke Beranda
        </Link>
      </div>
    </div>
  );
}
