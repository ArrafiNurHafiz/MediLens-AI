# AGENTS.md — Petunjuk Operasional & Arsitektur MediLens AI

Dokumen ini adalah instruksi operasional dan pedoman arsitektur untuk pengembangan dan pemeliharaan aplikasi **MediLens AI** (Asisten Pintar Keamanan Obat untuk Semua).

---

## 📌 Ringkasan Proyek

MediLens AI adalah aplikasi mobile-first berbasis web yang dirancang untuk membantu masyarakat (termasuk lansia dan pasien kronis) dalam memahami penggunaan obat secara aman. Sistem mengintegrasikan:
1. **Pemindaian Multi-Obat Real-Time** (WebRTC Camera Stream & image upload).
2. **Mesin Deteksi & Analisis Interaksi Antar-Obat** (Drug-to-Drug Interaction Matrix).
3. **Peringatan Pantangan Makanan & Minuman** (Food & Beverage Contraindications).
4. **Jadwal Konsumsi Otomatis & Checklist Kepatuhan Minum Obat**.
5. **Panduan Suara Terintegrasi** (Web Speech API dengan kontrol kecepatan & avatar interaktif).
6. **Profil Kesehatan Pribadi** (Kondisi medis, riwayat alergi, dan kontak darurat).

---

## 🎯 Core Behavioral Guidelines (Karpathy Guidelines)

1. **Think Before Coding**:
   - Jangan berasumsi. Nyatakan asumsi secara eksplisit sebelum implementasi.
   - Jika kebutuhan ambigu atau ada beberapa pendekatan, paparkan trade-off terlebih dahulu.
2. **Simplicity First**:
   - Tulis kode minimal yang menyelesaikan masalah.
   - Hindari abstraksi berlebih atau helper spekulatif yang tidak digunakan.
3. **Surgical Changes**:
   - Hanya sentuh berkas/baris yang relevan dengan kebutuhan task.
   - Jaga kebersihan kode dari unused imports dan dead code.
4. **Goal-Driven Execution**:
   - Setiap fitur harus memiliki kriteria verifikasi yang dapat diuji (`bun run build`, `bun dev`, pengujian fungsi rute dan interaktivitas).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 (TypeScript)
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism & Micro-animations
- **Icons**: `lucide-react`
- **State Management**: React Context (`MedicineContext`) dengan sinkronisasi otomatis ke `localStorage`
- **Hardware & Web APIs**:
  - `navigator.mediaDevices.getUserMedia` (WebRTC Live Camera)
  - `window.speechSynthesis` & `SpeechSynthesisUtterance` (Web Speech API Bahasa Indonesia)
  - HTML5 Canvas Frame Capture
  - HTML5 Notifications & Audio Feedback
- **Package Manager**: Bun (`bun@1.4.2`) / Node.js 26

---

## 📁 Struktur Folder & Rute Halaman (12 Screens)

Setiap layar dari prototype diimplementasikan ke dalam rute terstruktur di dalam direktori `src/`:

```
src/
├── app/
│   ├── layout.tsx                # App shell, fonts, layout metadata, MedicineProvider
│   ├── globals.css               # Tailwind v4, gradients, laser scan & sound wave animations
│   ├── page.tsx                  # [Screen 1] Splash & Onboarding
│   ├── beranda/
│   │   └── page.tsx              # [Screen 2] Beranda / Dashboard Utama
│   ├── scan/
│   │   └── page.tsx              # [Screen 3] Kamera Pindai Obat (WebRTC Camera Live)
│   ├── analyzing/
│   │   └── page.tsx              # [Screen 4] Layar Menganalisis (AI Multi-step Pipeline)
│   ├── results/
│   │   └── page.tsx              # [Screen 5] Hasil Analisis & Ringkasan Keamanan
│   ├── drugs/
│   │   ├── page.tsx              # [Screen 7] Daftar Obat / Kabinet Obat (Search & Filter)
│   │   └── [id]/
│   │       └── page.tsx          # [Screen 6] Detail Obat Mendalam (Passport & Panduan)
│   ├── interactions/
│   │   └── page.tsx              # [Screen 8] Analisis Interaksi Antar-Obat (Risk Matrix)
│   ├── restrictions/
│   │   └── page.tsx              # [Screen 9] Pantangan Makanan & Minuman
│   ├── schedule/
│   │   └── page.tsx              # [Screen 10] Jadwal Konsumsi & Checklist Minum Obat
│   ├── profile/
│   │   └── page.tsx              # [Screen 11] Profil Pasien & Riwayat Medis
│   └── voice-guide/
│       └── page.tsx              # [Screen 12] Asisten Panduan Suara AI (Web Speech TTS)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Mobile container & viewport frame
│   │   ├── BottomNav.tsx         # Floating bottom navigation bar
│   │   ├── TopHeader.tsx         # Header dinamis dengan status & back button
│   │   └── StatusBar.tsx         # Indikator jam, baterai & Dynamic Island
│   └── ui/
│       ├── Toast.tsx             # Feedback notifikasi aksi
│       └── Modal.tsx             # Modal form & konfirmasi
├── context/
│   └── MedicineContext.tsx       # Centralized state management & persistent storage
└── data/
    ├── initialMedicines.ts       # Database obat klinis bawaan
    ├── interactionsData.ts       # Aturan interaksi farmakologi
    └── restrictionsData.ts       # Aturan pantangan makanan/minuman
```

---

## ⚡ Perintah Penting (Commands)

| Perintah | Deskripsi |
| --- | --- |
| `bun dev` | Menjalankan Next.js development server pada `http://localhost:3000` |
| `bun run build` | Melakukan build production dan validasi TypeScript |
| `bun run start` | Menjalankan production server hasil build |
| `bun run lint` | Menjalankan linter untuk memeriksa kualitas kode |

---

## 🔒 Fitur Nyata (Bukan Sekadar Dummy / Mockup)

1. **Live Camera Capture**: Menggunakan sensor kamera perangkat asli (front/back camera switch, torch jika didukung, canvas snapshot).
2. **Real Web Speech Synthesis**: Pembacaan teks instruksi berbahasa Indonesia (`id-ID`) dengan pengaturan kecepatan (0.75x, 1.0x, 1.25x) serta visualisasi spektrum gelombang suara.
3. **Penyimpanan Lokal Persisten**: State obat, jadwal centang harian, dan profil kesehatan otomatis tersimpan di browser via `localStorage`.
4. **Interaksi Antar-Obat Cerdas**: Menghitung secara dinamis kombinasi obat yang sedang aktif dan mendeteksi apakah terdapat risiko benturan atau kebutuhan jeda konsumsi.
