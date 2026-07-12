import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { VisitorTracker } from "@/components/store/VisitorTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — ХайпХаб",
  description: "Политика конфиденциальности сервиса ХайпХаб. Сбор, обработка и защита персональных данных пользователей.",
  alternates: { canonical: "https://hypehub.shop/privacy" },
};

export default async function PrivacyPage() {
  const settings = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const sections = [
    {
      title: "1. ОБЩИЕ ПОЛОЖЕНИЯ",
      content: `1.1. Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей сервиса ХайпХаб (далее — «Сервис»).

1.2. Политика разработана в соответствии с Федеральным законом РФ от 27.07.2006 № 152-ФЗ «О персональных данных».

1.3. Используя Сервис, Пользователь даёт согласие на обработку своих персональных данных в соответствии с настоящей Политикой.`,
    },
    {
      title: "2. КАКИЕ ДАННЫЕ МЫ СОБИРАЕМ",
      content: `2.1. При оформлении заказа:
— Email (для отправки данных аккаунта)
— Контакт (Telegram или телефон, для связи)

2.2. При посещении сайта (автоматически):
— IP-адрес
— Браузер и операционная система
— Источник перехода (referer)
— Страницы посещения
— Время посещения

2.3. При оплате криптовалютой:
— Адрес кошелька отправителя
— Сумма и хэш транзакции
(Персональные данные не собираются)

2.4. При оплате :
— Номер -кошелька (виден только администрации)`,
    },
    {
      title: "3. ЦЕЛИ ОБРАБОТКИ ДАННЫХ",
      content: `3.1. Обработка персональных данных осуществляется в следующих целях:
— Исполнение заказов (выдача данных аккаунта)
— Связь с Пользователем (поддержка, уведомления)
— Аналитика посещаемости и улучшение сервиса
— Предотвращение мошенничества
— Соблюдение требований законодательства

3.2. Обработка данных ограничена указанными целями. Сервис не использует данные для других целей без согласия Пользователя.`,
    },
    {
      title: "4. ХРАНЕНИЕ ДАННЫХ",
      content: `4.1. Персональные данные хранятся на защищённых серверах с SSL-шифрованием.

4.2. Срок хранения:
— Данные заказов: бессрочно (для разрешения споров)
— Данные посещений: 90 дней
— Данные чатов поддержки: 1 год

4.3. По истечении срока данные удаляются или анонимизируются.`,
    },
    {
      title: "5. ПЕРЕДАЧА ДАННЫХ ТРЕТЬИМ ЛИЦАМ",
      content: `5.1. Сервис не передаёт персональные данные Пользователей третьим лицам, за исключением:
— По требованию правоохранительных органов (в соответствии с законом)
— При слиянии или поглощении компании (с уведомлением Пользователя)

5.2. Сервис может использовать сторонние сервисы аналитики (Яндекс.Метрика, Google Analytics), которые собирают обезличенные данные.

5.3. Платёжные данные (крипто-адреса, -номера) обрабатываются соответствующими платёжными системами, а не Сервисом.`,
    },
    {
      title: "6. ЗАЩИТА ДАННЫХ",
      content: `6.1. Сервис применяет технические и организационные меры защиты:
— SSL-шифрование (HTTPS)
— Защищённое хранение паролей (хэширование)
— Ограниченный доступ к данным (только администрация)
— Регулярное резервное копирование

6.2. В случае утечки данных Сервис уведомит Пользователей в течение 72 часов.

6.3. Пользователь обязуется обеспечить безопасность своего email и контактных данных.`,
    },
    {
      title: "7. ПРАВА ПОЛЬЗОВАТЕЛЯ",
      content: `7.1. Пользователь имеет право:
— Запросить информацию о своих данных
— Запросить исправление некорректных данных
— Запросить удаление своих данных (кроме данных, обязательных для хранения по закону)
— Отозвать согласие на обработку данных

7.2. Для реализации прав необходимо обратиться в поддержку: ${settingsMap.support_email || "support@hypehub.shop"}`,
    },
    {
      title: "8. COOKIES",
      content: `8.1. Сервис использует cookies для:
— Сохранения сессии (корзина, сравнение, избранное)
— Аналитики посещаемости
— Персонализации контента

8.2. Пользователь может отключить cookies в настройках браузера, однако это может повлиять на работу Сервиса.

8.3. Сервис не использует cookies для передачи данных третьим лицам без согласия.`,
    },
    {
      title: "9. ИЗМЕНЕНИЯ ПОЛИТИКИ",
      content: `9.1. Сервис оставляет за собой право изменять настоящую Политику.

9.2. Актуальная версия размещена на данной странице.

9.3. Дата последнего обновления: ${new Date().toLocaleDateString("ru-RU")}`,
    },
    {
      title: "10. КОНТАКТЫ",
      content: `10.1. По вопросам конфиденциальности обращайтесь:
— Email: ${settingsMap.support_email || "support@hypehub.shop"}
— Telegram: ${settingsMap.support_telegram || "@hypehub_support"}

10.2. Режим работы: 24/7`,
    },
  ];

  return (
    <>
      <VisitorTracker />
      <Header siteName={settingsMap.site_name} />
      <main className="flex-1 pt-28 md:pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase mb-6">
            <Link href="/" className="hover:text-[#BFFF00]">ГЛАВНАЯ</Link>
            <span className="text-[#BFFF00]">/</span>
            <span className="text-foreground">КОНФИДЕНЦИАЛЬНОСТЬ</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#00F0FF]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">{"// PRIVACY"}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">
            <span className="text-gradient-neon">Политика конфиденциальности</span>
          </h1>

          <div className="space-y-6">
            {sections.map((s, i) => (
              <div key={i} className="bg-[#121212] border-2 border-[#2A2A2A] p-5 md:p-6"
                style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
                <h2 className="font-black text-lg md:text-xl mb-3 uppercase tracking-tight text-[#00F0FF] font-mono">{s.title}</h2>
                <div className="text-sm text-[#888] leading-relaxed font-mono whitespace-pre-line">{s.content}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-[#BFFF00] font-mono uppercase text-sm hover:underline">
              ← Назад на главную
            </Link>
          </div>
        </div>
      </main>
      <Footer settings={settingsMap} />
    </>
  );
}
