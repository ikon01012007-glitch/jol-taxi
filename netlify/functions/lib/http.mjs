const baseHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export function json(statusCode, payload, headers = {}) {
  return {
    statusCode,
    headers: {
      ...baseHeaders,
      ...headers,
    },
    body: JSON.stringify(payload),
  };
}

export function ok(payload) {
  return json(200, payload);
}

export function badRequest(message, extra = {}) {
  return json(400, { error: message, ...extra });
}

export function unauthorized(message = 'Требуется авторизация') {
  return json(401, { error: message });
}

export function methodNotAllowed(method = 'Method Not Allowed') {
  return json(405, { error: method });
}

export function serverError(error) {
  return json(500, { error: error instanceof Error ? error.message : String(error) });
}

export function parseBody(event) {
  if (!event.body) {
    return {};
  }

  if (typeof event.body === 'object') {
    return event.body;
  }

  return JSON.parse(event.body);
}
