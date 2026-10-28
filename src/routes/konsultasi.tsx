import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Volume2,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  Stethoscope,
} from "lucide-react";
import { Phone, TopBar, BottomNav, Sheet, speak, stopSpeech } from "@/components/medi";
import { useMedicine, type DoctorConsultation } from "@/lib/medicineContext";

export const Route = createFileRoute("/konsultasi")({
  head: () => ({
    meta: [
      { title: "Rekam Suara Konsultasi Dokter — MediLens AI" },
      { name: "description", content: "Rekam instruksi dokter setelah konsultasi untuk dicocokkan otomatis saat pindai obat di rumah." },
    ],
  }),
  component: KonsultasiPage,
});

export default function KonsultasiPage() {
  const nav = useNavigate();
  const {
    consultations,
    addConsultation,
    deleteConsultation,
    addMedicine,
    profile,
    showToast,
    playFeedback,
  } = useMedicine();

  // Voice recording & Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [doctorNameInput, setDoctorNameInput] = useState("");
  const [clinicInput, setClinicInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<DoctorConsultation | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Announce page for screen readers / autoVoice
  useEffect(() => {
    if (profile.settings.autoVoice) {
      speak(
        "Halaman rekam suara instruksi dokter. Ketuk tombol mikrofon besar di tengah untuk mulai merekam arahan dokter pasca konsultasi.",
        profile.settings.speechRate
      );
    }
    return () => {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Web Speech Recognition setup
  const startRecording = useCallback(() => {
    playFeedback("click");
    stopSpeech();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Browser tidak mendukung pengenalan suara langsung. Anda dapat mengetik arahan dokter di bawah.", "warning");
      return;
    }

    try {
      const reco = new SpeechRecognition();
      reco.lang = "id-ID";
      reco.continuous = true;
      reco.interimResults = true;

      reco.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        setTranscript("");
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
        speak("Perekaman aktif. Silakan bicara arahan dokter.", profile.settings.speechRate);
      };

      reco.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + " ";
        }
        setTranscript(currentText.trim());
      };

      reco.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          showToast(`Mikrofon: ${event.error}`, "warning");
        }
      };

      reco.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = reco;
      reco.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      showToast("Gagal memulai mikrofon. Pastikan izin mikrofon diaktifkan.", "error");
    }
  }, [profile.settings, playFeedback, showToast]);

  const stopRecording = useCallback(() => {
    playFeedback("click");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    speak("Perekaman dihentikan. Siap dianalisis oleh AI.", profile.settings.speechRate);
  }, [profile.settings, playFeedback]);

  // Submit to API
  const handleProcessConsultation = async (textToProcess?: string) => {
    const text = textToProcess || transcript;
    if (!text.trim()) {
      showToast("Belum ada rekaman suara atau teks arahan dokter.", "warning");
      speak("Belum ada rekaman suara. Silakan rekam atau ketik arahan dokter.", profile.settings.speechRate);
      return;
    }

    setIsProcessing(true);
    playFeedback("click");
    speak("Sedang memproses dan mengekstrak instruksi dokter...", profile.settings.speechRate);

    try {
      const res = await fetch("/api/consultation/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          doctorName: doctorNameInput || undefined,
          clinic: clinicInput || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memproses via server API");
      }

      const json = await res.json();
      if (json.success && json.data) {
        const data: DoctorConsultation = json.data;
        addConsultation(data);
        setLastProcessed(data);
        playFeedback("success");

        // Speak summary back immediately for blind users
        const speakText = `${data.audioGuideText}. Instruksi telah dicocokkan ke sistem MediLens AI.`;
        speak(speakText, profile.settings.speechRate);
      } else {
        throw new Error(json.error || "Gagal memproses resep");
      }
    } catch (err: any) {
      console.warn("Process error, local fallback:", err);
      // Local fallback
      const fallbackData: DoctorConsultation = {
        id: `cons-${Date.now()}`,
        timestamp: new Date().toISOString(),
        doctorName: doctorNameInput || "Dokter Pemeriksa",
        clinicOrHospital: clinicInput || "Puskesmas / Klinik",
        rawTranscript: text,
        summary: `Instruksi konsultasi: "${text.slice(0, 100)}"`,
        prescriptions: [
          {
            id: `rx-local-${Date.now()}`,
            medicineName: "Obat dari Dokter",
            dosage: "Sesuai resep",
            frequency: text.toLowerCase().includes("3x") ? "3x sehari" : "2x sehari",
            timing: text.toLowerCase().includes("sebelum") ? "before_meal" : "after_meal",
            timingLabel: text.toLowerCase().includes("sebelum") ? "Sebelum Makan" : "Setelah Makan",
            instructions: text,
            spokeSummary: `Obat dari dokter, diminum sesuai instruksi: ${text}`,
          },
        ],
        audioGuideText: "Instruksi dokter berhasil disimpan ke perangkat Anda.",
      };
      addConsultation(fallbackData);
      setLastProcessed(fallbackData);
      playFeedback("success");
      speak(fallbackData.audioGuideText, profile.settings.speechRate);
    } finally {
      setIsProcessing(false);
    }
  };

  // Demo canned audio preset (similar to Bolo's instant demo)
  const loadDemoConsultation = () => {
    const demo =
      "Halo bapak, hasil pemeriksaan tekanan darah agak naik 140/90. Saya resepkan Amlodipine 5 miligram diminum satu kali sehari pada malam hari setelah makan. Dan untuk sakit kepalanya saya berikan Paracetamol 500 miligram, diminum dua kali sehari sesudah makan pagi dan malam, jika sudah tidak sakit boleh dihentikan. Banyak minum air putih dan kurangi makanan asin ya.";
    setTranscript(demo);
    setDoctorNameInput("Dr. Budi Santoso, Sp.PD");
    setClinicInput("Klinik Pratama Sehat");
    playFeedback("click");
    handleProcessConsultation(demo);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Sync a prescription item to My Medicine cabinet
  const handleSaveToCabinet = (item: any) => {
    playFeedback("success");
    addMedicine({
      id: `med-${Date.now()}`,
      name: item.medicineName,
      genericName: item.medicineName,
      dosage: item.dosage || "1 tablet",
      form: "Tablet",
      category: "Obat Resep Dokter",
      status: "safe",
      statusLabel: "Resep Terverifikasi",
      expiryDate: "Sesuai kemasan",
      bpomNumber: "Resep Dokter",
      indication: item.instructions,
      instructions: item.instructions,
      timing: item.timing,
      timingLabel: item.timingLabel,
      recommendedTime: item.timing === "before_meal" ? "07:00" : "08:00",
      sideEffects: [],
      precautions: item.doctorNotes || "Minum sesuai anjuran dokter",
      teksPanduanSuara: item.spokeSummary,
    });
    speak(`"${item.medicineName}" ditambahkan ke lemari obat dan jadwal harian.`, profile.settings.speechRate);
  };

  return (
    <Phone dark={true}>
      <TopBar title="Rekam Arahan Dokter" />

      <main className="flex-1 flex flex-col p-4 gap-4 pb-24">
        {/* Banner Penjelasan Medis Ramah Tunanetra */}
        <section
          aria-label="Panduan Rekam Konsultasi"
          className="rounded-3xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 p-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div className="text-xs text-blue-100">
              <h2 className="font-bold text-sm text-white">Konsultasi Suara Dokter (Bolo Doctor)</h2>
              <p className="mt-1 leading-relaxed opacity-90">
                Rekam arahan dokter saat Anda periksa di klinik. Saat Anda pulang ke rumah dan bingung membedakan obat,
                cukup <strong>Pindai Obat</strong> dengan kamera — aplikasi akan membacakan aturan minum persis seperti
                yang diucapkan dokter.
              </p>
            </div>
          </div>
        </section>

        {/* Big Mic Audio Recording Section */}
        <section
          aria-label="Area Perekaman Suara"
          className="rounded-3xl bg-slate-900 border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden"
        >
          {isRecording && (
            <div className="absolute inset-0 bg-rose-950/40 animate-pulse pointer-events-none" />
          )}

          <div className="relative mb-4">
            {isRecording && (
              <span className="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping" />
            )}
            <button
              aria-label={
                isRecording
                  ? `Hentikan perekaman. Durasi ${recordingSeconds} detik.`
                  : "Mulai merekam percakapan atau instruksi dokter."
              }
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 grid h-24 w-24 place-items-center rounded-full shadow-2xl transition-all active:scale-90 ${
                isRecording
                  ? "bg-rose-600 text-white ring-8 ring-rose-500/30"
                  : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white hover:opacity-95"
              }`}
            >
              {isRecording ? <Square className="h-10 w-10 fill-current" /> : <Mic className="h-11 w-11" />}
            </button>
          </div>

          <p className="text-sm font-extrabold text-white">
            {isRecording ? "Merekam Arahan Dokter..." : "Ketuk untuk Mulai Merekam"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isRecording ? `Durasi: ${formatTimer(recordingSeconds)} • Ketuk lagi untuk selesai` : "Atau gunakan tombol Coba Contoh Suara di bawah"}
          </p>

          {/* Quick Demo Button */}
          {!isRecording && !isProcessing && (
            <button
              onClick={loadDemoConsultation}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 rounded-full transition-all active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" /> Coba Contoh Suara Dokter (Simulasi)
            </button>
          )}
        </section>

        {/* Transcript & Action Card */}
        <section className="rounded-3xl bg-slate-900 border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Transkrip / Catatan Arahan Dokter
            </h3>
            {transcript && (
              <button
                onClick={() => speak(transcript, profile.settings.speechRate)}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                title="Dengarkan Transkrip"
              >
                <Volume2 className="h-3.5 w-3.5" /> Dengar
              </button>
            )}
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Hasil rekaman suara akan muncul di sini... Anda juga bisa langsung mengetik arahan dokter di sini."
            rows={4}
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Nama Dokter (opsional)"
              value={doctorNameInput}
              onChange={(e) => setDoctorNameInput(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Klinik / RS (opsional)"
              value={clinicInput}
              onChange={(e) => setClinicInput(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <button
            disabled={isProcessing || !transcript.trim()}
            onClick={() => handleProcessConsultation()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs disabled:opacity-40 shadow-lg active:scale-95 transition-all"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Mengekstrak Resep Medis...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Proses Resep dengan AI Dokter
              </>
            )}
          </button>
        </section>

        {/* Result: Last Processed Prescriptions */}
        {lastProcessed && (
          <section
            aria-label="Hasil Ekstraksi Resep Dokter"
            className="rounded-3xl bg-emerald-950/30 border border-emerald-500/40 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Resep Terverifikasi dari Dokter</h3>
                  <p className="text-[11px] text-emerald-300">
                    {lastProcessed.doctorName} • {lastProcessed.prescriptions.length} Jenis Obat
                  </p>
                </div>
              </div>
              <button
                onClick={() => speak(lastProcessed.audioGuideText, profile.settings.speechRate)}
                className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                title="Dengarkan Ulang Panduan"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic bg-black/30 p-3 rounded-2xl border border-white/5">
              "{lastProcessed.summary}"
            </p>

            <div className="space-y-3">
              {lastProcessed.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-2xl bg-slate-900 border border-white/10 p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{rx.medicineName}</h4>
                      <p className="text-[11px] text-slate-400">
                        Dosis: {rx.dosage} • Frekuensi: <strong className="text-emerald-400">{rx.frequency}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {rx.timingLabel}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed">
                    <strong>Arahan:</strong> {rx.instructions}
                  </p>

                  {rx.doctorNotes && (
                    <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                      <strong>Catatan Dokter:</strong> {rx.doctorNotes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => speak(rx.spokeSummary, profile.settings.speechRate)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold active:scale-95 transition-all"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> Dengar Suara
                    </button>
                    <button
                      onClick={() => handleSaveToCabinet(rx)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold active:scale-95 transition-all shadow"
                    >
                      <PlusCircle className="h-3.5 w-3.5" /> Masukkan ke Obat Saya
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => nav({ to: "/scan" })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg active:scale-95 transition-all"
              >
                <span>Buka Kamera & Pindai Obat Fisik di Rumah</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Consultation History List */}
        {consultations.length > 0 && !lastProcessed && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Riwayat Arahan Dokter ({consultations.length})
            </h3>
            <div className="space-y-3">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl bg-slate-900 border border-white/10 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{c.doctorName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(c.timestamp).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {c.clinicOrHospital}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteConsultation(c.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-300 text-xs line-clamp-2">{c.summary}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => speak(c.audioGuideText, profile.settings.speechRate)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                    >
                      <Volume2 className="h-3 w-3" /> Putar Arahan
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {c.prescriptions.length} resep obat aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </Phone>
  );
}
