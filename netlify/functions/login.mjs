import { sanitizeUser, verifyPassword } from './lib/auth.mjs';
import { ensureTables, getSql } from './lib/db.mjs';
import { badRequest, methodNotAllowed, ok, parseBody, serverError, unauthorized } from './lib/http.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed();
  }

  try {
    const sql = await ensureTables(getSql());
    const { identifier, password } = parseBody(event);

    if (!identifier || !password) {
      return badRequest('Введите email или телефон и пароль.');
    }

    const result = await sql`
      SELECT id, name, email, phone, role, car_model, car_number, rating, created_at, password_hash
      FROM users
      WHERE email = ${identifier.trim().toLowerCase()} OR phone = ${identifier.trim()}
      LIMIT 1
    `;

    const user = result[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return unauthorized('Неверный логин или пароль.');
    }

    return ok({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return serverError(error);
  }
}
