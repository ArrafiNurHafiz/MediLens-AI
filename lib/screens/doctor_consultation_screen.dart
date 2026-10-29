import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../models/medicine_models.dart';
import '../providers/medicine_provider.dart';

class DoctorConsultationScreen extends StatefulWidget {
  final Function(int) onNavigateTab;

  const DoctorConsultationScreen({super.key, required this.onNavigateTab});

  @override
  State<DoctorConsultationScreen> createState() =>
      _DoctorConsultationScreenState();
}

class _DoctorConsultationScreenState extends State<DoctorConsultationScreen> {
  late stt.SpeechToText _speech;
  bool _isRecording = false;
  int _seconds = 0;
  Timer? _timer;

  final TextEditingController _transcriptController = TextEditingController();
  final TextEditingController _doctorNameController = TextEditingController();
  final TextEditingController _clinicController = TextEditingController();

  bool _isProcessing = false;
  DoctorConsultation? _lastResult;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<MedicineProvider>();
      if (p.profile.settings.autoVoice) {
        p.speak(
            'Halaman rekam arahan suara dokter. Ketuk tombol mikrofon besar di tengah untuk mulai merekam arahan dokter pasca konsultasi.');
      }
    });
  }

  void _startRecording() async {
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');
    provider.stopSpeech();

    bool available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'notListening' && mounted && _isRecording) {
          _stopRecording();
        }
      },
      onError: (val) {
        if (mounted && _isRecording) _stopRecording();
      },
    );

    if (available) {
      setState(() {
        _isRecording = true;
        _seconds = 0;
        _transcriptController.clear();
      });
      _timer?.cancel();
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (mounted) setState(() => _seconds++);
      });

      provider.speak('Merekam suara dokter aktif. Silakan bicara.');

      _speech.listen(
        onResult: (val) {
          if (mounted) {
            setState(() {
              _transcriptController.text = val.recognizedWords;
            });
          }
        },
      );
    } else {
      provider.speak('Mikrofon tidak dapat diakses.');
    }
  }

  void _stopRecording() {
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');
    _speech.stop();
    _timer?.cancel();
    setState(() => _isRecording = false);
    provider.speak('Perekaman dihentikan. Siap diproses oleh AI dokter.');
  }

  void _processConsultation({String? forcedText}) async {
    final text = forcedText ?? _transcriptController.text.trim();
    final provider = context.read<MedicineProvider>();

    if (text.isEmpty) {
      provider.speak('Belum ada rekaman atau teks arahan dokter.');
      return;
    }

    setState(() => _isProcessing = true);
    provider.triggerHaptic('click');
    provider.speak('Sedang mengekstrak resep dan instruksi dokter dengan AI...');

    try {
      final res = await provider.processConsultationApi(
        transcript: text,
        doctorName: _doctorNameController.text.trim().isNotEmpty
            ? _doctorNameController.text.trim()
            : null,
        clinic: _clinicController.text.trim().isNotEmpty
            ? _clinicController.text.trim()
            : null,
      );

      if (mounted) {
        setState(() {
          _lastResult = res;
        });
        provider.triggerHaptic('success');
        provider.speak(
            '${res.audioGuideText}. Instruksi telah dicocokkan ke sistem.');
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _loadCannedDemo() {
    const demo =
        'Saya resepkan Amlodipine 5 miligram diminum satu kali sehari pada malam hari setelah makan. Dan untuk sakit kepalanya saya berikan Paracetamol 500 miligram, diminum dua kali sehari sesudah makan pagi dan malam. Jika demam sudah reda Paracetamol boleh dihentikan. Banyak minum air putih ya.';
    _transcriptController.text = demo;
    _doctorNameController.text = 'Dr. Budi Santoso, Sp.PD';
    _clinicController.text = 'Klinik Pratama Sehat';
    _processConsultation(forcedText: demo);
  }

  void _addRxToCabinet(DoctorPrescriptionItem rx) {
    final provider = context.read<MedicineProvider>();
    final newMed = Medicine(
      id: 'med-${DateTime.now().millisecondsSinceEpoch}',
      name: rx.medicineName,
      genericName: rx.medicineName,
      dosage: rx.dosage,
      instructions: rx.instructions,
      timing: rx.timing,
      timingLabel: rx.timingLabel,
      recommendedTime: rx.timing == 'before_meal' ? '07:00' : '08:00',
      precautions: rx.doctorNotes ?? 'Minum teratur sesuai arahan',
      teksPanduanSuara: rx.spokeSummary,
    );
    provider.addMedicine(newMed);
    provider.speak('${rx.medicineName} ditambahkan ke lemari obat dan jadwal harian.');
  }

  @override
  void dispose() {
    _timer?.cancel();
    _speech.stop();
    _transcriptController.dispose();
    _doctorNameController.dispose();
    _clinicController.dispose();
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
          'Rekam Arahan Dokter',
          style: TextStyle(
            color: isHC ? const Color(0xFFFFE600) : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Info Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isHC ? Colors.black : const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isHC ? const Color(0xFFFFE600) : const Color(0xFF3B82F6).withValues(alpha: 0.3),
                  width: isHC ? 3 : 1,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.2) : Colors.blue.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.medical_services, color: isHC ? const Color(0xFFFFE600) : Colors.blueAccent),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Rekam dikte dokter pasca-konsultasi. Saat Anda sampai di rumah, pindai kemasan obat untuk mencocokkan instruksi ini.',
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFFCBD5E1),
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Big Mic Record Area
            Center(
              child: Column(
                children: [
                  Semantics(
                    label: _isRecording
                        ? 'Hentikan perekaman suara dokter. Durasi $_seconds detik.'
                        : 'Mulai merekam arahan suara dokter.',
                    button: true,
                    child: InkWell(
                      onTap: _isRecording ? _stopRecording : _startRecording,
                      borderRadius: BorderRadius.circular(50),
                      child: Container(
                        height: 96,
                        width: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isRecording
                              ? Colors.redAccent
                              : (isHC ? const Color(0xFFFFE600) : const Color(0xFF2563EB)),
                          boxShadow: [
                            BoxShadow(
                              color: (_isRecording ? Colors.redAccent : (isHC ? const Color(0xFFFFE600) : Colors.blue))
                                  .withValues(alpha: 0.35),
                              blurRadius: 24,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: Icon(
                          _isRecording ? Icons.stop : Icons.mic,
                          size: 44,
                          color: isHC ? Colors.black : Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _isRecording ? 'Merekam... ($_seconds detik)' : 'Ketuk untuk Mulai Merekam',
                    style: TextStyle(
                      color: isHC ? const Color(0xFFFFE600) : Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (!_isRecording && !_isProcessing)
                    TextButton.icon(
                      style: TextButton.styleFrom(
                        foregroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                      ),
                      icon: const Icon(Icons.auto_awesome, size: 16),
                      label: const Text('Coba Contoh Suara Dokter (Simulasi)', style: TextStyle(fontSize: 12)),
                      onPressed: _loadCannedDemo,
                    ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Transcript Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isHC ? Colors.black : const Color(0xFF131B2E),
                borderRadius: BorderRadius.circular(20),
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
                      Text(
                        'Transkrip / Catatan Arahan Dokter',
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_transcriptController.text.isNotEmpty)
                        IconButton(
                          icon: Icon(Icons.volume_up, size: 20, color: isHC ? const Color(0xFFFFE600) : Colors.blueAccent),
                          onPressed: () => provider.speak(_transcriptController.text),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _transcriptController,
                    maxLines: 3,
                    style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Hasil rekaman suara atau ketik manual instruksi dokter...',
                      hintStyle: TextStyle(color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.5) : const Color(0xFF64748B)),
                      border: InputBorder.none,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _doctorNameController,
                          style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            hintText: 'Nama Dokter (opsional)',
                            hintStyle: TextStyle(color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.5) : const Color(0xFF64748B)),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _clinicController,
                          style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            hintText: 'Klinik / RS (opsional)',
                            hintStyle: TextStyle(color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.5) : const Color(0xFF64748B)),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF2563EB),
                      foregroundColor: isHC ? Colors.black : Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      minimumSize: const Size.fromHeight(48),
                    ),
                    icon: _isProcessing
                        ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.psychology),
                    label: Text(
                      _isProcessing ? 'Mengekstrak Resep Medis...' : 'Proses Resep dengan AI Dokter',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    onPressed: _isProcessing ? null : () => _processConsultation(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Extracted Result Card
            if (_lastResult != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isHC ? Colors.black : const Color(0xFF064E3B).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isHC ? const Color(0xFFFFE600) : const Color(0xFF059669),
                    width: isHC ? 3 : 1.5,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.verified, color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399)),
                            const SizedBox(width: 8),
                            Text(
                              'Resep Terverifikasi dari Dokter',
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: Icon(Icons.volume_up, color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399)),
                          onPressed: () => provider.speak(_lastResult!.audioGuideText),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '"${_lastResult!.summary}"',
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFFE2E8F0),
                        fontStyle: FontStyle.italic,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._lastResult!.prescriptions.map((rx) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isHC ? Colors.black : const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isHC ? const Color(0xFFFFE600) : Colors.white10,
                            width: isHC ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  rx.medicineName,
                                  style: TextStyle(
                                    color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isHC ? const Color(0xFFFFE600) : Colors.blue.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    rx.frequency,
                                    style: TextStyle(
                                      color: isHC ? Colors.black : Colors.blueAccent,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              rx.instructions,
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: isHC ? const Color(0xFFFFE600) : Colors.white,
                                      side: BorderSide(color: isHC ? const Color(0xFFFFE600) : Colors.white24),
                                    ),
                                    icon: const Icon(Icons.volume_up, size: 16),
                                    label: const Text('Dengar', style: TextStyle(fontSize: 11)),
                                    onPressed: () => provider.speak(rx.spokeSummary),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF059669),
                                      foregroundColor: isHC ? Colors.black : Colors.white,
                                    ),
                                    icon: const Icon(Icons.add_task, size: 16),
                                    label: const Text('Simpan', style: TextStyle(fontSize: 11)),
                                    onPressed: () => _addRxToCabinet(rx),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isHC ? const Color(0xFFFFE600) : Colors.blueAccent,
                        foregroundColor: isHC ? Colors.black : Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Buka Kamera & Pindai Kemasan di Rumah', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: () => widget.onNavigateTab(2),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ],
        ),
      ),
    );
  }
}
