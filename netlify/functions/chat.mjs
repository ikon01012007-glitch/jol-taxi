import { askGemini } from './lib/ai.mjs';
import { ensureTables, getSql } from './lib/db.mjs';
import { badRequest, methodNotAllowed, ok, parseBody, serverError } from './lib/http.mjs';

export async function handler(event) {
  try {
    const sql = await ensureTables(getSql());

    if (event.httpMethod === 'GET') {
      const userId = Number(event.queryStringParameters?.userId || 0);
      if (!userId) {
        return ok({ messages: [] });
      }

      const messages = await sql`
        SELECT id, role, text, created_at
        FROM chat_messages
        WHERE user_id = ${userId} AND channel = 'support'
        ORDER BY created_at ASC
        LIMIT 40
      `;

      return ok({ messages });
    }

    if (event.httpMethod !== 'POST') {
      return methodNotAllowed();
    }

    const { userId, text, userName = 'пользователь' } = parseBody(event);
    if (!userId || !text?.trim()) {
      return badRequest('Сообщение пустое.');
    }

    await sql`
      INSERT INTO chat_messages (user_id, role, channel, text)
      VALUES (${userId}, 'user', 'support', ${text.trim()})
    `;

    const latestRide = await sql`
      SELECT pickup_label, destination_label, recommended_price, status, created_at
      FROM rides
      WHERE passenger_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let reply =
      'Я на связи. Могу помочь с поездкой, ценой, маршрутом по Астане, безопасностью и статусом заказа.';
    const normalizedText = text.trim().toLowerCase();
    const lastRide = latestRide[0];

    if (/(цена|стоимость|тариф|дорого|сколько)/i.test(normalizedText)) {
      reply = lastRide
        ? `Последняя цена была ${lastRide.recommended_price} ₸ за маршрут ${lastRide.pickup_label} -> ${lastRide.destination_label}. На итог влияют расстояние, время в пути, текущий спрос, пробки и погода в Астане.`
        : 'Цена поездки зависит от расстояния, времени в пути, текущего спроса, пробок и погоды в Астане. Если хотите, рассчитайте маршрут на главном экране, и я помогу разобрать итоговую стоимость.';
    } else {
      try {
        const assistantText = await askGemini({
          systemPrompt:
            'Ты AI-оператор поддержки сервиса Jol Taxi в Астане. Отвечай по-русски, спокойно, конкретно и кратко. Отвечай только на текущее сообщение пользователя. Не выдумывай потерянные вещи, аварии, отмены и другие события, если пользователь их не упоминал.',
          userPrompt: `Пользователь: ${userName}. Последняя поездка: ${lastRide ? `${lastRide.pickup_label} -> ${lastRide.destination_label}, ${lastRide.recommended_price} ₸, статус ${lastRide.status}` : 'нет данных'}. Сообщение пользователя: ${text.trim()}`,
        });

        if (assistantText) {
          reply = assistantText;
        }
      } catch {
        // Use fallback reply when Gemini is unavailable.
      }
    }

    const inserted = await sql`
      INSERT INTO chat_messages (user_id, role, channel, text)
      VALUES (${userId}, 'assistant', 'support', ${reply})
      RETURNING id, role, text, created_at
    `;

    return ok({
      reply: inserted[0],
    });
  } catch (error) {
    return serverError(error);
  }
}
