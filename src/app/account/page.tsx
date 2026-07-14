import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";
import { AccountClient } from "@/components/store/AccountClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Личный кабинет — мои заказы | ХайпХаб",
  description: "Личный кабинет покупателя. История заказов, скачивание данных аккаунтов, статусы гарантии.",
  alternates: { canonical: "https://hypehub.vercel.app/account" },
};

export default async function AccountPage() {
  const settings = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return (
    <>
      <VisitorTracker />
      <Header siteName={settingsMap.site_name} />
      <AccountClient settings={settingsMap} />
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
