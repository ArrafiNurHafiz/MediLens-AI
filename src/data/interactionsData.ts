export interface DrugInteraction {
  id: string;
  drugAId: string;
  drugAName: string;
  drugBId: string;
  drugBName: string;
  severity: 'safe' | 'caution' | 'warning';
  title: string;
  badge: string;
  timeSpacing: string;
  mechanism: string;
  recommendation: string;
}

export const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    id: "simvastatin-omeprazole",
    drugAId: "simvastatin",
    drugAName: "Simvastatin 20 mg",
    drugBId: "omeprazole",
    drugBName: "Omeprazole 20 mg",
    severity: "caution",
    title: "Perlu Jeda Waktu Minum",
    badge: "Jeda 2 Jam",
    timeSpacing: "Minimal 2 jam pemisah",
    mechanism: "Omeprazole meningkatkan pH asam lambung yang dapat mempengaruhi bioavailabilitas penyerapan Simvastatin, serta memiliki jalur eliminasi hepatik yang beririsan.",
    recommendation: "Minum Omeprazole pagi hari pukul 10:00 (sebelum makan) dan Simvastatin malam hari pukul 20:00 (setelah makan malam). Dengan jeda 10 jam, kedua obat bekerja optimal tanpa risiko interaksi."
  },
  {
    id: "amlodipine-simvastatin",
    drugAId: "amlodipine",
    drugAName: "Amlodipine Besylate 5 mg",
    drugBId: "simvastatin",
    drugBName: "Simvastatin 20 mg",
    severity: "caution",
    title: "Interaksi Farmakokinetik Terpantau",
    badge: "Pantau Dosis",
    timeSpacing: "Minum pagi & malam terpisah",
    mechanism: "Amlodipine merupakan inhibitor ringan CYP3A4 yang dapat menaikkan konsentrasi Simvastatin darah hingga 77%, meningkatkan potensi miopati jika dosis Simvastatin > 20 mg.",
    recommendation: "Dosis Simvastatin Anda adalah 20 mg (batas aman maksimal saat bersama Amlodipine). Tetap aman dikonsumsi. Jika timbul keluhan kram atau nyeri otot hebat, segera hubungi dokter."
  },
  {
    id: "amlodipine-omeprazole",
    drugAId: "amlodipine",
    drugAName: "Amlodipine Besylate 5 mg",
    drugBId: "omeprazole",
    drugBName: "Omeprazole 20 mg",
    severity: "safe",
    title: "Aman Dikonsumsi Bersamaan",
    badge: "Kompatibel",
    timeSpacing: "Tidak perlu jeda khusus",
    mechanism: "Tidak ditemukan interaksi metabolisme, ikatan protein plasma, atau klirens ginjal yang signifikan antara kedua senyawa obat ini.",
    recommendation: "Kombinasi obat ini aman dan lazim diresepkan bersamaan untuk pasien dengan hipertensi dan keluhan asam lambung."
  }
];
