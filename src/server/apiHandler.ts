import fs from "fs";
import path from "path";

// Read environment variables
let geminiApiKey = process.env["GEMINI_API_KEY"] || "";
let ninerouterBaseUrl = process.env["NINEROUTER_BASE_URL"] || "http://127.0.0.1:20128/v1";
let ninerouterApiKey = process.env["NINEROUTER_API_KEY"] || "";
let ninerouterModel = process.env["NINEROUTER_MODEL"] || "ag/gemini-3.8-flash-high";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (key === "GEMINI_API_KEY" && !process.env["GEMINI_API_KEY"]) geminiApiKey = val;
        if (key === "NINEROUTER_BASE_URL" && !process.env["NINEROUTER_BASE_URL"]) ninerouterBaseUrl = val;
        if (key === "NINEROUTER_API_KEY" && !process.env["NINEROUTER_API_KEY"]) ninerouterApiKey = val;
        if (key === "NINEROUTER_MODEL" && !process.env["NINEROUTER_MODEL"]) ninerouterModel = val;
      }
    }
  }
} catch (e) {
  console.warn("Failed reading .env.local:", e);
}

// Universal AI Completion (9Router Primary with Gemini Fallback)
async function callAiCompletion({
  systemInstruction,
  prompt,
  imageBase64,
  temperature = 0.2,
}: {
  systemInstruction?: string;
  prompt: string;
  imageBase64?: string;
  temperature?: number;
}): Promise<string> {
  // 1. Prioritas Utama: 9Router (ag/gemini-3.8-flash-high)
  if (ninerouterApiKey || ninerouterBaseUrl) {
    try {
      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }

      if (imageBase64) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        });
      } else {
        messages.push({ role: "user", content: prompt });
      }

      const aiRes = await fetch(`${ninerouterBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ninerouterApiKey}`,
        },
        body: JSON.stringify({
          model: ninerouterModel,
          messages,
          stream: false,
          temperature,
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        const reply = aiJson.choices?.[0]?.message?.content;
        if (reply) return reply;
      } else {
        const errText = await aiRes.text();
        console.warn(`9Router HTTP ${aiRes.status}:`, errText.slice(0, 150));
      }
    } catch (err: any) {
      console.warn("9Router call error, checking fallback:", err.message);
    }
  }

  // 2. Fallback: Google Gemini Official REST API jika 9Router tidak merespons
  const activeGeminiKey = process.env["GEMINI_API_KEY"] || geminiApiKey;
  if (activeGeminiKey) {
    const models = ["gemini-3.5-flash"];
    const fullText = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    const parts: any[] = [{ text: fullText }];

    if (imageBase64) {
      let cleanB64 = imageBase64;
      let mimeType = "image/jpeg";
      if (cleanB64.startsWith("data:")) {
        const match = cleanB64.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1] || "image/jpeg";
          cleanB64 = match[2] || "";
        }
      }
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: cleanB64,
        },
      });
    }

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature,
            },
          }),
          signal: AbortSignal.timeout(45000),
        });

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (err: any) {
        console.warn(`Gemini fallback error:`, err.message);
      }
    }
  }

  throw new Error("Gagal memproses permintaan AI melalui 9Router.");
}

export async function handleApiRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. POST /api/analyze
    if (pathname === "/api/analyze" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { image, query, existingMedicines = [], allergies = [], conditions = [] } = body;

      if (!image && !query) {
        return new Response(JSON.stringify({ error: "Foto kemasan obat atau nama obat diperlukan." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const systemPrompt = `Anda adalah sistem AI farmakologi klinis resmi MediLens AI.
Tugas Anda adalah menganalisis obat dari gambar kemasan obat/resep dokter atau dari nama obat yang diberikan.
Berikan informasi medis akurat, komprehensif, dan mudah dipahami oleh pasien dalam format JSON murni TANPA markdown formatting, TANPA backtick, TANPA pembungkus \`\`\`json.

Format JSON yang WAJIB dihasilkan:
{
  "nama": "Nama dagang lengkap dan dosis, misal: Amlodipine Besylate 5 mg",
  "namaGenerik": "Nama generik zat aktif, misal: Amlodipine",
  "kandungan": "Zat aktif dan kekuatan per tablet/kapsul/ml",
  "kategori": "Obat Bebas / Obat Bebas Terbatas / Obat Keras (Resep Dokter)",
  "bentuk": "Tablet / Kapsul / Sirup / Salep / Kaplet",
  "bpom": "Nomor izin edar BPOM atau estimasi format BPOM bila tidak terlihat jelas di kemasan",
  "kadaluarsa": "Tanggal kadaluarsa terdeteksi atau 'Periksa pada kemasan'",
  "indikasi": "Kegunaan utama obat bagi pasien secara ringkas dan jelas",
  "aturanPakai": "Dosis standar dan anjuran frekuensi (misal: 1 tablet 1x sehari)",
  "waktuOptimal": "pagi / siang / sore / malam",
  "timing": "sebelum_makan / setelah_makan / bersama_makan",
  "rekomendasiJam": "07:00 / 12:00 / 19:00 / 21:00",
  "peringatan": "Peringatan keselamatan penting yang wajib diketahui pasien",
  "efekSamping": ["Efek samping umum 1", "Efek samping umum 2", "Efek samping umum 3"],
  "pantangan": [
    { "makanan": "Nama makanan/minuman", "alasan": "Alasan farmakologis", "bahaya": "Tinggi/Sedang" }
  ],
  "interaksi": [
    { "obat": "Nama obat lain", "tingkat": "Mayor/Moderat/Minor", "catatan": "Dampak interaksi dan anjuran jeda waktu" }
  ],
  "cocokProfil": {
    "peringatanAlergi": "Peringatan bila zat aktif/turunannya bertentangan dengan alergi pasien: [${allergies.join(", ")}]",
    "peringatanKondisi": "Peringatan bila bertentangan dengan kondisi penyakit pasien: [${conditions.join(", ")}]"
  },
  "teksPanduanSuara": "Teks ringkas 2-3 kalimat yang ramah dan menenangkan untuk dibacakan oleh asisten suara kepada lansia atau tunanetra"
}`;

      const userPrompt = image
        ? `Pindai dan analisis kemasan obat/resep ini. Obat yang sedang dikonsumsi pasien: ${JSON.stringify(existingMedicines)}. Riwayat alergi pasien: ${JSON.stringify(allergies)}. Kondisi medis pasien: ${JSON.stringify(conditions)}.`
        : `Analisis obat ini: "${query}". Obat lain yang diminum pasien: ${JSON.stringify(existingMedicines)}. Riwayat alergi pasien: ${JSON.stringify(allergies)}. Kondisi medis: ${JSON.stringify(conditions)}.`;

      let rawText = await callAiCompletion({
        systemInstruction: systemPrompt,
        prompt: userPrompt,
        imageBase64: image,
        temperature: 0.1,
      });
      // Strip markdown codeblocks if model included them
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn("Could not parse AI output as JSON directly, attempting recovery:", rawText);
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsedData = JSON.parse(match[0]);
        } else {
          parsedData = {
            nama: query || "Obat Terdeteksi",
            indikasi: rawText,
            aturanPakai: "Konsultasikan dengan apoteker atau dokter",
            peringatan: "Pastikan membaca label fisik obat.",
          };
        }
      }

      return new Response(JSON.stringify({ success: true, data: parsedData }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. POST /api/chat
    if (pathname === "/api/chat" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { messages = [], medicines = [], profile = {} } = body;

      const systemPrompt = `Anda adalah Asisten Dokter & Apoteker MediLens AI.
Anda membantu pasien memahami obat mereka, jadwal konsumsi, cara pakai, efek samping, dan pantangan makanan.
Jawab dengan ramah, jelas, solutif, berbasis bukti klinis farmakologi, dan menggunakan bahasa Indonesia yang santun.

Konteks Pasien:
- Profil: Nama: ${profile.name || "Pasien"}, Usia: ${profile.age || "-"}, Kondisi: ${profile.conditions?.join(", ") || "Tidak ada"}, Alergi: ${profile.allergies?.join(", ") || "Tidak ada"}
- Daftar Obat Aktif Pasien: ${medicines.map((m: any) => `${m.name} (${m.dosage || ""}, ${m.instructions || ""})`).join("; ") || "Belum ada obat terdaftar"}

Aturan penting:
1. Berikan jawaban yang ringkas dan terstruktur (gunakan poin bila perlu).
2. Jika pasien bertanya tentang obat yang berpotensi interaksi atau memicu alergi mereka, TEGASKAN peringatan tersebut.
3. Selalu sertakan kalimat penutup edukatif bahwa rekomendasi ini adalah panduan medis dan jika ada gejala darurat segera hubungi dokter.`;

      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const historyContext = messages
        .slice(0, -1)
        .map((m: any) => `${m.role === "user" ? "Pasien" : "Dokter"}: ${m.content}`)
        .join("\n");

      const promptWithHistory = historyContext
        ? `Riwayat Percakapan:\n${historyContext}\n\nPertanyaan Pasien: ${lastUserMsg}`
        : lastUserMsg;

      const reply = await callAiCompletion({
        systemInstruction: systemPrompt,
        prompt: promptWithHistory,
        temperature: 0.3,
      });

      return new Response(JSON.stringify({ success: true, reply }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. GET /api/pharmacies
    if (pathname === "/api/pharmacies" && req.method === "GET") {
      const lat = url.searchParams.get("lat");
      const lon = url.searchParams.get("lon");
      const q = url.searchParams.get("q") || "Yogyakarta";

      let nominatimUrl = "";
      if (lat && lon) {
        nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=apotek&bounded=1&viewbox=${Number(lon) - 0.08},${Number(lat) + 0.08},${Number(lon) + 0.08},${Number(lat) - 0.08}&limit=15`;
      } else {
        nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=apotek+${encodeURIComponent(q)}&limit=15`;
      }

      try {
        const osmRes = await fetch(nominatimUrl, {
          headers: { "User-Agent": "MediLensAI/1.0 (contact: arrafi.nur24@students.utdi.ac.id)" },
          signal: AbortSignal.timeout(6000),
        });

        if (osmRes.ok) {
          const items = await osmRes.json();
          const results = items.map((item: any) => {
            const itemLat = parseFloat(item.lat);
            const itemLon = parseFloat(item.lon);
            let distanceKm: number | null = null;
            if (lat && lon) {
              const R = 6371; // km
              const dLat = ((itemLat - parseFloat(lat)) * Math.PI) / 180;
              const dLon = ((itemLon - parseFloat(lon)) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((parseFloat(lat) * Math.PI) / 180) *
                  Math.cos((itemLat * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              distanceKm = Math.round(R * c * 10) / 10;
            }

            return {
              id: item.place_id,
              name: item.name || item.display_name.split(",")[0],
              address: item.display_name,
              lat: itemLat,
              lon: itemLon,
              distanceKm,
              isOpen24Hours: item.display_name.toLowerCase().includes("k-24") || item.display_name.toLowerCase().includes("24 jam"),
              mapUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLon}`,
            };
          });

          return new Response(JSON.stringify({ success: true, count: results.length, data: results }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (osmErr) {
        console.warn("OSM Nominatim fetch failed, serving fallback nearby list:", osmErr);
      }

      // Real Fallback Pharmacies in Indonesia (Yogyakarta / Jakarta)
      const fallbackPharmacies = [
        {
          id: "fb-1",
          name: "Apotek K-24 Gejayan",
          address: "Jl. Affandi No. 25, Sleman, DI Yogyakarta",
          lat: -7.7712,
          lon: 110.3892,
          distanceKm: 0.8,
          isOpen24Hours: true,
          phone: "(0274) 543210",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=Apotek+K-24+Gejayan",
        },
        {
          id: "fb-2",
          name: "Apotek Kimia Farma Kaliurang",
          address: "Jl. Kaliurang Km 5.5, Depok, Sleman, DI Yogyakarta",
          lat: -7.7584,
          lon: 110.3814,
          distanceKm: 1.4,
          isOpen24Hours: true,
          phone: "(0274) 589123",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=Apotek+Kimia+Farma+Kaliurang",
        },
        {
          id: "fb-3",
          name: "Apotek Panasea Kenari",
          address: "Jl. Kenari No. 12, Muja Muju, Umbulharjo, Kota Yogyakarta",
          lat: -7.7981,
          lon: 110.3842,
          distanceKm: 2.1,
          isOpen24Hours: false,
          phone: "(0274) 554321",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=Apotek+Panasea+Kenari",
        },
        {
          id: "fb-4",
          name: "Apotek Viva Generik Gejayan",
          address: "Jl. Jembatan Merah No. 4, Condongcatur, Sleman",
          lat: -7.7651,
          lon: 110.3955,
          distanceKm: 2.7,
          isOpen24Hours: false,
          phone: "(0274) 887654",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=Apotek+Viva+Generik",
        },
      ];

      return new Response(JSON.stringify({ success: true, count: fallbackPharmacies.length, data: fallbackPharmacies }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. GET /api/tts
    if (pathname === "/api/tts" && req.method === "GET") {
      const text = url.searchParams.get("text");
      if (!text) {
        return new Response(JSON.stringify({ error: "Parameter 'text' diperlukan." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cleanText = text.replace(/[*_#`[\]()]/g, " ").slice(0, 500).trim();
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

      try {
        const ttsRes = await fetch(ttsUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(6000),
        });

        if (ttsRes.ok) {
          const audioBuf = await ttsRes.arrayBuffer();
          return new Response(audioBuf, {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch (err: any) {
        console.warn("TTS fetch error:", err);
      }

      return new Response(JSON.stringify({ error: "Gagal memproses audio suara" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Internal server error",
        name: err.name,
        cause: err.cause ? String(err.cause) : undefined,
        stack: err.stack ? err.stack.split("\n").slice(0, 5) : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
