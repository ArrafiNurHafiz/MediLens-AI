import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/medicine_models.dart';
import '../providers/medicine_provider.dart';

class MedicineCabinetScreen extends StatelessWidget {
  final Function(int) onNavigateTab;

  const MedicineCabinetScreen({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;
    final meds = provider.medicines;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Lemari Obat Saya',
          style: TextStyle(
            color: isHC ? const Color(0xFFFFE600) : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Tambah Obat Baru',
            icon: Icon(Icons.add_a_photo, color: isHC ? const Color(0xFFFFE600) : Colors.white),
            onPressed: () => onNavigateTab(2), // go to scan
          ),
        ],
      ),
      body: meds.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.medication_liquid_outlined,
                      size: 64,
                      color: isHC ? const Color(0xFFFFE600) : Colors.white38,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Lemari Obat Masih Kosong',
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Pindai kemasan obat baru dengan kamera atau rekam arahan dokter Anda.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF2563EB),
                        foregroundColor: isHC ? Colors.black : Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      ),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Pindai Obat Sekarang', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: () => onNavigateTab(2),
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: meds.length,
              itemBuilder: (context, index) {
                final med = meds[index];
                return _MedicineCard(med: med, isHC: isHC);
              },
            ),
    );
  }
}

class _MedicineCard extends StatelessWidget {
  final Medicine med;
  final bool isHC;

  const _MedicineCard({required this.med, required this.isHC});

  @override
  Widget build(BuildContext context) {
    final provider = context.read<MedicineProvider>();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      med.name,
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${med.dosage} • ${med.timingLabel}',
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(Icons.volume_up, color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981)),
                onPressed: () {
                  final text = med.teksPanduanSuara ?? '${med.name}. ${med.instructions}';
                  provider.speak(text);
                },
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                onPressed: () => provider.deleteMedicine(med.id),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            med.instructions,
            style: TextStyle(
              color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
              fontSize: 12,
            ),
          ),
          if (med.precautions.isNotEmpty) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isHC ? Colors.black : Colors.amber.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isHC ? const Color(0xFFFFE600) : Colors.amber.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: isHC ? const Color(0xFFFFE600) : Colors.amber),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      med.precautions,
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFFFDE68A),
                        fontSize: 11,
                      ),
                    ),
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
