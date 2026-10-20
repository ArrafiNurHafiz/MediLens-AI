"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMedicine } from "@/context/MedicineContext";
import {
  ArrowLeft,
  Camera,
  Flashlight,
  SwitchCamera,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react";

export default function CameraScanPage() {
  const router = useRouter();
  const { showToast } = useMedicine();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanMode, setScanMode] = useState<"multi" | "single" | "prescription">("multi");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Initialize camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCamera(false);
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
          setIsStreaming(true);
        }
      } catch (err) {
        console.warn("Camera access not available or denied:", err);
        setHasCamera(false);
        setIsStreaming(false);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Toggle Torch if supported
  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      showToast("Lampu kilat disimulasikan aktif", "info");
      setTorchOn(!torchOn);
      return;
    }
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    try {
      const capabilities = track.getCapabilities?.() as { torch?: boolean };
      if (capabilities && capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
        });
        setTorchOn(!torchOn);
        showToast(!torchOn ? "Lampu kilat menyala" : "Lampu kilat mati", "info");
      } else {
        setTorchOn(!torchOn);
        showToast(!torchOn ? "Flash diaktifkan" : "Flash dimatikan", "info");
      }
    } catch {
      setTorchOn(!torchOn);
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    showToast("Mengalihkan kamera...", "info");
  };

  // Trigger Capture & Proceed to Analyzing Screen
  const handleCapture = () => {
    setIsCapturing(true);
    showToast("Memotret 3 kemasan obat... Memulai analisis AI", "info");
    setTimeout(() => {
      router.push("/analyzing");
    }, 600);
  };

  // Handle Photo Upload from Gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      showToast("Foto obat terpilih dari galeri. Menganalisis...", "info");
      router.push("/analyzing");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-950 text-white relative overflow-hidden select-none">
      {/* Top Bar Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between z-30">
        <Link
          href="/beranda"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Kembali ke Beranda"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h2 className="text-xs font-bold tracking-tight">Pindai Beberapa Obat Sekaligus</h2>
          <p className="text-[10px] text-slate-300">Arahkan kamera ke strip atau kemasan obat</p>
        </div>
        <button
          onClick={() => showToast("Tips: Pastikan pencahayaan cukup dan teks nama obat tidak terpotong", "info")}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Bantuan"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-1.5 px-4 mb-2 z-30">
        <button
          onClick={() => setScanMode("multi")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            scanMode === "multi"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "bg-white/10 text-slate-300 hover:bg-white/15"
          }`}
        >
          Multi-Obat (3)
        </button>
        <button
          onClick={() => setScanMode("single")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            scanMode === "single"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "bg-white/10 text-slate-300 hover:bg-white/15"
          }`}
        >
          Single Strip
        </button>
        <button
          onClick={() => setScanMode("prescription")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            scanMode === "prescription"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "bg-white/10 text-slate-300 hover:bg-white/15"
          }`}
        >
          Resep Dokter
        </button>
      </div>

      {/* Camera Viewfinder Box */}
      <div className="mx-4 flex-1 rounded-3xl relative overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col justify-center items-center bg-slate-900">
        {/* Real Video Stream if available */}
        {hasCamera && isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          /* Realistic Medicine Sample Stage Fallback */
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-[#241a15] to-[#120d0a]">
            {/* Table Wood Texture */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(20deg, transparent, transparent 15px, rgba(0,0,0,0.4) 16px, transparent 18px)",
              }}
            />

            {/* Simulated Medicine Boxes on Stage */}
            <div className="relative w-full max-w-[280px] h-[300px] flex items-center justify-center">
              {/* Box 1: Amlodipine */}
              <div className="absolute top-6 left-2 w-32 h-24 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-400/40 p-2 shadow-xl rotate-[-4deg]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200">Antihipertensi</span>
                <p className="text-xs font-extrabold text-white leading-tight mt-0.5">Amlodipine</p>
                <p className="text-[10px] text-blue-100 font-bold">5 mg</p>
                <div className="mt-2 text-[8px] text-slate-300">Exp: 12/2026</div>
              </div>

              {/* Box 2: Simvastatin */}
              <div className="absolute bottom-10 left-6 w-36 h-28 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 border border-amber-400/40 p-2 shadow-2xl rotate-[3deg]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200">Kolesterol</span>
                <p className="text-xs font-extrabold text-white leading-tight mt-0.5">Simvastatin</p>
                <p className="text-[10px] text-amber-100 font-bold">20 mg</p>
                <div className="mt-4 text-[8px] text-slate-300">Exp: 11/2027</div>
              </div>

              {/* Box 3: Omeprazole Blister */}
              <div className="absolute top-12 right-1 w-28 h-40 rounded-xl bg-gradient-to-br from-emerald-800 to-slate-900 border border-emerald-400/40 p-2 shadow-2xl rotate-[-6deg]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Lambung</span>
                <p className="text-xs font-extrabold text-white leading-tight mt-0.5">Omeprazole</p>
                <p className="text-[10px] text-emerald-200 font-bold">20 mg</p>
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-emerald-400/30 border border-emerald-300/40 shadow-inner" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Animated Laser Scanning Line */}
        <div className="laser-line" />

        {/* Live Detected Bounding Boxes Overlays */}
        <div className="absolute inset-0 pointer-events-none p-4">
          {/* Box 1 Overlay */}
          <div className="absolute top-14 left-4 w-34 h-26 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-400/10 p-1.5 transition-all">
            <span className="text-[9.5px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-xs">
              <CheckCircle className="w-3 h-3" /> Amlodipine 5 mg
            </span>
          </div>

          {/* Box 2 Overlay */}
          <div className="absolute bottom-16 left-6 w-40 h-28 rounded-xl border-2 border-dashed border-amber-400 bg-amber-400/10 p-1.5 transition-all">
            <span className="text-[9.5px] font-extrabold bg-amber-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-xs">
              <AlertCircle className="w-3 h-3" /> Simvastatin 20 mg
            </span>
          </div>

          {/* Box 3 Overlay */}
          <div className="absolute top-20 right-4 w-30 h-44 rounded-xl border-2 border-dashed border-blue-400 bg-blue-400/10 p-1.5 transition-all">
            <span className="text-[9.5px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-xs">
              <CheckCircle className="w-3 h-3" /> Omeprazole 20 mg
            </span>
          </div>
        </div>

        {/* Detection Status Pill Badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>3 Obat Terdeteksi Otomatis</span>
        </div>

        {/* Torch indicator if active */}
        {torchOn && (
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
        )}
      </div>

      {/* Camera Shutter & Bottom Controls */}
      <div className="px-6 py-4 flex items-center justify-between z-30">
        {/* Gallery Upload Input */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex flex-col items-center justify-center text-white transition-all active:scale-95"
          aria-label="Upload dari Galeri"
        >
          <ImageIcon className="w-5 h-5 text-slate-200" />
          <span className="text-[9px] text-slate-300 mt-0.5 font-medium">Galeri</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Big Shutter Button */}
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={`w-18 h-18 rounded-full border-4 border-white/90 p-1 flex items-center justify-center shadow-2xl transition-all duration-150 active:scale-90 ${
            isCapturing ? "scale-90 opacity-75" : "hover:scale-105"
          }`}
          aria-label="Ambil Foto dan Analisis"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
            <Camera className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
        </button>

        {/* Torch / Flip Toggle Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTorch}
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all active:scale-95 ${
              torchOn
                ? "bg-amber-400 text-slate-900 border-amber-300 shadow-md shadow-amber-400/30"
                : "bg-white/10 hover:bg-white/20 text-white border-white/15"
            }`}
            aria-label="Lampu Kilat"
          >
            <Flashlight className="w-5 h-5" />
          </button>
          <button
            onClick={flipCamera}
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Balik Kamera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
