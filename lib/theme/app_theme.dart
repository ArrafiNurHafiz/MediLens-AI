import 'package:flutter/material.dart';

class AppTheme {
  // Mode Standar (Dark Medical Luxury)
  static const Color darkBackground = Color(0xFF090D16);
  static const Color darkSurface = Color(0xFF131B2E);
  static const Color darkCard = Color(0xFF1C2640);
  static const Color primaryBlue = Color(0xFF2563EB);
  static const Color primaryEmerald = Color(0xFF10B981);
  static const Color accentAmber = Color(0xFFF59E0B);
  static const Color accentRose = Color(0xFFEF4444);

  // Mode Kontras Tinggi WCAG AAA (Tunanetra & Low-Vision)
  static const Color highContrastBg = Color(0xFF000000);
  static const Color highContrastYellow = Color(0xFFFFE600);
  static const Color highContrastSurface = Color(0xFF1A1A00);
  static const Color highContrastBorder = Color(0xFFFFE600);

  static ThemeData getTheme({required bool highContrast, required bool largeFont}) {
    if (highContrast) {
      return ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: highContrastBg,
        primaryColor: highContrastYellow,
        colorScheme: const ColorScheme.dark(
          primary: highContrastYellow,
          secondary: highContrastYellow,
          surface: highContrastBg,
          onPrimary: Colors.black,
          onSurface: highContrastYellow,
        ),
        textTheme: TextTheme(
          displayLarge: TextStyle(
            color: highContrastYellow,
            fontSize: largeFont ? 34 : 28,
            fontWeight: FontWeight.w900,
          ),
          titleLarge: TextStyle(
            color: highContrastYellow,
            fontSize: largeFont ? 24 : 20,
            fontWeight: FontWeight.w900,
          ),
          bodyLarge: TextStyle(
            color: highContrastYellow,
            fontSize: largeFont ? 20 : 16,
            fontWeight: FontWeight.w800,
          ),
          bodyMedium: TextStyle(
            color: highContrastYellow,
            fontSize: largeFont ? 17 : 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      );
    }

    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBackground,
      primaryColor: primaryBlue,
      colorScheme: const ColorScheme.dark(
        primary: primaryBlue,
        secondary: primaryEmerald,
        surface: darkSurface,
        onPrimary: Colors.white,
        onSurface: Colors.white,
      ),
      textTheme: TextTheme(
        displayLarge: TextStyle(
          color: Colors.white,
          fontSize: largeFont ? 32 : 26,
          fontWeight: FontWeight.w800,
        ),
        titleLarge: TextStyle(
          color: Colors.white,
          fontSize: largeFont ? 22 : 18,
          fontWeight: FontWeight.w700,
        ),
        bodyLarge: TextStyle(
          color: Colors.white,
          fontSize: largeFont ? 18 : 15,
          fontWeight: FontWeight.w500,
        ),
        bodyMedium: TextStyle(
          color: const Color(0xFF94A3B8),
          fontSize: largeFont ? 16 : 13,
          fontWeight: FontWeight.w400,
        ),
      ),
    );
  }
}
