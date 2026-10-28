import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ScanLine,
  ChevronRight,
  Pill,
  CalendarClock,
  MessageCircle,
  MapPin,
  Volume2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Accessibility,
  User,
} from "lucide-react";
import { Phone, BottomNav, speak, AccessibilityModal } from "@/components/medi";
import { useMedicine } from "@/lib/medicineContext";

export const Route = createFileRoute("/beranda")({
  head: () => ({
    meta: [
      { title: "Beranda — MediLens AI" },
      { name: "description", content: "Pusat asisten pintar konsumsi obat, jadwal, dan deteksi interaksi medis." },
    ],
  }),
  component: Beranda,
});

export default function Beranda() {
  const { medicines, schedule, profile, playFeedback } = useMedicine();
  const [showA11y, setShowA11y] = useState(false);

  const totalMeds = medicines.length;
  const takenCount = schedule.filter((s) => s.taken).length;
  const totalSchedule = schedule.length;
  const nextPending = schedule.find((s) => !s.taken);

  // Check if any medicine in cabinet triggers user allergies
  const allergyAlerts = medicines.filter((m) =>
    profile.allergies.some((a) => {
      const allergyTerm = (a.toLowerCase().split("/")[0] ?? "").trim();
      if (!allergyTerm) return false;
      return (
        m.name.toLowerCase().includes(allergyTerm) ||
        m.genericName.toLowerCase().includes(allergyTerm) ||
        m.indication.toLowerCase().includes(allergyTerm)
      );
    })
  );

  const tiles = [
    {
      to: "/konsultasi" as const,
      label: "Rekam Suara Dokter",
      sub: "Dikte arahan resep klinik",
      icon: MessageCircle,
      color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    {
      to: "/obat" as const,
      label: "Daftar Obat Saya",
      sub: `${totalMeds} obat terdaftar`,
      icon: Pill,
      color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      to: "/jadwal" as const,
      label: "Jadwal Minum",
      sub: nextPending ? `Berikutnya: ${nextPending.time}` : "Semua selesai",
      icon: CalendarClock,
      color: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    },
    {
      to: "/apotek" as const,
      label: "Cari Apotek",
      sub: "Apotek buka terdekat",
      icon: MapPin,
      color: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    },
  ];

  const welcomeVoice = `Halo ${profile.name}. Hari ini ada ${totalSchedule} jadwal minum obat. ${takenCount} sudah diminum. ${nextPending ? `Obat Anda berikutnya adalah ${nextPending.medicineName} pada pukul ${nextPending.time}.` : "Semua obat hari ini telah diminum."}`;

  useEffect(() => {
    if (profile.settings.autoVoice) {
      const summary =
        totalMeds === 0
          ? `Selamat datang di MediLens AI, ${profile.name}. Lemari obat Anda masih kosong. Ketuk tombol besar di tengah untuk memindai obat baru dengan kamera.`
          : `Halo ${profile.name}. Ada ${totalMeds} obat terdaftar, dan ${totalSchedule} jadwal hari ini. ${takenCount} sudah diminum.`;
      speak(summary, profile.settings.speechRate);
    }
  }, []);

  return (
    <Phone dark={true}>
      {/* Top Profile Header */}
      <header className="px-5 pb-5 pt-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Sistem Aktif
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-extrabold text-white">Halo, {profile.name}</h1>
            <p className="text-xs text-slate-300">Asisten Keamanan & Jadwal Obat Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              onClick={() => playFeedback("click")}
              aria-label="Profil Pengguna & Ubah Nama"
              className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-slate-200 border border-white/10 hover:bg-white/20 active:scale-95 transition-transform"
              title="Profil Pengguna & Ubah Nama"
            >
              <User className="h-6 w-6" />
            </Link>
            <button
              onClick={() => {
                playFeedback("click");
                setShowA11y(true);
              }}
              aria-label="Pengaturan Ramah Disabilitas"
              className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 active:scale-95 transition-transform"
              title="Aksesibilitas & Ramah Disabilitas"
            >
              <Accessibility className="h-6 w-6" />
            </button>
            <button
              onClick={() => {
                playFeedback("click");
                speak(welcomeVoice, profile.settings.speechRate);
              }}
              aria-label="Dengarkan Ringkasan Suara Hari Ini"
              className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600/50 active:scale-95 transition-transform"
              title="Dengarkan Ringkasan Suara"
            >
              <Volume2 className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Allergy Warning Banner if any detected */}
        {allergyAlerts.length > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 p-3.5 text-rose-200">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="text-xs flex-1">
              <p className="font-bold text-rose-300">Peringatan Alergi Pasien!</p>
              <p className="mt-0.5 text-rose-200/90 leading-relaxed">
                Obat <strong>{allergyAlerts.map((m) => m.name).join(", ")}</strong> berpotensi bertentangan dengan riwayat alergi Anda ({profile.allergies.join(", ")}).
              </p>
            </div>
          </div>
        )}

        {/* Daily Progress Card */}
        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
            <span>Kepatuhan Minum Hari Ini</span>
            <span className="font-bold text-emerald-400">
              {takenCount} dari {totalSchedule} ({totalSchedule > 0 ? Math.round((takenCount / totalSchedule) * 100) : 100}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${totalSchedule > 0 ? (takenCount / totalSchedule) * 100 : 100}%` }}
            />
          </div>
          {nextPending ? (
            <p className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Berikutnya: <strong>{nextPending.time}</strong> — {nextPending.medicineName} ({nextPending.timingLabel})
            </p>
          ) : (
            <p className="mt-2.5 text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Semua jadwal obat hari ini sudah terpenuhi dengan baik!
            </p>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 rounded-t-3xl bg-slate-900 border-t border-white/10 p-5 text-white flex flex-col gap-5">
        {/* Big Real Scan Button */}
        <Link
          to="/scan"
          className="group relative flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white shadow-xl shadow-indigo-950/40 hover:brightness-105 active:scale-[0.99] transition-all border border-white/20"
        >
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-md">
            <ScanLine className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-extrabold tracking-tight">Pindai / Scan Obat</p>
              <span className="text-[10px] uppercase font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-blue-100/85 mt-0.5">
              Arahkan kamera ke kemasan/resep untuk analisis zat aktif, dosis, dan panduan suara instan
            </p>
          </div>
          <ChevronRight className="h-6 w-6 text-white/80 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* 4 Feature Tiles */}
        <div className="grid grid-cols-2 gap-3.5">
          {tiles.map(({ to, label, sub, icon: Icon, color }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col justify-between rounded-2xl bg-slate-800/80 border border-white/5 p-4 hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-white leading-tight">{label}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Health Profile & Emergency Summary */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex items-center justify-between">
          <Link
            to="/profile"
            onClick={() => playFeedback("click")}
            className="flex items-center gap-3 flex-1 hover:opacity-90"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-700 text-slate-200 shrink-0">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{profile.name} ({profile.bloodType}, {profile.age} th)</p>
              <p className="text-[11px] text-slate-400">
                Alergi: <span className="text-rose-400 font-medium">{profile.allergies.join(", ") || "Nihil"}</span>
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              onClick={() => playFeedback("click")}
              className="text-[11px] font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
            >
              Ubah Profil
            </Link>
            <button
              onClick={() => {
                if (profile.emergencyContact.phone) {
                  window.open(`tel:${profile.emergencyContact.phone}`);
                }
              }}
              className="text-[11px] font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
            >
              Darurat
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
      {showA11y && <AccessibilityModal onClose={() => setShowA11y(false)} />}
    </Phone>
  );
}
