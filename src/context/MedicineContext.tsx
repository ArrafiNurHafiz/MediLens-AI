"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Medicine, INITIAL_MEDICINES } from "@/data/initialMedicines";
import { DrugInteraction, DRUG_INTERACTIONS } from "@/data/interactionsData";
import { FoodRestriction, FOOD_RESTRICTIONS } from "@/data/restrictionsData";

export interface ScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string;
  timeSlot: 'pagi' | 'siang' | 'sore' | 'malam';
  timingLabel: string;
  instruction: string;
  taken: boolean;
  takenAt?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  weight: number;
  height: number;
  conditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  settings: {
    largeFont: boolean;
    autoVoiceGuide: boolean;
    speechRate: number;
  };
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  drugNames: string[];
  status: 'safe' | 'caution' | 'warning';
  summary: string;
}

interface ToastInfo {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  visible: boolean;
}

interface MedicineContextType {
  medicines: Medicine[];
  interactions: DrugInteraction[];
  restrictions: FoodRestriction[];
  schedule: ScheduleItem[];
  profile: UserProfile;
  scanHistory: ScanRecord[];
  toastInfo: ToastInfo;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  hideToast: () => void;
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  toggleScheduleItem: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addScanRecord: (record: ScanRecord) => void;
  resetAllData: () => void;
  recalculateInteractions: (currentMeds: Medicine[]) => DrugInteraction[];
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: "sch-1",
    medicineId: "amlodipine",
    medicineName: "Amlodipine Besylate",
    dosage: "5 mg",
    time: "07:00",
    timeSlot: "pagi",
    timingLabel: "Setelah Makan",
    instruction: "Minum 1 tablet bersama segelas air setelah sarapan.",
    taken: true,
    takenAt: "07:15"
  },
  {
    id: "sch-2",
    medicineId: "omeprazole",
    medicineName: "Omeprazole",
    dosage: "20 mg",
    time: "10:00",
    timeSlot: "pagi",
    timingLabel: "Sebelum Makan",
    instruction: "Minum 1 kapsul utuh dengan air hangat, 30 menit sebelum makan siang.",
    taken: true,
    takenAt: "10:05"
  },
  {
    id: "sch-3",
    medicineId: "amlodipine",
    medicineName: "Pantau Tekanan Darah",
    dosage: "Evaluasi",
    time: "13:00",
    timeSlot: "siang",
    timingLabel: "Waktu Istirahat",
    instruction: "Catat tensi darah harian pada profil kesehatan Anda.",
    taken: false
  },
  {
    id: "sch-4",
    medicineId: "simvastatin",
    medicineName: "Simvastatin",
    dosage: "20 mg",
    time: "20:00",
    timeSlot: "malam",
    timingLabel: "Setelah Makan Malam",
    instruction: "Minum 1 tablet sebelum tidur untuk kontrol sintesis kolesterol optimal.",
    taken: false
  }
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Arrafi Nur Hafiz",
  age: 25,
  gender: "Laki-laki",
  bloodType: "O+",
  weight: 68,
  height: 172,
  conditions: ["Hipertensi Stage 1", "Dislipidemia Terpantau", "Riwayat Dispepsia"],
  allergies: ["Penisilin / Amoxicillin", "Aspirin (Alergi Ringan)"],
  emergencyContact: {
    name: "Dr. Budi Santoso, Sp.PD",
    relation: "Dokter Spesialis Pendamping",
    phone: "+62 812-3456-7890"
  },
  settings: {
    largeFont: false,
    autoVoiceGuide: true,
    speechRate: 1.0
  }
};

const DEFAULT_HISTORY: ScanRecord[] = [
  {
    id: "scan-001",
    timestamp: "Hari ini, 09:41",
    drugNames: ["Amlodipine Besylate 5 mg", "Simvastatin 20 mg", "Omeprazole 20 mg"],
    status: "caution",
    summary: "3 Obat terdeteksi. Perlu jeda 2 jam antara Omeprazole & Simvastatin."
  },
  {
    id: "scan-002",
    timestamp: "Kemarin, 14:20",
    drugNames: ["Paracetamol 500 mg"],
    status: "safe",
    summary: "1 Obat terdeteksi. Aman untuk pereda demam dan nyeri ringan."
  }
];

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export function MedicineProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [interactions, setInteractions] = useState<DrugInteraction[]>(DRUG_INTERACTIONS);
  const [restrictions, setRestrictions] = useState<FoodRestriction[]>(FOOD_RESTRICTIONS);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>(DEFAULT_HISTORY);
  const [isLoaded, setIsLoaded] = useState(false);

  const [toastInfo, setToastInfo] = useState<ToastInfo>({
    message: "",
    type: "info",
    visible: false
  });

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedMeds = localStorage.getItem("medilens_medicines");
      if (savedMeds) setMedicines(JSON.parse(savedMeds));

      const savedSchedule = localStorage.getItem("medilens_schedule");
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));

      const savedProfile = localStorage.getItem("medilens_profile");
      if (savedProfile) setProfile(JSON.parse(savedProfile));

      const savedHistory = localStorage.getItem("medilens_history");
      if (savedHistory) setScanHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("medilens_medicines", JSON.stringify(medicines));
      localStorage.setItem("medilens_schedule", JSON.stringify(schedule));
      localStorage.setItem("medilens_profile", JSON.stringify(profile));
      localStorage.setItem("medilens_history", JSON.stringify(scanHistory));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [medicines, schedule, profile, scanHistory, isLoaded]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastInfo({ message, type, visible: true });
    setTimeout(() => {
      setToastInfo(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  const hideToast = () => {
    setToastInfo(prev => ({ ...prev, visible: false }));
  };

  const addMedicine = (medicine: Medicine) => {
    setMedicines(prev => {
      const filtered = prev.filter(m => m.id !== medicine.id);
      return [medicine, ...filtered];
    });
    // Add schedule item automatically
    const newSch: ScheduleItem = {
      id: `sch-${Date.now()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      time: medicine.recommendedTime || "08:00",
      timeSlot: medicine.recommendedTime >= "18:00" ? "malam" : medicine.recommendedTime >= "12:00" ? "siang" : "pagi",
      timingLabel: medicine.timingLabel,
      instruction: medicine.instructions,
      taken: false
    };
    setSchedule(prev => [...prev, newSch]);
    showToast(`Berhasil menambahkan ${medicine.name} ke Daftar Obat`, "success");
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    showToast("Data obat diperbarui", "info");
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    setSchedule(prev => prev.filter(s => s.medicineId !== id));
    showToast("Obat dihapus dari daftar", "info");
  };

  const toggleScheduleItem = (id: string) => {
    setSchedule(prev => prev.map(item => {
      if (item.id === id) {
        const nextTaken = !item.taken;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        showToast(
          nextTaken ? `Bagus! ${item.medicineName} ditandai sudah diminum.` : `${item.medicineName} dibatalkan dari tanda diminum.`,
          nextTaken ? "success" : "info"
        );
        return {
          ...item,
          taken: nextTaken,
          takenAt: nextTaken ? timeStr : undefined
        };
      }
      return item;
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    showToast("Profil kesehatan berhasil disimpan", "success");
  };

  const addScanRecord = (record: ScanRecord) => {
    setScanHistory(prev => [record, ...prev]);
  };

  const resetAllData = () => {
    setMedicines(INITIAL_MEDICINES);
    setSchedule(DEFAULT_SCHEDULE);
    setProfile(DEFAULT_PROFILE);
    setScanHistory(DEFAULT_HISTORY);
    localStorage.clear();
    showToast("Data berhasil direset ke pengaturan awal", "info");
  };

  const recalculateInteractions = (currentMeds: Medicine[]): DrugInteraction[] => {
    const medIds = currentMeds.map(m => m.id.toLowerCase());
    return DRUG_INTERACTIONS.filter(inter =>
      medIds.some(id => inter.drugAId.includes(id)) &&
      medIds.some(id => inter.drugBId.includes(id))
    );
  };

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        interactions,
        restrictions,
        schedule,
        profile,
        scanHistory,
        toastInfo,
        showToast,
        hideToast,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        toggleScheduleItem,
        updateProfile,
        addScanRecord,
        resetAllData,
        recalculateInteractions
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
}

export function useMedicine() {
  const context = useContext(MedicineContext);
  if (!context) {
    throw new Error("useMedicine must be used within a MedicineProvider");
  }
  return context;
}
