import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Heart,
  ShieldAlert,
  PhoneCall,
  Save,
  Trash2,
  Plus,
  X,
  Volume2,
  Accessibility,
  CheckCircle2,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { Phone, TopBar, BottomNav, speak, AccessibilityModal } from "@/components/medi";
import { useMedicine } from "@/lib/medicineContext";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil Kesehatan & Pengguna — MediLens AI" },
      { name: "description", content: "Kelola nama pengguna, riwayat alergi obat, kondisi medis, dan kontak darurat." },
    ],
  }),
  component: ProfilePage,
});

export default function ProfilePage() {
  const nav = useNavigate();
  const { profile, updateProfile, clearAllData, playFeedback } = useMedicine();

  // Form states
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [gender, setGender] = useState(profile.gender);
  const [bloodType, setBloodType] = useState(profile.bloodType);
  const [weight, setWeight] = useState(profile.weight.toString());
  const [height, setHeight] = useState(profile.height.toString());

  // Allergies & Conditions lists
  const [allergies, setAllergies] = useState<string[]>(profile.allergies);
  const [newAllergy, setNewAllergy] = useState("");

  const [conditions, setConditions] = useState<string[]>(profile.conditions);
  const [newCondition, setNewCondition] = useState("");

  // Emergency contact
  const [emName, setEmName] = useState(profile.emergencyContact.name);
  const [emRelation, setEmRelation] = useState(profile.emergencyContact.relation);
  const [emPhone, setEmPhone] = useState(profile.emergencyContact.phone);

  const [showA11y, setShowA11y] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile.settings.autoVoice) {
      speak(`Halaman profil pasien ${name}. Anda dapat mengubah nama, usia, riwayat alergi, dan kondisi medis di sini.`, profile.settings.speechRate);
    }
  }, []);

  // Add allergy
  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAllergy.trim();
    if (!trimmed || allergies.includes(trimmed)) return;
    const updated = [...allergies, trimmed];
    setAllergies(updated);
    setNewAllergy("");
    playFeedback("success");
    speak(`Alergi ${trimmed} ditambahkan.`);
  };

  const handleRemoveAllergy = (target: string) => {
    const updated = allergies.filter((a) => a !== target);
    setAllergies(updated);
    playFeedback("click");
    speak(`Alergi ${target} dihapus.`);
  };

  // Add condition
  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCondition.trim();
    if (!trimmed || conditions.includes(trimmed)) return;
    const updated = [...conditions, trimmed];
    setConditions(updated);
    setNewCondition("");
    playFeedback("success");
    speak(`Kondisi ${trimmed} ditambahkan.`);
  };

  const handleRemoveCondition = (target: string) => {
    const updated = conditions.filter((c) => c !== target);
    setConditions(updated);
    playFeedback("click");
    speak(`Kondisi ${target} dihapus.`);
  };

  // Save full profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || "Pasien",
      age: parseInt(age, 10) || 25,
      gender,
      bloodType,
      weight: parseInt(weight, 10) || 60,
      height: parseInt(height, 10) || 165,
      allergies,
      conditions,
      emergencyContact: {
        name: emName.trim(),
        relation: emRelation.trim(),
        phone: emPhone.trim(),
      },
    });

    setIsSaved(true);
    playFeedback("success");
    speak(`Profil kesehatan atas nama ${name} berhasil disimpan.`, profile.settings.speechRate);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const speakProfileSummary = () => {
    playFeedback("click");
    const summary = `Profil ${name}. Usia ${age} tahun. Golongan darah ${bloodType}. Alergi: ${allergies.join(", ") || "tidak ada"}. Riwayat kondisi: ${conditions.join(", ") || "tidak ada"}. Kontak darurat: ${emName}, ${emRelation}.`;
    speak(summary, profile.settings.speechRate);
  };

  return (
    <Phone dark={true}>
      <TopBar
        title="Profil & Data Pasien"
        rightAction={
          <button
            onClick={() => setShowA11y(true)}
            aria-label="Pengaturan Aksesibilitas"
            className="p-2 rounded-full hover:bg-white/10 text-emerald-400"
          >
            <Accessibility className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex-1 p-4 space-y-4 pb-8 text-white">
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xl shadow-md">
              {name ? name.slice(0, 1).toUpperCase() : "P"}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">{name || "Pasien"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {gender} • {age} th • Gol. {bloodType}
              </p>
            </div>
          </div>
          <button
            onClick={speakProfileSummary}
            className="grid h-10 w-10 place-items-center rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 active:scale-95"
            title="Dengarkan Ringkasan Profil"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        {/* Form Biodata */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" /> Informasi Utama Pasien
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Pasien / Pengguna</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Usia (Tahun)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gol. Darah</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-2 py-2 text-xs text-white outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Berat (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-2 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tinggi (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-2 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Riwayat Alergi Obat */}
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" /> Riwayat Alergi Obat
              </h3>
              <span className="text-[10px] text-slate-400">Penting untuk filter AI</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sistem AI akan otomatis memblokir dan memberi peringatan bahaya jika ada obat yang berpotensi memicu reaksi alergi ini.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {allergies.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Tidak ada catatan alergi obat.</span>
              ) : (
                allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-200 border border-rose-500/40 px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="hover:text-white rounded-full p-0.5"
                      title="Hapus"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Tambah alergi baru (misal: Penisilin, Aspirin)..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Kondisi Medis & Penyakit */}
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-400" /> Kondisi Medis & Penyakit
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Membantu AI menganalisis kesesuaian obat dengan riwayat penyakit penyerta Anda.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {conditions.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Tidak ada catatan penyakit.</span>
              ) : (
                conditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    {cond}
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond)}
                      className="hover:text-white rounded-full p-0.5"
                      title="Hapus"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Tambah kondisi medis (misal: Hipertensi, Asma, GERD)..."
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Kontak Darurat */}
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-400" /> Kontak Darurat & Dokter
            </h3>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nama Dokter / Kerabat</label>
                <input
                  type="text"
                  value={emName}
                  onChange={(e) => setEmName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Hubungan</label>
                  <input
                    type="text"
                    value={emRelation}
                    onChange={(e) => setEmRelation(e.target.value)}
                    placeholder="Dokter / Keluarga"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={emPhone}
                    onChange={(e) => setEmPhone(e.target.value)}
                    placeholder="+62 8..."
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Save Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-300" /> Profil Berhasil Disimpan!
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Simpan Perubahan Profil
              </>
            )}
          </button>
        </form>

        {/* Clear Data Reset Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              playFeedback("warning");
              if (confirm("Kosongkan semua data obat dan jadwal agar mulai fresh?")) {
                clearAllData();
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Trash2 className="h-4 w-4 text-rose-400" /> Kosongkan Semua Data (Mulai Fresh)
          </button>
        </div>
      </div>

      <BottomNav />
      {showA11y && <AccessibilityModal onClose={() => setShowA11y(false)} />}
    </Phone>
  );
}
