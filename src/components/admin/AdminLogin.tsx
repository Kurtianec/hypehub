"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Eye, EyeOff, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BrandMark } from "@/components/store/BrandMark";

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/captcha").then((r) => r.json()).then((data) => { setCaptchaToken(data.token); setCaptchaQuestion(data.question); });
  }, []);

  const submit = async () => {
    if (!password) {
      toast({ title: "Введите пароль", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, captchaToken, captchaAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin();
    } catch (e) {
      toast({
        title: "ACCESS_DENIED",
        description: e instanceof Error ? e.message : "Неверный пароль",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div
          className="admin-login-card bg-[#0E0E0E] border-2 border-[#F7A600] p-8 md:p-10"
          style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7A600] border-2 border-[#F7A600] mb-4"
              style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
            >
              <BrandMark className="w-full h-full" />
            </div>

            <h1 className="text-2xl font-black mb-1 uppercase tracking-tighter">
              <span className="text-[#F7A600]">Хайп</span>Хаб
            </h1>
            <p className="text-xs text-[#888] font-mono uppercase tracking-widest flex items-center justify-center gap-1">
              <Terminal className="w-3 h-3" />
              {"// ADMIN_ACCESS_REQUIRED"}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-widest font-mono text-[#F7A600]">
                {"// ПАРОЛЬ_АДМИНИСТРАТОРА"}
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#F7A600] font-mono"
                  autoFocus
                />
                <button
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#F7A600]"
                  type="button"
                  aria-label={showPass ? "Скрыть" : "Показать"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-widest font-mono text-[#F7A600]">Проверка: {captchaQuestion}</Label>
              <Input value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} inputMode="numeric" placeholder="Ответ" className="mt-1.5 bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:border-[#F7A600] font-mono" />
            </div>

            <Button
              onClick={submit}
              disabled={loading}
              className="w-full bg-[#F7A600] text-black hover:bg-[#F7A600] hover:text-white font-black uppercase py-6 border-2 border-[#F7A600] hover:border-[#F7A600] font-mono tracking-wide"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black blink" />
                  AUTHENTICATING...
                </span>
              ) : (
                <>
                  Войти
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={3} />
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-[#888] hover:text-[#F7A600] font-mono uppercase">
              &lt; Назад на сайт
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
