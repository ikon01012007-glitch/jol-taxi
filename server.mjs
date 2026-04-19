import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const port = Number(process.env.PORT || 8888);

loadDotEnv(path.join(rootDir, '.env'));

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith('/.netlify/functions/')) {
      await handleFunction(req, res, url);
      return;
    }

    await handleStatic(req, res, url);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(port, () => {
  console.log(`Jol Taxi local server is running on http://localhost:${port}`);
});

async function handleFunction(req, res, url) {
  const name = url.pathname.replace('/.netlify/functions/', '');
  const modulePath = resolveFunctionPath(name);

  if (!modulePath) {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: `Function "${name}" not found` }));
    return;
  }

  const mod = await import(pathToFileURL(modulePath).href + `?t=${Date.now()}`);
  const handler = mod.handler || mod.default;

  if (typeof handler !== 'function') {
    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: `Function "${name}" does not export a handler` }));
    return;
  }

  const body = await readRequestBody(req);
  const event = {
    httpMethod: req.method,
    path: url.pathname,
    rawUrl: url.toString(),
    headers: req.headers,
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    body,
    isBase64Encoded: false,
  };

  const result = await handler(event, {});
  const statusCode = result?.statusCode || 200;
  const headers = result?.headers || { 'content-type': 'application/json; charset=utf-8' };
  const responseBody = result?.body ?? '';

  res.writeHead(statusCode, headers);
  res.end(responseBody);
}

async function handleStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(rootDir, pathname);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  const data = await readFile(filePath);
  res.writeHead(200, { 'content-type': contentTypes[ext] || 'application/octet-stream' });
  res.end(data);
}

function resolveFunctionPath(name) {
  const candidates = [
    path.join(rootDir, 'netlify', 'functions', `${name}.mjs`),
    path.join(rootDir, 'netlify', 'functions', `${name}.js`),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function loadDotEnv(envPath) {
  if (!existsSync(envPath)) {
    return;
  }

  const file = process.env.__DOTENV_CACHE || null;
  if (file === envPath) {
    return;
  }

  const text = requireText(envPath);
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^"(.*)"$/, '$1');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }

  process.env.__DOTENV_CACHE = envPath;
}

function requireText(filePath) {
  return readFileSync(filePath, 'utf8');
}
