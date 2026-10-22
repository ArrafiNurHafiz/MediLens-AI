import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Pill,
  Volume2,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Search,
  Plus,
  Info,
  Clock,
  ChevronRight,
  X,
  CalendarPlus,
} from "lucide-react";
import { Phone, TopBar, BottomNav, speak } from "@/components/medi";
import { useMedicine, type Medicine } from "@/lib/medicineContext";

export const Route = createFileRoute("/obat")({
  head: () => ({
    meta: [
      { title: "Daftar Obat Saya — MediLens AI" },
      { name: "description", content: "Kelola lemari obat, informasi dosis, dan panduan suara keselamatan obat." },
    ],
  }),
  component: ObatPage,
});

export default function ObatPage() {
  const { medicines, deleteMedicine, profile, playFeedback } = useMedicine();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);

  const filteredMedicines = medicines.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.indication.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (profile.settings.autoVoice) {
      if (medicines.length === 0) {
        speak("Lemari obat Anda masih kosong. Pindai kemasan obat untuk mulai menyimpan data obat.", profile.settings.speechRate);
      } else {
        speak(`Lemari obat Anda. Ada ${medicines.length} obat terdaftar. Ketuk kartu obat untuk mendengarkan monograf lengkap.`, profile.settings.speechRate);
      }
    }
  }, []);

  return (
    <Phone dark={true}>
      <TopBar title="Lemari Obat Saya" />

      {/* Search & Actions Bar */}
      <div className="px-5 pt-3 pb-3 space-y-3">
        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-2xl px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari obat dalam lemari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>
            Total <strong>{filteredMedicines.length}</strong> obat aktif
          </span>
          <Link
            to="/scan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Obat
          </Link>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 rounded-t-3xl bg-slate-900 border-t border-white/10 p-5 text-white space-y-3.5 pb-8">
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 border border-white/10 mx-auto text-slate-500">
              <Pill className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Tidak Ada Obat Ditemukan</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {searchTerm
                  ? `Tidak ada obat yang cocok dengan "${searchTerm}".`
                  : "Lemari obat Anda masih kosong. Pindai kemasan obat atau resep Anda sekarang."}
              </p>
            </div>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg"
            >
              <Plus className="h-4 w-4" /> Pindai Obat Sekarang
            </Link>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const hasAllergyConflict = profile.allergies.some((a) => {
              const term = (a.toLowerCase().split("/")[0] ?? "").trim();
              return term && (med.name.toLowerCase().includes(term) || med.genericName.toLowerCase().includes(term));
            });

            return (
              <div
                key={med.id}
                className={`rounded-2xl p-4 border transition-all ${
                  hasAllergyConflict
                    ? "bg-rose-950/40 border-rose-500/40"
                    : "bg-slate-800/80 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {med.imageUrl ? (
                      <img
                        src={med.imageUrl}
                        alt={med.name}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover border border-white/10 shadow-sm"
                      />
                    ) : (
                      <div
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                          hasAllergyConflict ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        <Pill className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {med.category || "Obat"}
                        </span>
                        {hasAllergyConflict && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Peringatan Alergi!
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{med.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {med.genericName} • {med.dosage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        playFeedback("click");
                        speak(
                          med.teksPanduanSuara ||
                            `${med.name}. Kandungan ${med.dosage}. Indikasi: ${med.indication}. Aturan pakai: ${med.instructions}.`,
                          profile.settings.speechRate
                        );
                      }}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-slate-700/80 text-emerald-400 hover:bg-slate-700 active:scale-95 transition-all"
                      title="Dengarkan Panduan Suara"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        playFeedback("warning");
                        deleteMedicine(med.id);
                      }}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-slate-700/80 text-rose-400 hover:bg-slate-700 active:scale-95 transition-all"
                      title="Hapus Obat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span>
                      {med.timingLabel || "Setelah Makan"} ({med.recommendedTime || "08:00"})
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedMed(med)}
                    className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 active:scale-95 transition-all"
                  >
                    Detail Lengkap <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal / Sheet */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-t-3xl md:rounded-3xl p-6 text-white max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {selectedMed.category}
                </span>
                <h2 className="text-xl font-bold mt-1.5">{selectedMed.name}</h2>
                <p className="text-xs text-slate-400">
                  {selectedMed.genericName} • {selectedMed.dosage}
                </p>
              </div>
              <button
                onClick={() => setSelectedMed(null)}
                className="rounded-full p-2 bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedMed.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-48 w-full bg-black flex items-center justify-center">
                <img
                  src={selectedMed.imageUrl}
                  alt={selectedMed.name}
                  className="w-full h-full object-cover max-h-48"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-[10px] text-emerald-300 font-bold px-2.5 py-1 rounded-md border border-white/10">
                  Foto Kemasan Tersimpan
                </span>
              </div>
            )}

            <button
              onClick={() => {
                playFeedback("click");
                speak(
                  selectedMed.teksPanduanSuara ||
                    `${selectedMed.name}. Fungsi: ${selectedMed.indication}. Aturan pakai: ${selectedMed.instructions}. Peringatan: ${selectedMed.precautions}`,
                  profile.settings.speechRate
                );
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
            >
              <Volume2 className="h-4 w-4" /> Dengarkan Seluruh Monograf Obat
            </button>

            {/* Monograph breakdown */}
            <div className="space-y-3 text-xs divide-y divide-white/5">
              <div className="pt-2">
                <span className="text-slate-400 font-semibold block">Indikasi & Khasiat:</span>
                <p className="text-slate-200 mt-1 leading-relaxed">{selectedMed.indication}</p>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 font-semibold block">Aturan Pakai & Jam Minum:</span>
                <p className="text-emerald-400 font-bold mt-1">
                  {selectedMed.instructions} ({selectedMed.timingLabel}, {selectedMed.recommendedTime})
                </p>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 font-semibold block">Peringatan Keamanan:</span>
                <p className="text-amber-300 mt-1 leading-relaxed">
                  {selectedMed.precautions || "Gunakan sesuai petunjuk dokter dan resep resmi."}
                </p>
              </div>

              {selectedMed.foodRestrictions && selectedMed.foodRestrictions.length > 0 && (
                <div className="pt-2">
                  <span className="text-rose-400 font-semibold block">Pantangan Makanan & Minuman:</span>
                  <ul className="mt-1.5 space-y-1 text-slate-300">
                    {selectedMed.foodRestrictions.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>
                          <strong>{r.food}:</strong> {r.warning}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMed.interactions && selectedMed.interactions.length > 0 && (
                <div className="pt-2">
                  <span className="text-blue-400 font-semibold block">Potensi Interaksi Obat:</span>
                  <ul className="mt-1.5 space-y-1 text-slate-300">
                    {selectedMed.interactions.map((i, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400">•</span>
                        <span>
                          <strong>{i.otherDrug} ({i.severity}):</strong> {i.note}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-between text-slate-400">
                <span>Kadaluarsa: <strong>{selectedMed.expiryDate}</strong></span>
                <span>Izin: <strong>{selectedMed.bpomNumber}</strong></span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedMed(null)}
                className="w-full py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Tutup Monograf
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </Phone>
  );
}
