import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AIAssistant } from "@/components/store/AIAssistant";
import { SupportChat } from "@/components/store/SupportChat";
import { VisitorTracker } from "@/components/store/VisitorTracker";
import { ReferClient } from "@/components/store/ReferClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Реферальная программа — получайте бонусы за приглашения | ХайпХаб",
  description: "Приглашайте друзей в ХайпХаб и получайте 10% от каждой их покупки. Реферальная ссылка, статистика кликов и заработка.",
  alternates: { canonical: "https://hypehub.shop/refer" },
};

export default async function ReferPage() {
  const settings = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return (
    <>
      <VisitorTracker />
      <Header siteName={settingsMap.site_name} />
      <ReferClient />
      <Footer settings={settingsMap} />
      <AIAssistant />
      <SupportChat />
    </>
  );
}
