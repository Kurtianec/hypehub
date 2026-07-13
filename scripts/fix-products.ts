// Фикс фото товаров + новые бейджи
import { db } from "../src/lib/db";

async function main() {
  // Fix broken images
  await db.product.update({ where: { id: "vk_3" }, data: { image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" } });
  await db.product.update({ where: { id: "tg_4" }, data: { image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80" } });

  // Убираем все старые бейджи, оставляем только тематические + New/Хит
  const updates: Record<string, string> = {
    // VK
    vk_1: "new",           // Юмор
    vk_2: "",              // Фитнес
    vk_3: "hit",           // Студенты
    vk_4: "new",           // Игры
    vk_5: "",              // Кулинария
    vk_6: "hit",           // Авто
    vk_7: "new",           // Новости
    // TikTok
    tt_1: "hit",           // Котики
    tt_2: "",              // Танцы
    tt_3: "new",           // Пранки
    tt_4: "hit",           // Фильмы
    tt_5: "new",           // Глитч-арт
    // YouTube
    yt_1: "hit",           // Игры
    yt_2: "",              // Влоги
    yt_3: "new",           // Технологии
    yt_4: "hit",           // Кино
    yt_5: "new",           // Кулинария
    // Telegram
    tg_1: "hit",           // Крипта
    tg_2: "",              // Образование
    tg_3: "new",           // Новости
    tg_4: "hit",           // Мемы
    // Instagram
    ig_1: "new",           // Кулинария
    ig_2: "hit",           // Путешествия
  };

  for (const [id, badges] of Object.entries(updates)) {
    await db.product.update({ where: { id }, data: { badges: badges || null } });
  }

  console.log("✅ Fixed images + updated badges");
}

main().catch(console.error).finally(() => db.$disconnect());
