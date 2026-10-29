import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/medicine_provider.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/doctor_consultation_screen.dart';
import 'screens/scan_screen.dart';
import 'screens/medicine_cabinet_screen.dart';
import 'screens/schedule_screen.dart';
import 'screens/welcome_name_screen.dart';
import 'widgets/voice_commander_dialog.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => MedicineProvider(),
      child: const MediLensApp(),
    ),
  );
}

class MediLensApp extends StatelessWidget {
  const MediLensApp({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final settings = provider.profile.settings;

    return MaterialApp(
      title: 'MediLens AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.getTheme(
        highContrast: settings.highContrast,
        largeFont: settings.largeFont,
      ),
      home: provider.isOnboarded
          ? const MainNavigationShell()
          : const WelcomeNameScreen(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  void _onSelectTab(int index) {
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;

    final List<Widget> screens = [
      HomeScreen(onNavigateTab: _onSelectTab),
      MedicineCabinetScreen(onNavigateTab: _onSelectTab),
      ScanScreen(onNavigateTab: _onSelectTab),
      DoctorConsultationScreen(onNavigateTab: _onSelectTab),
      const ScheduleScreen(),
    ];

    return Scaffold(
      body: SafeArea(child: screens[_currentIndex]),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isHC ? Colors.black : const Color(0xFF0F172A),
          border: Border(
            top: BorderSide(
              color: isHC ? const Color(0xFFFFE600) : Colors.white10,
              width: isHC ? 3 : 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onSelectTab,
          backgroundColor: Colors.transparent,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8),
          unselectedItemColor: isHC ? const Color(0xFFFFE600).withValues(alpha: 0.5) : const Color(0xFF64748B),
          selectedFontSize: 12,
          unselectedFontSize: 11,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Beranda'),
            BottomNavigationBarItem(icon: Icon(Icons.medication), label: 'Obat'),
            BottomNavigationBarItem(icon: Icon(Icons.camera_alt), label: 'Scan'),
            BottomNavigationBarItem(icon: Icon(Icons.mic), label: 'Dokter'),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Jadwal'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF2563EB),
        foregroundColor: isHC ? Colors.black : Colors.white,
        tooltip: 'Buka Komandan Suara',
        onPressed: () {
          showDialog(
            context: context,
            builder: (ctx) => VoiceCommanderDialog(onNavigateTab: _onSelectTab),
          );
        },
        child: const Icon(Icons.mic_none, size: 28),
      ),
    );
  }
}
