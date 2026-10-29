import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../providers/medicine_provider.dart';

class WelcomeNameScreen extends StatefulWidget {
  const WelcomeNameScreen({super.key});

  @override
  State<WelcomeNameScreen> createState() => _WelcomeNameScreenState();
}

class _WelcomeNameScreenState extends State<WelcomeNameScreen> {
  final TextEditingController _nameController = TextEditingController();
  late stt.SpeechToText _speech;
  bool _isListening = false;
  Timer? _autoListenTimer;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<MedicineProvider>();
      provider.triggerHaptic('success');
      provider.speak(
        'Selamat datang di MediLens AI. Pendaftaran instan tanpa login akun. Nama Anda wajib diisi. Silakan sebutkan nama Anda setelah getaran.',
      );

      // Default menggunakan input suara: aktifkan mikrofon otomatis
      _autoListenTimer = Timer(const Duration(milliseconds: 4000), () {
        if (mounted && _nameController.text.trim().isEmpty) {
          _startListening();
        }
      });
    });
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
      provider.triggerHaptic('click');

      _speech.listen(
        onResult: (val) {
          if (mounted) {
            final words = val.recognizedWords.trim();
            if (words.isNotEmpty) {
              setState(() {
                _nameController.text = _formatName(words);
              });
            }
            if (val.finalResult && words.isNotEmpty) {
              final formatted = _formatName(words);
              provider.triggerHaptic('success');
              provider.speak(
                'Nama Anda $formatted. Ketuk tombol Masuk di bawah atau ketuk layar dua kali untuk mulai.',
              );
            }
          }
        },
      );
    } else {
      provider.speak('Mikrofon suara tidak dapat diakses. Silakan gunakan keyboard di bawah.');
    }
  }

  String _formatName(String raw) {
    if (raw.isEmpty) return raw;
    return raw.split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }

  void _submitName() {
    final name = _nameController.text.trim();
    final provider = context.read<MedicineProvider>();

    if (name.isEmpty) {
      provider.triggerHaptic('alert');
      provider.speak(
        'Nama wajib diisi sebelum melanjutkan. Silakan sebutkan nama Anda melalui mikrofon atau ketik menggunakan keyboard.',
      );
      return;
    }

    _speech.stop();
    _autoListenTimer?.cancel();
    provider.completeOnboarding(name);
  }

  @override
  void dispose() {
    _autoListenTimer?.cancel();
    _speech.stop();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MedicineProvider>();
    final isHC = provider.profile.settings.highContrast;

    return Scaffold(
      backgroundColor: isHC ? Colors.black : const Color(0xFF090D16),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 12),

                // Logo & App Branding
                Center(
                  child: Column(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.asset(
                          'assets/images/logo.png',
                          height: 72,
                          width: 72,
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, err, stack) => Icon(
                            Icons.lens,
                            size: 72,
                            color: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'MediLens AI',
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Asisten Pintar Keamanan Obat Ramah Disabilitas',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Zero-Login Banner & Instruction
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: isHC ? Colors.black : const Color(0xFF131B2E),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isHC ? const Color(0xFFFFE600) : Colors.white12,
                      width: isHC ? 3 : 1.5,
                    ),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.lock_open,
                            size: 20,
                            color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Tanpa Login Akun',
                            style: TextStyle(
                              color: isHC ? const Color(0xFFFFE600) : const Color(0xFF34D399),
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Siapa Nama Anda?',
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Nama wajib diisi agar asisten dapat menyapa dan mengonfirmasi resep obat Anda dengan tepat.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFFCBD5E1),
                          fontSize: 13,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Giant Voice Input Microphone Button (DEFAULT INPUT: SUARA)
                Center(
                  child: Column(
                    children: [
                      Semantics(
                        label: _isListening
                            ? 'Sedang mendengarkan suara Anda. Sebutkan nama Anda.'
                            : 'Ketuk untuk menyebutkan nama Anda lewat suara.',
                        button: true,
                        child: InkWell(
                          onTap: _startListening,
                          borderRadius: BorderRadius.circular(60),
                          child: Container(
                            height: 110,
                            width: 110,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _isListening
                                  ? Colors.redAccent
                                  : (isHC ? const Color(0xFFFFE600) : const Color(0xFF2563EB)),
                              boxShadow: [
                                BoxShadow(
                                  color: (_isListening
                                          ? Colors.redAccent
                                          : (isHC ? const Color(0xFFFFE600) : Colors.blue))
                                      .withValues(alpha: 0.35),
                                  blurRadius: 28,
                                  spreadRadius: 6,
                                ),
                              ],
                            ),
                            child: Icon(
                              _isListening ? Icons.mic : Icons.mic_none,
                              size: 54,
                              color: isHC ? Colors.black : Colors.white,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        _isListening ? 'Mendengarkan... Sebutkan Nama Anda' : 'Ketuk untuk Bicara (Default Suara)',
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Suara aktif otomatis untuk tunanetra',
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Optional Keyboard Input (OPSIONAL KEYBOARD)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
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
                            child: Text(
                              'Nama Anda (Opsional Keyboard):',
                              style: TextStyle(
                                color: isHC ? const Color(0xFFFFE600) : const Color(0xFF94A3B8),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Text(
                            'Wajib Diisi',
                            style: TextStyle(
                              color: isHC ? const Color(0xFFFFE600) : Colors.amberAccent,
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _nameController,
                        style: TextStyle(
                          color: isHC ? const Color(0xFFFFE600) : Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Ketik nama jika suara kurang jelas...',
                          hintStyle: TextStyle(
                            color: isHC
                                ? const Color(0xFFFFE600).withValues(alpha: 0.5)
                                : const Color(0xFF64748B),
                            fontSize: 14,
                          ),
                          border: InputBorder.none,
                          suffixIcon: _nameController.text.isNotEmpty
                              ? IconButton(
                                  icon: Icon(
                                    Icons.clear,
                                    color: isHC ? const Color(0xFFFFE600) : Colors.white54,
                                  ),
                                  onPressed: () {
                                    setState(() => _nameController.clear());
                                  },
                                )
                              : null,
                        ),
                        onChanged: (val) => setState(() {}),
                        onSubmitted: (val) => _submitName(),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Submit / Enter Button
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _nameController.text.trim().isNotEmpty
                        ? (isHC ? const Color(0xFFFFE600) : const Color(0xFF10B981))
                        : Colors.grey.shade800,
                    foregroundColor: isHC ? Colors.black : Colors.white,
                    minimumSize: const Size.fromHeight(56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 6,
                  ),
                  icon: const Icon(Icons.arrow_forward, size: 22),
                  label: const Text(
                    'Simpan Nama & Masuk ke Aplikasi',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  onPressed: _submitName,
                ),

                const SizedBox(height: 16),

                // Audio Guidance Replay
                Center(
                  child: TextButton.icon(
                    style: TextButton.styleFrom(
                      foregroundColor: isHC ? const Color(0xFFFFE600) : const Color(0xFF38BDF8),
                    ),
                    icon: const Icon(Icons.volume_up, size: 18),
                    label: const Text(
                      'Putar Ulang Panduan Suara',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      provider.speak(
                        'Pendaftaran instan tanpa login akun. Nama Anda wajib diisi. Silakan sebutkan nama Anda melalui tombol mikrofon, atau ketik menggunakan keyboard pada kolom di bawah.',
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
    );
  }
}
