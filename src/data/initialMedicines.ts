export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  status: 'safe' | 'caution' | 'warning';
  statusLabel: string;
  expiryDate: string;
  isExpired: boolean;
  bpomNumber: string;
  indication: string;
  instructions: string;
  timing: 'before_meal' | 'after_meal' | 'with_meal' | 'empty_stomach';
  timingLabel: string;
  recommendedTime: string;
  sideEffects: string[];
  precautions: string;
  imageUrl?: string;
  takenToday?: boolean;
}

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "amlodipine",
    name: "Amlodipine Besylate 5 mg",
    genericName: "Amlodipine",
    dosage: "5 mg",
    form: "Tablet",
    status: "safe",
    statusLabel: "Aman",
    expiryDate: "12 Des 2026",
    isExpired: false,
    bpomNumber: "DKL1234567810A1",
    indication: "Menurunkan tekanan darah tinggi dengan merelaksasi pembuluh darah agar aliran darah lebih lancar.",
    instructions: "1 kali sehari 1 tablet, sebaiknya di pagi hari pada jam yang sama setiap hari.",
    timing: "after_meal",
    timingLabel: "Setelah makan",
    recommendedTime: "07:00",
    sideEffects: [
      "Pusing atau sakit kepala ringan saat bangun mendadak",
      "Pembengkakan ringan pada pergelangan kaki (edema)",
      "Rasa lelah atau mengantuk"
    ],
    precautions: "Jangan menghentikan obat secara tiba-tiba tanpa berkonsultasi dengan dokter untuk menghindari lonjakan tekanan darah (rebound hypertension).",
    takenToday: true
  },
  {
    id: "simvastatin",
    name: "Simvastatin 20 mg",
    genericName: "Simvastatin",
    dosage: "20 mg",
    form: "Tablet Salut Selaput",
    status: "caution",
    statusLabel: "Perlu Jeda",
    expiryDate: "28 Nov 2027",
    isExpired: false,
    bpomNumber: "GKL0987654317B1",
    indication: "Menurunkan kadar kolesterol jahat (LDL) dan trigliserida serta meningkatkan kolesterol baik (HDL).",
    instructions: "1 kali sehari 1 tablet, diminum malam hari sebelum tidur karena biosintesis kolesterol hati aktif pada malam hari.",
    timing: "after_meal",
    timingLabel: "Setelah makan malam",
    recommendedTime: "20:00",
    sideEffects: [
      "Nyeri atau pegal otot (myalgia)",
      "Gangguan lambung atau kembung",
      "Sakit kepala ringan"
    ],
    precautions: "Hindari konsumsi buah jeruk bali (grapefruit) dan beri jeda minimal 2 jam bila meminum antasida atau obat lambung.",
    takenToday: false
  },
  {
    id: "omeprazole",
    name: "Omeprazole 20 mg",
    genericName: "Omeprazole",
    dosage: "20 mg",
    form: "Kapsul Pelepasan Tunda",
    status: "safe",
    statusLabel: "Aman",
    expiryDate: "15 Jan 2028",
    isExpired: false,
    bpomNumber: "DKL9876543201A1",
    indication: "Menekan sekresi asam lambung berlebih, mengatasi tukak lambung, nyeri ulu hati, dan GERD.",
    instructions: "1 kali sehari 1 kapsul, diminum 30 hingga 60 menit sebelum makan pagi atau sebelum makan besar.",
    timing: "before_meal",
    timingLabel: "Sebelum makan",
    recommendedTime: "10:00",
    sideEffects: [
      "Perut kembung atau sering buang gas",
      "Mual ringan",
      "Konstipasi atau diare ringan"
    ],
    precautions: "Kapsul harus ditelan utuh dengan segelas air putih hangat. Jangan dibuka, dikunyah, atau dilarutkan.",
    takenToday: true
  }
];
