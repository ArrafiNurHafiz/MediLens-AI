"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMedicine } from "@/context/MedicineContext";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Bell,
  Sparkles,
  ChevronRight,
  Pill,
  X
} from "lucide-react";

export default function SchedulePage() {
  const { schedule, toggleScheduleItem, showToast } = useMedicine();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Hari Ini");

  // Form state
  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");
  const [newTime, setNewTime] = useState("12:00");
  const [newInstruction, setNewInstruction] = useState("Setelah makan");

  const completedCount = schedule.filter((s) => s.taken).length;
  const totalCount = schedule.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (id: string) => {
    toggleScheduleItem(id);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // We can show toast or handle custom schedule
    showToast(`Jadwal baru untuk ${newName} (${newTime}) berhasil ditambahkan`, "success");
    setShowAddModal(false);
    setNewName("");
    setNewDose("");
  };

  return (
    <div className="flex-1 pb-6 select-none relative">
      {/* Top Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <Link
          href="/beranda"
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Jadwal Konsumsi Obat
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">
            Kepatuhan & Pengingat Waktu Presisi
          </p>
        </div>
        <button
          onClick={() => {
            if ("Notification" in window) {
              Notification.requestPermission().then((perm) => {
                showToast(
                  perm === "granted"
                    ? "Pengingat alarm notifikasi aktif!"
                    : "Izin notifikasi belum diberikan di browser",
                  perm === "granted" ? "success" : "info"
                );
              });
            } else {
              showToast("Pengingat suara otomatis aktif setiap jam minum obat", "info");
            }
          }}
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-xs border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Alarm"
        >
          <Bell className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Date Selector Banner */}
      <div className="px-4 my-2">
        <div className="flex items-center justify-between bg-white/90 rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-slate-800 leading-tight">
                {selectedDate}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                20 Oktober 2026
              </p>
            </div>
          </div>
          <button
            onClick={() => showToast("Menampilkan jadwal minum obat hari ini", "info")}
            className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] border border-blue-200"
          >
            Aktif
          </button>
        </div>
      </div>

      {/* Daily Progress Tracker Card */}
      <div className="px-4 my-2">
        <div className="glass-card rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-800">
              Kepatuhan Minum Hari Ini
            </span>
            <span className="text-xs font-extrabold text-blue-600">
              {completedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            {progressPercent === 100
              ? "Luar biasa! Semua obat hari ini telah diminum tepat waktu."
              : "Ketuk lingkaran centang setelah meminum obat untuk mencatat kepatuhan."}
          </p>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="px-4 mt-3 space-y-3 relative">
        {/* Timeline Line */}
        <div className="absolute left-[58px] top-6 bottom-6 w-[2px] bg-blue-200/80 pointer-events-none" />

        {schedule.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 relative z-10">
            {/* Time Stamp */}
            <span className="w-10 text-[11.5px] font-extrabold text-slate-700 shrink-0 text-right">
              {item.time}
            </span>

            {/* Indicator Dot / Checkbox */}
            <button
              onClick={() => handleToggle(item.id)}
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                item.taken
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-white border-2 border-slate-300 text-slate-300 hover:border-blue-400"
              }`}
              aria-label={item.taken ? "Tandai belum diminum" : "Tandai sudah diminum"}
            >
              {item.taken ? (
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Medicine Schedule Card */}
            <div
              onClick={() => handleToggle(item.id)}
              className={`flex-1 rounded-2xl p-3 border transition-all cursor-pointer ${
                item.taken
                  ? "bg-white/60 border-slate-200/70 opacity-75"
                  : "glass-card border-blue-200/80 shadow-xs hover:border-blue-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs font-bold leading-tight ${
                    item.taken ? "line-through text-slate-500" : "text-slate-900"
                  }`}
                >
                  {item.medicineName} {item.dosage}
                </h3>
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                    item.taken
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {item.taken ? `Diminum ${item.takenAt || "Tepat Waktu"}` : item.timingLabel}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1 leading-tight">
                {item.instruction}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Schedule Button */}
      <div className="px-4 mt-5">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 rounded-2xl bg-white border border-dashed border-blue-400 text-blue-600 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengingat Dosis Baru</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Tambah Jadwal Minum</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Obat
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Vitamin B-Complex"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Jam
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Aturan
                  </label>
                  <input
                    type="text"
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-primary-grad font-bold text-xs shadow-md mt-2"
              >
                Simpan Jadwal Pengingat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
