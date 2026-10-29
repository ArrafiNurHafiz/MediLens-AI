import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vibration/vibration.dart';
import 'package:http/http.dart' as http;
import '../models/medicine_models.dart';

class MedicineProvider extends ChangeNotifier {
  static const String _apiBaseUrl = 'https://medilens-ai-six.vercel.app/api';

  List<Medicine> _medicines = [];
  List<ScheduleItem> _schedule = [];
  List<DoctorConsultation> _consultations = [];
  UserProfile _profile = UserProfile();
  bool _isLoaded = false;

  final FlutterTts _tts = FlutterTts();

  List<Medicine> get medicines => _medicines;
  List<ScheduleItem> get schedule => _schedule;
  List<DoctorConsultation> get consultations => _consultations;
  DoctorConsultation? get activeConsultation =>
      _consultations.isNotEmpty ? _consultations.first : null;
  UserProfile get profile => _profile;
  bool get isLoaded => _isLoaded;

  MedicineProvider() {
    _initTts();
    _loadFromStorage();
  }

  void _initTts() async {
    await _tts.setLanguage('id-ID');
    await _tts.setSpeechRate(_profile.settings.speechRate);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
    await _tts.setQueueMode(0); // Flush queue on urgent interrupts
  }

  Future<void> speak(String text) async {
    if (text.isEmpty) return;
    try {
      await _tts.setSpeechRate(_profile.settings.speechRate);
      await _tts.stop();
      await _tts.speak(text);
    } catch (e) {
      debugPrint('TTS Error: $e');
    }
  }

  Future<void> stopSpeech() async {
    try {
      await _tts.stop();
    } catch (_) {}
  }

  Future<void> triggerHaptic(String type) async {
    if (!_profile.settings.hapticFeedback) return;
    try {
      final hasVibrator = await Vibration.hasVibrator();
      if (hasVibrator != true) return;

      if (type == 'alert') {
        // Kejut kuat untuk bahaya/alergi
        Vibration.vibrate(pattern: [0, 100, 50, 100, 50, 100], intensities: [0, 255, 0, 255, 0, 255]);
      } else if (type == 'warning') {
        Vibration.vibrate(pattern: [0, 80, 40, 80]);
      } else if (type == 'success') {
        Vibration.vibrate(pattern: [0, 50, 50, 120]);
      } else {
        Vibration.vibrate(duration: 40);
      }
    } catch (_) {}
  }

  Future<void> _loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      final medsJson = prefs.getString('medilens_fresh_v2_medicines');
      if (medsJson != null) {
        final List decoded = jsonDecode(medsJson);
        _medicines = decoded.map((e) => Medicine.fromJson(e)).toList();
      }

      final schedJson = prefs.getString('medilens_fresh_v2_schedule');
      if (schedJson != null) {
        final List decoded = jsonDecode(schedJson);
        _schedule = decoded.map((e) => ScheduleItem.fromJson(e)).toList();
      }

      final consultJson = prefs.getString('medilens_fresh_v2_consultations');
      if (consultJson != null) {
        final List decoded = jsonDecode(consultJson);
        _consultations =
            decoded.map((e) => DoctorConsultation.fromJson(e)).toList();
      }

      final profileJson = prefs.getString('medilens_fresh_v2_profile');
      if (profileJson != null) {
        _profile = UserProfile.fromJson(jsonDecode(profileJson));
      }
    } catch (e) {
      debugPrint('Storage load error: $e');
    } finally {
      _isLoaded = true;
      notifyListeners();
    }
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
          'medilens_fresh_v2_medicines',
          jsonEncode(_medicines.map((e) => e.toJson()).toList()));
      await prefs.setString(
          'medilens_fresh_v2_schedule',
          jsonEncode(_schedule.map((e) => e.toJson()).toList()));
      await prefs.setString(
          'medilens_fresh_v2_consultations',
          jsonEncode(_consultations.map((e) => e.toJson()).toList()));
      await prefs.setString(
          'medilens_fresh_v2_profile', jsonEncode(_profile.toJson()));
    } catch (e) {
      debugPrint('Storage save error: $e');
    }
  }

  void addMedicine(Medicine medicine) {
    final idx = _medicines.indexWhere((m) =>
        m.id == medicine.id ||
        m.name.toLowerCase() == medicine.name.toLowerCase());
    if (idx != -1) {
      _medicines[idx] = medicine;
    } else {
      _medicines.insert(0, medicine);
    }

    // Hanya buat jadwal jika dosis sudah terkonfirmasi oleh resep dokter atau penjelasan pasien
    if (medicine.dosageConfirmed) {
      final hour = int.tryParse(medicine.recommendedTime.split(':').first) ?? 8;
      final timeSlot = hour < 11
          ? 'pagi'
          : hour < 15
              ? 'siang'
              : hour < 18
                  ? 'sore'
                  : 'malam';

      _schedule.add(ScheduleItem(
        id: 'sch-${DateTime.now().millisecondsSinceEpoch}',
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: medicine.dosage,
        time: medicine.recommendedTime,
        timeSlot: timeSlot,
        timingLabel: medicine.timingLabel,
        instruction: medicine.instructions,
      ));
    }

    _saveToStorage();
    triggerHaptic('success');
    notifyListeners();
  }

  void deleteMedicine(String id) {
    _medicines.removeWhere((m) => m.id == id);
    _schedule.removeWhere((s) => s.medicineId == id);
    _saveToStorage();
    triggerHaptic('click');
    notifyListeners();
  }

  void toggleSchedule(String id) {
    final item = _schedule.firstWhere((s) => s.id == id);
    item.taken = !item.taken;
    if (item.taken) {
      final now = DateTime.now();
      item.takenAt =
          '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
      triggerHaptic('success');
      speak('${item.medicineName} ditandai sudah diminum.');
    } else {
      item.takenAt = null;
      triggerHaptic('click');
      speak('${item.medicineName} ditandai belum diminum.');
    }
    _saveToStorage();
    notifyListeners();
  }

  void addConsultation(DoctorConsultation consultation) {
    _consultations.insert(0, consultation);
    _saveToStorage();
    triggerHaptic('success');
    notifyListeners();
  }

  void deleteConsultation(String id) {
    _consultations.removeWhere((c) => c.id == id);
    _saveToStorage();
    triggerHaptic('click');
    notifyListeners();
  }

  DoctorPrescriptionItem? findDoctorPrescriptionMatch(String medicineName) {
    if (medicineName.isEmpty) return null;
    final cleanTarget =
        medicineName.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
    for (final consult in _consultations) {
      for (final item in consult.prescriptions) {
        final cleanItem =
            item.medicineName.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
        if (cleanTarget.contains(cleanItem) ||
            cleanItem.contains(cleanTarget) ||
            (cleanTarget.length >= 4 &&
                cleanItem.length >= 4 &&
                cleanTarget.substring(0, 4) == cleanItem.substring(0, 4))) {
          return item;
        }
      }
    }
    return null;
  }

  void updateProfile(UserProfile newProfile) {
    _profile = newProfile;
    _saveToStorage();
    triggerHaptic('success');
    notifyListeners();
  }

  void updateAccessibility(AccessibilitySettings newSettings) {
    _profile.settings = newSettings;
    _tts.setSpeechRate(newSettings.speechRate);
    _saveToStorage();
    triggerHaptic('click');
    notifyListeners();
  }

  // API Call: Process Doctor Voice Notes (Bolo Safety-Contract)
  Future<DoctorConsultation> processConsultationApi({
    required String transcript,
    String? doctorName,
    String? clinic,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBaseUrl/consultation/process'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'transcript': transcript,
          'doctorName': doctorName,
          'clinic': clinic,
        }),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null) {
          final consult = DoctorConsultation.fromJson(data['data']);
          addConsultation(consult);
          return consult;
        }
      }
    } catch (e) {
      debugPrint('Consultation API network error: $e');
    }

    // Offline / Fallback Rule-based processing
    final fallbackRx = <DoctorPrescriptionItem>[];
    final lines = transcript.split(RegExp(r'[.\n,;]'));
    int rxIdx = 0;
    for (final line in lines) {
      final trimmed = line.trim();
      if (trimmed.length > 5 &&
          (trimmed.toLowerCase().contains('minum') ||
              trimmed.toLowerCase().contains('sehari') ||
              trimmed.toLowerCase().contains('x'))) {
        final freqMatch = RegExp(r'(\d+)\s*[xX]\s*sehari').firstMatch(trimmed);
        final freq = freqMatch != null ? '${freqMatch.group(1)}x sehari' : '2x sehari';
        final isBefore = trimmed.toLowerCase().contains('sebelum');
        fallbackRx.add(DoctorPrescriptionItem(
          id: 'rx-fb-${DateTime.now().millisecondsSinceEpoch}-${rxIdx++}',
          medicineName: trimmed.length > 25 ? trimmed.substring(0, 25) : trimmed,
          dosage: '1 dosis',
          frequency: freq,
          timing: isBefore ? 'before_meal' : 'after_meal',
          timingLabel: isBefore ? 'Sebelum Makan' : 'Setelah Makan',
          instructions: trimmed,
          spokeSummary: 'Obat dari dokter, diminum $freq ${isBefore ? "sebelum makan" : "setelah makan"}.',
        ));
      }
    }

    final fallbackConsult = DoctorConsultation(
      id: 'cons-${DateTime.now().millisecondsSinceEpoch}',
      timestamp: DateTime.now().toIso8601String(),
      doctorName: doctorName ?? 'Dr. Pemeriksa',
      clinicOrHospital: clinic ?? 'Klinik / Faskes',
      rawTranscript: transcript,
      summary: 'Catatan konsultasi tersimpan.',
      prescriptions: fallbackRx.isNotEmpty
          ? fallbackRx
          : [
              DoctorPrescriptionItem(
                id: 'rx-default-${DateTime.now().millisecondsSinceEpoch}',
                medicineName: 'Obat Resep',
                dosage: 'Sesuai resep',
                frequency: '2x sehari',
                instructions: transcript,
                spokeSummary: 'Diminum 2 kali sehari setelah makan.',
              )
            ],
      audioGuideText: 'Instruksi dokter berhasil disimpan ke perangkat.',
    );

    addConsultation(fallbackConsult);
    return fallbackConsult;
  }

  // API Call: Analyze Medicine Image or Text
  Future<Map<String, dynamic>> analyzeMedicineApi({
    String? imageBase64,
    String? query,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBaseUrl/analyze'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'image': imageBase64,
          'query': query,
          'existingMedicines': _medicines.map((m) => m.name).toList(),
          'allergies': _profile.allergies,
          'conditions': _profile.conditions,
        }),
      ).timeout(const Duration(seconds: 35));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null) {
          return data['data'];
        }
      } else {
        final err = jsonDecode(res.body);
        return {
          'isMedicine': false,
          'nama': 'Gagal Menganalisis',
          'teksPanduanSuara': err['error'] ?? 'Gagal menghubungi server analisis obat. Pastikan koneksi internet aktif.',
        };
      }
    } catch (e) {
      debugPrint('Analyze API error: $e');
    }

    // Safety fallback: Jika input BUKAN obat (misal tisu, kertas, atau scan gagal), JANGAN tebak Paracetamol!
    if (query != null && query.trim().isNotEmpty) {
      final qLower = query.toLowerCase();
      if (qLower.contains('tisu') || qLower.contains('tissue') || qLower.contains('baju') || qLower.contains('kertas')) {
        return {
          'isMedicine': false,
          'nama': 'Bukan Kemasan Obat',
          'indikasi': 'Objek terdeteksi sebagai benda non-medis ($query).',
          'aturanPakai': 'Tidak ada aturan pakai (bukan obat).',
          'peringatan': 'Benda ini bukan obat farmasi untuk dikonsumsi.',
          'teksPanduanSuara': 'Objek terdeteksi sebagai $query, bukan kemasan obat. Harap arahkan kamera ke strip atau botol obat Anda.',
        };
      }
    }

    return {
      'isMedicine': false,
      'nama': 'Kemasan Obat Tidak Dikenali',
      'indikasi': 'Gambar tidak jelas atau objek di depan kamera bukan obat yang sah.',
      'aturanPakai': 'Posisikan ulang kemasan obat di depan kamera.',
      'peringatan': 'Pastikan teks pada kemasan obat terlihat jelas dan pencahayaan memadai.',
      'teksPanduanSuara': 'Maaf, objek tidak dikenali sebagai kemasan obat. Posisikan strip atau botol obat sekitar 15 sentimeter di depan kamera dan ketuk dua kali untuk mencoba lagi.',
    };
  }
}
