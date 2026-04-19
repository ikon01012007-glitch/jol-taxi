import { ensureTables, getSql } from './lib/db.mjs';
import { methodNotAllowed, ok, serverError } from './lib/http.mjs';

export async function handler(event) {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return methodNotAllowed();
  }

  try {
    await ensureTables(getSql());
    return ok({ message: 'База данных готова к работе.' });
  } catch (error) {
    return serverError(error);
  }
}
