// Assign unique themed hover images per product — no duplicates, matches product theme
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Curated unique images per product ID — themed to the account's niche
// Each image is unique across the entire catalog AND different from the primary image
const HOVER_IMAGES = {
  // === VK groups (7) — community/people themed ===
  "vk_1": "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=600&q=80",   // Pri**kol* — humor/comedy
  "vk_2": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",   // Fit**Life* — fitness/gym
  "vk_3": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",   // Stu**den* — students/campus
  "vk_4": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80",   // Game**Zone* — gaming neon
  "vk_5": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80",      // Coo**Pro* — cooking chef
  "vk_6": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",   // Auto**Mir* — car dashboard
  "vk_7": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",   // New**Day* — sunrise/lifestyle

  // === TikTok accounts (5) — short video/dance/creative themed ===
  "tt_1": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80",   // Kit**Cat* — cute cat
  "tt_2": "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&q=80",      // Dan**Cer* — dance studio
  "tt_3": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",   // Pra**nks* — fun/laughter
  "tt_4": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",   // Muv**Pro* — film production studio
  "tt_5": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",   // Glo**Art* — art supplies

  // === YouTube channels (5) — content creation themed ===
  "yt_1": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80",   // Game**Play* — gaming controller
  "yt_2": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",   // Vlo**Ger* — vlog camera setup
  "yt_3": "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600&q=80",   // Tech**Rev* — tech devices
  "yt_4": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",   // Muv**Rev* — movie review
  "yt_5": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80",   // Coo**Mas* — kitchen master

  // === Telegram channels (4) — messaging/crypto/news themed ===
  "tg_1": "https://images.unsplash.com/photo-1621761191319-c2fb6c4ee055?w=600&q=80",   // Cry**pto* — bitcoin
  "tg_2": "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80",   // Tee**ch* — chalkboard
  "tg_3": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",   // New**Hub* — news (DIFFERENT from vk_7)
  "tg_4": "https://images.unsplash.com/photo-1543610892-0b1f7e6d3ac6?w=600&q=80",      // Mem**Pad* — phone laughing

  // === Instagram accounts (2) — lifestyle/travel themed ===
  "ig_1": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",   // Coo**Ra* — food plate
  "ig_2": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",   // Tra**Vel* — travel suitcase
};

async function main() {
  const products = await db.product.findMany({
    select: { id: true, title: true, image: true },
  });

  let updated = 0;
  let skipped = 0;
  const usedUrls = new Set();
  const allErrors = [];

  for (const p of products) {
    const hoverUrl = HOVER_IMAGES[p.id];
    if (!hoverUrl) {
      allErrors.push(`No hover image defined for ${p.id} (${p.title})`);
      continue;
    }

    // Check it's not the same as primary image
    if (hoverUrl === p.image) {
      allErrors.push(`COLLISION: ${p.id} hover URL === primary image URL — need different photo`);
      skipped++;
      continue;
    }

    // Check uniqueness across catalog
    if (usedUrls.has(hoverUrl)) {
      allErrors.push(`DUPLICATE: ${p.id} would reuse an already-assigned URL`);
      skipped++;
      continue;
    }

    usedUrls.add(hoverUrl);
    await db.product.update({
      where: { id: p.id },
      data: { images: JSON.stringify([hoverUrl]) },
    });
    updated++;
    console.log(`✓ ${p.id.padEnd(6)} ${p.title.substring(0, 35).padEnd(35)} → ${hoverUrl.substring(50, 100)}`);
  }

  console.log(`\n=== ИТОГ ===`);
  console.log(`Обновлено: ${updated}`);
  console.log(`Пропущено: ${skipped}`);
  console.log(`Уникальных URL использовано: ${usedUrls.size} (должно быть ${products.length})`);
  if (allErrors.length > 0) {
    console.log(`\n⚠️  Ошибки:`);
    for (const e of allErrors) console.log(`  - ${e}`);
  } else {
    console.log(`\n✅ Все ${products.length} товаров получили уникальные themed-изображения без повторений`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
