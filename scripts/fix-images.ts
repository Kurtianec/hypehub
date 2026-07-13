// Обновление всех фото на уникальные, без повторений
import { db } from "../src/lib/db";

async function main() {
  const updates: Record<string, string> = {
    // VK — 7 уникальных фото по тематике
    vk_1: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&q=80", // Кот/юмор
    vk_2: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", // Фитнес
    vk_3: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80", // Студенты
    vk_4: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80", // Игры
    vk_5: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80", // Кулинария
    vk_6: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", // Авто
    vk_7: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80", // Новости

    // TikTok — 5 уникальных
    tt_1: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80", // Котики
    tt_2: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80", // Танцы
    tt_3: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600&q=80", // Юмор
    tt_4: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80", // Кино
    tt_5: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&q=80", // Визуал

    // YouTube — 5 уникальных
    yt_1: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80", // Игры
    yt_2: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80", // Путешествия
    yt_3: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80", // Технологии
    yt_4: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&q=80", // Кинообзоры
    yt_5: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", // Кулинария

    // Telegram — 4 уникальных
    tg_1: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80", // Крипта
    tg_2: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80", // Образование
    tg_3: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&q=80", // Новости
    tg_4: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80", // Мемы

    // Instagram — 2 уникальных
    ig_1: "https://images.unsplash.com/photo-1495546968767-f0573cca821e?w=600&q=80", // Кулинария/food
    ig_2: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80", // Путешествия/природа
  };

  for (const [id, image] of Object.entries(updates)) {
    await db.product.update({ where: { id }, data: { image } });
  }

  console.log(`✅ Updated ${Object.keys(updates).length} product images`);
}

main().catch(console.error).finally(() => db.$disconnect());
