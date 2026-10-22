# MediLens AI — Asisten Pintar Keamanan Obat

Aplikasi mobile-first berbasis web dan Android untuk membantu masyarakat, lansia, dan penyandang disabilitas memahami penggunaan obat secara aman melalui pemindaian kemasan obat berbasis AI, panduan suara, deteksi kontraindikasi alergi, jadwal minum obat, serta pencarian apotek terdekat.

## Fitur Utama

- **Pemindai Obat Pintar**: Pindai kemasan obat atau resep menggunakan kamera atau berkas foto untuk ekstraksi zat aktif, dosis, aturan pakai, efek samping, dan pantangan makanan.
- **Aksesibilitas Disabilitas & Tunanetra**:
  - Full-screen tap-to-capture dengan panduan suara jarak fokus.
  - Mode Suara Narasi Otomatis (Text-to-Speech Bahasa Indonesia alami).
  - Mode Kontras Tinggi WCAG AAA (hitam pekat & kuning kontras).
  - Mode Huruf Ekstra Besar (A+).
  - Feedback getaran haptik dan nada Web Audio konfirmasi.
  - Asisten navigasi perintah suara (*Voice Commander*).
- **Asisten Medis AI**: Konsultasi tanya-jawab klinis farmakologi kontekstual terhadap obat aktif dan riwayat pasien.
- **Deteksi Kontraindikasi & Alergi**: Peringatan otomatis bila obat yang dipindai memicu alergi atau bertentangan dengan komorbiditas pasien.
- **Jadwal Minum Obat**: Pengingat harian (pagi, siang, sore, malam) dengan pelacak kepatuhan konsumsi.
- **Pencari Apotek Terdekat**: Integrasi data apotek nyata berbasis OpenStreetMap dan generator QR Code resep.
- **Aplikasi Android Native**: Wrapper WebView Android dengan integrasi hardware camera dan native text-to-speech.

## Struktur Proyek

- `src/routes/`: Halaman TanStack Router (`/beranda`, `/scan`, `/obat`, `/jadwal`, `/tanya`, `/apotek`, `/profile`).
- `src/components/medi.tsx`: Komponen UI mobile, TopBar, BottomNav, VoiceCommander, dan AccessibilityModal.
- `src/lib/medicineContext.tsx`: Manajemen state lemari obat, jadwal, profil kesehatan, dan sinkronisasi `localStorage`.
- `src/server/apiHandler.ts`: Serverless API endpoints (`/api/analyze`, `/api/chat`, `/api/pharmacies`, `/api/tts`).
- `android/`: Proyek native Android (SDK 34) WebView wrapper.

## Pengembangan Lokal

```bash
# 1. Pasang dependensi
bun install

# 2. Salin template env
cp .env.example .env.local

# 3. Jalankan server pengembangan
bun run dev
```

## Build & Deployment

```bash
# Build web production untuk Vercel
NITRO_PRESET=vercel bun run build

# Deploy Vercel
npx vercel deploy --prebuilt --prod
```
