# MediLens AI — Native Flutter Assistive Health Assistant

[![Flutter](https://img.shields.io/badge/Flutter-3.47.8-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.13.7-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![Android](https://img.shields.io/badge/Android-minSdk%2023%20%7C%20compileSdk%2037-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![WCAG AAA](https://img.shields.io/badge/A11y-WCAG%202.1%20AAA-FFD700?style=for-the-badge&logo=w3c&logoColor=black)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Aplikasi asisten pintar konsumsi obat berbasis **Native Flutter** dengan arsitektur **Audio-First** dan **Haptic-Guided**, dirancang khusus untuk penyandang disabilitas penglihatan (tunanetra/low-vision) serta lansia agar terbebas dari kesalahan minum obat (*medication error*).

---

## 🚀 Fitur Unggulan

### 1. Pindai Obat Cerdas & Cross-Check Arahan Dokter (Camera & Multimodal AI)
- **Deteksi Kamera Native**: Kamera langsung menganalisis kemasan obat fisik (nama merek, zat aktif, dosis, BPOM, dan tanggal kedaluwarsa).
- **Cross-Check Otomatis Rekaman Dokter**: Saat obat terpindai di rumah, sistem mencocokkannya dengan resep suara dokter yang tersimpan.
- **Auto-TTS Interaktif**: Menyuarakannya langsung ke telinga pasien: *"Obat cocok dengan resep dokter Anda. Diminum 2 kali sehari setelah makan."*

### 2. Dikte Suara Dokter Pasca-Konsultasi (Safety Contract Bolo Doctor)
- Pasien/pendamping merekam suara arahan dokter di klinik menggunakan pengenalan suara offline/online (*Speech-to-Text*).
- Ekstraksi AI dengan **Safety Contract**: dilarang keras menebak/mengarang nama obat, dosis, frekuensi, atau durasi yang tidak disebutkan dokter.
- Menghasilkan panduan suara terstruktur (*spokeSummary*) yang langsung dapat disimpan ke lemari obat dan jadwal harian.

### 3. Aksesibilitas WCAG AAA & Audio-Haptic Feedback
- **Mode Kontras Tinggi**: Palet warna hitam pekat (`#000000`) dan kuning terang (`#FFE600`) dengan border 3px sesuai standar WCAG 2.1 AAA.
- **Umpan Balik Haptic Native**: Modulasi pola getaran Android (`VibrationEffect`) untuk konfirmasi aksi dan peringatan bahaya kontraindikasi alergi.
- **Voice Commander Hands-Free**: Navigasi antar-layar cukup dengan perintah suara (*"Buka Beranda"*, *"Pindai Obat"*, *"Suara Dokter"*, *"Daftar Obat"*, *"Jadwal"*).
- **Huruf Ekstra Besar (A+)**: Teks besar dan touch target 64dp+ untuk lansia dan motor-impaired.

---

## 📂 Struktur Proyek

```
lib/
├── main.dart                          # Inisialisasi aplikasi, navigasi shell, FAB Voice Commander
├── models/
│   └── medicine_models.dart           # Model Medicine, DoctorConsultation, ScheduleItem, UserProfile
├── providers/
│   └── medicine_provider.dart        # State management (TTS native, Haptic, SharedPreferences, AI API)
├── screens/
│   ├── home_screen.dart               # Beranda utama, deteksi alergi profil, quick tiles
│   ├── scan_screen.dart               # Kamera pemindai obat & cross-check resep dokter
│   ├── doctor_consultation_screen.dart# Perekaman suara dokter, AI parsing, simpan resep
│   ├── medicine_cabinet_screen.dart   # Lemari obat saya & pemutar suara instruksi
│   └── schedule_screen.dart           # Jadwal minum obat harian & toggle minum bergetar
├── theme/
│   └── app_theme.dart                 # Tema Dark Medical & High Contrast WCAG AAA
└── widgets/
    └── voice_commander_dialog.dart    # Dialog pengenal perintah suara hands-free
```

---

## 🛠️ Instalasi & Menjalankan

### Persyaratan Sistem
- Flutter SDK 3.47.8+ / Dart 3.13.7+
- Android SDK Platform 35/37 (Java 17+)

### Menjalankan di Emulator / Perangkat
```bash
# Pasang dependensi
flutter pub get

# Jalankan uji otomatis
flutter test

# Jalankan aplikasi (Debug)
flutter run
```

### Membangun Berkas APK Rilis
```bash
flutter build apk --release
```
Berkas APK rilis tersimpan di:
`build/app/outputs/flutter-apk/app-release.apk`
