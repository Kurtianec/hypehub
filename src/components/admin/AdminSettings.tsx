"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Settings as SettingsIcon, Bitcoin, Wallet, Mail, Send, BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const TOKEN = "hypehub-admin-2024";

const FIELDS = [
  { group: "Основное", icon: SettingsIcon, fields: [
    { key: "site_name", label: "Название сайта", type: "text" },
    { key: "tagline", label: "Слоган", type: "text" },
  ]},
  { group: "Крипто-кошельки", icon: Bitcoin, fields: [
    { key: "crypto_btc", label: "BTC адрес", type: "text", mono: true },
    { key: "crypto_usdt", label: "USDT TRC-20 адрес", type: "text", mono: true },
    { key: "crypto_ton", label: "TON адрес", type: "text", mono: true },
  ]},
  { group: "Контакты поддержки", icon: Mail, fields: [
    { key: "support_email", label: "Email поддержки", type: "text" },
    { key: "support_telegram", label: "Telegram (с @)", type: "text" },
  ]},
  { group: "Статистика (на главной)", icon: BarChart3, fields: [
    { key: "stats_accounts", label: "Аккаунтов продано", type: "text" },
    { key: "stats_clients", label: "Клиентов", type: "text" },
    { key: "stats_rating", label: "Рейтинг (из 5)", type: "text" },
    { key: "stats_support", label: "Поддержка", type: "text" },
  ]},
  { group: "Аналитика", icon: BarChart3, fields: [
    { key: "yandex_metrika", label: "Yandex.Metrika ID", type: "text", mono: true },
    { key: "google_analytics", label: "Google Analytics ID (G-XXXX)", type: "text", mono: true },
    { key: "hotjar_id", label: "Hotjar ID", type: "text", mono: true },
  ]},
  { group: "Безопасность", icon: Lock, fields: [
    { key: "admin_pass", label: "Новый пароль админа", type: "text" },
  ]},
];

export function AdminSettings({ settings }: { settings: Record<string, string> }) {
  const [form, setForm] = useState<Record<string, string>>(settings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка");
      toast({
        title: "✓ Настройки сохранены",
        description: "Изменения применены на сайте. Обновите главную страницу.",
      });
      // Reload data
      setTimeout(() => {
        fetch("/api/settings")
          .then((r) => r.json())
          .then((d) => {
            if (d.settings) setForm(d.settings);
          })
          .catch(() => {});
      }, 500);
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#FF7A00]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_SETTINGS"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Настройки</h1>
          <p className="text-sm text-[#888] font-mono">&gt; Управление сайтом и контактами</p>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-[#BFFF00] text-black hover:bg-[#FF2D87] hover:text-white font-black uppercase border-2 border-[#BFFF00] hover:border-[#FF2D87] font-mono tracking-wide"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" strokeWidth={3} />}
          Сохранить
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {FIELDS.map((group) => (
          <motion.div
            key={group.group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border-2 border-[#2A2A2A] p-5"
            style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
          >
            <h3 className="font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
              <group.icon className="w-4 h-4 text-[#BFFF00]" strokeWidth={2.5} />
              <span className="font-mono text-xs text-[#BFFF00]">{"// "}{group.group.toUpperCase()}</span>
            </h3>
            <div className="space-y-3">
              {group.fields.map((f) => (
                <div key={f.key}>
                  <Label className="text-[10px] uppercase tracking-widest font-mono text-[#888]">{f.label}</Label>
                  <Input
                    type={f.type}
                    value={String(form[f.key] || "")}
                    onChange={(e) => set(f.key, e.target.value)}
                    className={`mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#BFFF00] ${f.mono ? "font-mono text-xs" : ""}`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-[#0E0E0E] border-2 border-[#00F0FF] p-5"
        style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
      >
        <h3 className="font-black mb-3 flex items-center gap-2 uppercase tracking-tight">
          <SettingsIcon className="w-4 h-4 text-[#00F0FF]" strokeWidth={2.5} />
          <span className="font-mono text-xs text-[#00F0FF]">{"// INFO"}</span>
        </h3>
        <div className="text-sm text-[#888] space-y-2 font-mono">
          <p>&gt; Все изменения применяются на сайте мгновенно после сохранения.</p>
          <p>&gt; Крипто-адреса используются в модальном окне оплаты — проверьте перед публикацией.</p>
          <p>&gt; Смена пароля админа вступает в силу при следующем входе.</p>
          <p>&gt; Доступ к админке: добавьте <code className="text-[#BFFF00]">?admin=1</code> к URL сайта.</p>
        </div>
      </div>
    </div>
  );
}
