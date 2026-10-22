# MediLens AI — Asisten Pintar Keamanan Obat & Aksesibilitas Disabilitas

<div align="center">

![MediLens AI Banner](https://medilens-ai-six.vercel.app/favicon.ico)

**Solusi Cerdas Pengenalan Obat, Analisis Kontraindikasi Alergi, dan Navigasi Suara Ramah Disabilitas Netra & Lansia**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployment%20Active-black?style=for-the-badge&logo=vercel)](https://medilens-ai-six.vercel.app)
[![Android APK](https://img.shields.io/badge/Android-APK%20v1.0.0-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://medilens-ai-six.vercel.app/MediLensAI.apk)
[![WCAG Level](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-FFB800?style=for-the-badge)](https://medilens-ai-six.vercel.app/beranda)
[![Built with Bun](https://img.shields.io/badge/Runtime-Bun%201.4-FBF0DF?style=for-the-badge&logo=bun&logoColor=black)](https://bun.sh)
[![TanStack Start](https://img.shields.io/badge/Framework-TanStack%20Start-000000?style=for-the-badge&logo=react)](https://tanstack.com/start)

[Live Web Demo](https://medilens-ai-six.vercel.app) • [Download Android APK](https://medilens-ai-six.vercel.app/MediLensAI.apk) • [Dokumentasi API](#-arsitektur-dan-alur-sistem) • [Panduan Aksesibilitas](#-standar-aksesibilitas-disabilitas-wcag-aaa)

</div>

---

## 📌 Latar Belakang Masalah

Di Indonesia, tingkat kesalahan konsumsi obat (*medication error*) pada lansia dan pasien berpenyakit kronis masih tergolong tinggi. Kendala umum yang dihadapi meliputi:
1. **Tulisan Kemasan yang Terlalu Kecil**: Huruf informasi komposisi, dosis, dan tanggal kedaluwarsa sering kali sulit dibaca oleh pasien lansia dan penderita *low vision*.
2. **Keterbatasan Akses bagi Penyandang Tunanetra**: Belum ada kemasan obat lokal yang menyediakan huruf braille lengkap untuk seluruh instruksi klinis dan efek samping.
3. **Risiko Polifarmasi & Kontraindikasi Alergi**: Pasien sering mengonsumsi beberapa jenis obat sekaligus tanpa menyadari potensi benturan zat aktif (*drug-drug interaction*) atau reaksi alergi fatal seperti anafilaksis.

**MediLens AI** hadir sebagai jembatan teknologi kesehatan yang inklusif untuk menjamin keselamatan setiap pasien tanpa terkecuali.

---

## 🚀 Fitur Utama & Inovasi

### 1. 🔍 Pemindai Obat Berbasis Vision Multimodal AI
- **Identifikasi Cepat**: Memindai kemasan obat fisik (strip, botol, blister) atau resep dokter menggunakan kamera WebRTC langsung maupun unggah foto galeri.
- **Ekstraksi Komprehensif**: Menghasilkan monograf resmi mencakup nama dagang, nama generik zat aktif, dosis standar, bentuk sediaan, izin edar BPOM, tanggal kedaluwarsa, aturan pakai, waktu optimal minum, efek samping, dan pantangan makanan.
- **Penyimpanan Foto Permanen**: Foto hasil pemindaian langsung ditampilkan pada kartu obat dan tersimpan secara persisten di lemari obat digital.

### 2. 🛡️ Mesin Deteksi Kontraindikasi & Bahaya Alergi Real-Time
- **Pemeriksaan Silang Riwayat Pasien**: Setiap obat yang dipindai otomatis dicocokkan dengan profil alergi dan komorbiditas pengguna.
- **Peringatan Audio-Visual Mutlak**: Jika obat berpotensi memicu reaksi alergi (misal: turunan penisilin pada pasien alergi amoksisilin), sistem membunyikan alarm earcon, getaran haptik, dan spanduk bahaya berwarna merah menyala.

### 3. ♿ Paket Aksesibilitas Disabilitas Netra (WCAG 2.1 AAA)
- **Bidikan Layar Penuh (*Full-Screen Tap-to-Capture*)**: Tunanetra cukup mengetuk bagian mana saja di layar untuk mengambil foto obat, didukung panduan suara jarak fokus fisik (15–20 cm).
- **Arsitektur Suara 3 Lapis (*Tri-Layer Speech Engine*)**:
  1. *Native Android TTS Bridge*: Integrasi langsung mesin ucapan Android (`window.AndroidTTS`) tanpa latensi jaringan.
  2. *Cloud Indonesian TTS Serverless*: Endpoint `/api/tts` berbasis audio streaming MP3 bahasa Indonesia berartikulasi jernih.
  3. *Web Speech API Fallback*: Sintesis suara browser bawaan dengan kontrol kecepatan dinamis (0.8x, 1.0x, 1.25x).
- **Mode Kontras Tinggi WCAG AAA**: Tema khusus berlatar hitam pekat (`#000000`) dengan tipografi kuning cerah (`#FFE600`) berdaya kontras rasio tinggi.
- **Mode Huruf Ekstra Besar (A+)**: Penskalaan ukuran fon dan tombol hingga 130% untuk pasien *low vision*.
- **Earcon Audio & Getaran Haptik**: Nada Web Audio frekuensi khusus (880 Hz, 440 Hz, 220 Hz) untuk setiap konfirmasi tombol dan peringatan.
- **Komandan Suara Hands-Free (*Voice Commander*)**: Navigasi halaman antar-rute hanya dengan mengucapkan kata kunci perintah (contoh: *"Buka Scan"*, *"Lihat Jadwal"*, *"Cari Apotek"*).

### 4. 💬 Asisten Konsultasi Medis AI Kontekstual
- Percakapan interaktif dua arah mengenai aturan pakai obat, penanganan dosis terlupa, hingga interaksi makanan.
- Mendukung masukan suara (*voice-to-text*) dan pembacaan otomatis jawaban asisten medis secara vokal.

### 5. 📍 Pencari Apotek 24 Jam Terdekat (Integrasi GPS OpenStreetMap)
- Mengambil koordinat GPS pengguna secara presisi untuk memetakan apotek terdekat via OpenStreetMap Nominatim API.
- Filter khusus apotek buka 24 jam (K-24, Kimia Farma) lengkap dengan estimasi jarak (km) dan rute navigasi Google Maps.
- Dilengkapi generator QR Code resep obat digital untuk kemudahan verifikasi di kasir apotek.

### 6. ⏰ Jadwal Konsumsi Obat Harian & Pelacak Kepatuhan
- Pengelompokan cerdas berdasarkan waktu konsumsi (Pagi, Siang, Sore, Malam).
- Checklist mandiri dengan penghitungan persentase kepatuhan harian pasien.

---

## 🏗️ Arsitektur dan Alur Sistem

```
                               ┌────────────────────────────────┐
                               │   Pengguna / Pasien Inklusif   │
                               │  (Disabilitas / Lansia / Umum) │
                               └──────────────┬─────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │   Aplikasi Web Mobile   │                     │   Aplikasi Android APK  │
         │   TanStack Start / Vite │                     │  Native WebView Wrapper │
         └────────────┬────────────┘                     └────────────┬────────────┘
                      │                                               │
                      │         WebRTC Stream / Hardware Camera       │
                      │         Native TTS Bridge (AndroidTTS)        │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │       MediLens API Engine       │
                             │   (Vercel Edge & Serverless)    │
                             └────────────────┬────────────────┘
                                              │
         ┌─────────────────────────┬──────────┴──────────┬─────────────────────────┐
         ▼                         ▼                     ▼                         ▼
┌──────────────────┐      ┌──────────────────┐  ┌──────────────────┐      ┌──────────────────┐
│  /api/analyze    │      │    /api/chat     │  │ /api/pharmacies  │      │     /api/tts     │
│ Vision AI &      │      │ AI Dokter &      │  │ OpenStreetMap    │      │ Google Natural   │
│ Farmakologi      │      │ Apoteker Virtual │  │ Nominatim Live   │      │ Indonesian Voice │
└────────┬─────────┘      └────────┬─────────┘  └──────────────────┘      └──────────────────┘
         │                         │
         └────────────┬────────────┘
                      ▼
       ┌──────────────────────────────┐
       │   Google Gemini 3.5 Flash    │
       │   + 9Router Gateway Fallback │
       └──────────────────────────────┘
```

---

## 📂 Struktur Repositori

```
MedilensAI/
├── android/                         # Proyek Android Native Wrapper
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml
│   │   ├── src/main/java/id/medilens/app/MainActivity.java  # WebView, Camera, TTS Bridge
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── public/                          # Aset statis & berkas publik
│   ├── favicon.ico
│   ├── robots.txt
│   └── MediLensAI.apk               # Berkas unduhan installer Android (5.3 MB)
├── src/
│   ├── components/
│   │   ├── medi.tsx                 # Komponen navigasi, VoiceCommander, AccessibilityModal
│   │   └── ui/                      # Desain sistem Radix UI & Tailwind CSS
│   ├── lib/
│   │   ├── medicineContext.tsx      # State global obat, jadwal, profil, audio earcon, haptik
│   │   └── utils.ts
│   ├── routes/                      # File-based routing TanStack Start
│   │   ├── __root.tsx               # Root app shell, layout global, toast banner
│   │   ├── index.tsx                # Halaman selamat datang & unduh APK
│   │   ├── beranda.tsx              # Dashboard kepatuhan & ringkasan obat
│   │   ├── scan.tsx                 # Pemindai kamera interaktif & ekstraksi AI
│   │   ├── obat.tsx                 # Lemari obat tersimpan & modal monograf detail
│   │   ├── jadwal.tsx               # Jadwal konsumsi obat harian & checklist
│   │   ├── tanya.tsx                # Chat asisten apoteker virtual (suara & teks)
│   │   ├── apotek.tsx               # Radar apotek terdekat (OSM GPS) & QR resep
│   │   └── profile.tsx              # Manajemen profil kesehatan & riwayat alergi
│   ├── server/
│   │   └── apiHandler.ts            # Implementasi handler serverless seluruh endpoint /api
│   ├── router.tsx                   # Konfigurasi router aplikasi
│   ├── server.ts                    # Server SSR TanStack Start
│   └── styles.css                   # Tailwind v4 tema medis, animasi, & WCAG styling
├── .env.example                     # Template konfigurasi variabel lingkungan aman
├── package.json
└── vite.config.ts
```

---

## ♿ Standar Aksesibilitas Disabilitas (WCAG AAA)

MediLens AI dirancang dengan mematuhi prinsip aksesibilitas **POUR** (*Perceivable, Operable, Understandable, Robust*):

| Prinsip Aksesibilitas | Implementasi pada MediLens AI |
| --- | --- |
| **Kontras Warna Tinggi** | Rasio kontras 21:1 dengan palet `#000000` (latar) dan `#FFE600` (teks utama) melampaui standar WCAG AAA minimum 7:1. |
| **Navigasi Layar Penuh** | Area pemindai kamera berfungsi ganda sebagai tombol tangkap gambar layar penuh tanpa memerlukan bidikan tombol kecil. |
| **Panduan Narasi Suara** | Setiap pergantian halaman mengumumkan judul dan panduan layar secara otomatis kepada pengguna tunanetra. |
| **Umpan Balik Taktil (Haptic)** | Pola getaran dinamis untuk aksi sukses (50 ms), pergantian mode (80 ms), dan peringatan kontraindikasi (500 ms). |
| **Font Responsif Scalable** | Penskalaan fon berbasis variabel CSS dinamis untuk kenyamanan membaca penderita *low vision*. |

---

## 💻 Panduan Instalasi dan Pengujian Lokal

### Prasyarat Sistem
- **Node.js** v20+ atau **Bun** v1.2+
- **Android SDK Platform 34** (khusus kompilasi aplikasi Android)

### 1. Kloning Repositori
```bash
git clone https://github.com/ArrafiNurHafiz/MediLens-AI.git
cd MediLens-AI
```

### 2. Pasang Dependensi
```bash
bun install
```

### 3. Konfigurasi Variabel Lingkungan
Salin berkas template lingkungan:
```bash
cp .env.example .env.local
```

Isi variabel pada berkas `.env.local`:
```env
# Google AI Studio API Key (untuk model gemini-3.5-flash)
GEMINI_API_KEY=your_gemini_api_key_here

# 9Router Local Gateway (opsional untuk pengembangan lokal)
NINEROUTER_BASE_URL=http://127.0.0.1:20128/v1
NINEROUTER_API_KEY=
NINEROUTER_MODEL=ag/gemini-3.8-flash-high
```

### 4. Jalankan Server Pengembangan
```bash
bun run dev
```
Buka peramban di `http://localhost:3333` atau `http://localhost:3333/beranda`.

---

## 📦 Build Produksi & Kompilasi Android

### Build Web Produksi (Vercel Preset)
```bash
NITRO_PRESET=vercel bun run build
```

### Kompilasi Berkas Android APK
```bash
cd android
export ANDROID_HOME=$HOME/Android/Sdk
gradle assembleDebug
```
Berkas installer `.apk` siap diinstal di perangkat Android Anda pada path:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔒 Kebijakan Keamanan Data & Privasi

- **Penyimpanan Lokal Eksklusif**: Data resep obat, jadwal pribadi, dan riwayat penyakit disimpan secara lokal pada penyimpanan perangkat pengguna (*localStorage*), tanpa penyimpanan basis data terpusat pihak ketiga yang rentan bocor.
- **Transmisi Terenkripsi**: Seluruh komunikasi data dengan antarmuka pemrograman aplikasi (API) dilindungi oleh protokol HTTPS/TLS modern.
- **Kepatuhan Sensor Privasi**: Akses kamera dan mikrofon hanya aktif saat berada di layar terkait dan dimatikan seketika saat pengguna meninggalkan halaman.

---

## 👨‍💻 Pengembang

Dikembangkan dengan dedikasi untuk inklusivitas kesehatan masyarakat Indonesia oleh:

**Arrafi Nur Hafiz**
- **Institusi**: Universitas Teknologi Digital Indonesia (UTDI)
- **Portofolio**: [porto.rapydev.my.id](https://porto.rapydev.my.id)
- **GitHub**: [@ArrafiNurHafiz](https://github.com/ArrafiNurHafiz)

---

<div align="center">
  <sub>MediLens AI • Menghadirkan Kemandirian Medis yang Aman dan Aksesibel untuk Semua Jiwa.</sub>
</div>
