import { Download, ShieldCheck, Smartphone, Zap } from "lucide-react";

export function AndroidAppPromo() {
  return (
    <section className="android-download-cta container mx-auto px-4 pb-2 pt-8 md:px-6 md:pt-10" aria-label="Приложение ХайпХаб для Android">
      <div className="android-app-promo flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#8E1537]/25 px-5 py-5 md:flex-row md:items-center md:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#8E1537] text-white shadow-lg shadow-[#8E1537]/20">
            <Smartphone className="h-6 w-6" />
          </span>
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#A82049]">Приложение для Android</div>
            <h2 className="text-lg font-black text-[#181818] md:text-xl">ХайпХаб всегда под рукой</h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666]">
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#8E1537]" />Быстрый доступ</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#8E1537]" />Официальная APK</span>
            </div>
          </div>
        </div>
        <a href="/downloads/hypehub-android.apk" download className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#151515] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#8E1537] md:w-auto">
          <Download className="h-4 w-4" />Скачать APK
        </a>
      </div>
    </section>
  );
}
