import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface FoodRestrictionItem {
  food: string;
  warning: string;
  severity: "warning" | "caution";
}

export interface DrugInteractionItem {
  otherDrug: string;
  severity: "warning" | "caution" | "safe";
  note: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  category: string;
  status: "safe" | "caution" | "warning";
  statusLabel: string;
  expiryDate: string;
  bpomNumber: string;
  indication: string;
  instructions: string;
  timing: "before_meal" | "after_meal" | "with_meal";
  timingLabel: string;
  recommendedTime: string;
  sideEffects: string[];
  precautions: string;
  imageUrl?: string;
  foodRestrictions?: FoodRestrictionItem[];
  interactions?: DrugInteractionItem[];
  allergyWarning?: string;
  teksPanduanSuara?: string;
  scannedAt?: string;
  takenToday?: boolean;
}

export interface ScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string;
  timeSlot: "pagi" | "siang" | "sore" | "malam";
  timingLabel: string;
  instruction: string;
  taken: boolean;
  takenAt?: string;
}

export interface AccessibilitySettings {
  largeFont: boolean;
  highContrast: boolean;
  autoVoice: boolean;
  speechRate: number;
  hapticFeedback: boolean;
  soundEffects: boolean;
  simplifiedLanguage: boolean;
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
  settings: AccessibilitySettings;
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  drugNames: string[];
  status: "safe" | "caution" | "warning";
  summary: string;
}

interface ToastInfo {
  message: string;
  type: "info" | "success" | "warning" | "error";
  visible: boolean;
}

interface MedicineContextType {
  medicines: Medicine[];
  schedule: ScheduleItem[];
  profile: UserProfile;
  scanHistory: ScanRecord[];
  toastInfo: ToastInfo;
  showToast: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  hideToast: () => void;
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  toggleScheduleItem: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  addScanRecord: (record: ScanRecord) => void;
  clearAllData: () => void;
  playFeedback: (type?: "click" | "success" | "warning" | "alert") => void;
}

export function playEarcon(type: "click" | "success" | "warning" | "alert" = "click") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "success") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "warning") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "alert") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(660, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // restricted before user interaction
  }
}

export function triggerVibration(pattern: number | number[] = 70) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Arrafi Nur Hafiz",
  age: 25,
  gender: "Laki-laki",
  bloodType: "O+",
  weight: 68,
  height: 172,
  conditions: ["Hipertensi Ringan", "Riwayat Dispepsia (Asam Lambung)"],
  allergies: ["Penisilin / Amoxicillin"],
  emergencyContact: {
    name: "Dr. Budi Santoso, Sp.PD",
    relation: "Dokter Spesialis Pendamping",
    phone: "+62 812-3456-7890",
  },
  settings: {
    largeFont: false,
    highContrast: false,
    autoVoice: true,
    speechRate: 1.0,
    hapticFeedback: true,
    soundEffects: true,
    simplifiedLanguage: false,
  },
};

const DEFAULT_MEDICINES: Medicine[] = [];

const DEFAULT_SCHEDULE: ScheduleItem[] = [];

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export function MedicineProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(DEFAULT_MEDICINES);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [toastInfo, setToastInfo] = useState<ToastInfo>({
    message: "",
    type: "info",
    visible: false,
  });

  const playFeedback = useCallback(
    (type: "click" | "success" | "warning" | "alert" = "click") => {
      if (profile.settings.soundEffects) {
        playEarcon(type);
      }
      if (profile.settings.hapticFeedback) {
        const pattern = type === "alert" ? [100, 50, 100, 50, 100] : type === "warning" ? [80, 40, 80] : 60;
        triggerVibration(pattern);
      }
    },
    [profile.settings]
  );

  // Load from localStorage (Fresh start with no dummy medicines)
  useEffect(() => {
    try {
      const savedMeds = localStorage.getItem("medilens_fresh_v2_medicines");
      if (savedMeds) setMedicines(JSON.parse(savedMeds));
      else setMedicines([]);

      const savedSchedule = localStorage.getItem("medilens_fresh_v2_schedule");
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
      else setSchedule([]);

      const savedProfile = localStorage.getItem("medilens_fresh_v2_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          settings: { ...prev.settings, ...(parsed.settings || {}) },
        }));
      }

      const savedHistory = localStorage.getItem("medilens_fresh_v2_history");
      if (savedHistory) setScanHistory(JSON.parse(savedHistory));
      else setScanHistory([]);
    } catch (e) {
      console.warn("Storage load warning:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("medilens_fresh_v2_medicines", JSON.stringify(medicines));
      localStorage.setItem("medilens_fresh_v2_schedule", JSON.stringify(schedule));
      localStorage.setItem("medilens_fresh_v2_profile", JSON.stringify(profile));
      localStorage.setItem("medilens_fresh_v2_history", JSON.stringify(scanHistory));
    } catch (e) {
      console.warn("Storage save warning:", e);
    }
  }, [medicines, schedule, profile, scanHistory, isLoaded]);

  const showToast = useCallback(
    (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
      playFeedback(type === "error" ? "alert" : type === "warning" ? "warning" : "success");
      setToastInfo({ message, type, visible: true });
      setTimeout(() => {
        setToastInfo((prev) => ({ ...prev, visible: false }));
      }, 3500);
    },
    [playFeedback]
  );

  const hideToast = useCallback(() => {
    setToastInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  const addMedicine = useCallback(
    (medicine: Medicine) => {
      setMedicines((prev) => {
        const exists = prev.some((m) => m.id === medicine.id || m.name.toLowerCase() === medicine.name.toLowerCase());
        if (exists) {
          return prev.map((m) => (m.id === medicine.id || m.name.toLowerCase() === medicine.name.toLowerCase() ? medicine : m));
        }
        return [medicine, ...prev];
      });

      const time = medicine.recommendedTime || "08:00";
      const hour = parseInt(time.split(":")[0] || "8", 10);
      const timeSlot: "pagi" | "siang" | "sore" | "malam" =
        hour < 11 ? "pagi" : hour < 15 ? "siang" : hour < 18 ? "sore" : "malam";

      const newScheduleItem: ScheduleItem = {
        id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: medicine.dosage || "1 dosis",
        time: medicine.recommendedTime || "08:00",
        timeSlot,
        timingLabel: medicine.timingLabel || "Setelah Makan",
        instruction: medicine.instructions || "Minum sesuai anjuran",
        taken: false,
      };

      setSchedule((prev) => [...prev, newScheduleItem]);
      showToast(`"${medicine.name}" berhasil ditambahkan ke lemari obat!`, "success");
    },
    [showToast]
  );

  const updateMedicine = useCallback(
    (id: string, updates: Partial<Medicine>) => {
      setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
      showToast("Informasi obat diperbarui", "info");
    },
    [showToast]
  );

  const deleteMedicine = useCallback(
    (id: string) => {
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      setSchedule((prev) => prev.filter((s) => s.medicineId !== id));
      showToast("Obat dihapus dari daftar", "info");
    },
    [showToast]
  );

  const toggleScheduleItem = useCallback(
    (id: string) => {
      setSchedule((prev) =>
        prev.map((item): ScheduleItem => {
          if (item.id === id) {
            const nextTaken = !item.taken;
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            showToast(
              nextTaken ? `Hebat! ${item.medicineName} ditandai sudah diminum.` : `${item.medicineName} ditandai belum diminum.`,
              nextTaken ? "success" : "info"
            );
            const updated: ScheduleItem = {
              ...item,
              taken: nextTaken,
            };
            if (nextTaken) {
              updated.takenAt = timeStr;
            } else {
              delete updated.takenAt;
            }
            return updated;
          }
          return item;
        })
      );
    },
    [showToast]
  );

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...updates }));
      showToast("Profil kesehatan berhasil disimpan", "success");
    },
    [showToast]
  );

  const updateAccessibility = useCallback(
    (settings: Partial<AccessibilitySettings>) => {
      setProfile((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...settings },
      }));
      showToast("Pengaturan aksesibilitas diperbarui", "success");
    },
    [showToast]
  );

  const addScanRecord = useCallback((record: ScanRecord) => {
    setScanHistory((prev) => [record, ...prev]);
  }, []);

  const clearAllData = useCallback(() => {
    setMedicines([]);
    setSchedule([]);
    setScanHistory([]);
    try {
      localStorage.removeItem("medilens_fresh_v2_medicines");
      localStorage.removeItem("medilens_fresh_v2_schedule");
      localStorage.removeItem("medilens_fresh_v2_history");
      localStorage.removeItem("medilens_real_medicines");
      localStorage.removeItem("medilens_real_schedule");
      localStorage.removeItem("medilens_real_history");
    } catch (e) {}
    showToast("Data lemari obat telah dikosongkan.", "info");
  }, [showToast]);

  return (
    <MedicineContext.Provider
      value={{
        medicines,
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
        updateAccessibility,
        addScanRecord,
        clearAllData,
        playFeedback,
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
