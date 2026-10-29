import 'dart:convert';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/medicine_models.dart';
import '../providers/medicine_provider.dart';

class ScanScreen extends StatefulWidget {
  final Function(int) onNavigateTab;

  const ScanScreen({super.key, required this.onNavigateTab});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  bool _isCameraReady = false;
  bool _isAnalyzing = false;
  String _analyzingStep = '';

  Map<String, dynamic>? _analyzedData;
  DoctorPrescriptionItem? _matchedDoctorRx;
  bool _isSaved = false;

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _initCamera();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<MedicineProvider>();
      if (p.profile.settings.autoVoice) {
        p.speak(
            'Kamera pemindai obat aktif. Arahkan kamera ke kemasan obat sekitar 15 sampai 20 sentimeter. Ketuk di mana saja pada layar kamera untuk memotret.');
      }
    });
  }

  void _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isNotEmpty) {
        _cameraController = CameraController(
          _cameras.first,
          ResolutionPreset.medium,
          enableAudio: false,
        );
        await _cameraController!.initialize();
        if (mounted) setState(() => _isCameraReady = true);
      }
    } catch (e) {
      debugPrint('Camera init error: $e');
    }
  }

  void _captureAndAnalyze() async {
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');
    provider.stopSpeech();

    String? b64Image;
    if (_cameraController != null && _cameraController!.value.isInitialized) {
      try {
        final xfile = await _cameraController!.takePicture();
        final bytes = await xfile.readAsBytes();
        b64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      } catch (e) {
        debugPrint('Capture error: $e');
      }
    }

    _runAnalysis(imageBase64: b64Image);
  }

  void _runAnalysis({String? imageBase64, String? query}) async {
    final provider = context.read<MedicineProvider>();
    setState(() {
      _isAnalyzing = true;
      _analyzedData = null;
      _matchedDoctorRx = null;
      _isSaved = false;
      _analyzingStep = 'Mendeteksi kemasan obat dengan AI...';
    });

    provider.speak('Sedang memproses pemindaian obat dengan kecerdasan buatan.');

    try {
      final res = await provider.analyzeMedicineApi(
        imageBase64: imageBase64,
        query: query,
      );

      final medName = res['nama'] ?? query ?? 'Obat Terdeteksi';
      final docMatch = provider.findDoctorPrescriptionMatch(medName);

      if (mounted) {
        setState(() {
          _analyzedData = res;
          _matchedDoctorRx = docMatch;
        });

        if (docMatch != null) {
          provider.triggerHaptic('success');
          final text =
              'Obat cocok dengan resep dokter Anda. ${docMatch.spokeSummary}. Catatan dokter: ${docMatch.doctorNotes ?? "Minum teratur"}.';
          provider.speak(text);
        } else if (res['teksPanduanSuara'] != null) {
          provider.triggerHaptic('success');
          provider.speak(res['teksPanduanSuara']);
        } else {
          provider.triggerHaptic('success');
          provider.speak('Obat terdeteksi $medName. ${res["aturanPakai"] ?? ""}');
        }
      }
    } finally {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
          _analyzingStep = '';
        });
      }
    }
  }

  void _saveToCabinet() {
    if (_analyzedData == null) return;
    final provider = context.read<MedicineProvider>();

    final rx = _matchedDoctorRx;
    final newMed = Medicine(
      id: 'med-${DateTime.now().millisecondsSinceEpoch}',
      name: _analyzedData!['nama'] ?? 'Obat Baru',
      genericName: _analyzedData!['namaGenerik'] ?? _analyzedData!['nama'] ?? '',
      dosage: rx?.dosage ?? _analyzedData!['kandungan'] ?? 'Sesuai resep',
      category: rx != null ? 'Obat Resep Terverifikasi Dokter' : (_analyzedData!['kategori'] ?? 'Obat Resep'),
      status: rx != null ? 'safe' : 'safe',
      statusLabel: rx != null ? 'Cocok Resep Dokter' : 'Aman Dikonsumsi',
      instructions: rx?.instructions ?? _analyzedData!['aturanPakai'] ?? '1 kali sehari sesudah makan',
      timing: rx?.timing ?? _analyzedData!['timing'] ?? 'after_meal',
      timingLabel: rx?.timingLabel ?? (_analyzedData!['timing'] == 'before_meal' ? 'Sebelum Makan' : 'Setelah Makan'),
      recommendedTime: _analyzedData!['rekomendasiJam'] ?? '08:00',
      precautions: rx?.doctorNotes ?? _analyzedData!['peringatan'] ?? '',
      teksPanduanSuara: rx?.spokeSummary ?? _analyzedData!['teksPanduanSuara'],
    );

    provider.addMedicine(newMed);
    setState(() => _isSaved = true);
    provider.speak('${newMed.name} berhasil disimpan ke lemari obat dan jadwal harian.');
  }

  void _resetScan() {
    setState(() {
      _analyzedData = null;
      _matchedDoctorRx = null;
      _isSaved = false;
      _searchController.clear();
    });
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Pemindai Obat Cerdas',
          style: TextStyle(
            color: isHC ? const Color(0xFFFFE600) : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (_analyzedData != null)
            IconButton(
              icon: Icon(Icons.refresh, color: isHC ? const Color(0xFFFFE600) : Colors.white),
              onPressed: _resetScan,
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Camera Area / Captured Viewport
            if (_analyzedData == null) ...[
              Semantics(
                label: 'Area Kamera Pemindai. Ketuk di mana saja pada layar ini untuk memotret dan memindai obat.',
                button: true,
                child: InkWell(
                  onTap: _isAnalyzing ? null : _captureAndAnalyze,
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    height: 340,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isHC ? const Color(0xFFFFE600) : Colors.blueAccent.withValues(alpha: 0.4),
                        width: isHC ? 3 : 1.5,
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        if (_isCameraReady && _cameraController != null)
                          CameraPreview(_cameraController!)
                        else
                          Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.camera_alt, size: 48, color: isHC ? const Color(0xFFFFE600) : Colors.white38),
                                const SizedBox(height: 12),
                                Text(
                                  'Kamera Siap. Ketuk Layar untuk Memotret',
                                  style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white70, fontSize: 13),
                                ),
                              ],
                            ),
                          ),

                        // Viewfinder Frame
                        Positioned.fill(
                          child: Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981).withValues(alpha: 0.6),
                                  width: 2,
                                ),
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                          ),
                        ),

                        // Analyzing spinner overlay
                        if (_isAnalyzing)
                          Container(
                            color: Colors.black.withValues(alpha: 0.8),
                            child: Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircularProgressIndicator(color: isHC ? const Color(0xFFFFE600) : Colors.blueAccent),
                                  const SizedBox(height: 16),
                                  Text(
                                    _analyzingStep,
                                    style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Manual Search Fallback
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Atau ketik nama obat (misal: Paracetamol)...',
                        hintStyle: TextStyle(color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.5) : const Color(0xFF64748B)),
                        prefixIcon: Icon(Icons.search, color: isHC ? const Color(0xFFFFE600) : Colors.white54),
                        filled: true,
                        fillColor: isHC ? Colors.black : const Color(0xFF131B2E),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: isHC ? const Color(0xFFFFE600) : Colors.white12),
                        ),
                      ),
                      onSubmitted: (val) {
                        if (val.trim().isNotEmpty) _runAnalysis(query: val.trim());
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF2563EB),
                      foregroundColor: isHC ? Colors.black : Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                    onPressed: () {
                      if (_searchController.text.trim().isNotEmpty) {
                        _runAnalysis(query: _searchController.text.trim());
                      }
                    },
                    child: const Text('Cari', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],

            // Analyzed Result Screen
            if (_analyzedData != null) ...[
              // Banner Cocok Resep Dokter (Bolo Doctor Cross-Check)
              if (_matchedDoctorRx != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isHC ? Colors.black : const Color(0xFF064E3B).withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981),
                      width: isHC ? 3 : 2,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981).withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.medical_services, color: isHC ? Colors.black : const Color(0xFF34D399)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'COCOK REKAMAN DOKTER (${_matchedDoctorRx!.frequency})',
                                style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _matchedDoctorRx!.instructions,
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            if (_matchedDoctorRx!.doctorNotes != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Catatan: ${_matchedDoctorRx!.doctorNotes}',
                                style: TextStyle(
                                  color: isHC ? const Color(0xFFFFE600) : const Color(0xFF6EE7B7),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                            const SizedBox(height: 10),
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                                side: BorderSide(color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399)),
                              ),
                              icon: const Icon(Icons.volume_up, size: 16),
                              label: const Text('Putar Ulang Arahan Dokter', style: TextStyle(fontSize: 11)),
                              onPressed: () => provider.speak(_matchedDoctorRx!.spokeSummary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Detail Obat Utama Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isHC ? Colors.black : const Color(0xFF131B2E),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isHC ? const Color(0xFFFFE600) : Colors.white12,
                    width: isHC ? 3 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _analyzedData!['nama'] ?? 'Obat',
                                style: TextStyle(
                                  color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 20,
                                ),
                              ),
                              Text(
                                '${_analyzedData!["namaGenerik"] ?? ""} • ${_analyzedData!["kandungan"] ?? ""}',
                                style: TextStyle(
                                  color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.volume_up, size: 28, color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981)),
                          onPressed: () {
                            final text = _matchedDoctorRx != null
                                ? _matchedDoctorRx!.spokeSummary
                                : (_analyzedData!['teksPanduanSuara'] ?? '${_analyzedData!["nama"]}. ${_analyzedData!["aturanPakai"]}');
                            provider.speak(text);
                          },
                        ),
                      ],
                    ),

                    const Divider(color: Colors.white12, height: 24),

                    _InfoRow(label: 'Indikasi / Khasiat', value: _analyzedData!['indikasi'] ?? '-', isHC: isHC),
                    _InfoRow(label: 'Aturan Pakai', value: _matchedDoctorRx?.instructions ?? _analyzedData!['aturanPakai'] ?? '-', isHC: isHC),
                    _InfoRow(
                      label: 'Waktu Minum',
                      value: '${_matchedDoctorRx?.timingLabel ?? (_analyzedData!["timing"] == "before_meal" ? "Sebelum Makan" : "Setelah Makan")} (${_analyzedData!["rekomendasiJam"] ?? "08:00"})',
                      isHC: isHC,
                    ),
                    _InfoRow(label: 'Izin BPOM', value: _analyzedData!['bpom'] ?? 'BPOM Terverifikasi', isHC: isHC),

                    const SizedBox(height: 20),

                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: isHC ? const Color(0xFFFFE600) : Colors.white70,
                              side: BorderSide(color: isHC ? const Color(0xFFFFE600) : Colors.white24),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            onPressed: _resetScan,
                            child: const Text('Pindai Ulang', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _isSaved
                                  ? Colors.grey
                                  : (isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981)),
                              foregroundColor: isHC ? Colors.black : Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            icon: Icon(_isSaved ? Icons.check : Icons.add_circle),
                            label: Text(_isSaved ? 'Tersimpan' : 'Simpan ke Lemari', style: const TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: _isSaved ? null : _saveToCabinet,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isHC;

  const _InfoRow({required this.label, required this.value, required this.isHC});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8), fontSize: 12)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                color: isHC ? const Color(0xFFFFE600) : Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
