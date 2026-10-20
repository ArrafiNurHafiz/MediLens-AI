export interface FoodRestriction {
  id: string;
  name: string;
  category: 'fruit' | 'drink' | 'dairy' | 'alcohol' | 'food';
  categoryLabel: string;
  severity: 'warning' | 'caution' | 'safe';
  severityLabel: string;
  iconName: string;
  relatedDrugs: string[];
  description: string;
  scientificReason: string;
  safeAlternative: string;
}

export const FOOD_RESTRICTIONS: FoodRestriction[] = [
  {
    id: "jeruk-bali",
    name: "Jeruk Bali (Grapefruit / Pomelo)",
    category: "fruit",
    categoryLabel: "Buah-buahan",
    severity: "warning",
    severityLabel: "Hindari Total",
    iconName: "Citrus",
    relatedDrugs: ["Simvastatin 20 mg"],
    description: "Sangat berbahaya jika dikonsumsi bersamaan atau dalam jarak 24 jam dengan Simvastatin.",
    scientificReason: "Mengandung senyawa furanocoumarin yang memblokir enzim usus CYP3A4 secara permanen, menyebabkan kadar Simvastatin dalam darah melonjak hingga 15 kali lipat. Berisiko tinggi memicu kerusakan jaringan otot berat (rhabdomyolysis) dan gagal ginjal akut.",
    safeAlternative: "Jeruk manis lokal, apel, pisang, pir, semangka, atau pepaya."
  },
  {
    id: "kopi-kafein",
    name: "Kopi & Minuman Berkafein Tinggi",
    category: "drink",
    categoryLabel: "Minuman",
    severity: "caution",
    severityLabel: "Beri Jeda & Batasi",
    iconName: "Coffee",
    relatedDrugs: ["Amlodipine Besylate 5 mg", "Omeprazole 20 mg"],
    description: "Dapat memicu lonjakan tekanan darah sementara dan merangsang produksi asam lambung berlebih.",
    scientificReason: "Kafein memblokir adenosin yang memicu vasokonstriksi pembuluh darah, melemahkan efek penurunan tensi dari Amlodipine. Selain itu, kafein mengendurkan sfingter esofagus bawah sehingga memperburuk gejala GERD pada pasien yang mengonsumsi Omeprazole.",
    safeAlternative: "Beri jeda minimal 2 jam setelah minum obat. Batasi maksimal 1 cangkir kecil per hari atau beralih ke teh herbal hangat chamomile."
  },
  {
    id: "susu-kalsium",
    name: "Susu Sapi & Produk Olahan Susu",
    category: "dairy",
    categoryLabel: "Susu & Dairy",
    severity: "caution",
    severityLabel: "Beri Jeda 2 Jam",
    iconName: "Milk",
    relatedDrugs: ["Omeprazole 20 mg"],
    description: "Jangan meminum obat lambung langsung menggunakan susu sapi kental.",
    scientificReason: "Meskipun susu terasa menyejukkan sesaat di lambung, kalsium dan kasein di dalamnya merangsang sel parietal lambung memproduksi lebih banyak asam lambung (asam rebound), mengurangi efektivitas Omeprazole.",
    safeAlternative: "Gunakan selalu air putih matang suhu ruang saat menelan obat. Susu boleh diminum 2 jam setelah atau sebelum waktu minum obat."
  },
  {
    id: "alkohol",
    name: "Minuman Beralkohol",
    category: "alcohol",
    categoryLabel: "Alkohol",
    severity: "warning",
    severityLabel: "Hindari Total",
    iconName: "Wine",
    relatedDrugs: ["Amlodipine Besylate 5 mg", "Simvastatin 20 mg", "Omeprazole 20 mg"],
    description: "Sangat dilarang selama masa terapi pengobatan aktif.",
    scientificReason: "Kombinasi alkohol dengan Amlodipine memicu vasodilatasi ekstrem dan hipotensi ortostatik (pusing mendadak hingga pingsan). Dengan Simvastatin, alkohol menggandakan stres hepatotoksik pada sel hati.",
    safeAlternative: "Air mineral, air kelapa murni, atau jus buah segar alami non-sitrus pekat."
  }
];
