import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MedicineProvider } from "@/context/MedicineContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "MediLens AI – Asisten Pintar Keamanan Obat",
  description: "Pindai beberapa obat sekaligus, pahami risiko interaksi obat, pantangan makanan, jadwal konsumsi otomatis, dan panduan suara cerdas.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediLens AI"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MedicineProvider>
          <AppShell>{children}</AppShell>
        </MedicineProvider>
      </body>
    </html>
  );
}
