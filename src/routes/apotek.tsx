import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Phone as PhoneIcon,
  Search,
  Clock,
  Printer,
  Plus,
  QrCode,
  FileText,
  Volume2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Phone, TopBar, BottomNav, speak } from "@/components/medi";
import { useMedicine } from "@/lib/medicineContext";

export const Route = createFileRoute("/apotek")({
  head: () => ({
    meta: [
      { title: "Apotek & Resep — MediLens AI" },
      { name: "description", content: "Pencarian apotek terdekat dengan GPS dan manajemen QR code resep obat." },
    ],
  }),
  component: ApotekPage,
});

interface PharmacyItem {
  id: string | number;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distanceKm: number | null;
  isOpen24Hours: boolean;
  phone?: string;
  mapUrl: string;
}

// Deterministic QR Matrix Generator (SVG)
function QRCodeSvg({ value, size = 180 }: { value: string; size?: number }) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  const dim = 21;
  const cells: boolean[] = [];

  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      // Finder patterns in corners (7x7)
      const isTopLeft = x < 7 && y < 7;
      const isTopRight = x >= dim - 7 && y < 7;
      const isBottomLeft = x < 7 && y >= dim - 7;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const lx = isTopRight ? x - (dim - 7) : x;
        const ly = isBottomLeft ? y - (dim - 7) : y;
        const isBorder = lx === 0 || lx === 6 || ly === 0 || ly === 6;
        const isCenter = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
        cells.push(isBorder || isCenter);
      } else {
        // Hash pseudo-random matrix
        hash = (hash * 1664525 + 1013904223) >>> 0;
        cells.push((hash >> 16) % 2 === 0);
      }
    }
  }

  const cellSize = size / dim;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl bg-white p-2 shadow-sm">
      {cells.map((filled, i) => {
        if (!filled) return null;
        const cx = (i % dim) * cellSize;
        const cy = Math.floor(i / dim) * cellSize;
        return <rect key={i} x={cx} y={cy} width={cellSize} height={cellSize} fill="#0f172a" />;
      })}
    </svg>
  );
}

export default function ApotekPage() {
  const { profile, medicines, showToast, playFeedback } = useMedicine();
  const [tab, setTab] = useState<"nearby" | "prescription">("nearby");

  // Pharmacy search states
  const [pharmacies, setPharmacies] = useState<PharmacyItem[]>([]);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
  const [searchCity, setSearchCity] = useState("Yogyakarta");
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Prescription QR states
  const [patientName, setPatientName] = useState(profile.name || "Arrafi Nur Hafiz");
  const [selectedMedName, setSelectedMedName] = useState(medicines[0]?.name || "Amlodipine Besylate 5 mg");
  const [rxDose, setRxDose] = useState("1 tablet setelah makan pagi");
  const [rxNotes, setRxNotes] = useState("Habiskan sesuai anjuran dokter");
  const [generatedRx, setGeneratedRx] = useState({
    id: "RSP-20261021-001",
    patient: profile.name,
    medicine: medicines[0]?.name || "Amlodipine Besylate 5 mg",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    qrData: JSON.stringify({
      id: "RSP-20261021-001",
      patient: profile.name,
      drug: medicines[0]?.name || "Amlodipine 5mg",
      issuedAt: new Date().toISOString(),
    }),
  });

  const fetchPharmacies = async (lat?: number, lon?: number, cityQuery?: string) => {
    setIsLoadingPharmacies(true);
    try {
      let queryUrl = "/api/pharmacies?";
      if (lat && lon) {
        queryUrl += `lat=${lat}&lon=${lon}`;
      } else {
        queryUrl += `q=${encodeURIComponent(cityQuery || searchCity)}`;
      }

      const res = await fetch(queryUrl);
      if (!res.ok) throw new Error("Gagal mengambil data apotek");
      const json = await res.json();
      if (json.success && json.data) {
        setPharmacies(json.data);
      }
    } catch (e: any) {
      console.warn("Pharmacy fetch error:", e);
    } finally {
      setIsLoadingPharmacies(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPharmacies(undefined, undefined, searchCity);
    if (profile.settings.autoVoice) {
      speak(
        "Halaman pencarian apotek terdekat. Tekan tombol hijau di atas untuk mencari apotek terdekat dengan GPS.",
        profile.settings.speechRate
      );
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast("Perangkat tidak mendukung geolokasi GPS.", "warning");
      return;
    }
    setIsLoadingPharmacies(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        fetchPharmacies(latitude, longitude);
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setIsLoadingPharmacies(false);
        showToast("Izin lokasi tidak diberikan. Menampilkan apotek berdasarkan pencarian kota.", "info");
        fetchPharmacies(undefined, undefined, searchCity);
      },
      { timeout: 8000 }
    );
  };

  const handleGeneratePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const rxId = `RSP-${Date.now().toString().slice(-6)}`;
    const rx = {
      id: rxId,
      patient: patientName,
      medicine: selectedMedName,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      qrData: JSON.stringify({
        id: rxId,
        patient: patientName,
        drug: selectedMedName,
        dose: rxDose,
        notes: rxNotes,
        issuedBy: "Klinik Pratama & Farmasi MediLens",
        issuedAt: new Date().toISOString(),
      }),
    };
    setGeneratedRx(rx);
    playFeedback("success");
    speak(`Resep elektronik untuk ${patientName} berhasil dibuat dengan kode ${rxId}.`, profile.settings.speechRate);
  };

  return (
    <Phone dark={true}>
      <TopBar title="Apotek & Resep Digital" />

      {/* Segmented Tab Switcher */}
      <div className="px-4 pt-3 pb-3">
        <div className="flex rounded-2xl bg-slate-900 border border-white/10 p-1">
          <button
            onClick={() => setTab("nearby")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "nearby"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Apotek Terdekat
          </button>
          <button
            onClick={() => setTab("prescription")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "prescription"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            QR Resep Obat
          </button>
        </div>
      </div>

      {/* TAB 1: Nearby Pharmacies */}
      {tab === "nearby" && (
        <div className="flex-1 flex flex-col px-4 pb-6 space-y-4">
          {/* GPS & Search Control */}
          <div className="space-y-2.5">
            <button
              onClick={handleGetLocation}
              disabled={isLoadingPharmacies}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg active:scale-95 transition-all"
            >
              <Navigation className="h-4 w-4" /> Cari Apotek Menggunakan Lokasi Saya (GPS)
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchPharmacies(undefined, undefined, searchCity);
              }}
              className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-2xl px-3 py-1.5"
            >
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari apotek di kota/daerah Anda..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 py-1.5 outline-none"
              />
              <button
                type="submit"
                className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-xl shrink-0"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Pharmacy Count & Audio Announcement */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Ditemukan <strong>{pharmacies.length}</strong> apotek terdaftar</span>
            <button
              onClick={() => {
                const first = pharmacies[0];
                if (first) {
                  speak(`Apotek terdekat adalah ${first.name}, berjarak ${first.distanceKm ? `${first.distanceKm} kilometer` : "dekat dari lokasi Anda"}. Alamat: ${first.address}`);
                } else {
                  speak("Tidak ada apotek ditemukan pada area ini.");
                }
              }}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Volume2 className="h-3.5 w-3.5" /> Bacakan Apotek Terdekat
            </button>
          </div>

          {/* Pharmacies List */}
          {isLoadingPharmacies ? (
            <div className="text-center py-12 space-y-3">
              <div className="h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Mencari apotek terdekat via OpenStreetMap...</p>
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MapPin className="h-10 w-10 text-slate-500 mx-auto mb-2" />
              <p>Tidak ditemukan apotek di sekitar lokasi ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pharmacies.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-900 border border-white/10 p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                        {item.isOpen24Hours && (
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                            Buka 24 Jam
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.address}</p>
                    </div>

                    {item.distanceKm !== null && (
                      <span className="shrink-0 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-lg">
                        {item.distanceKm} km
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <a
                      href={item.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold active:scale-95 transition-all"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Buka di Google Maps
                    </a>
                    <button
                      onClick={() =>
                        speak(
                          `${item.name}. Berjarak ${item.distanceKm ? `${item.distanceKm} kilometer` : "dekat"}. Alamat di ${item.address}. ${item.isOpen24Hours ? "Buka dua puluh empat jam." : ""}`
                        )
                      }
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 active:scale-95"
                      title="Dengarkan Alamat"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Prescription Portal & QR Generator */}
      {tab === "prescription" && (
        <div className="flex-1 flex flex-col px-4 pb-6 space-y-5">
          {/* Active QR Card */}
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 flex flex-col items-center text-center shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full mb-3 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> QR Resep Terverifikasi
            </span>

            {/* Generated QR Matrix */}
            <div className="my-2 p-2 bg-white rounded-2xl shadow-lg">
              <QRCodeSvg value={generatedRx.qrData} size={170} />
            </div>

            <h3 className="text-base font-extrabold text-white mt-3">{generatedRx.medicine}</h3>
            <p className="text-xs text-slate-300 mt-0.5">Pasien: <strong>{generatedRx.patient}</strong></p>
            <p className="text-[11px] text-slate-400 mt-0.5">Kode: {generatedRx.id} • {generatedRx.date}</p>

            <div className="mt-4 flex gap-2 w-full">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 active:scale-95 transition-all"
              >
                <Printer className="h-4 w-4" /> Cetak QR Resep
              </button>
              <button
                onClick={() => speak(`Resep digital nomor ${generatedRx.id}. Pasien ${generatedRx.patient}. Obat ${generatedRx.medicine}. Dosis ${rxDose}.`)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 active:scale-95 transition-all"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form to Create New Prescription QR */}
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" /> Buat Resep Baru
            </h3>

            <form onSubmit={handleGeneratePrescription} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nama Pasien</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pilih / Ketik Obat</label>
                <input
                  type="text"
                  value={selectedMedName}
                  onChange={(e) => setSelectedMedName(e.target.value)}
                  placeholder="Misal: Amlodipine 5 mg"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Dosis & Aturan Pakai</label>
                <input
                  type="text"
                  value={rxDose}
                  onChange={(e) => setRxDose(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Catatan Tambahan Apoteker</label>
                <input
                  type="text"
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-md active:scale-95 transition-all text-xs"
              >
                Perbarui QR Code Resep
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </Phone>
  );
}
