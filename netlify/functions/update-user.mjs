import { hashPassword, sanitizeUser, verifyPassword } from './lib/auth.mjs';
import { ensureTables, getSql } from './lib/db.mjs';
import { badRequest, methodNotAllowed, ok, parseBody, serverError, unauthorized } from './lib/http.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed();
  }

  try {
    const sql = await ensureTables(getSql());
    const { action, userId, name, email, phone, car_model, car_number, oldPassword, newPassword } = parseBody(event);

    if (!userId) {
      return badRequest('Не найден пользователь.');
    }

    if (action === 'change_password') {
      if (!oldPassword || !newPassword) {
        return badRequest('Введите старый и новый пароль.');
      }

      const result = await sql`SELECT id, password_hash FROM users WHERE id = ${userId} LIMIT 1`;
      const user = result[0];
      if (!user || !verifyPassword(oldPassword, user.password_hash)) {
        return unauthorized('Старый пароль указан неверно.');
      }

      await sql`UPDATE users SET password_hash = ${hashPassword(newPassword)} WHERE id = ${userId}`;
      return ok({ message: 'Пароль обновлён.' });
    }

    if (action === 'update_profile') {
      const result = await sql`
        UPDATE users
        SET
          name = COALESCE(${name?.trim() || null}, name),
          email = COALESCE(${email?.trim().toLowerCase() || null}, email),
          phone = COALESCE(${phone?.trim() || null}, phone),
          car_model = ${car_model || null},
          car_number = ${car_number || null}
        WHERE id = ${userId}
        RETURNING id, name, email, phone, role, car_model, car_number, rating, created_at
      `;

      return ok({
        message: 'Профиль обновлён.',
        user: sanitizeUser(result[0]),
      });
    }

    return badRequest('Неизвестное действие.');
  } catch (error) {
    return serverError(error);
  }
}
