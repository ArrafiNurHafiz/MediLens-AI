import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Phone, TopBar, BottomNav, speak, stopSpeech } from "@/components/medi";
import { useMedicine } from "@/lib/medicineContext";

export const Route = createFileRoute("/tanya")({
  head: () => ({
    meta: [
      { title: "Tanya AI Dokter — MediLens AI" },
      { name: "description", content: "Konsultasi cerdas keamanan obat, efek samping, dan pantangan makanan berbasis AI medis." },
    ],
  }),
  component: TanyaPage,
});

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

export default function TanyaPage() {
  const { medicines, profile, showToast, playFeedback } = useMedicine();

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: `Halo ${profile.name}! Saya asisten cerdas MediLens AI. Saya memantau ${medicines.length} obat di lemari Anda. Ada yang ingin Anda tanyakan seputar dosis, efek samping, aturan pakai, atau pantangan makanan?`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (profile.settings.autoVoice) {
      speak(
        `Asisten Dokter AI siap membantu ${profile.name}. Tekan tombol mikrofon di bawah untuk bertanya lewat suara.`,
        profile.settings.speechRate
      );
    }
  }, []);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.lang = "id-ID";
        reco.continuous = false;
        reco.interimResults = false;

        reco.onstart = () => {
          setIsListening(true);
        };

        reco.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            handleSendMessage(transcript);
          }
        };

        reco.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = reco;
      }
    }

    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [medicines, profile]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      showToast("Browser tidak mendukung pengenalan suara. Silakan ketik pertanyaan Anda.", "info");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeech();
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Could not start recognition:", e);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText("");
    const userMsg: ChatMsg = {
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    const newChatHistory = [...messages, userMsg];
    setMessages(newChatHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newChatHistory.map((m) => ({ role: m.role, content: m.content })),
          medicines: medicines.map((m) => ({
            name: m.name,
            dosage: m.dosage,
            instructions: m.instructions,
            indication: m.indication,
          })),
          profile: {
            name: profile.name,
            age: profile.age,
            allergies: profile.allergies,
            conditions: profile.conditions,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Gagal menghubungi AI Dokter.");
      }

      const data = await res.json();
      const replyText = data.reply || "Maaf, tidak ada jawaban dari server.";

      const aiMsg: ChatMsg = {
        role: "assistant",
        content: replyText,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      playFeedback("success");
      speak(replyText, profile.settings.speechRate);
      setIsSpeaking(true);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errMsg: ChatMsg = {
        role: "assistant",
        content: `Terjadi kendala saat memproses jawaban: ${err.message}. Pastikan koneksi internet Anda stabil.`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Apakah obat saya boleh diminum bersamaan?",
    "Apa efek samping paling umum obat saya?",
    "Bagaimana jika saya terlambat minum obat?",
    "Pantangan makanan apa yang wajib dihindari?",
  ];

  return (
    <Phone dark={true}>
      <TopBar
        title="Tanya Dokter & Farmasis AI"
        rightAction={
          isSpeaking ? (
            <button
              onClick={() => {
                stopSpeech();
                setIsSpeaking(false);
              }}
              className="text-rose-400 p-1 rounded-full bg-rose-500/20 active:scale-95"
              title="Hentikan Suara"
            >
              <VolumeX className="h-5 w-5" />
            </button>
          ) : null
        }
      />

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  isUser
                    ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`max-w-[82%] space-y-1 ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none font-medium"
                      : "bg-slate-800 border border-white/10 text-slate-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${isUser ? "justify-end" : "justify-start"}`}>
                  <span>{m.time}</span>
                  {!isUser && (
                    <button
                      onClick={() => {
                        speak(m.content);
                        setIsSpeaking(true);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-0.5"
                    >
                      <Volume2 className="h-3 w-3" /> Bacakan
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-white/10 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Dokter AI sedang menganalisis panduan klinis...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Pills */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] shrink-0 font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 px-3 py-1.5 rounded-full active:scale-95 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleMic}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-all ${
              isListening
                ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
            }`}
            title={isListening ? "Sedang Mendengarkan... Klik untuk berhenti" : "Bicara dengan Suara"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Mendengarkan suara Anda..." : "Ketik pertanyaan obat Anda..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading || isListening}
            className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-40 active:scale-95 transition-all shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <BottomNav />
    </Phone>
  );
}
