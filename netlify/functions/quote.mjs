import { askGemini } from './lib/ai.mjs';
import { buildFareModel, getAstanaWeather, getRouteMetrics } from './lib/geo.mjs';
import { badRequest, methodNotAllowed, ok, parseBody, serverError } from './lib/http.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed();
  }

  try {
    const { pickup, destination } = parseBody(event);

    if (!pickup?.label || pickup?.lat == null || pickup?.lng == null || !destination?.label || destination?.lat == null || destination?.lng == null) {
      return badRequest('Выберите точку отправления и пункт назначения.');
    }

    const route = await getRouteMetrics(pickup, destination);
    const weather = await getAstanaWeather();
    const fare = buildFareModel({
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
      weather,
    });

    let aiReasoning = `${fare.demandLabel}, ${fare.trafficLabel.toLowerCase()}, погода: ${fare.weatherLabel.toLowerCase()}.`;
    let recommendedPrice = fare.recommendedPrice;

    try {
      const answer = await askGemini({
        systemPrompt:
          'Ты AI-диспетчер премиального сервиса такси в Астане. Отвечай кратко, деловым русским языком, без Markdown. В конце обязательно дай итоговую цену в тенге одной строкой: "Цена: 1234 ₸".',
        userPrompt: `Маршрут: ${pickup.label} -> ${destination.label}. Расстояние: ${fare.distanceKm} км. Время: ${fare.durationMin} мин. Спрос: ${fare.demandLabel}. Трафик: ${fare.trafficLabel}. Погода: ${fare.weatherLabel}. Базовая рекомендация системы: ${fare.recommendedPrice} тенге. Объясни цену и можешь скорректировать её не более чем на 12% от системной оценки.`,
      });

      if (answer) {
        aiReasoning = answer;
        const matched = answer.match(/Цена:\s*([\d\s]+)\s*₸/i);
        if (matched) {
          const parsed = Number(matched[1].replace(/\s+/g, ''));
          if (parsed > 0) {
            recommendedPrice = parsed;
          }
        }
      }
    } catch {
      // Keep deterministic fallback when Gemini or network is unavailable.
    }

    return ok({
      pickup,
      destination,
      route,
      fare: {
        ...fare,
        recommendedPrice,
      },
      weather,
      aiReasoning,
    });
  } catch (error) {
    return serverError(error);
  }
}
