import { db } from "@/lib/db";

// Серверный компонент — обновляется при каждом запросе страницы
export async function StatsBar() {
  const settings = await db.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const stats = [
    { label: "КЛИЕНТОВ", value: map.stats_clients || "12 800+", color: "#BFFF00" },
    { label: "АККАУНТОВ", value: map.stats_accounts || "5 200+", color: "#FF2D87" },
    { label: "РЕЙТИНГ", value: `${map.stats_rating || "4.9"}/5`, color: "#FFE600" },
    { label: "АПТАЙМ", value: map.stats_support || "24/7", color: "#00F0FF" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-2xl mx-auto">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-[#121212] border-2 p-3 md:p-4 text-left"
          style={{
            borderColor: `${s.color}40`,
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}
        >
          <div className="text-lg md:text-2xl font-black leading-none mb-1 font-mono" style={{ color: s.color }}>
            {s.value}
          </div>
          <div className="text-[10px] md:text-[11px] text-[#888] font-mono uppercase tracking-wider leading-tight">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
