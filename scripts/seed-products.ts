// ХайпХаб — новые товары с контекстными названиями и фото
import { db } from "../src/lib/db";

async function main() {
  // Обновляем порядок категорий: VK → TikTok → YouTube → Telegram → Instagram
  await db.category.update({ where: { slug: "vk" }, data: { order: 1 } });
  await db.category.update({ where: { slug: "tiktok" }, data: { order: 2 } });
  await db.category.update({ where: { slug: "youtube" }, data: { order: 3 } });
  await db.category.update({ where: { slug: "telegram" }, data: { order: 4 } });
  await db.category.update({ where: { slug: "instagram" }, data: { order: 5 } });

  // Удаляем старые товары (сначала заказы, потом товары)
  await db.order.deleteMany({});
  await db.product.deleteMany({});

  const catVk = await db.category.findFirst({ where: { slug: "vk" } });
  const catTt = await db.category.findFirst({ where: { slug: "tiktok" } });
  const catYt = await db.category.findFirst({ where: { slug: "youtube" } });
  const catTg = await db.category.findFirst({ where: { slug: "telegram" } });
  const catIg = await db.category.findFirst({ where: { slug: "instagram" } });

  if (!catVk || !catTt || !catYt || !catTg || !catIg) throw new Error("Categories not found");

  const products = [
    // === VK ГРУППЫ (7) ===
    {
      id: "vk_1", categoryId: catVk.id,
      title: "VK группа Pri**kol*",
      description: "Живая VK группа с мемами и юмором. Высокая активность, ежедневные посты, реальная аудитория. Полная передача прав создателя.",
      price: 990, oldPrice: 1490,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
      badges: "hot",
      followers: "1 000 участников",
      metadata: JSON.stringify({ country: "RU", age: "4 мес", theme: "Юмор и мемы" }),
      login: "vk_pricol_1k@mail.com", password: "VK@1k#Pri2026",
      deliveryNote: "Полная передача прав через функцию VK. Смените пароль после получения.",
      status: "available", featured: true,
    },
    {
      id: "vk_2", categoryId: catVk.id,
      title: "VK группа Fit**Life*",
      description: "Фитнес-сообщество с живой аудиторией. Посты о тренировках, питании, мотивации. Подходит для продажи спорттоваров.",
      price: 1990, oldPrice: 2990,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
      badges: "verified",
      followers: "3 000 участников",
      metadata: JSON.stringify({ country: "RU", age: "8 мес", theme: "Фитнес и здоровье" }),
      login: "vk_fitlife_3k@mail.com", password: "VK@3k#Fit2026!",
      deliveryNote: "Полные права. Аудитория интересуется фитнесом.",
      status: "available", featured: false,
    },
    {
      id: "vk_3", categoryId: catVk.id,
      title: "VK группа Stu**den*",
      description: "Студенческое сообщество с активной аудиторией. Мемы, советы, обсуждения. Идеально для рекламы студенческих услуг.",
      price: 2990, oldPrice: 4490,
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
      badges: "hot",
      followers: "5 000 участников",
      metadata: JSON.stringify({ country: "RU", age: "1 год", theme: "Студенческая жизнь" }),
      login: "vk_studen_5k@mail.com", password: "VK@5k#Stu2026!",
      deliveryNote: "Активная студенческая аудитория 18-25 лет.",
      status: "available", featured: true,
    },
    {
      id: "vk_4", categoryId: catVk.id,
      title: "VK группа Game**Zone*",
      description: "Игровое сообщество с живой аудиторией. Обзоры игр, стримы, турниры. Высокий охват постов.",
      price: 4990, oldPrice: 6990,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
      badges: "verified,top",
      followers: "10 000 участников",
      metadata: JSON.stringify({ country: "RU", age: "1.5 года", theme: "Игры", monetization: true }),
      login: "vk_gamezone_10k@mail.com", password: "VK@10k#Game2026!",
      deliveryNote: "Подключена монетизация. Игровая аудитория.",
      status: "available", featured: true,
    },
    {
      id: "vk_5", categoryId: catVk.id,
      title: "VK группа Coo**Pro*",
      description: "Кулинарное сообщество с рецептами и фуд-фотографией. Высокая вовлечённость, активные комментарии.",
      price: 7990, oldPrice: 10990,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      badges: "premium",
      followers: "20 000 участников",
      metadata: JSON.stringify({ country: "RU", age: "2 года", theme: "Кулинария", monetization: true }),
      login: "vk_coopro_20k@mail.com", password: "VK@20k#Cook2026!",
      deliveryNote: "Кулинарная тематика. Подходит для рекламы продуктов.",
      status: "available", featured: false,
    },
    {
      id: "vk_6", categoryId: catVk.id,
      title: "VK группа Auto**Mir*",
      description: "Автомобильное сообщество. Обзоры авто, советы, новости. Аудитория — автолюбители 25-45 лет.",
      price: 14990, oldPrice: 19990,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
      badges: "premium,verified,top",
      followers: "50 000 участников",
      metadata: JSON.stringify({ country: "RU", age: "3 года", theme: "Автомобили", monetization: true }),
      login: "vk_automir_50k@mail.com", password: "VK@50k#Auto2026!",
      deliveryNote: "VIP-передача. Автомобильная тематика. Гарантия 14 дней.",
      status: "available", featured: true,
    },
    {
      id: "vk_7", categoryId: catVk.id,
      title: "VK группа New**Day*",
      description: "Новостной паблик с ежедневными публикациями. Высокий охват, стабильный трафик. Подходит для серьёзных проектов.",
      price: 24990, oldPrice: 34990,
      image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&q=80",
      badges: "premium,verified,top",
      followers: "100 000 участников",
      metadata: JSON.stringify({ country: "RU", age: "4 года", theme: "Новости", monetization: true }),
      login: "vk_newday_100k@mail.com", password: "VK@100k#News2026!",
      deliveryNote: "VIP-передача. Новостной паблик. Гарантия 14 дней.",
      status: "available", featured: true,
    },

    // === TIKTOK (5) ===
    {
      id: "tt_1", categoryId: catTt.id,
      title: "TikTok аккаунт Kit**Cat*",
      description: "TikTok аккаунт с котиками и питомцами. Милый контент, высокий охват. Подходит для рекламы зоотоваров.",
      price: 1490, oldPrice: 2490,
      image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80",
      badges: "hot",
      followers: "10 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "6 мес", theme: "Котики и питомцы" }),
      login: "tt_kitcat_10k@mail.com", password: "TT@10k#Cat2026",
      deliveryNote: "Полный доступ. Тематика — котики и питомцы.",
      status: "available", featured: true,
    },
    {
      id: "tt_2", categoryId: catTt.id,
      title: "TikTok аккаунт Dan**Cer*",
      description: "TikTok аккаунт с танцами и хореографией. Молодая аудитория, высокие просмотры. Подходит для рекламы брендов.",
      price: 2990, oldPrice: 4490,
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80",
      badges: "verified",
      followers: "25 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "10 мес", theme: "Танцы" }),
      login: "tt_dancer_25k@mail.com", password: "TT@25k#Dance2026!",
      deliveryNote: "Танцевальная тематика. Активная аудитория 16-24.",
      status: "available", featured: false,
    },
    {
      id: "tt_3", categoryId: catTt.id,
      title: "TikTok аккаунт Pra**nks*",
      description: "TikTok аккаунт с пранками и юмором. Вирусный контент, высокие охваты. Готов к монетизации Creator Fund.",
      price: 6990, oldPrice: 9990,
      image: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600&q=80",
      badges: "top,premium",
      followers: "50 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "1 год", theme: "Пранки и юмор", monetization: true }),
      login: "tt_pranks_50k@mail.com", password: "TT@50k#Prank2026!",
      deliveryNote: "Подключена монетизация. Пранк-контент.",
      status: "available", featured: true,
    },
    {
      id: "tt_4", categoryId: catTt.id,
      title: "TikTok аккаунt Muv**Pro*",
      description: "TikTok аккаунт с обзорами фильмов и сериалов. Качественный контент, лояльная аудитория.",
      price: 14990, oldPrice: 19990,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
      badges: "premium,verified,top",
      followers: "100 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "1.5 года", theme: "Фильмы и сериалы", monetization: true }),
      login: "tt_muvpro_100k@mail.com", password: "TT@100k#Muv2026!",
      deliveryNote: "VIP-поддержка. Кино-тематика. Гарантия 7 дней.",
      status: "available", featured: true,
    },
    {
      id: "tt_5", categoryId: catTt.id,
      title: "TikTok аккаунт Glo**Art*",
      description: "TikTok аккаунт с глитч-артом и визуальным контентом. Уникальная ниша, высокая вовлечённость.",
      price: 24990, oldPrice: 32990,
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
      badges: "premium,verified,top",
      followers: "200 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "2 года", theme: "Глитч-арт", monetization: true }),
      login: "tt_gloart_200k@mail.com", password: "TT@200k#Glo2026!",
      deliveryNote: "VIP-передача. Уникальный визуальный контент. Гарантия 14 дней.",
      status: "available", featured: false,
    },

    // === YOUTUBE (5) ===
    {
      id: "yt_1", categoryId: catYt.id,
      title: "YouTube канал Game**Play*",
      description: "Игровой YouTube канал с гайдами и прохождениями. Есть начальная аудитория, готов к росту.",
      price: 2490, oldPrice: 3490,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
      badges: "hot",
      followers: "1 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "8 мес", theme: "Игры", watchHours: 4000 }),
      login: "yt_gameplay_1k@mail.com", password: "YT@1k#Game2026",
      deliveryNote: "Игровой канал. Без страйков. Полный доступ.",
      status: "available", featured: true,
    },
    {
      id: "yt_2", categoryId: catYt.id,
      title: "YouTube канал Vlo**Ger*",
      description: "Влог-канал о путешествиях и生活方式. Качественный контент, лояльная аудитория.",
      price: 3990, oldPrice: 5490,
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
      badges: "verified",
      followers: "5 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "1 год", theme: "Влоги и путешествия" }),
      login: "yt_vloger_5k@mail.com", password: "YT@5k#Vlog2026!",
      deliveryNote: "Влог-канал. Путешествия. Без страйков.",
      status: "available", featured: false,
    },
    {
      id: "yt_3", categoryId: catYt.id,
      title: "YouTube канал Tech**Rev*",
      description: "Технологический канал с обзорами гаджетов. Монетизация подключена, стабильный доход от AdSense.",
      price: 8990, oldPrice: 12990,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
      badges: "verified,premium",
      followers: "10 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "2 года", theme: "Технологии", monetization: true, watchHours: 240000 }),
      login: "yt_techrev_10k@mail.com", password: "YT@10k#Tech2026!",
      deliveryNote: "Монетизация активна. Тех-обзоры. Помощь с AdSense.",
      status: "available", featured: true,
    },
    {
      id: "yt_4", categoryId: catYt.id,
      title: "YouTube канал Muv**Rev*",
      description: "Канал с обзорами фильмов и сериалов. Высокий Watch Time, стабильные просмотры.",
      price: 24990, oldPrice: 34990,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
      badges: "premium,verified,top",
      followers: "50 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "3 года", theme: "Кинообзоры", monetization: true, watchHours: 800000 }),
      login: "yt_muvrev_50k@mail.com", password: "YT@50k#Muv2026!",
      deliveryNote: "Кино-обзоры. Монетизация активна. Гарантия 14 дней.",
      status: "available", featured: true,
    },
    {
      id: "yt_5", categoryId: catYt.id,
      title: "YouTube канал Coo**Mas*",
      description: "Кулинарный YouTube канал с рецептами. Высокий Watch Time, стабильный доход от монетизации.",
      price: 49990, oldPrice: 69990,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      badges: "premium,verified,top",
      followers: "100 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "4 года", theme: "Кулинария", monetization: true, watchHours: 1200000 }),
      login: "yt_coomas_100k@mail.com", password: "YT@100k#Cook2026!",
      deliveryNote: "VIP-передача. Кулинарный канал. Гарантия 14 дней.",
      status: "available", featured: true,
    },

    // === TELEGRAM (4) ===
    {
      id: "tg_1", categoryId: catTg.id,
      title: "Telegram канал Cry**pto*",
      description: "Криптовалютный канал с аналитикой и сигналами. Аудитория интересуется инвестициями.",
      price: 1490, oldPrice: 1990,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80",
      badges: "hot",
      followers: "1 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "5 мес", theme: "Криптовалюта" }),
      login: "tg_crypto_1k", password: "TG@1k#Cry2026",
      deliveryNote: "Полные права администратора. Крипто-тематика.",
      status: "available", featured: true,
    },
    {
      id: "tg_2", categoryId: catTg.id,
      title: "Telegram канал Tee**ch*",
      description: "Образовательный канал с уроками и курсами. Аудитория интересуется обучением.",
      price: 3990, oldPrice: 5490,
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
      badges: "verified",
      followers: "5 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "1 год", theme: "Образование" }),
      login: "tg_teech_5k", password: "TG@5k#Edu2026!",
      deliveryNote: "Образовательный канал. Полная передача.",
      status: "available", featured: false,
    },
    {
      id: "tg_3", categoryId: catTg.id,
      title: "Telegram канал New**Hub*",
      description: "Новостной канал с ежедневными публикациями. Стабильный охват, активная аудитория.",
      price: 7990, oldPrice: 9990,
      image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&q=80",
      badges: "verified,top",
      followers: "10 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "1.5 года", theme: "Новости", monetization: true }),
      login: "tg_newhub_10k", password: "TG@10k#New2026!",
      deliveryNote: "Новостной канал. Подключена монетизация.",
      status: "available", featured: true,
    },
    {
      id: "tg_4", categoryId: catTg.id,
      title: "Telegram канал Mem**Pad*",
      description: "Мем-канал с ежедневным контентом. Высокий охват, вирусные посты. Готов к рекламе.",
      price: 19990, oldPrice: 26990,
      image: "https://images.unsplash.com/photo-1543584758-24d4c54d84ff?w=600&q=80",
      badges: "premium,verified,top",
      followers: "50 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "2 года", theme: "Мемы и юмор", monetization: true }),
      login: "tg_mempad_50k", password: "TG@50k#Mem2026!",
      deliveryNote: "Мем-канал. Высокий охват. Гарантия 14 дней.",
      status: "available", featured: true,
    },

    // === INSTAGRAM (2) ===
    {
      id: "ig_1", categoryId: catIg.id,
      title: "Instagram аккаунт Coo**Ra*",
      description: "Instagram страница о кулинарии и рецептах. Красивая food-фотография, высокая вовлечённость. Подходит для рекламы продуктов.",
      price: 12990, oldPrice: 16990,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      badges: "premium,verified",
      followers: "50 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "2 года", theme: "Кулинария и еда", monetization: true }),
      login: "ig_coora_50k@mail.com", password: "IG@50k#Cook2026!",
      deliveryNote: "Кулинарная страница. Food-фотография. VIP-передача. Гарантия 7 дней.",
      status: "available", featured: true,
    },
    {
      id: "ig_2", categoryId: catIg.id,
      title: "Instagram аккаунт Tra**Vel*",
      description: "Instagram страница о путешествиях. Красивые фото из разных стран, лояльная аудитория. Подходит для туризма и брендов.",
      price: 24990, oldPrice: 32990,
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
      badges: "premium,verified,top",
      followers: "100 000 подписчиков",
      metadata: JSON.stringify({ country: "RU", age: "3 года", theme: "Путешествия", monetization: true }),
      login: "ig_travel_100k@mail.com", password: "IG@100k#Tra2026!",
      deliveryNote: "Travel-страница. Высокое качество фото. VIP-передача. Гарантия 14 дней.",
      status: "available", featured: true,
    },
  ];

  for (const p of products) {
    await db.product.create({ data: p });
  }

  console.log(`✅ Created ${products.length} products`);
  console.log("   VK: 7, TikTok: 5, YouTube: 5, Telegram: 4, Instagram: 2");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
