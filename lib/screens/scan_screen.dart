import 'dart:convert';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
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
  bool _isFlashOn = false;
  String _analyzingStep = '';

  Map<String, dynamic>? _analyzedData;
  DoctorPrescriptionItem? _matchedDoctorRx;
  bool _isSaved = false;

  // State klarifikasi aturan minum (Safety Contract)
  late stt.SpeechToText _speech;
  bool _isListeningClarification = false;
  String? _verbalFrequency;
  String _verbalTiming = 'Setelah Makan';
  bool _userForgotDosage = false;

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _initCamera();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<MedicineProvider>();
      if (p.profile.settings.autoVoice) {
        p.speak(
          'Kamera pemindai obat aktif. Arahkan kamera ke kemasan obat. Ketuk layar dua kali di mana saja untuk memotret.',
        );
      }
    });
  }

  void _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isNotEmpty) {
        _cameraController = CameraController(
          _cameras.first,
          ResolutionPreset.high,
          enableAudio: false,
        );
        await _cameraController!.initialize();
        if (mounted) setState(() => _isCameraReady = true);
      }
    } catch (e) {
      debugPrint('Camera init error: $e');
    }
  }

  void _toggleFlash() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');

    try {
      if (_isFlashOn) {
        await _cameraController!.setFlashMode(FlashMode.off);
        setState(() => _isFlashOn = false);
        provider.speak('Lampu senter mati.');
      } else {
        await _cameraController!.setFlashMode(FlashMode.torch);
        setState(() => _isFlashOn = true);
        provider.speak('Lampu senter menyala untuk memperjelas kemasan obat.');
      }
    } catch (e) {
      debugPrint('Flash error: $e');
    }
  }

  void _captureAndAnalyze() async {
    if (_isAnalyzing) return;
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('alert');
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
      _verbalFrequency = null;
      _userForgotDosage = false;
      _analyzingStep = 'Menganalisis kemasan obat dengan AI...';
    });

    provider.speak('Foto diambil. Sedang memverifikasi kemasan obat.');

    try {
      final res = await provider.analyzeMedicineApi(
        imageBase64: imageBase64,
        query: query,
      );

      final isMed = res['isMedicine'] != false;
      final medName = res['nama'] ?? query ?? 'Kemasan Tidak Dikenali';
      final docMatch = isMed ? provider.findDoctorPrescriptionMatch(medName) : null;

      if (mounted) {
        setState(() {
          _analyzedData = res;
          _matchedDoctorRx = docMatch;
        });

        if (!isMed) {
          provider.triggerHaptic('warning');
          final guideText = res['teksPanduanSuara'] ??
              'Objek di depan kamera bukan kemasan obat. Arahkan kamera ke strip atau botol obat Anda.';
          provider.speak(guideText);
        } else if (docMatch != null) {
          // Kasus A: Cocok dengan resep rekaman dokter!
          provider.triggerHaptic('success');
          final text =
              'Obat cocok dengan resep dokter Anda. ${docMatch.spokeSummary}. Catatan dokter: ${docMatch.doctorNotes ?? "Minum teratur"}.';
          provider.speak(text);
        } else {
          // Kasus B: Obat sah, tapi TIDAK ADA rekaman dokter. JANGAN MENGARANG ATURAN MINUM!
          provider.triggerHaptic('alert');
          final text =
              'Obat teridentifikasi $medName. Belum ada rekaman dokter untuk obat ini. Apakah dokter memberitahu berapa kali sehari obat ini harus diminum? Bicara arahan dokter atau ketuk tombol Saya Lupa.';
          provider.speak(text);
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

  void _startListeningClarification() async {
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');
    provider.stopSpeech();

    bool available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'notListening' && mounted) {
          setState(() => _isListeningClarification = false);
        }
      },
      onError: (val) {
        if (mounted) setState(() => _isListeningClarification = false);
      },
    );

    if (available) {
      setState(() => _isListeningClarification = true);
      provider.speak('Silakan bicara aturan minum dari dokter.');
      _speech.listen(
        onResult: (val) {
          if (mounted) {
            final words = val.recognizedWords.toLowerCase();
            if (val.finalResult) {
              _processVerbalClarification(words);
            }
          }
        },
      );
    } else {
      provider.speak('Mikrofon tidak dapat diakses.');
    }
  }

  void _processVerbalClarification(String words) {
    final provider = context.read<MedicineProvider>();

    if (words.contains('lupa') ||
        words.contains('tidak tahu') ||
        words.contains('nggak tahu') ||
        words.contains('kurang tahu') ||
        words.contains('tidak ingat')) {
      _handlePatientForgot();
      return;
    }

    String freq = '2x sehari';
    if (words.contains('1') || words.contains('satu') || words.contains('sekali')) {
      freq = '1x sehari';
    } else if (words.contains('2') || words.contains('dua')) {
      freq = '2x sehari';
    } else if (words.contains('3') || words.contains('tiga')) {
      freq = '3x sehari';
    } else if (words.contains('4') || words.contains('empat')) {
      freq = '4x sehari';
    }

    String timing = 'Setelah Makan';
    if (words.contains('sebelum')) {
      timing = 'Sebelum Makan';
    }

    setState(() {
      _verbalFrequency = freq;
      _verbalTiming = timing;
      _userForgotDosage = false;
    });

    provider.triggerHaptic('success');
    provider.speak(
      'Baik, dicatat diminum $freq $timing sesuai arahan dokter yang Anda sampaikan.',
    );
  }

  void _handlePatientForgot() {
    final provider = context.read<MedicineProvider>();
    setState(() {
      _userForgotDosage = true;
      _verbalFrequency = null;
    });

    provider.triggerHaptic('warning');
    final warning =
        'Demi keselamatan Anda, jangan menebak dosis obat. Hubungi dokter pendamping Anda ${provider.profile.doctorName} atau tanyakan apoteker sebelum meminumnya.';
    provider.speak(warning);
  }

  void _saveToCabinet() {
    if (_analyzedData == null || _analyzedData!['isMedicine'] == false) return;
    final provider = context.read<MedicineProvider>();

    final rx = _matchedDoctorRx;
    final bool isConfirmed = rx != null || _verbalFrequency != null;
    final String source = rx != null
        ? 'doctor_recording'
        : (_verbalFrequency != null ? 'patient_verbal' : 'unconfirmed');

    final String instructionText = rx != null
        ? rx.instructions
        : (_verbalFrequency != null
            ? 'Diminum $_verbalFrequency $_verbalTiming (sesuai arahan lisan pasien)'
            : 'Perhatian: Dosis belum terkonfirmasi dokter. Jangan diminum sebelum konfirmasi!');

    final newMed = Medicine(
      id: 'med-${DateTime.now().millisecondsSinceEpoch}',
      name: _analyzedData!['nama'] ?? 'Obat Baru',
      genericName: _analyzedData!['namaGenerik'] ?? _analyzedData!['nama'] ?? '',
      dosage: rx?.dosage ?? _analyzedData!['kandungan'] ?? 'Sesuai petunjuk',
      category: isConfirmed ? 'Obat Terkonfirmasi' : 'Dosis Belum Terkonfirmasi',
      status: isConfirmed ? 'safe' : 'warning',
      statusLabel: isConfirmed
          ? (rx != null ? 'Resep Dokter Terverifikasi' : 'Aturan Lisan Pasien')
          : 'Menunggu Konfirmasi Dokter',
      instructions: instructionText,
      timing: _verbalTiming == 'Sebelum Makan' ? 'before_meal' : 'after_meal',
      timingLabel: _verbalTiming,
      recommendedTime: '08:00',
      precautions: _userForgotDosage
          ? 'WAJIB KONFIRMASI DOKTER / APOTEKER SEBELUM KONSUMSI.'
          : (rx?.doctorNotes ?? _analyzedData!['peringatan'] ?? ''),
      teksPanduanSuara: isConfirmed
          ? 'Obat ${_analyzedData!["nama"]}. $instructionText'
          : 'Obat ${_analyzedData!["nama"]}. Dosis belum terkonfirmasi. Hubungi dokter atau apoteker.',
      dosageConfirmed: isConfirmed,
      dosageSource: source,
    );

    provider.addMedicine(newMed);
    setState(() => _isSaved = true);

    if (isConfirmed) {
      provider.speak('${newMed.name} disimpan ke lemari obat dan jadwal harian.');
    } else {
      provider.speak('${newMed.name} disimpan ke lemari dengan status menunggu konfirmasi dokter.');
    }
  }

  void _resetScan() {
    setState(() {
      _analyzedData = null;
      _matchedDoctorRx = null;
      _verbalFrequency = null;
      _userForgotDosage = false;
      _isSaved = false;
      _searchController.clear();
    });
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');
    provider.speak('Kamera aktif kembali. Ketuk layar dua kali untuk memotret.');
  }

  @override
  void dispose() {
    _speech.stop();
    _cameraController?.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;

    return Scaffold(
      backgroundColor: isHC ? Colors.black : const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: isHC ? Colors.black : const Color(0xFF131B2E),
        elevation: 0,
        title: Text(
          'Pemindai Obat Cerdas',
          style: TextStyle(
            color: isHC ? const Color(0xFFFFE600) : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            tooltip: _isFlashOn ? 'Matikan Lampu Senter' : 'Nyalakan Lampu Senter',
            icon: Icon(
              _isFlashOn ? Icons.flash_on : Icons.flash_off,
              color: isHC ? const Color(0xFFFFE600) : Colors.amber,
            ),
            onPressed: _toggleFlash,
          ),
          if (_analyzedData != null)
            IconButton(
              tooltip: 'Pindai Ulang',
              icon: Icon(Icons.refresh, color: isHC ? const Color(0xFFFFE600) : Colors.white),
              onPressed: _resetScan,
            ),
        ],
      ),
      body: _analyzedData == null
          ? _buildCameraViewfinder(provider, isHC)
          : _buildResultView(provider, isHC),
    );
  }

  Widget _buildCameraViewfinder(MedicineProvider provider, bool isHC) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onDoubleTap: _captureAndAnalyze,
      onTap: () {
        provider.triggerHaptic('click');
        provider.speak('Kamera siap. Ketuk layar dua kali dengan cepat untuk memotret.');
      },
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Camera Preview with Exact Aspect Ratio (No Stretching/Gepeng)
          if (_isCameraReady && _cameraController != null)
            Center(
              child: AspectRatio(
                aspectRatio: 1 / _cameraController!.value.aspectRatio,
                child: CameraPreview(_cameraController!),
              ),
            )
          else
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt, size: 64, color: isHC ? const Color(0xFFFFE600) : Colors.white38),
                  const SizedBox(height: 16),
                  Text(
                    'Menyiapkan Kamera...',
                    style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white70, fontSize: 16),
                  ),
                ],
              ),
            ),

          // Tunanetra Guidance Overlay Frame (High-Contrast Viewfinder)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top Status Pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981),
                        width: isHC ? 3 : 1.5,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.touch_app,
                          size: 18,
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'KETUK 2X DI MANA SAJA UNTUK MEMOTRET',
                          style: TextStyle(
                            color: isHC ? const Color(0xFFFFE600) : Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Center Guidance Frame
                  Container(
                    height: 240,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8).withValues(alpha: 0.8),
                        width: isHC ? 4 : 2,
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Center(
                      child: Text(
                        'Arahkan Kemasan Obat ke Sini',
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : Colors.white.withValues(alpha: 0.8),
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          backgroundColor: Colors.black54,
                        ),
                      ),
                    ),
                  ),

                  // Bottom Controls Bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isHC ? const Color(0xFFFFE600) : Colors.white12,
                        width: isHC ? 3 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontSize: 13),
                            decoration: InputDecoration(
                              hintText: 'Ketik nama obat jika kamera sulit...',
                              hintStyle: TextStyle(
                                color: isHC
                                    ? const Color(0xFFFFE600).withValues(alpha: 0.5)
                                    : const Color(0xFF64748B),
                                fontSize: 12,
                              ),
                              prefixIcon: Icon(Icons.search, color: isHC ? const Color(0xFFFFE600) : Colors.white54, size: 20),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                            onSubmitted: (val) {
                              if (val.trim().isNotEmpty) _runAnalysis(query: val.trim());
                            },
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.send, color: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8)),
                          onPressed: () {
                            if (_searchController.text.trim().isNotEmpty) {
                              _runAnalysis(query: _searchController.text.trim());
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Loading / Analyzing Overlay
          if (_isAnalyzing)
            Container(
              color: Colors.black.withValues(alpha: 0.85),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      height: 54,
                      width: 54,
                      child: CircularProgressIndicator(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8),
                        strokeWidth: 4,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      _analyzingStep,
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Mohon tunggu sebentar...',
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildResultView(MedicineProvider provider, bool isHC) {
    final isMed = _analyzedData!['isMedicine'] != false;
    final rx = _matchedDoctorRx;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Kasus 1: BUKAN OBAT (Tisu, Makanan, Perabotan, dll)
          if (!isMed) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isHC ? Colors.black : const Color(0xFF450A0A),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isHC ? const Color(0xFFFFE600) : Colors.redAccent,
                  width: isHC ? 3 : 2,
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    size: 54,
                    color: isHC ? const Color(0xFFFFE600) : Colors.redAccent,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _analyzedData!['nama'] ?? 'Bukan Kemasan Obat',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isHC ? const Color(0xFFFFE600) : Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _analyzedData!['indikasi'] ??
                        'Objek yang tertangkap kamera bukan kemasan obat, tablet, sirup, atau resep dokter yang sah.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isHC ? const Color(0xFFFFE600) : const Color(0xFFFECACA),
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isHC ? const Color(0xFFFFE600) : Colors.redAccent,
                      foregroundColor: isHC ? Colors.black : Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Pindai Ulang (Ketuk 2x)', style: TextStyle(fontWeight: FontWeight.bold)),
                    onPressed: _resetScan,
                  ),
                ],
              ),
            ),
          ] else ...[
            // Kasus 2: OBAT SAH
            // 2A: Jika ADA rekaman dokter yang cocok
            if (rx != null) ...[
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
                              'COCOK REKAMAN DOKTER (${rx.frequency})',
                              style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            rx.instructions,
                            style: TextStyle(
                              color: isHC ? const Color(0xFFFFE600) : Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          if (rx.doctorNotes != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              'Catatan: ${rx.doctorNotes}',
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
                            onPressed: () => provider.speak(rx.spokeSummary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ] else ...[
              // 2B: BELUM ADA REKAMAN DOKTER (Safety First Dialog)
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isHC ? Colors.black : const Color(0xFF1E1B4B).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isHC ? const Color(0xFFFFE600) : const Color(0xFF818CF8),
                    width: isHC ? 3 : 2,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.contact_support,
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFFA5B4FC),
                          size: 26,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Klarifikasi Aturan Minum Dokter',
                            style: TextStyle(
                              color: isHC ? const Color(0xFFFFE600) : Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Obat ini belum tercatat dalam rekaman dokter Anda. Berapa kali sehari dokter menyuruh Anda meminum obat ini?',
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFFC7D2FE),
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Jika pasien sudah menjawab lisan
                    if (_verbalFrequency != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.15) : const Color(0xFF065F46).withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                            width: 1.5,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.check_circle, color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Terkonfirmasi: Diminum $_verbalFrequency $_verbalTiming (sesuai ingatan Anda)',
                                style: TextStyle(
                                  color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Jika pasien menyatakan lupa
                    if (_userForgotDosage) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isHC ? Colors.black : const Color(0xFF450A0A),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isHC ? const Color(0xFFFFE600) : Colors.redAccent,
                            width: 2,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.shield_outlined, color: isHC ? const Color(0xFFFFE600) : Colors.redAccent),
                                const SizedBox(width: 8),
                                Text(
                                  'Protokol Keselamatan Medis',
                                  style: TextStyle(
                                    color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Jangan menebak dosis! Segera hubungi dokter Anda untuk memastikan aturan minum obat ini:',
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : const Color(0xFFFCA5A5),
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: isHC ? const Color(0xFFFFE600) : Colors.red.shade900,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '${provider.profile.doctorName}: ${provider.profile.doctorPhone}',
                                style: TextStyle(
                                  color: isHC ? Colors.black : Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Tombol Interaksi Bicara & Opsi Lupa
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _isListeningClarification
                                  ? Colors.redAccent
                                  : (isHC ? const Color(0xFFFFE600) : const Color(0xFF4F46E5)),
                              foregroundColor: isHC ? Colors.black : Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            icon: Icon(_isListeningClarification ? Icons.mic : Icons.mic_none),
                            label: Text(
                              _isListeningClarification ? 'Mendengarkan...' : 'Jawab via Suara',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            onPressed: _startListeningClarification,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 2,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFFFCA5A5),
                              side: BorderSide(
                                color: isHC ? const Color(0xFFFFE600) : Colors.redAccent.withValues(alpha: 0.6),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            onPressed: _handlePatientForgot,
                            child: const Text(
                              'Saya Lupa',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    // Quick Chips Selection
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _QuickDosageChip(
                          label: '1x Sehari',
                          isSelected: _verbalFrequency == '1x sehari',
                          isHC: isHC,
                          onTap: () {
                            setState(() {
                              _verbalFrequency = '1x sehari';
                              _userForgotDosage = false;
                            });
                            provider.speak('Dipilih 1 kali sehari setelah makan.');
                          },
                        ),
                        _QuickDosageChip(
                          label: '2x Sehari',
                          isSelected: _verbalFrequency == '2x sehari',
                          isHC: isHC,
                          onTap: () {
                            setState(() {
                              _verbalFrequency = '2x sehari';
                              _userForgotDosage = false;
                            });
                            provider.speak('Dipilih 2 kali sehari setelah makan.');
                          },
                        ),
                        _QuickDosageChip(
                          label: '3x Sehari',
                          isSelected: _verbalFrequency == '3x sehari',
                          isHC: isHC,
                          onTap: () {
                            setState(() {
                              _verbalFrequency = '3x sehari';
                              _userForgotDosage = false;
                            });
                            provider.speak('Dipilih 3 kali sehari setelah makan.');
                          },
                        ),
                        _QuickDosageChip(
                          label: 'Saat Perlu (PRN)',
                          isSelected: _verbalFrequency == 'Bila Perlu',
                          isHC: isHC,
                          onTap: () {
                            setState(() {
                              _verbalFrequency = 'Bila Perlu';
                              _userForgotDosage = false;
                            });
                            provider.speak('Dipilih diminum hanya bila perlu saat gejala timbul.');
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Detail Kartu Obat Utama
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
                              _analyzedData!['nama'] ?? 'Obat Teridentifikasi',
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
                        tooltip: 'Dengarkan Ulang Suara Penjelasan',
                        icon: Icon(Icons.volume_up, size: 30, color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981)),
                        onPressed: () {
                          final text = rx != null
                              ? rx.spokeSummary
                              : (_verbalFrequency != null
                                  ? 'Obat ${_analyzedData!["nama"]}. Diminum $_verbalFrequency $_verbalTiming sesuai ingatan Anda.'
                                  : 'Obat ${_analyzedData!["nama"]}. Dosis belum terkonfirmasi dari dokter.');
                          provider.speak(text);
                        },
                      ),
                    ],
                  ),

                  const Divider(color: Colors.white12, height: 24),

                  _InfoRow(label: 'Indikasi / Khasiat', value: _analyzedData!['indikasi'] ?? '-', isHC: isHC),
                  _InfoRow(
                    label: 'Status Aturan Pakai',
                    value: rx != null
                        ? rx.instructions
                        : (_verbalFrequency != null
                            ? 'Diminum $_verbalFrequency $_verbalTiming'
                            : 'BELUM TERKONFIRMASI (Tanya Dokter)'),
                    isHC: isHC,
                  ),
                  _InfoRow(
                    label: 'Sumber Aturan',
                    value: rx != null
                        ? 'Resep Rekaman Dokter'
                        : (_verbalFrequency != null ? 'Konfirmasi Lisan Pasien' : 'Menunggu Konfirmasi'),
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
    );
  }
}

class _QuickDosageChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final bool isHC;
  final VoidCallback onTap;

  const _QuickDosageChip({
    required this.label,
    required this.isSelected,
    required this.isHC,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? (isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8))
              : (isHC ? Colors.black : Colors.white10),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isHC ? const Color(0xFFFFE600) : (isSelected ? const Color(0xFF38BDF8) : Colors.white24),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.black : (isHC ? const Color(0xFFFFE600) : Colors.white),
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
          ),
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
