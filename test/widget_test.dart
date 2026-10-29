import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:medilens_ai/main.dart';
import 'package:medilens_ai/providers/medicine_provider.dart';

void main() {
  setUp(() {
    TestWidgetsFlutterBinding.ensureInitialized();
  });

  testWidgets('First launch displays zero-login WelcomeNameScreen with voice default', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    SharedPreferences.setMockInitialValues({
      'medilens_fresh_v2_onboarded': false,
    });

    final provider = MedicineProvider();
    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: provider,
        child: const MediLensApp(),
      ),
    );
    await tester.pump();

    // Verify first launch zero-login welcome screen
    expect(find.text('Siapa Nama Anda?'), findsOneWidget);
    expect(find.text('Tanpa Login Akun'), findsOneWidget);
    expect(find.text('Ketuk untuk Bicara (Default Suara)'), findsOneWidget);
    expect(find.text('Nama Anda (Opsional Keyboard):'), findsOneWidget);

    // Try submitting without name - should remain on welcome screen
    await tester.ensureVisible(find.byType(ElevatedButton));
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();
    expect(find.text('Siapa Nama Anda?'), findsOneWidget);

    // Fill name via keyboard
    await tester.enterText(find.byType(TextField), 'Budi Santoso');
    await tester.pump();

    // Scroll to button and tap to submit
    await tester.ensureVisible(find.byType(ElevatedButton));
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    // Verify seamless transition to Home Screen
    expect(find.text('Halo, Budi Santoso'), findsOneWidget);
    expect(find.text('PINDAI OBAT FISIK'), findsOneWidget);
  });

  testWidgets('Subsequent launch displays HomeScreen directly', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    SharedPreferences.setMockInitialValues({
      'medilens_fresh_v2_onboarded': true,
      'medilens_fresh_v2_profile': '{"name":"Ahmad Fauzi"}',
    });

    final provider = MedicineProvider();
    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: provider,
        child: const MediLensApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Halo, Ahmad Fauzi'), findsOneWidget);
    expect(find.text('PINDAI OBAT FISIK'), findsOneWidget);
  });
}
