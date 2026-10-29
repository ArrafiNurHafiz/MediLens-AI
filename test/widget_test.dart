import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:medilens_ai/main.dart';
import 'package:medilens_ai/providers/medicine_provider.dart';

void main() {
  testWidgets('MediLensApp loads smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => MedicineProvider(),
        child: const MediLensApp(),
      ),
    );

    // Verify main branding and navigation
    expect(find.text('PINDAI OBAT FISIK'), findsOneWidget);
    expect(find.text('Beranda'), findsOneWidget);
  });
}
