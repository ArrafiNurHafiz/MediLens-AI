class FoodRestrictionItem {
  final String food;
  final String warning;
  final String severity; // warning | caution

  FoodRestrictionItem({
    required this.food,
    required this.warning,
    required this.severity,
  });

  Map<String, dynamic> toJson() => {
        'food': food,
        'warning': warning,
        'severity': severity,
      };

  factory FoodRestrictionItem.fromJson(Map<String, dynamic> json) =>
      FoodRestrictionItem(
        food: json['food'] ?? '',
        warning: json['warning'] ?? '',
        severity: json['severity'] ?? 'caution',
      );
}

class DrugInteractionItem {
  final String otherDrug;
  final String severity; // warning | caution | safe
  final String note;

  DrugInteractionItem({
    required this.otherDrug,
    required this.severity,
    required this.note,
  });

  Map<String, dynamic> toJson() => {
        'otherDrug': otherDrug,
        'severity': severity,
        'note': note,
      };

  factory DrugInteractionItem.fromJson(Map<String, dynamic> json) =>
      DrugInteractionItem(
        otherDrug: json['otherDrug'] ?? '',
        severity: json['severity'] ?? 'safe',
        note: json['note'] ?? '',
      );
}

class Medicine {
  final String id;
  final String name;
  final String genericName;
  final String dosage;
  final String form;
  final String category;
  final String status; // safe | caution | warning
  final String statusLabel;
  final String expiryDate;
  final String bpomNumber;
  final String indication;
  final String instructions;
  final String timing; // before_meal | after_meal | with_meal
  final String timingLabel;
  final String recommendedTime;
  final List<String> sideEffects;
  final String precautions;
  final String? imageUrl;
  final List<FoodRestrictionItem> foodRestrictions;
  final List<DrugInteractionItem> interactions;
  final String? allergyWarning;
  final String? teksPanduanSuara;
  final String? scannedAt;
  bool takenToday;
  final bool dosageConfirmed;
  final String dosageSource; // 'doctor_recording' | 'patient_verbal' | 'unconfirmed'

  Medicine({
    required this.id,
    required this.name,
    required this.genericName,
    required this.dosage,
    this.form = 'Tablet',
    this.category = 'Obat Resep',
    this.status = 'safe',
    this.statusLabel = 'Aman Dikonsumsi',
    this.expiryDate = 'Sesuai kemasan',
    this.bpomNumber = 'BPOM Terverifikasi',
    this.indication = 'Sesuai petunjuk dokter',
    required this.instructions,
    this.timing = 'after_meal',
    this.timingLabel = 'Setelah Makan',
    this.recommendedTime = '08:00',
    this.sideEffects = const [],
    this.precautions = '',
    this.imageUrl,
    this.foodRestrictions = const [],
    this.interactions = const [],
    this.allergyWarning,
    this.teksPanduanSuara,
    this.scannedAt,
    this.takenToday = false,
    this.dosageConfirmed = true,
    this.dosageSource = 'doctor_recording',
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'genericName': genericName,
        'dosage': dosage,
        'form': form,
        'category': category,
        'status': status,
        'statusLabel': statusLabel,
        'expiryDate': expiryDate,
        'bpomNumber': bpomNumber,
        'indication': indication,
        'instructions': instructions,
        'timing': timing,
        'timingLabel': timingLabel,
        'recommendedTime': recommendedTime,
        'sideEffects': sideEffects,
        'precautions': precautions,
        'imageUrl': imageUrl,
        'foodRestrictions': foodRestrictions.map((e) => e.toJson()).toList(),
        'interactions': interactions.map((e) => e.toJson()).toList(),
        'allergyWarning': allergyWarning,
        'teksPanduanSuara': teksPanduanSuara,
        'scannedAt': scannedAt,
        'takenToday': takenToday,
        'dosageConfirmed': dosageConfirmed,
        'dosageSource': dosageSource,
      };

  factory Medicine.fromJson(Map<String, dynamic> json) => Medicine(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        genericName: json['genericName'] ?? '',
        dosage: json['dosage'] ?? '',
        form: json['form'] ?? 'Tablet',
        category: json['category'] ?? 'Obat Resep',
        status: json['status'] ?? 'safe',
        statusLabel: json['statusLabel'] ?? 'Aman Dikonsumsi',
        expiryDate: json['expiryDate'] ?? '',
        bpomNumber: json['bpomNumber'] ?? '',
        indication: json['indication'] ?? '',
        instructions: json['instructions'] ?? '',
        timing: json['timing'] ?? 'after_meal',
        timingLabel: json['timingLabel'] ?? 'Setelah Makan',
        recommendedTime: json['recommendedTime'] ?? '08:00',
        sideEffects: List<String>.from(json['sideEffects'] ?? []),
        precautions: json['precautions'] ?? '',
        imageUrl: json['imageUrl'],
        foodRestrictions: (json['foodRestrictions'] as List? ?? [])
            .map((e) => FoodRestrictionItem.fromJson(e))
            .toList(),
        interactions: (json['interactions'] as List? ?? [])
            .map((e) => DrugInteractionItem.fromJson(e))
            .toList(),
        allergyWarning: json['allergyWarning'],
        teksPanduanSuara: json['teksPanduanSuara'],
        scannedAt: json['scannedAt'],
        takenToday: json['takenToday'] ?? false,
        dosageConfirmed: json['dosageConfirmed'] ?? true,
        dosageSource: json['dosageSource'] ?? 'doctor_recording',
      );
}

class DoctorPrescriptionItem {
  final String id;
  final String medicineName;
  final String dosage;
  final String frequency; // e.g. "2x sehari"
  final String timing; // before_meal | after_meal | with_meal
  final String timingLabel;
  final String? duration;
  final String instructions;
  final String? doctorNotes;
  final String spokeSummary;

  DoctorPrescriptionItem({
    required this.id,
    required this.medicineName,
    required this.dosage,
    required this.frequency,
    this.timing = 'after_meal',
    this.timingLabel = 'Setelah Makan',
    this.duration,
    required this.instructions,
    this.doctorNotes,
    required this.spokeSummary,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'medicineName': medicineName,
        'dosage': dosage,
        'frequency': frequency,
        'timing': timing,
        'timingLabel': timingLabel,
        'duration': duration,
        'instructions': instructions,
        'doctorNotes': doctorNotes,
        'spokeSummary': spokeSummary,
      };

  factory DoctorPrescriptionItem.fromJson(Map<String, dynamic> json) =>
      DoctorPrescriptionItem(
        id: json['id'] ?? '',
        medicineName: json['medicineName'] ?? '',
        dosage: json['dosage'] ?? '',
        frequency: json['frequency'] ?? '1x sehari',
        timing: json['timing'] ?? 'after_meal',
        timingLabel: json['timingLabel'] ?? 'Setelah Makan',
        duration: json['duration'],
        instructions: json['instructions'] ?? '',
        doctorNotes: json['doctorNotes'],
        spokeSummary: json['spokeSummary'] ?? '',
      );
}

class DoctorConsultation {
  final String id;
  final String timestamp;
  final String? doctorName;
  final String? clinicOrHospital;
  final String rawTranscript;
  final String summary;
  final List<DoctorPrescriptionItem> prescriptions;
  final List<String> precautions;
  final String audioGuideText;

  DoctorConsultation({
    required this.id,
    required this.timestamp,
    this.doctorName,
    this.clinicOrHospital,
    required this.rawTranscript,
    required this.summary,
    required this.prescriptions,
    this.precautions = const [],
    required this.audioGuideText,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp,
        'doctorName': doctorName,
        'clinicOrHospital': clinicOrHospital,
        'rawTranscript': rawTranscript,
        'summary': summary,
        'prescriptions': prescriptions.map((p) => p.toJson()).toList(),
        'precautions': precautions,
        'audioGuideText': audioGuideText,
      };

  factory DoctorConsultation.fromJson(Map<String, dynamic> json) =>
      DoctorConsultation(
        id: json['id'] ?? '',
        timestamp: json['timestamp'] ?? '',
        doctorName: json['doctorName'],
        clinicOrHospital: json['clinicOrHospital'],
        rawTranscript: json['rawTranscript'] ?? '',
        summary: json['summary'] ?? '',
        prescriptions: (json['prescriptions'] as List? ?? [])
            .map((e) => DoctorPrescriptionItem.fromJson(e))
            .toList(),
        precautions: List<String>.from(json['precautions'] ?? []),
        audioGuideText: json['audioGuideText'] ?? '',
      );
}

class ScheduleItem {
  final String id;
  final String medicineId;
  final String medicineName;
  final String dosage;
  final String time;
  final String timeSlot; // pagi | siang | sore | malam
  final String timingLabel;
  final String instruction;
  bool taken;
  String? takenAt;

  ScheduleItem({
    required this.id,
    required this.medicineId,
    required this.medicineName,
    required this.dosage,
    required this.time,
    required this.timeSlot,
    required this.timingLabel,
    required this.instruction,
    this.taken = false,
    this.takenAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'medicineId': medicineId,
        'medicineName': medicineName,
        'dosage': dosage,
        'time': time,
        'timeSlot': timeSlot,
        'timingLabel': timingLabel,
        'instruction': instruction,
        'taken': taken,
        'takenAt': takenAt,
      };

  factory ScheduleItem.fromJson(Map<String, dynamic> json) => ScheduleItem(
        id: json['id'] ?? '',
        medicineId: json['medicineId'] ?? '',
        medicineName: json['medicineName'] ?? '',
        dosage: json['dosage'] ?? '',
        time: json['time'] ?? '08:00',
        timeSlot: json['timeSlot'] ?? 'pagi',
        timingLabel: json['timingLabel'] ?? 'Setelah Makan',
        instruction: json['instruction'] ?? '',
        taken: json['taken'] ?? false,
        takenAt: json['takenAt'],
      );
}

class AccessibilitySettings {
  bool largeFont;
  bool highContrast;
  bool autoVoice;
  double speechRate;
  bool hapticFeedback;
  bool soundEffects;

  AccessibilitySettings({
    this.largeFont = false,
    this.highContrast = false,
    this.autoVoice = true,
    this.speechRate = 1.0,
    this.hapticFeedback = true,
    this.soundEffects = true,
  });

  Map<String, dynamic> toJson() => {
        'largeFont': largeFont,
        'highContrast': highContrast,
        'autoVoice': autoVoice,
        'speechRate': speechRate,
        'hapticFeedback': hapticFeedback,
        'soundEffects': soundEffects,
      };

  factory AccessibilitySettings.fromJson(Map<String, dynamic> json) =>
      AccessibilitySettings(
        largeFont: json['largeFont'] ?? false,
        highContrast: json['highContrast'] ?? false,
        autoVoice: json['autoVoice'] ?? true,
        speechRate: (json['speechRate'] as num?)?.toDouble() ?? 1.0,
        hapticFeedback: json['hapticFeedback'] ?? true,
        soundEffects: json['soundEffects'] ?? true,
      );
}

class UserProfile {
  String name;
  int age;
  String gender;
  String bloodType;
  List<String> conditions;
  List<String> allergies;
  String doctorName;
  String doctorPhone;
  AccessibilitySettings settings;

  UserProfile({
    this.name = 'Arrafi Nur Hafiz',
    this.age = 25,
    this.gender = 'Laki-laki',
    this.bloodType = 'O+',
    this.conditions = const [
      'Hipertensi Ringan',
      'Riwayat Dispepsia (Asam Lambung)'
    ],
    this.allergies = const ['Penisilin / Amoxicillin'],
    this.doctorName = 'Dr. Budi Santoso, Sp.PD',
    this.doctorPhone = '+62 812-3456-7890',
    AccessibilitySettings? settings,
  }) : settings = settings ?? AccessibilitySettings();

  Map<String, dynamic> toJson() => {
        'name': name,
        'age': age,
        'gender': gender,
        'bloodType': bloodType,
        'conditions': conditions,
        'allergies': allergies,
        'doctorName': doctorName,
        'doctorPhone': doctorPhone,
        'settings': settings.toJson(),
      };

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        name: json['name'] ?? 'Arrafi Nur Hafiz',
        age: json['age'] ?? 25,
        gender: json['gender'] ?? 'Laki-laki',
        bloodType: json['bloodType'] ?? 'O+',
        conditions: List<String>.from(json['conditions'] ?? []),
        allergies: List<String>.from(json['allergies'] ?? []),
        doctorName: json['doctorName'] ?? 'Dr. Budi Santoso, Sp.PD',
        doctorPhone: json['doctorPhone'] ?? '+62 812-3456-7890',
        settings: json['settings'] != null
            ? AccessibilitySettings.fromJson(json['settings'])
            : AccessibilitySettings(),
      );
}
