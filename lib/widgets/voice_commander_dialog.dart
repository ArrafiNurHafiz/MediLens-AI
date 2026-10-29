import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../providers/medicine_provider.dart';

class VoiceCommanderDialog extends StatefulWidget {
  final Function(int) onNavigateTab;

  const VoiceCommanderDialog({super.key, required this.onNavigateTab});

  @override
  State<VoiceCommanderDialog> createState() => _VoiceCommanderDialogState();
}

class _VoiceCommanderDialogState extends State<VoiceCommanderDialog> {
  late stt.SpeechToText _speech;
  bool _isListening = false;
  String _words = '';

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _startListening();
  }

  void _startListening() async {
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('click');
    provider.stopSpeech();

    bool available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'notListening' && mounted) {
          setState(() => _isListening = false);
        }
      },
      onError: (val) {
        if (mounted) setState(() => _isListening = false);
      },
    );

    if (available) {
      setState(() => _isListening = true);
      _speech.listen(
        onResult: (val) {
          if (mounted) {
            setState(() {
              _words = val.recognizedWords.toLowerCase();
            });
            if (val.finalResult) {
              _handleCommand(_words);
            }
          }
        },
      );
    } else {
      provider.speak('Mikrofon suara tidak tersedia pada perangkat.');
    }
  }

  void _handleCommand(String cmd) {
    final provider = context.read<MedicineProvider>();
    provider.triggerHaptic('success');

    if (cmd.contains('beranda') || cmd.contains('menu') || cmd.contains('home')) {
      provider.speak('Membuka beranda utama.');
      widget.onNavigateTab(0);
      Navigator.pop(context);
    } else if (cmd.contains('obat') || cmd.contains('lemari') || cmd.contains('daftar')) {
      provider.speak('Membuka daftar lemari obat.');
      widget.onNavigateTab(1);
      Navigator.pop(context);
    } else if (cmd.contains('scan') || cmd.contains('pindai') || cmd.contains('kamera')) {
      provider.speak('Membuka kamera pemindai obat.');
      widget.onNavigateTab(2);
      Navigator.pop(context);
    } else if (cmd.contains('konsultasi') || cmd.contains('dokter') || cmd.contains('suara dokter') || cmd.contains('rekam')) {
      provider.speak('Membuka perekam arahan suara dokter.');
      widget.onNavigateTab(3);
      Navigator.pop(context);
    } else if (cmd.contains('jadwal') || cmd.contains('jam') || cmd.contains('pengingat')) {
      provider.speak('Membuka jadwal minum obat.');
      widget.onNavigateTab(4);
      Navigator.pop(context);
    } else {
      provider.speak('Perintah "$cmd" belum dikenali. Katakan beranda, obat, scan, dokter, atau jadwal.');
    }
  }

  @override
  void dispose() {
    _speech.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;

    return Dialog(
      backgroundColor: isHC ? Colors.black : const Color(0xFF131B2E),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(28),
        side: BorderSide(
          color: isHC ? const Color(0xFFFFE600) : Colors.white12,
          width: isHC ? 3 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 80,
              width: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isListening
                    ? (isHC ? const Color(0xFFFFE600) : Colors.redAccent)
                    : Colors.white12,
              ),
              child: Icon(
                Icons.mic,
                size: 44,
                color: _isListening
                    ? (isHC ? Colors.black : Colors.white)
                    : (isHC ? const Color(0xFFFFE600) : Colors.white70),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              _isListening ? 'Mendengarkan Perintah Suara...' : 'Menunggu Suara',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isHC ? const Color(0xFFFFE600) : Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _words.isEmpty
                ? 'Katakan: "Buka Beranda", "Pindai Obat", "Suara Dokter", "Daftar Obat", atau "Jadwal"'
                : '"$_words"',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                fontSize: 13,
                fontStyle: _words.isEmpty ? FontStyle.normal : FontStyle.italic,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isHC ? const Color(0xFFFFE600) : Colors.white10,
                foregroundColor: isHC ? Colors.black : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
