import { hashPassword, sanitizeUser } from './lib/auth.mjs';
import { ensureTables, getSql } from './lib/db.mjs';
import { badRequest, methodNotAllowed, ok, parseBody, serverError } from './lib/http.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed();
  }

  try {
    const sql = await ensureTables(getSql());
    const { name, email, phone, password, role = 'passenger', car_model = null, car_number = null } = parseBody(event);

    if (!name || !email || !phone || !password) {
      return badRequest('Заполните имя, email, телефон и пароль.');
    }

    if (password.length < 6) {
      return badRequest('Пароль должен быть не короче 6 символов.');
    }

    const existing = await sql`
      SELECT id FROM users
      WHERE email = ${email.trim().toLowerCase()} OR phone = ${phone.trim()}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return badRequest('Пользователь с таким email или телефоном уже существует.');
    }

    const result = await sql`
      INSERT INTO users (name, email, phone, password_hash, role, car_model, car_number)
      VALUES (
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${phone.trim()},
        ${hashPassword(password)},
        ${role === 'driver' ? 'driver' : 'passenger'},
        ${car_model || null},
        ${car_number || null}
      )
      RETURNING id, name, email, phone, role, car_model, car_number, rating, created_at
    `;

    return ok({
      message: 'Регистрация прошла успешно.',
      user: sanitizeUser(result[0]),
    });
  } catch (error) {
    return serverError(error);
  }
}
