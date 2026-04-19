import { ensureTables, getSql } from './lib/db.mjs';
import { badRequest, methodNotAllowed, ok, parseBody, serverError } from './lib/http.mjs';

export async function handler(event) {
  try {
    const sql = await ensureTables(getSql());

    if (event.httpMethod === 'GET') {
      const userId = Number(event.queryStringParameters?.userId || 0);
      if (!userId) {
        return badRequest('Не найден пользователь.');
      }

      const rides = await sql`
        SELECT
          id,
          service_type,
          vehicle_type,
          pickup_label,
          destination_label,
          route_distance_km,
          route_duration_min,
          recommended_price,
          status,
          created_at
        FROM rides
        WHERE passenger_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 12
      `;

      return ok({ rides });
    }

    if (event.httpMethod === 'POST') {
      const { userId, serviceType = 'city', vehicleType, pickup, destination, fare, aiReasoning } = parseBody(event);

      if (!userId || !pickup || !destination || !fare) {
        return badRequest('Недостаточно данных для заказа.');
      }

      const result = await sql`
        INSERT INTO rides (
          passenger_id,
          service_type,
          vehicle_type,
          pickup_label,
          pickup_lat,
          pickup_lng,
          destination_label,
          destination_lat,
          destination_lng,
          route_distance_km,
          route_duration_min,
          base_price,
          recommended_price,
          demand_multiplier,
          traffic_multiplier,
          weather_multiplier,
          ai_reasoning,
          status
        )
        VALUES (
          ${userId},
          ${serviceType},
          ${vehicleType || 'jol_x'},
          ${pickup.label},
          ${pickup.lat},
          ${pickup.lng},
          ${destination.label},
          ${destination.lat},
          ${destination.lng},
          ${fare.distanceKm},
          ${fare.durationMin},
          ${fare.baseFare},
          ${fare.recommendedPrice},
          ${fare.demandMultiplier},
          ${fare.trafficMultiplier},
          ${fare.weatherMultiplier},
          ${aiReasoning || null},
          'confirmed'
        )
        RETURNING id, status, created_at
      `;

      return ok({
        message: serviceType === 'delivery' ? 'Доставка оформлена. Курьер скоро будет назначен.' : 'Заказ оформлен. Водитель скоро будет назначен.',
        ride: result[0],
      });
    }

    return methodNotAllowed();
  } catch (error) {
    return serverError(error);
  }
}
