"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMedicine } from "@/context/MedicineContext";
import { Medicine } from "@/data/initialMedicines";
import {
  ArrowLeft,
  Search,
  Plus,
  Pill,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  X
} from "lucide-react";

export default function DrugListPage() {
  const { medicines, addMedicine, showToast } = useMedicine();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "safe" | "caution" | "warning">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding new drug
  const [newDrugName, setNewDrugName] = useState("");
  const [newGenericName, setNewGenericName] = useState("");
  const [newDosage, setNewDosage] = useState("500 mg");
  const [newForm, setNewForm] = useState("Tablet");
  const [newTime, setNewTime] = useState("08:00");
  const [newTiming, setNewTiming] = useState<Medicine["timing"]>("after_meal");
  const [newIndication, setNewIndication] = useState("");

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrugName.trim()) {
      showToast("Nama obat tidak boleh kosong", "warning");
      return;
    }

    const created: Medicine = {
      id: newDrugName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name: newDrugName,
      genericName: newGenericName || newDrugName,
      dosage: newDosage,
      form: newForm,
      status: "safe",
      statusLabel: "Aman",
      expiryDate: "31 Des 2027",
      isExpired: false,
      bpomNumber: "DKL" + Math.floor(1000000000 + Math.random() * 9000000000) + "A1",
      indication: newIndication || "Obat terapi penunjang kesehatan harian.",
      instructions: `1 kali sehari 1 ${newForm.toLowerCase()}, diminum ${newTiming === "after_meal" ? "setelah makan" : "sebelum makan"}.`,
      timing: newTiming,
      timingLabel: newTiming === "after_meal" ? "Setelah makan" : "Sebelum makan",
      recommendedTime: newTime,
      sideEffects: ["Mual ringan jika perut kosong", "Mengantuk"],
      precautions: "Konsumsi sesuai anjuran dan perbanyak minum air putih.",
      takenToday: false,
    };

    addMedicine(created);
    setShowAddModal(false);
    // Reset Form
    setNewDrugName("");
    setNewGenericName("");
    setNewIndication("");
  };

  return (
    <div className="flex-1 pb-6 select-none relative">
      {/* Top Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <Link
          href="/beranda"
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Kembali ke Beranda"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Kabinet Obat Saya
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">
            {medicines.length} Obat Tersimpan
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-all active:scale-95"
          aria-label="Tambah Obat Manual"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 my-2">
        <div className="bg-white/95 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200/80 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari obat, zat aktif, atau indikasi..."
            className="bg-transparent text-xs w-full focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 my-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
            statusFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-white"
          }`}
        >
          Semua ({medicines.length})
        </button>
        <button
          onClick={() => setStatusFilter("safe")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 ${
            statusFilter === "safe"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          Aman ({medicines.filter((m) => m.status === "safe").length})
        </button>
        <button
          onClick={() => setStatusFilter("caution")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 ${
            statusFilter === "caution"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <AlertCircle className="w-3 h-3" />
          Perlu Jeda ({medicines.filter((m) => m.status === "caution").length})
        </button>
      </div>

      {/* Drug List */}
      <div className="px-4 mt-3 space-y-2.5">
        {filteredMedicines.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center mt-6">
            <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Obat Tidak Ditemukan</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Coba kata kunci lain atau tambahkan obat baru secara manual.
            </p>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const isCaution = med.status === "caution";
            return (
              <Link
                key={med.id}
                href={`/drugs/${med.id}`}
                className="glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCaution
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <Pill className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {med.name}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      {med.genericName} • {med.dosage}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isCaution
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isCaution ? (
                          <AlertCircle className="w-2.5 h-2.5" />
                        ) : (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        )}
                        {med.statusLabel}
                      </span>
                      <span className="text-[9.5px] text-slate-400">
                        {med.timingLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })
        )}
      </div>

      {/* Modal: Tambah Obat Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Tambah Obat ke Kabinet</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Obat & Dosis
                </label>
                <input
                  type="text"
                  required
                  value={newDrugName}
                  onChange={(e) => setNewDrugName(e.target.value)}
                  placeholder="Contoh: Metformin 500 mg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Bentuk Sediaan
                  </label>
                  <select
                    value={newForm}
                    onChange={(e) => setNewForm(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Kapsul">Kapsul</option>
                    <option value="Sirup">Sirup</option>
                    <option value="Salep">Salep</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Jam Minum
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Aturan Makan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTiming("after_meal")}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      newTiming === "after_meal"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    Setelah Makan
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTiming("before_meal")}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      newTiming === "before_meal"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    Sebelum Makan
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Catatan / Indikasi (Opsional)
                </label>
                <input
                  type="text"
                  value={newIndication}
                  onChange={(e) => setNewIndication(e.target.value)}
                  placeholder="Contoh: Mengontrol kadar gula darah"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl btn-primary-grad font-bold text-xs shadow-md"
                >
                  Simpan Obat ke Kabinet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
