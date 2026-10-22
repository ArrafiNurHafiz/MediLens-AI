import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Pill,
  Volume2,
  Calendar,
  Sparkles,
  Plus,
  Sun,
  Sunset,
  Moon,
  Coffee,
} from "lucide-react";
import { Phone, TopBar, BottomNav, speak } from "@/components/medi";
import { useMedicine, type ScheduleItem } from "@/lib/medicineContext";

export const Route = createFileRoute("/jadwal")({
  head: () => ({
    meta: [
      { title: "Jadwal Minum Obat — MediLens AI" },
      { name: "description", content: "Pengingat jadwal minum obat harian cerdas dengan panduan suara interaktif." },
    ],
  }),
  component: JadwalPage,
});

export default function JadwalPage() {
  const { schedule, toggleScheduleItem, profile, playFeedback } = useMedicine();
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Generate 5 days (2 days ago, yesterday, today, tomorrow, next day)
  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      offset,
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dateNum: d.getDate(),
      isToday: offset === 0,
    };
  });

  const slots = [
    { key: "pagi", title: "Pagi Hari", icon: Coffee, desc: "06:00 – 11:00 WIB", color: "text-amber-400 bg-amber-500/10" },
    { key: "siang", title: "Siang Hari", icon: Sun, desc: "11:00 – 15:00 WIB", color: "text-orange-400 bg-orange-500/10" },
    { key: "sore", title: "Sore Hari", icon: Sunset, desc: "15:00 – 18:00 WIB", color: "text-rose-400 bg-rose-500/10" },
    { key: "malam", title: "Malam Hari", icon: Moon, desc: "18:00 – 22:00 WIB", color: "text-indigo-400 bg-indigo-500/10" },
  ] as const;

  const total = schedule.length;
  const taken = schedule.filter((s) => s.taken).length;
  const percent = total > 0 ? Math.round((taken / total) * 100) : 100;

  useEffect(() => {
    if (profile.settings.autoVoice) {
      if (total === 0) {
        speak("Halaman jadwal minum obat. Belum ada jadwal terdaftar. Pindai obat Anda untuk membuat jadwal otomatis.", profile.settings.speechRate);
      } else {
        speak(`Halaman jadwal minum obat. Hari ini ada ${total} jadwal. ${taken} sudah diminum.`, profile.settings.speechRate);
      }
    }
  }, []);

  const speakFullSchedule = () => {
    playFeedback("click");
    if (schedule.length === 0) {
      speak("Belum ada jadwal minum obat yang terdaftar.", profile.settings.speechRate);
      return;
    }
    const text = `Jadwal hari ini. Ada ${total} obat. ${taken} sudah diminum. ` +
      schedule.map((s) => `Pukul ${s.time}, ${s.medicineName}, dosis ${s.dosage}, ${s.instruction}. ${s.taken ? "Status: sudah diminum." : "Status: belum diminum."}`).join(" ");
    speak(text, profile.settings.speechRate);
  };

  return (
    <Phone dark={true}>
      <TopBar title="Jadwal Minum Obat" />

      {/* Day Selector */}
      <div className="flex justify-between gap-2 px-4 pb-3 pt-2">
        {days.map(({ offset, dayName, dateNum, isToday }) => {
          const isSelected = selectedDayOffset === offset;
          return (
            <button
              key={offset}
              onClick={() => setSelectedDayOffset(offset)}
              className={`flex flex-1 flex-col items-center py-2.5 px-1 rounded-2xl transition-all ${
                isSelected
                  ? "bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-400"
                  : "bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider">{isToday ? "Hari Ini" : dayName}</span>
              <span className="text-lg font-extrabold mt-0.5">{dateNum}</span>
            </button>
          );
        })}
      </div>

      {/* Progress & Audio Summary Banner */}
      <div className="px-4 pb-3">
        <div className="rounded-2xl bg-slate-900 border border-white/10 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Progres Minum Obat</span>
            <span className="text-emerald-400 font-bold">{taken} dari {total} ({percent}%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
          <button
            onClick={speakFullSchedule}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30 active:scale-95 transition-all"
          >
            <Volume2 className="h-4 w-4" /> Dengarkan Seluruh Jadwal Hari Ini
          </button>
        </div>
      </div>

      {/* Schedule Items by Time Slot */}
      <div className="flex-1 rounded-t-3xl bg-slate-900 border-t border-white/10 p-4 text-white space-y-6 pb-8">
        {schedule.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 border border-white/10 mx-auto text-slate-500">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Belum Ada Jadwal Obat</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Pindai kemasan obat atau resep dokter Anda untuk membuat jadwal minum otomatis.
              </p>
            </div>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg"
            >
              <Plus className="h-4 w-4" /> Pindai Obat
            </Link>
          </div>
        ) : (
          slots.map((slot) => {
            const slotItems = schedule.filter((s) => s.timeSlot === slot.key);
            if (slotItems.length === 0) return null;

            const SlotIcon = slot.icon;
            return (
              <div key={slot.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`grid h-7 w-7 place-items-center rounded-lg ${slot.color}`}>
                    <SlotIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white leading-none">
                      {slot.title}
                    </h2>
                    <span className="text-[10px] text-slate-400">{slot.desc}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {slotItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-4 border transition-all ${
                        item.taken
                          ? "bg-slate-800/40 border-white/5 opacity-80"
                          : "bg-slate-800 border-white/10 shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                              item.taken ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            <Pill className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-white">{item.time} WIB</span>
                              <span className="text-[10px] text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded">
                                {item.timingLabel}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-white mt-0.5">{item.medicineName}</h3>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                              {item.dosage} • {item.instruction}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            playFeedback("click");
                            speak(
                              `Pukul ${item.time}, minum ${item.medicineName}, dosis ${item.dosage}, ${item.instruction}`,
                              profile.settings.speechRate
                            );
                          }}
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-700/80 text-emerald-400 hover:bg-slate-700 active:scale-95 transition-all"
                          title="Dengarkan Pengingat"
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        {item.taken ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Sudah diminum {item.takenAt ? `(pukul ${item.takenAt})` : ""}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                            <Clock className="h-4 w-4" />
                            <span>Menunggu waktu minum</span>
                          </div>
                        )}

                        <button
                          onClick={() => toggleScheduleItem(item.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
                            item.taken
                              ? "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                          }`}
                        >
                          {item.taken ? "Batal Tandai" : "Tandai Diminum"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </Phone>
  );
}
