import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/medicine_provider.dart';

class HomeScreen extends StatelessWidget {
  final Function(int) onNavigateTab;

  const HomeScreen({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;
    final totalMeds = provider.medicines.length;
    final schedule = provider.schedule;
    final takenCount = schedule.where((s) => s.taken).length;
    final nextPending = schedule.cast().firstWhere(
          (s) => !s.taken,
          orElse: () => null,
        );

    final allergyAlerts = provider.medicines.where((m) {
      return provider.profile.allergies.any((a) {
        final term = a.toLowerCase().split('/').first.trim();
        if (term.isEmpty) return false;
        return m.name.toLowerCase().contains(term) ||
            m.genericName.toLowerCase().contains(term) ||
            m.indication.toLowerCase().contains(term);
      });
    }).toList();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                'assets/images/logo.png',
                height: 38,
                width: 38,
                fit: BoxFit.cover,
                errorBuilder: (ctx, err, stack) => const Icon(Icons.lens, size: 38),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isHC
                            ? const Color(0xFFFFE600).withValues(alpha: 0.2)
                            : const Color(0xFF10B981).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            height: 6,
                            width: 6,
                            decoration: BoxDecoration(
                              color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'SISTEM AKTIF',
                            style: TextStyle(
                              color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'Halo, ${provider.profile.name}',
                  style: TextStyle(
                    color: isHC ? const Color(0xFFFFE600) : Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Dengar Ringkasan Suara',
            icon: Icon(
              Icons.volume_up,
              color: isHC ? const Color(0xFFFFE600) : Colors.white70,
              size: 28,
            ),
            onPressed: () {
              provider.triggerHaptic('click');
              final summary =
                  'Halo ${provider.profile.name}. Ada $totalMeds obat terdaftar, dan ${schedule.length} jadwal hari ini. $takenCount sudah diminum. ${nextPending != null ? "Jadwal berikutnya adalah ${nextPending.medicineName} jam ${nextPending.time}." : "Semua obat hari ini telah diminum."}';
              provider.speak(summary);
            },
          ),
          IconButton(
            tooltip: 'Pengaturan Aksesibilitas',
            icon: Icon(
              Icons.accessibility_new,
              color: isHC ? const Color(0xFFFFE600) : Colors.white70,
              size: 28,
            ),
            onPressed: () => _showA11yDialog(context, provider),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Peringatan Alergi Pasien
            if (allergyAlerts.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isHC ? Colors.black : const Color(0xFF450A0A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isHC ? const Color(0xFFFFE600) : Colors.redAccent,
                    width: isHC ? 3 : 1.5,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.warning_amber_rounded,
                      color: isHC ? const Color(0xFFFFE600) : Colors.redAccent,
                      size: 28,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Peringatan Kontraindikasi Alergi!',
                            style: TextStyle(
                              color: isHC ? const Color(0xFFFFE600) : Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Ada obat dalam daftar yang berpotensi memicu alergi Anda: ${allergyAlerts.map((e) => e.name).join(", ")}.',
                            style: TextStyle(
                              color: isHC ? const Color(0xFFFFE600) : const Color(0xFFFCA5A5),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Hero Card: Big Scan Medicine CTA (Target Utama Tunanetra)
            Semantics(
              label: 'Tombol Pindai Kemasan Obat Cerdas dengan Kamera.',
              button: true,
              child: InkWell(
                onTap: () {
                  provider.triggerHaptic('click');
                  onNavigateTab(2); // Scan tab
                },
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: isHC ? Colors.black : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isHC ? const Color(0xFFFFE600) : const Color(0xFF3B82F6),
                      width: isHC ? 3 : 1.5,
                    ),
                    gradient: isHC
                        ? null
                        : const LinearGradient(
                            colors: [Color(0xFF1D4ED8), Color(0xFF4338CA)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        height: 64,
                        width: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isHC ? const Color(0xFFFFE600) : Colors.white24,
                        ),
                        child: Icon(
                          Icons.camera_alt,
                          size: 34,
                          color: isHC ? Colors.black : Colors.white,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PINDAI OBAT FISIK',
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 18,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Arahkan kamera ke kemasan obat untuk mendengarkan nama dan dosis otomatis.',
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Card 2: Rekam Arahan Dokter (Bolo Doctor)
            Semantics(
              label: 'Tombol Rekam Suara Konsultasi Dokter Pasca Pemeriksaan.',
              button: true,
              child: InkWell(
                onTap: () {
                  provider.triggerHaptic('click');
                  onNavigateTab(3); // Konsultasi tab
                },
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: isHC ? Colors.black : const Color(0xFF131B2E),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isHC ? const Color(0xFFFFE600) : Colors.white12,
                      width: isHC ? 3 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        height: 52,
                        width: 52,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: isHC
                              ? const Color(0xFFFFE600).withValues(alpha: 0.2)
                              : Colors.blue.withValues(alpha: 0.2),
                        ),
                        child: Icon(
                          Icons.mic,
                          size: 28,
                          color: isHC ? const Color(0xFFFFE600) : Colors.blueAccent,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Rekam Arahan Dokter',
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Dikte suara dokter saat konsultasi untuk dicocokkan otomatis saat pindai di rumah.',
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right,
                        color: isHC ? const Color(0xFFFFE600) : Colors.white38,
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Grid Navigasi Cepat
            Row(
              children: [
                Expanded(
                  child: _QuickTile(
                    title: 'Lemari Obat',
                    subtitle: '$totalMeds Terdaftar',
                    icon: Icons.medication,
                    isHC: isHC,
                    onTap: () => onNavigateTab(1),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickTile(
                    title: 'Jadwal Minum',
                    subtitle: nextPending != null
                        ? 'Jam ${nextPending.time}'
                        : 'Semua Selesai',
                    icon: Icons.access_time_filled,
                    isHC: isHC,
                    onTap: () => onNavigateTab(4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showA11yDialog(BuildContext context, MedicineProvider provider) {
    showModalBottomSheet(
      context: context,
      backgroundColor: provider.profile.settings.highContrast
          ? Colors.black
          : const Color(0xFF131B2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final s = provider.profile.settings;
            final isHC = s.highContrast;

            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Pengaturan Aksesibilitas (Ramah Netra)',
                    style: TextStyle(
                      color: isHC ? const Color(0xFFFFE600) : Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: Text('Kontras Tinggi Kuning-Hitam (WCAG AAA)',
                        style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white)),
                    value: s.highContrast,
                    activeThumbColor: const Color(0xFFFFE600),
                    onChanged: (val) {
                      setModalState(() => s.highContrast = val);
                      provider.updateAccessibility(s);
                    },
                  ),
                  SwitchListTile(
                    title: Text('Huruf Ekstra Besar (A+)',
                        style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white)),
                    value: s.largeFont,
                    activeThumbColor: const Color(0xFFFFE600),
                    onChanged: (val) {
                      setModalState(() => s.largeFont = val);
                      provider.updateAccessibility(s);
                    },
                  ),
                  SwitchListTile(
                    title: Text('Umpan Balik Getaran Haptic',
                        style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white)),
                    value: s.hapticFeedback,
                    activeThumbColor: const Color(0xFFFFE600),
                    onChanged: (val) {
                      setModalState(() => s.hapticFeedback = val);
                      provider.updateAccessibility(s);
                    },
                  ),
                  ListTile(
                    leading: Icon(Icons.person, color: isHC ? const Color(0xFFFFE600) : Colors.blueAccent),
                    title: Text(
                      'Ubah Nama Pengguna (${provider.profile.name})',
                      style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      'Ketuk untuk mengganti nama via suara atau keyboard',
                      style: TextStyle(color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.6) : Colors.white60, fontSize: 11),
                    ),
                    onTap: () {
                      Navigator.pop(ctx);
                      _showEditNameDialog(context, provider);
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showEditNameDialog(BuildContext context, MedicineProvider provider) {
    final controller = TextEditingController(text: provider.profile.name);
    final isHC = provider.profile.settings.highContrast;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isHC ? Colors.black : const Color(0xFF131B2E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: isHC ? const Color(0xFFFFE600) : Colors.white12, width: isHC ? 3 : 1),
        ),
        title: Text(
          'Ubah Nama Pengguna',
          style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white, fontWeight: FontWeight.bold),
        ),
        content: TextField(
          controller: controller,
          style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white),
          decoration: InputDecoration(
            hintText: 'Masukkan nama baru...',
            hintStyle: TextStyle(color: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.5) : Colors.white38),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Batal', style: TextStyle(color: isHC ? const Color(0xFFFFE600) : Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isHC ? const Color(0xFFFFE600) : Colors.blueAccent,
              foregroundColor: isHC ? Colors.black : Colors.white,
            ),
            onPressed: () {
              final newName = controller.text.trim();
              if (newName.isNotEmpty) {
                provider.completeOnboarding(newName);
                Navigator.pop(ctx);
              }
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }
}

class _QuickTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isHC;
  final VoidCallback onTap;

  const _QuickTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isHC,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
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
            Icon(
              icon,
              size: 28,
              color: isHC ? const Color(0xFFFFE600) : Colors.blueAccent,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                color: isHC ? const Color(0xFFFFE600) : Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
