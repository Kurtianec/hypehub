"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Save, Loader2, Settings as SettingsIcon, Bitcoin, Mail, BarChart3, Lock, Megaphone, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


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
  { group: "Рекламные баннеры", icon: Megaphone, fields: [
    { key: "ad_wide_enabled", label: "Показывать широкий баннер 970 × 250", type: "checkbox" },
    { key: "ad_wide_image", label: "Загрузить широкий баннер 970 × 250", type: "file", accept: "image/jpeg,image/png,image/webp,image/gif" },
    { key: "ad_wide_url", label: "Ссылка для перехода по широкому баннеру", type: "url", placeholder: "https://example.com" },
    { key: "ad_wide_title", label: "Название рекламодателя / alt-текст", type: "text" },
    { key: "ad_portrait_enabled", label: "Показывать вертикальный баннер 300 × 600", type: "checkbox" },
    { key: "ad_portrait_image", label: "Загрузить вертикальный баннер 300 × 600", type: "file", accept: "image/jpeg,image/png,image/webp,image/gif" },
    { key: "ad_portrait_url", label: "Ссылка для перехода по вертикальному баннеру", type: "url", placeholder: "https://zismo.biz" },
    { key: "ad_portrait_title", label: "Название рекламодателя / alt-текст", type: "text" },
  ]},
  { group: "Безопасность", icon: Lock, fields: [
    { key: "admin_pass", label: "Новый пароль админа", type: "text" },
  ]},
];

export function AdminSettings({ settings }: { settings: Record<string, string> }) {
  const [form, setForm] = useState<Record<string, string>>({ ...settings, admin_pass: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const uploadBanner = (key: string, file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast({ title: "Неверный формат", description: "Используйте JPG, PNG, WebP или GIF.", variant: "destructive" });
      return;
    }
    if (file.size > 1024 * 1024) {
      toast({ title: "Файл слишком большой", description: "Максимальный размер баннера — 1 МБ.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const enabledKey = key.replace(/_image$/, "_enabled");
      setForm((current) => ({ ...current, [key]: String(reader.result || ""), [enabledKey]: "true" }));
      toast({ title: "Баннер загружен и включён", description: "Добавьте ссылку перехода и нажмите «Сохранить»." });
    };
    reader.onerror = () => toast({ title: "Не удалось прочитать файл", variant: "destructive" });
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
            <div className="w-1 h-8 bg-[#8E1537]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// SECTION_SETTINGS"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter">Настройки</h1>
          <p className="text-sm text-[#888] font-mono">&gt; Управление сайтом и контактами</p>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-[#8E1537] text-black hover:bg-[#8E1537] hover:text-white font-black uppercase border-2 border-[#8E1537] hover:border-[#8E1537] font-mono tracking-wide"
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
              <group.icon className="w-4 h-4 text-[#8E1537]" strokeWidth={2.5} />
              <span className="font-mono text-xs text-[#8E1537]">{"// "}{group.group.toUpperCase()}</span>
            </h3>
            <div className="space-y-3">
              {group.fields.map((f) => (
                <div key={f.key}>
                  {f.type === "checkbox" ? (
                    <label className="flex items-center justify-between gap-4 rounded-xl border border-[#303030] bg-[#0A0A0A] px-3 py-3 cursor-pointer">
                      <span className="text-xs font-semibold">{f.label}</span>
                      <input type="checkbox" checked={form[f.key] === "true"} onChange={(e) => set(f.key, String(e.target.checked))} className="h-5 w-5 accent-[#8E1537]" />
                    </label>
                  ) : f.type === "file" ? (
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest font-mono text-[#888]">{f.label}</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <label className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#3A3A3A] bg-[#0A0A0A] px-3 text-xs font-bold transition-colors hover:border-[#8E1537]">
                          <Upload className="h-4 w-4 text-[#8E1537]" />
                          {form[f.key] ? "Заменить изображение" : "Выбрать файл"}
                          <input
                            type="file"
                            accept={"accept" in f ? f.accept : undefined}
                            className="sr-only"
                            onChange={(e) => {
                              uploadBanner(f.key, e.target.files?.[0]);
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        {form[f.key] && (
                          <Button type="button" variant="outline" size="icon" onClick={() => set(f.key, "")} title="Удалить баннер" className="border-[#3A3A3A] bg-[#0A0A0A] hover:border-[#8E1537]">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[#777]">JPG, PNG, WebP или GIF · до 1 МБ{form[f.key] ? " · файл выбран" : ""}</p>
                      {form[f.key] && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-[#303030] bg-[#080808] p-2">
                          <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#777]">Предпросмотр</p>
                          <Image
                            src={form[f.key]}
                            alt="Предпросмотр рекламного баннера"
                            width={f.key === "ad_wide_image" ? 970 : 300}
                            height={f.key === "ad_wide_image" ? 250 : 600}
                            unoptimized
                            className={`mx-auto block max-w-full rounded-lg object-cover ${f.key === "ad_wide_image" ? "h-auto" : "h-[300px] w-[150px]"}`}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Label className="text-[10px] uppercase tracking-widest font-mono text-[#888]">{f.label}</Label>
                      <Input
                        type={f.type}
                        value={String(form[f.key] || "")}
                        onChange={(e) => set(f.key, e.target.value)}
                        placeholder={"placeholder" in f ? f.placeholder : undefined}
                        className={`mt-1 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#8E1537] ${"mono" in f && f.mono ? "font-mono text-xs" : ""}`}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-[#0E0E0E] border-2 border-[#8E1537] p-5"
        style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
      >
        <h3 className="font-black mb-3 flex items-center gap-2 uppercase tracking-tight">
          <SettingsIcon className="w-4 h-4 text-[#8E1537]" strokeWidth={2.5} />
          <span className="font-mono text-xs text-[#8E1537]">{"// INFO"}</span>
        </h3>
        <div className="text-sm text-[#888] space-y-2 font-mono">
          <p>&gt; Все изменения применяются на сайте мгновенно после сохранения.</p>
          <p>&gt; Крипто-адреса используются в модальном окне оплаты — проверьте перед публикацией.</p>
          <p>&gt; Смена пароля админа вступает в силу при следующем входе.</p>
          <p>&gt; Доступ к админке: добавьте <code className="text-[#8E1537]">?admin=1</code> к URL сайта.</p>
        </div>
      </div>
    </div>
  );
}
