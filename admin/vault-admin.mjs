// Admin mode: lets you edit collections from the listing pages while `npm run dev` is running.
// It only exists on the dev server, so nothing here ends up in dist/ or on your host.
// Log in with the ADMIN_PASSWORD from your .env file.
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { loadEnv } from 'vite';

const dataDir = new URL('../src/data/collections/', import.meta.url);
const COOKIE = 'vault_admin';

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 2_000_000) throw new Error('Request too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function sameText(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

// Keeps the house style of the JSON files: settings on their own lines, one item per line.
const inline = (value) =>
  Array.isArray(value)
    ? `[${value.map((v) => JSON.stringify(v)).join(', ')}]`
    : `{ ${Object.entries(value).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`;

function format(data) {
  const lines = Object.entries(data).map(([key, value]) => {
    let out;
    if (Array.isArray(value) && value.length && value.every((v) => v && typeof v === 'object' && !Array.isArray(v))) {
      out = `[\n${value.map((v) => `    ${inline(v)}`).join(',\n')}\n  ]`;
    } else if (Array.isArray(value)) {
      out = inline(value);
    } else {
      out = JSON.stringify(value);
    }
    return `  ${JSON.stringify(key)}: ${out}`;
  });
  return `{\n${lines.join(',\n')}\n}\n`;
}

// Drops empty fields, checks every item still has a name, and puts keys in column order.
function cleanItems(items, columns) {
  if (!Array.isArray(items)) throw new Error('"items" must be a list');
  return items.map((item, i) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Item ${i + 1} is not valid`);
    const clean = {};
    for (const [key, value] of Object.entries(item)) {
      const v = typeof value === 'string' ? value.trim() : value;
      if (v === '' || v === null || v === undefined) continue;
      clean[key] = v;
    }
    if (!clean.name) throw new Error(`Item ${i + 1} needs a name`);
    const order = ['name', ...columns.map((c) => c.key)];
    const rank = (key) => (order.includes(key) ? order.indexOf(key) : order.length);
    return Object.fromEntries(Object.entries(clean).sort(([a], [b]) => rank(a) - rank(b)));
  });
}

export default function vaultAdmin() {
  return {
    name: 'vault-admin',
    hooks: {
      'astro:server:setup': ({ server }) => {
        const sessions = new Set();
        const password = () => loadEnv('development', process.cwd(), '').ADMIN_PASSWORD ?? '';
        const loggedIn = (req) => {
          const match = (req.headers.cookie ?? '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
          return Boolean(match && sessions.has(match[1]));
        };

        server.middlewares.use('/__admin', async (req, res) => {
          try {
            // Only accept requests made by the site itself.
            const origin = req.headers.origin;
            if (req.method !== 'GET' && origin && new URL(origin).host !== req.headers.host) {
              return send(res, 403, { error: 'Not allowed' });
            }

            const route = req.url.split('?')[0];

            if (req.method === 'GET' && route === '/session') {
              return send(res, 200, { loggedIn: loggedIn(req), configured: Boolean(password()) });
            }

            if (req.method === 'POST' && route === '/login') {
              const expected = password();
              if (!expected) return send(res, 400, { error: 'Set ADMIN_PASSWORD in your .env file first, then restart npm run dev.' });
              const { password: given } = await readBody(req);
              if (!sameText(given ?? '', expected)) return send(res, 401, { error: 'That password is not right.' });
              const token = randomBytes(24).toString('hex');
              sessions.add(token);
              return send(res, 200, { loggedIn: true }, {
                'Set-Cookie': `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/`,
              });
            }

            if (req.method === 'POST' && route === '/logout') {
              sessions.clear();
              return send(res, 200, { loggedIn: false }, {
                'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,
              });
            }

            if (req.method === 'POST' && route === '/save') {
              if (!loggedIn(req)) return send(res, 401, { error: 'Please log in again.' });
              const { slug, items } = await readBody(req);
              if (!/^[a-z0-9-]+$/.test(slug ?? '')) return send(res, 400, { error: 'Unknown collection' });
              const file = new URL(`${slug}.json`, dataDir);
              const original = await readFile(file, 'utf8');
              const data = JSON.parse(original);
              data.items = cleanItems(items, data.columns ?? []);
              let text = format(data);
              if (original.includes('\r\n')) text = text.replace(/\n/g, '\r\n');
              await writeFile(file, text, 'utf8');
              return send(res, 200, { saved: data.items.length });
            }

            send(res, 404, { error: 'Not found' });
          } catch (error) {
            send(res, 400, { error: error.message });
          }
        });
      },
    },
  };
}
