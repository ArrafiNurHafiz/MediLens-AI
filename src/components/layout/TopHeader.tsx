"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, Sparkles } from "lucide-react";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showVoiceShortcut?: boolean;
  dark?: boolean;
}

export default function TopHeader({
  title,
  subtitle,
  backHref,
  showBack = true,
  rightAction,
  showVoiceShortcut = true,
  dark = false,
}: TopHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`w-full px-4 pt-1 pb-3 flex items-center justify-between z-30 transition-colors ${
        dark ? "text-white" : "text-slate-800"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            onClick={handleBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              dark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700"
            }`}
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold tracking-tight leading-tight flex items-center gap-1.5">
            {title}
          </h1>
          {subtitle && (
            <p className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightAction}
        {showVoiceShortcut && (
          <Link
            href="/voice-guide"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs transition-colors"
            title="Buka Asisten Suara"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="text-[11px]">Suara</span>
          </Link>
        )}
      </div>
    </header>
  );
}
