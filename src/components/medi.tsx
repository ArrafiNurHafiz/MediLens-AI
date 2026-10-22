import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Home,
  Pill,
  Mic,
  CalendarDays,
  MapPin,
  Eye,
  Type,
  Volume2,
  VolumeX,
  Vibrate,
  Sliders,
  Check,
  X,
  Sparkles,
  Accessibility,
  User,
} from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useMedicine } from "@/lib/medicineContext";

export function Phone({ children, dark = true }: { children: ReactNode; dark?: boolean }) {
  const { profile } = useMedicine();
  const { highContrast, largeFont } = profile.settings;

  return (
    <div className={`flex min-h-screen justify-center ${highContrast ? "bg-black" : "bg-slate-950"}`}>
      <div
        className={`relative flex min-h-screen w-full max-w-md flex-col shadow-2xl overflow-x-hidden transition-all duration-300 ${
          highContrast
            ? "bg-black text-[#FFE600] border-x-4 border-[#FFE600]"
            : dark
              ? "bg-navy text-navy-foreground"
              : "bg-background text-foreground"
        } ${largeFont ? "text-base [&_p]:text-sm [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_button]:py-4 [&_button]:text-sm" : ""}`}
      >
        {children}
        <VoiceCommander />
      </div>
    </div>
  );
}

export function TopBar({
  title,
  rightAction,
  onBack,
}: {
  title: string;
  rightAction?: ReactNode;
  onBack?: () => void;
}) {
  const nav = useNavigate();
  const { profile, playFeedback } = useMedicine();
  const [showA11yModal, setShowA11yModal] = useState(false);

  return (
    <>
      <header
        className={`relative z-20 flex items-center justify-between px-4 pb-3 pt-5 backdrop-blur-md border-b ${
          profile.settings.highContrast
            ? "bg-black text-[#FFE600] border-[#FFE600]"
            : "bg-navy/95 text-navy-foreground border-white/5"
        }`}
      >
        <button
          aria-label="Kembali ke halaman sebelumnya"
          onClick={() => {
            playFeedback("click");
            if (onBack) onBack();
            else nav({ to: "/beranda" });
          }}
          className={`rounded-full p-2 transition-all active:scale-95 ${
            profile.settings.highContrast
              ? "text-[#FFE600] border-2 border-[#FFE600] bg-black"
              : "text-white hover:bg-white/10"
          }`}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <h1 className="text-base font-extrabold text-center flex-1 px-2 truncate tracking-tight">{title}</h1>

        <div className="flex items-center gap-1 min-w-10 justify-end">
          {rightAction}
          <Link
            to="/profile"
            onClick={() => playFeedback("click")}
            aria-label="Profil Pengguna"
            className={`rounded-full p-2 transition-all active:scale-95 ${
              profile.settings.highContrast
                ? "text-[#FFE600] border-2 border-[#FFE600] bg-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
            title="Profil Pengguna"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            aria-label="Buka Pengaturan Aksesibilitas Disabilitas"
            onClick={() => {
              playFeedback("click");
              setShowA11yModal(true);
            }}
            className={`rounded-full p-2 transition-all active:scale-95 ${
              profile.settings.highContrast
                ? "bg-[#FFE600] text-black font-black"
                : "bg-white/10 text-emerald-400 hover:bg-white/20 border border-emerald-400/30"
            }`}
            title="Aksesibilitas & Ramah Disabilitas"
          >
            <Accessibility className="h-5 w-5" />
          </button>
        </div>
      </header>

      {showA11yModal && <AccessibilityModal onClose={() => setShowA11yModal(false)} />}
    </>
  );
}

export function Sheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { profile } = useMedicine();
  return (
    <div
      className={`flex-1 rounded-t-3xl p-5 shadow-inner ${
        profile.settings.highContrast
          ? "bg-black text-[#FFE600] border-t-4 border-[#FFE600]"
          : "bg-background text-foreground"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function BottomNav() {
  const { profile, playFeedback } = useMedicine();
  const { highContrast } = profile.settings;

  const navItem = `flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
    highContrast ? "text-[#FFE600]/80 hover:text-[#FFE600]" : "text-slate-300 hover:text-white"
  }`;
  const activeClass = highContrast
    ? "text-black bg-[#FFE600] px-2 py-1 rounded-xl font-black"
    : "text-emerald-400 font-extrabold";

  return (
    <nav
      className={`mt-auto relative z-10 flex items-center justify-around px-2 py-2.5 border-t ${
        highContrast ? "bg-black border-[#FFE600] text-[#FFE600]" : "bg-slate-900 border-white/10"
      }`}
    >
      <Link
        to="/beranda"
        onClick={() => playFeedback("click")}
        className={navItem}
        activeProps={{ className: activeClass }}
      >
        <Home className="h-5 w-5" />
        <span>Beranda</span>
      </Link>
      <Link
        to="/obat"
        onClick={() => playFeedback("click")}
        className={navItem}
        activeProps={{ className: activeClass }}
      >
        <Pill className="h-5 w-5" />
        <span>Obat Saya</span>
      </Link>
      <Link
        to="/tanya"
        onClick={() => playFeedback("click")}
        aria-label="Tanya AI Dokter"
        className={`-mt-7 grid h-14 w-14 place-items-center rounded-full shadow-lg active:scale-95 transition-transform ${
          highContrast
            ? "bg-[#FFE600] text-black ring-4 ring-black font-black"
            : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white ring-4 ring-slate-900"
        }`}
      >
        <Mic className="h-7 w-7" />
      </Link>
      <Link
        to="/jadwal"
        onClick={() => playFeedback("click")}
        className={navItem}
        activeProps={{ className: activeClass }}
      >
        <CalendarDays className="h-5 w-5" />
        <span>Jadwal</span>
      </Link>
      <Link
        to="/apotek"
        onClick={() => playFeedback("click")}
        className={navItem}
        activeProps={{ className: activeClass }}
      >
        <MapPin className="h-5 w-5" />
        <span>Apotek</span>
      </Link>
    </nav>
  );
}

export function AccessibilityModal({ onClose }: { onClose: () => void }) {
  const { profile, updateAccessibility, playFeedback } = useMedicine();
  const settings = profile.settings;

  const speakGuide = () => {
    speak(
      "Menu Aksesibilitas Ramah Disabilitas. Di sini Anda dapat mengaktifkan Pembaca Suara Otomatis untuk tunanetra, mode ukuran huruf besar, mode kontras tinggi kuning hitam, dan mengatur kecepatan bicara.",
      settings.speechRate
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl border ${
          settings.highContrast
            ? "bg-black text-[#FFE600] border-4 border-[#FFE600]"
            : "bg-slate-900 text-white border-white/10"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-xl ${
                settings.highContrast ? "bg-[#FFE600] text-black" : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              <Accessibility className="h-6 w-6" />
            </span>
            <div>
              <h2 id="a11y-title" className="text-base font-extrabold">
                Fitur Ramah Disabilitas
              </h2>
              <p className="text-xs opacity-80">Dirancang untuk Tunanetra, Low Vision & Lansia</p>
            </div>
          </div>
          <button
            aria-label="Tutup Menu Aksesibilitas"
            onClick={() => {
              playFeedback("click");
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <button
          onClick={speakGuide}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 ${
            settings.highContrast
              ? "bg-[#FFE600] text-black font-black"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
          }`}
        >
          <Volume2 className="h-4 w-4" /> Dengarkan Panduan Menu Ini
        </button>

        <div className="space-y-3.5 text-xs">
          {/* 1. Suara Otomatis (Screen Reader Tunanetra) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <Volume2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Pembaca Suara Otomatis</p>
                <p className="opacity-75 mt-0.5">Membacakan nama obat, dosis, dan hasil scan secara otomatis.</p>
              </div>
            </div>
            <button
              aria-label="Alihkan Pembaca Suara Otomatis"
              onClick={() => {
                const next = !settings.autoVoice;
                updateAccessibility({ autoVoice: next });
                playFeedback("click");
                speak(next ? "Pembaca suara otomatis aktif." : "Pembaca suara otomatis dinonaktifkan.", settings.speechRate);
              }}
              className={`h-7 w-12 rounded-full p-1 transition-colors ${
                settings.autoVoice ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  settings.autoVoice ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 2. Huruf Ekstra Besar (A+) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <Type className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Huruf Ekstra Besar (A+)</p>
                <p className="opacity-75 mt-0.5">Memperbesar ukuran teks dan tombol agar mudah dibaca lansia.</p>
              </div>
            </div>
            <button
              aria-label="Alihkan Huruf Ekstra Besar"
              onClick={() => {
                const next = !settings.largeFont;
                updateAccessibility({ largeFont: next });
                playFeedback("click");
                speak(next ? "Mode huruf ekstra besar aktif." : "Ukuran huruf kembali normal.", settings.speechRate);
              }}
              className={`h-7 w-12 rounded-full p-1 transition-colors ${
                settings.largeFont ? "bg-blue-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  settings.largeFont ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 3. Kontras Tinggi WCAG AAA */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Kontras Tinggi (WCAG AAA)</p>
                <p className="opacity-75 mt-0.5">Warna kuning di atas hitam pekat untuk penderita low vision & katarak.</p>
              </div>
            </div>
            <button
              aria-label="Alihkan Mode Kontras Tinggi"
              onClick={() => {
                const next = !settings.highContrast;
                updateAccessibility({ highContrast: next });
                playFeedback("click");
                speak(next ? "Mode kontras tinggi aktif." : "Mode kontras standar aktif.", settings.speechRate);
              }}
              className={`h-7 w-12 rounded-full p-1 transition-colors ${
                settings.highContrast ? "bg-amber-400" : "bg-slate-700"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  settings.highContrast ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 4. Kecepatan Suara */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" /> Kecepatan Bicara Suara
              </span>
              <span className="font-extrabold text-xs">{settings.speechRate}x</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { val: 0.8, label: "Lambat (0.8x)" },
                { val: 1.0, label: "Normal (1.0x)" },
                { val: 1.25, label: "Cepat (1.25x)" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => {
                    updateAccessibility({ speechRate: val });
                    playFeedback("click");
                    speak(`Kecepatan suara diatur ke ${label}`, val);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                    settings.speechRate === val
                      ? settings.highContrast
                        ? "bg-[#FFE600] text-black border-[#FFE600] font-black"
                        : "bg-purple-600 text-white border-purple-400 shadow-md"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Getaran & Nada Audio */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <Vibrate className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Umpan Balik Getaran & Nada</p>
                <p className="opacity-75 mt-0.5">Konfirmasi fisik melalui getaran ponsel dan nada saat tombol ditekan.</p>
              </div>
            </div>
            <button
              aria-label="Alihkan Getaran dan Nada"
              onClick={() => {
                const next = !settings.hapticFeedback;
                updateAccessibility({ hapticFeedback: next, soundEffects: next });
                playFeedback("click");
                speak(next ? "Umpan balik getaran dan nada aktif." : "Umpan balik dinonaktifkan.", settings.speechRate);
              }}
              className={`h-7 w-12 rounded-full p-1 transition-colors ${
                settings.hapticFeedback ? "bg-rose-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  settings.hapticFeedback ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            playFeedback("click");
            onClose();
          }}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all active:scale-95 ${
            settings.highContrast
              ? "bg-[#FFE600] text-black font-black"
              : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
          }`}
        >
          Selesai & Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}

export function VoiceCommander() {
  const nav = useNavigate();
  const { profile, playFeedback } = useMedicine();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.lang = "id-ID";
        reco.continuous = false;
        reco.interimResults = false;

        reco.onstart = () => {
          setIsListening(true);
          playFeedback("click");
        };

        reco.onresult = (event: any) => {
          const command = event.results[0][0].transcript.toLowerCase();
          console.log("Voice Command received:", command);

          if (command.includes("beranda") || command.includes("home") || command.includes("menu")) {
            speak("Membuka beranda utama.", profile.settings.speechRate);
            nav({ to: "/beranda" });
          } else if (command.includes("obat") || command.includes("lemari") || command.includes("daftar")) {
            speak("Membuka lemari obat saya.", profile.settings.speechRate);
            nav({ to: "/obat" });
          } else if (command.includes("scan") || command.includes("pindai") || command.includes("kamera")) {
            speak("Membuka kamera pemindai obat.", profile.settings.speechRate);
            nav({ to: "/scan" });
          } else if (command.includes("jadwal") || command.includes("jam") || command.includes("pengingat")) {
            speak("Membuka jadwal minum obat harian.", profile.settings.speechRate);
            nav({ to: "/jadwal" });
          } else if (command.includes("apotek") || command.includes("resep") || command.includes("beli")) {
            speak("Mencari apotek terdekat.", profile.settings.speechRate);
            nav({ to: "/apotek" });
          } else if (command.includes("tanya") || command.includes("dokter") || command.includes("konsultasi")) {
            speak("Membuka asisten dokter AI.", profile.settings.speechRate);
            nav({ to: "/tanya" });
          } else if (command.includes("profil") || command.includes("profile") || command.includes("nama") || command.includes("biodata") || command.includes("akun")) {
            speak("Membuka profil kesehatan dan pengaturan nama pengguna.", profile.settings.speechRate);
            nav({ to: "/profile" });
          } else {
            speak(`Perintah "${command}" tidak dikenali. Katakan beranda, obat, scan, jadwal, atau apotek.`);
          }
        };

        reco.onerror = () => {
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = reco;
      }
    }
  }, [nav, profile.settings.speechRate]);

  const toggleVoiceCommand = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeech();
      speak("Katakan menu tujuan Anda. Misalnya: buka jadwal, atau scan obat.", profile.settings.speechRate);
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }, 1200);
    }
  };

  if (typeof window === "undefined") return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <button
        aria-label={isListening ? "Mendengarkan perintah suara..." : "Perintah Suara Hands-free Navigasi"}
        onClick={toggleVoiceCommand}
        className={`grid h-12 w-12 place-items-center rounded-full shadow-2xl transition-all active:scale-95 ${
          isListening
            ? "bg-rose-600 text-white animate-bounce ring-4 ring-rose-500/50"
            : profile.settings.highContrast
              ? "bg-[#FFE600] text-black font-black border-2 border-black"
              : "bg-slate-800/90 hover:bg-slate-700 text-emerald-400 border border-emerald-400/30 backdrop-blur-md"
        }`}
        title="Navigasi Suara Hands-free (Katakan: Beranda, Obat, Jadwal, Scan, Apotek)"
      >
        <Mic className={`h-6 w-6 ${isListening ? "animate-pulse" : ""}`} />
      </button>
    </div>
  );
}

let currentAudioInstance: HTMLAudioElement | null = null;

export const speak = (text: string, rate = 1.0) => {
  if (typeof window === "undefined") return;
  const cleanText = text.replace(/[*_#`[\]()]/g, " ").trim();
  if (!cleanText) return;

  // 1. Prioritas Utama: Android Native TextToSpeech Bridge (Jika di dalam APK Android)
  if ((window as any).AndroidTTS && typeof (window as any).AndroidTTS.speak === "function") {
    try {
      (window as any).AndroidTTS.speak(cleanText, rate);
      return;
    } catch (e) {
      console.warn("AndroidTTS bridge error:", e);
    }
  }

  // 2. Prioritas Kedua: Natural Indonesian Audio Stream dari Server (/api/tts)
  // Menghasilkan suara manusia berbahasa Indonesia asli, tidak tergantung mesin suara lokal
  try {
    if (currentAudioInstance) {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
    }

    const audio = new Audio(`/api/tts?text=${encodeURIComponent(cleanText)}`);
    audio.playbackRate = rate;
    currentAudioInstance = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((playErr) => {
        console.warn("Audio play blocked by browser autoplay policy, fallback to SpeechSynthesis:", playErr);
        // Fallback langsung ke SpeechSynthesis
        fallbackBrowserSpeech(cleanText, rate);
      });
    }
    return;
  } catch (err) {
    console.warn("Audio streaming error:", err);
  }

  // 3. Fallback: Browser Web SpeechSynthesis
  fallbackBrowserSpeech(cleanText, rate);
};

function fallbackBrowserSpeech(cleanText: string, rate: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = "id-ID";
    u.rate = rate;
    u.pitch = 1.0;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.startsWith("id") || v.lang.startsWith("ID"));
    if (idVoice) u.voice = idVoice;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn("Speech synthesis fallback error:", e);
  }
}

export const stopSpeech = () => {
  if (typeof window === "undefined") return;
  if (currentAudioInstance) {
    currentAudioInstance.pause();
    currentAudioInstance.currentTime = 0;
    currentAudioInstance = null;
  }
  if ((window as any).AndroidTTS && typeof (window as any).AndroidTTS.stop === "function") {
    try {
      (window as any).AndroidTTS.stop();
    } catch (e) {}
  }
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};
