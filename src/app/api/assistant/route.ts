import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { consumeRateLimit, requestIp } from "@/lib/security";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`assistant:${ip}`, 10, 10 * 60_000)).allowed) return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
  const parsed = z.object({ question: z.string().trim().min(2).max(800), context: z.string().max(100).optional(), captchaToken: z.string().optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const { question, context } = parsed.data;

  const systemPrompt = `Ты — AI-ассистент сайта ХайпХаб, современного маркетплейса готовых аккаунтов TikTok, YouTube, VK, Instagram и Telegram.

Твоя задача — помогать посетителям сайта:
- Объяснять, как купить аккаунт
- Рассказывать про способы оплаты (криптовалюта BTC/USDT/TON и )
- Объяснять про гарантию и доставку (мгновенная выдача файла с логином и паролем)
- Помогать выбрать подходящий аккаунт под задачу пользователя
- Отвечать про безопасность, монетизацию, передачу аккаунта
- Поддерживать дружелюбный, современный тон, как у топовых сервисов уровня TikTok/YouTube

Правила:
- Отвечай КРАТКО и ПО ДЕЛУ (2–5 предложений), без воды
- Используй markdown для форматирования (жирный, списки)
- Если вопроса нет в контексте сайта — отвечай общими советами
- Никогда не выдумывай цены или конкретные товары — направляй в каталог
- Если вопрос про оплату/возврат/гарантию — отвечай по фактам: оплата криптой , гарантия от 24ч до 14 дней, мгновенная выдача
- Язык — русский

${context ? `Контекст: пользователь сейчас смотрит блок "${context}". Ответь с учётом этого.` : ""}`;

  try {
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.6,
      max_tokens: 600,
    });

    const answer =
      response.choices?.[0]?.message?.content ||
      "Извините, не смог обработать запрос. Напишите в чат поддержки — поможем!";

    return NextResponse.json({ answer });
  } catch (e) {
    console.error("AI assistant error:", e);
    return NextResponse.json({
      answer:
        "Извините, AI-ассистент временно недоступен. Напишите в чат техподдержки в правом нижнем углу — поможем за пару минут!",
    });
  }
}
