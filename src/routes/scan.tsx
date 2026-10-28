import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  Volume2,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Plus,
  ArrowLeft,
  Search,
  Sparkles,
  Info,
  Pill,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import { Phone, speak, stopSpeech } from "@/components/medi";
import { useMedicine, type Medicine, type DoctorPrescriptionItem } from "@/lib/medicineContext";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Pindai Obat AI — MediLens AI" },
      { name: "description", content: "Pindai kemasan obat fisik secara langsung dengan kamera atau unggah foto." },
    ],
  }),
  component: ScanPage,
});

export default function ScanPage() {
  const nav = useNavigate();
  const { addMedicine, profile, medicines, findConsultationMatchForMedicine, showToast, playFeedback } = useMedicine();

  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>("");
  const [analyzedData, setAnalyzedData] = useState<any | null>(null);
  const [matchedDoctorRx, setMatchedDoctorRx] = useState<DoctorPrescriptionItem | null>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Start Camera
  const startCamera = useCallback(async (facing: "environment" | "user") => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Perangkat tidak mendukung akses kamera langsung. Gunakan fitur unggah foto di bawah.");
        return;
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn("Camera init error:", err);
      setCameraError("Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan tombol Unggah Foto.");
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    if (profile.settings.autoVoice) {
      speak(
        "Kamera pemindai obat aktif. Arahkan kamera ke kemasan obat sekitar 15 sampai 20 sentimeter. Ketuk di mana saja pada layar untuk memotret.",
        profile.settings.speechRate
      );
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      stopSpeech();
    };
  }, []);

  const switchCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture from live video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    playFeedback("click");
    speak("Foto obat diambil. Sedang memproses analisis AI medis...", profile.settings.speechRate);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);

    // Stop stream temporarily to save battery/performance
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    runAnalysis({ image: dataUrl });
  };

  // Handle file upload (from gallery or device file)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setCapturedImage(b64);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      runAnalysis({ image: b64 });
    };
    reader.readAsDataURL(file);
  };

  // Handle manual drug search
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    runAnalysis({ query: manualQuery.trim() });
  };

  // Main real analysis caller
  const runAnalysis = async ({ image, query }: { image?: string; query?: string }) => {
    setIsAnalyzing(true);
    setAnalyzedData(null);
    setIsSaved(false);

    try {
      setAnalyzingStep("Mendeteksi teks & kemasan obat...");
      speak("Sedang memproses pemindaian obat dengan kecerdasan buatan.");

      const existingNames = medicines.map((m) => m.name);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          query,
          existingMedicines: existingNames,
          allergies: profile.allergies,
          conditions: profile.conditions,
        }),
      });

      setAnalyzingStep("Menganalisis zat aktif & interaksi...");

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Gagal menghubungi server analisis.");
      }

      const result = await res.json();
      if (result.success && result.data) {
        setAnalyzedData(result.data);
        const hasAllergyWarning = Boolean(result.data.cocokProfil?.peringatanAlergi);
        playFeedback(hasAllergyWarning ? "alert" : "success");

        // Cross-check with Doctor's consultation voice recordings!
        const docMatch = findConsultationMatchForMedicine(result.data.nama || result.data.namaGenerik || query || "");
        setMatchedDoctorRx(docMatch);

        if (docMatch) {
          // Speak doctor's exact instructions aloud for blind patients
          const doctorVoiceGuidance = `Obat cocok dengan resep dokter Anda. ${docMatch.spokeSummary}. Catatan dokter: ${docMatch.doctorNotes || "Minum teratur"}.`;
          speak(doctorVoiceGuidance, profile.settings.speechRate);
          showToast(`Cocok dengan resep dokter: ${docMatch.frequency}`, "success");
        } else if (result.data.teksPanduanSuara) {
          speak(result.data.teksPanduanSuara, profile.settings.speechRate);
        } else {
          speak(`Obat terdeteksi: ${result.data.nama}. Aturan pakai: ${result.data.aturanPakai}`, profile.settings.speechRate);
        }
      } else {
        throw new Error("Format respons tidak valid.");
      }
    } catch (err: any) {
      console.error("Analysis failure:", err);
      speak("Maaf, pemindaian obat gagal diproses. Silakan coba kembali atau gunakan pencarian manual.");
      showToast(`Analisis gagal: ${err.message}`, "error");
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStep("");
    }
  };

  // Save to Medicine Cabinet
  const handleSaveToCabinet = () => {
    if (!analyzedData) return;

    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name: analyzedData.nama || manualQuery || "Obat Baru",
      genericName: analyzedData.namaGenerik || analyzedData.nama || "",
      dosage: matchedDoctorRx ? matchedDoctorRx.dosage : (analyzedData.kandungan || "Sesuai resep"),
      form: analyzedData.bentuk || "Tablet",
      category: matchedDoctorRx ? "Obat Resep Terverifikasi Dokter" : (analyzedData.kategori || "Obat Resep"),
      status: analyzedData.cocokProfil?.peringatanAlergi ? "warning" : "safe",
      statusLabel: analyzedData.cocokProfil?.peringatanAlergi ? "Peringatan Alergi" : (matchedDoctorRx ? "Cocok Resep Dokter" : "Aman Dikonsumsi"),
      expiryDate: analyzedData.kadaluarsa || "Periksa kemasan",
      bpomNumber: analyzedData.bpom || "BPOM Terverifikasi",
      indication: matchedDoctorRx ? matchedDoctorRx.instructions : (analyzedData.indikasi || "Sesuai petunjuk dokter"),
      instructions: matchedDoctorRx ? matchedDoctorRx.instructions : (analyzedData.aturanPakai || "1 kali sehari sesudah makan"),
      timing: matchedDoctorRx ? matchedDoctorRx.timing : ((analyzedData.timing as any) || "after_meal"),
      timingLabel: matchedDoctorRx ? matchedDoctorRx.timingLabel : (analyzedData.timing === "before_meal" ? "Sebelum Makan" : "Setelah Makan"),
      recommendedTime: analyzedData.rekomendasiJam || "08:00",
      sideEffects: analyzedData.efekSamping || [],
      precautions: matchedDoctorRx?.doctorNotes || analyzedData.peringatan || "",
      foodRestrictions: analyzedData.pantangan || [],
      interactions: analyzedData.interaksi || [],
      allergyWarning: analyzedData.cocokProfil?.peringatanAlergi,
      teksPanduanSuara: matchedDoctorRx ? matchedDoctorRx.spokeSummary : analyzedData.teksPanduanSuara,
      scannedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    if (capturedImage) {
      newMed.imageUrl = capturedImage;
    }

    addMedicine(newMed);
    setIsSaved(true);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setAnalyzedData(null);
    setMatchedDoctorRx(null);
    setIsSaved(false);
    startCamera(facingMode);
  };

  return (
    <Phone dark={true}>
      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 bg-navy/95 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => nav({ to: "/beranda" })}
          className="rounded-full p-2 hover:bg-white/10 active:scale-95 transition-all text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-base font-bold text-white">Pemindai Obat Cerdas</h1>
        <button
          onClick={switchCamera}
          className="rounded-full p-2 hover:bg-white/10 active:scale-95 transition-all text-white"
          title="Ganti Kamera"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </header>

      {/* Hidden elements for processing */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Camera / Image Viewport */}
        {!analyzedData ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Area Kamera. Ketuk di mana saja pada layar ini untuk memotret dan memindai obat secara otomatis."
            onClick={capturePhoto}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                capturePhoto();
              }
            }}
            className="relative flex-1 min-h-[360px] rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-[0.99] transition-transform"
          >
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : cameraError ? (
              <div className="p-6 text-center text-slate-300">
                <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-semibold">{cameraError}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg"
                >
                  <Upload className="h-4 w-4" /> Pilih Foto dari Galeri
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover pointer-events-none"
                />
                {/* Viewfinder Target Frame */}
                <div className="absolute inset-8 border-2 border-emerald-400/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <span className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                    <span className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] bg-black/80 text-emerald-300 px-3 py-1.5 rounded-full font-bold backdrop-blur-sm border border-emerald-400/40">
                      Ketuk di mana saja pada layar untuk memotret
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                    <span className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                  </div>
                </div>
              </>
            )}

            {/* Analyzing Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-blue-500/30 border-t-blue-400 animate-spin" />
                  <Sparkles className="h-8 w-8 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">Menganalisis Kemasan Obat</h3>
                <p className="mt-1 text-xs text-blue-200/80">{analyzingStep}</p>
                <div className="mt-4 flex gap-1.5">
                  <span className="h-1.5 w-6 rounded-full bg-blue-500 animate-pulse" />
                  <span className="h-1.5 w-6 rounded-full bg-indigo-500 animate-pulse delay-100" />
                  <span className="h-1.5 w-6 rounded-full bg-purple-500 animate-pulse delay-200" />
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Camera Action Buttons (When not showing results) */}
        {!analyzedData && !isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={capturePhoto}
                className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
              >
                <Camera className="h-5 w-5" /> Ambil Foto Obat
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="grid h-12 w-12 shrink-0 place-items-center bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-white/10 active:scale-95 transition-all"
                title="Unggah Foto dari Galeri"
              >
                <Upload className="h-5 w-5" />
              </button>
            </div>

            {/* Manual Text Search Fallback */}
            <form onSubmit={handleManualSearch} className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-2xl px-3 py-1.5">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Atau ketik nama obat (misal: Paracetamol 500mg)..."
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 py-2 outline-none"
              />
              <button
                type="submit"
                disabled={!manualQuery.trim()}
                className="text-xs font-bold bg-blue-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl shrink-0 active:scale-95 transition-all"
              >
                Cari
              </button>
            </form>
          </div>
        )}

        {/* Real Analyzed Result View */}
        {analyzedData && (
          <div className="space-y-4 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Matched Doctor Prescription Banner */}
            {matchedDoctorRx && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-3xl bg-gradient-to-r from-emerald-900/90 to-teal-950/90 border-2 border-emerald-400 p-4 shadow-2xl flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shrink-0 mt-0.5">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-400 text-black">
                      Cocok Instruksi Dokter
                    </span>
                    <span className="text-[11px] font-bold text-emerald-300">
                      {matchedDoctorRx.frequency}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white mt-1">
                    {matchedDoctorRx.instructions}
                  </h3>
                  {matchedDoctorRx.doctorNotes && (
                    <p className="mt-1 text-emerald-200/90">
                      <strong>Catatan Dokter:</strong> {matchedDoctorRx.doctorNotes}
                    </p>
                  )}
                  <button
                    onClick={() => speak(matchedDoctorRx.spokeSummary, profile.settings.speechRate)}
                    className="mt-2.5 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-400 text-black font-extrabold text-[11px] active:scale-95 transition-all shadow"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Putar Ulang Suara Dokter
                  </button>
                </div>
              </div>
            )}

            {/* Main Result Card */}
            <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                    <Pill className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {analyzedData.kategori || "Obat Terdaftar"}
                    </span>
                    <h2 className="text-lg font-extrabold text-white mt-1 leading-snug">
                      {analyzedData.nama}
                    </h2>
                    <p className="text-xs text-slate-400">{analyzedData.namaGenerik} • {analyzedData.kandungan}</p>
                  </div>
                </div>
                <button
                  onClick={() => speak(analyzedData.teksPanduanSuara || `${analyzedData.nama}. ${analyzedData.aturanPakai}`)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 active:scale-95 transition-all"
                  title="Dengarkan Ulang"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              {/* Captured Photo Preview */}
              {capturedImage && (
                <div className="relative mt-4 rounded-2xl overflow-hidden border border-white/10 max-h-52 w-full bg-black flex items-center justify-center">
                  <img src={capturedImage} alt="Foto Kemasan Terpindai" className="w-full h-full object-cover max-h-52" />
                  <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-[10px] text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-md">
                    <Camera className="h-3.5 w-3.5" /> Foto Obat Terpindai
                  </span>
                </div>
              )}

              {/* Patient Allergy Alert Check */}
              {analyzedData.cocokProfil?.peringatanAlergi && (
                <div className="mt-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 p-3.5 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-200">
                    <p className="font-bold text-rose-300">Peringatan Keamanan Profil!</p>
                    <p className="mt-0.5 leading-relaxed">{analyzedData.cocokProfil.peringatanAlergi}</p>
                  </div>
                </div>
              )}

              {/* Clinical Details Grid */}
              <div className="mt-4 divide-y divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Indikasi / Khasiat:</span>
                  <span className="text-right font-medium text-white max-w-[65%]">{analyzedData.indikasi}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Aturan Pakai:</span>
                  <span className="text-right font-bold text-emerald-400 max-w-[65%]">{analyzedData.aturanPakai}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Waktu & Jam Minum:</span>
                  <span className="text-right font-medium text-white">
                    {analyzedData.timing === "before_meal" ? "Sebelum Makan" : "Setelah Makan"} ({analyzedData.rekomendasiJam || "08:00"})
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Bentuk / Izin BPOM:</span>
                  <span className="text-right font-medium text-white">{analyzedData.bentuk || "Tablet"} • {analyzedData.bpom || "BPOM RI"}</span>
                </div>
              </div>

              {/* Food & Beverage Restrictions */}
              {analyzedData.pantangan && analyzedData.pantangan.length > 0 && (
                <div className="mt-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 p-3.5">
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Pantangan Makanan & Minuman:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-amber-200/90">
                    {analyzedData.pantangan.map((p: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>
                          <strong>{p.makanan}:</strong> {p.alasan}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Drug Interactions with existing medicines */}
              {analyzedData.interaksi && analyzedData.interaksi.length > 0 && (
                <div className="mt-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 p-3.5">
                  <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Info className="h-4 w-4" /> Interaksi dengan Obat Anda:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-blue-200/90">
                    {analyzedData.interaksi.map((inter: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>
                          <strong>{inter.obat} ({inter.tingkat}):</strong> {inter.catatan}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleSaveToCabinet}
                  disabled={isSaved}
                  className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-2xl transition-all text-xs ${
                    isSaved
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-95"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> Tersimpan di Lemari Obat
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Simpan ke Lemari Obat
                    </>
                  )}
                </button>
                <button
                  onClick={resetScan}
                  className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 active:scale-95 transition-all"
                >
                  Pindai Lagi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Phone>
  );
}
