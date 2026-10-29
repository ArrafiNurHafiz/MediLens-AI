import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/medicine_models.dart';
import '../providers/medicine_provider.dart';

class ScheduleScreen extends StatelessWidget {
  const ScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;
    final schedule = provider.schedule;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Jadwal Minum Obat',
          style: TextStyle(
            color: isHC ? const Color(0xFFFFE600) : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: schedule.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.alarm_off,
                      size: 64,
                      color: isHC ? const Color(0xFFFFE600) : Colors.white38,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Belum Ada Jadwal Minum',
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Saat Anda menambahkan obat atau resep dokter, jadwal minum akan otomatis dibuat di sini.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: schedule.length,
              itemBuilder: (context, index) {
                final item = schedule[index];
                return _ScheduleCard(item: item, isHC: isHC);
              },
            ),
    );
  }
}

class _ScheduleCard extends StatelessWidget {
  final ScheduleItem item;
  final bool isHC;

  const _ScheduleCard({required this.item, required this.isHC});

  @override
  Widget build(BuildContext context) {
    final provider = context.read<MedicineProvider>();

    return InkWell(
      onTap: () => provider.toggleSchedule(item.id),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isHC
              ? (item.taken ? const Color(0xFF1A1A00) : Colors.black)
              : (item.taken ? const Color(0xFF064E3B).withValues(alpha: 0.25) : const Color(0xFF131B2E)),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isHC
                ? const Color(0xFFFFE600)
                : (item.taken ? const Color(0xFF10B981) : Colors.white12),
            width: isHC ? 3 : 1.5,
          ),
        ),
        child: Row(
          children: [
            Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: item.taken
                    ? (isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981))
                    : (isHC ? Colors.black : Colors.white10),
                border: Border.all(
                  color: isHC ? const Color(0xFFFFE600) : (item.taken ? const Color(0xFF10B981) : Colors.white30),
                  width: 2,
                ),
              ),
              child: Icon(
                item.taken ? Icons.check : Icons.alarm,
                color: item.taken ? Colors.black : (isHC ? const Color(0xFFFFE600) : Colors.white70),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        item.time,
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8),
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(${item.timeSlot.toUpperCase()} • ${item.timingLabel})',
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.medicineName,
                    style: TextStyle(
                      color: isHC ? const Color(0xFFFFE600) : Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      decoration: item.taken ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  Text(
                    item.instruction,
                    style: TextStyle(
                      color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: Icon(Icons.volume_up, color: isHC ? const Color(0xFFFFE600) : Colors.white70),
              onPressed: () {
                final status = item.taken ? 'sudah diminum' : 'belum diminum';
                provider.speak('Jadwal jam ${item.time}. ${item.medicineName}, dosis ${item.dosage}. Status: $status.');
              },
            ),
          ],
        ),
      ),
    );
  }
}
