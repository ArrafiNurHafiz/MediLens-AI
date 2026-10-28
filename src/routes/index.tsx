import { createFileRoute, Link } from "@tanstack/react-router";
import { Pill, Volume2, ArrowRight, ShieldCheck, Sparkles, Download } from "lucide-react";
import { Phone, speak } from "@/components/medi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediLens AI — Asisten Cerdas Keamanan Obat" },
      { name: "description", content: "Pindai obat dengan kamera, dengarkan instruksi suara ramah lansia, dan pantau jadwal minum obat secara real-time." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const introVoice = "Selamat datang di MediLens AI. Asisten pintar konsumsi obat resep, panduan suara ramah lansia dan tunanetra, serta deteksi interaksi obat cerdas.";

  return (
    <Phone dark={true}>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-6">
          <div className="grid h-32 w-32 place-items-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-2xl ring-8 ring-white/5">
            <Pill className="h-16 w-16 text-white -rotate-45" />
          </div>
          <span className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-slate-950">
            <Sparkles className="h-5 w-5" />
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">MediLens AI</h1>
        <p className="mt-2 text-sm text-blue-200/90 font-medium">
          Asisten Cerdas Keamanan & Panduan Obat Pasien
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="text-[11px] font-semibold bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Deteksi Alergi Real
          </span>
          <span className="text-[11px] font-semibold bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-blue-400" /> Panduan Suara Lansia
          </span>
        </div>
      </div>

      <div className="space-y-3 p-6 pb-8">
        <button
          onClick={() => speak(introVoice)}
          className="flex w-full items-center gap-3.5 rounded-2xl bg-slate-900 border border-white/10 p-4 text-left text-slate-200 hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/20 text-blue-400">
            <Volume2 className="h-5 w-5" />
          </span>
          <span className="text-xs leading-relaxed flex-1">
            Dengarkan pengenalan aplikasi melalui suara bahasa Indonesia.
          </span>
        </button>

        <Link
          to="/beranda"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-950/50 hover:brightness-105 active:scale-95 transition-all"
        >
          Masuk ke Aplikasi <ArrowRight className="h-4 w-4" />
        </Link>

        <a
          href="https://github.com/ArrafiNurHafiz/MediLens-AI/releases/download/v1.1.0/MediLensAI.apk"
          download="MediLensAI.apk"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 py-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 active:scale-95 transition-all"
        >
          <Download className="h-4 w-4" /> Pasang / Unduh APK Android (5.3 MB)
        </a>
      </div>
    </Phone>
  );
}
