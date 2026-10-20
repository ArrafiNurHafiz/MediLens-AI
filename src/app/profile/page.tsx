"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMedicine } from "@/context/MedicineContext";
import {
  ArrowLeft,
  User,
  Heart,
  Phone,
  Shield,
  Volume2,
  Settings,
  RotateCcw,
  Edit2,
  Check,
  AlertCircle,
  X
} from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile, resetAllData, showToast } = useMedicine();
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [bloodType, setBloodType] = useState(profile.bloodType);
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyContact.phone);

  const availableConditions = [
    "Hipertensi",
    "Dislipidemia",
    "Maag / GERD",
    "Diabetes Melitus",
    "Asma",
    "Asam Urat"
  ];

  const availableAllergies = [
    "Penisilin / Amoxicillin",
    "Aspirin & NSAID",
    "Sulfa",
    "Paracetamol",
    "Antibiotik Ciprofloxacin"
  ];

  const toggleCondition = (cond: string) => {
    const exists = profile.conditions.some((c) => c.toLowerCase().includes(cond.toLowerCase()));
    const newConditions = exists
      ? profile.conditions.filter((c) => !c.toLowerCase().includes(cond.toLowerCase()))
      : [...profile.conditions, cond];
    updateProfile({ conditions: newConditions });
  };

  const toggleAllergy = (allergy: string) => {
    const exists = profile.allergies.some((a) => a.toLowerCase().includes(allergy.toLowerCase()));
    const newAllergies = exists
      ? profile.allergies.filter((a) => !a.toLowerCase().includes(allergy.toLowerCase()))
      : [...profile.allergies, allergy];
    updateProfile({ allergies: newAllergies });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      age: Number(age),
      bloodType,
      emergencyContact: {
        ...profile.emergencyContact,
        phone: emergencyPhone,
      },
    });
    setShowEditModal(false);
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
            Profil Kesehatan Pasien
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">
            Data Medis & Pengaturan Aksesibilitas
          </p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 transition-colors"
          aria-label="Edit Profil"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="px-4 my-2">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-500">
                {profile.age} tahun • Gol. Darah {profile.bloodType}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {profile.weight} kg • {profile.height} cm
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs border border-blue-200 hover:bg-blue-100"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Kondisi Medis */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Kondisi Medis Pasien
          </h3>
          <span className="text-[10px] text-slate-400">Ketuk untuk toggle</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {availableConditions.map((cond) => {
            const isActive = profile.conditions.some((c) =>
              c.toLowerCase().includes(cond.toLowerCase())
            );
            return (
              <button
                key={cond}
                onClick={() => toggleCondition(cond)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive
                    ? "bg-rose-50 text-rose-700 border border-rose-300 shadow-xs"
                    : "bg-white/80 text-slate-500 border border-slate-200 hover:bg-white"
                }`}
              >
                {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Riwayat Alergi Obat */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Riwayat Alergi Obat (Kontraindikasi)
          </h3>
          <span className="text-[10px] text-slate-400">Peringatan Kritis</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {availableAllergies.map((allergy) => {
            const isActive = profile.allergies.some((a) =>
              a.toLowerCase().includes(allergy.toLowerCase())
            );
            return (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive
                    ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                    : "bg-white/80 text-slate-500 border border-slate-200 hover:bg-white"
                }`}
              >
                {isActive && <AlertCircle className="w-3 h-3 text-amber-700" />}
                {allergy}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kontak Darurat / Dokter Pendamping */}
      <div className="px-4 mt-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
          Kontak Darurat Medis
        </h3>
        <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Phone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                {profile.emergencyContact.name}
              </h4>
              <p className="text-[10.5px] text-slate-500">
                {profile.emergencyContact.relation}
              </p>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                {profile.emergencyContact.phone}
              </p>
            </div>
          </div>
          <a
            href={`tel:${profile.emergencyContact.phone}`}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Hubungi
          </a>
        </div>
      </div>

      {/* Aksesibilitas & Reset Data */}
      <div className="px-4 mt-4 space-y-2">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
          Pengaturan Aplikasi
        </h3>

        <div className="glass-card rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Panduan Suara Otomatis
            </span>
          </div>
          <input
            type="checkbox"
            checked={profile.settings.autoVoiceGuide}
            onChange={(e) =>
              updateProfile({
                settings: { ...profile.settings, autoVoiceGuide: e.target.checked },
              })
            }
            className="w-4 h-4 accent-blue-600 rounded"
          />
        </div>

        <button
          onClick={() => {
            if (confirm("Reset seluruh data obat, riwayat, dan jadwal ke pengaturan awal?")) {
              resetAllData();
            }
          }}
          className="w-full py-3 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Seluruh Data Aplikasi</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Ubah Profil Pasien</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Umur (Tahun)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Golongan Darah
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nomor Kontak Darurat
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-primary-grad font-bold text-xs shadow-md mt-2"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
