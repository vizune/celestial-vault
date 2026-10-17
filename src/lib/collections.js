// Loads every JSON file in src/data/collections/ at build time.
// Each file becomes one collection; its filename becomes the URL slug,
// e.g. ps2-games.json -> /collections/ps2-games/
const files = import.meta.glob('../data/collections/*.json', { eager: true });

function check(slug, data) {
  const problems = [];
  if (!data.title) problems.push('missing "title"');
  if (!Array.isArray(data.columns) || data.columns.length === 0) problems.push('missing "columns"');
  if (!Array.isArray(data.items)) problems.push('"items" must be an array');
  (data.items ?? []).forEach((item, i) => {
    if (!item.name) problems.push(`item ${i + 1} has no "name"`);
  });
  (data.filters ?? []).forEach((key) => {
    if (!data.columns?.some((c) => c.key === key)) problems.push(`filter "${key}" is not a column`);
  });
  if (problems.length) {
    throw new Error(`src/data/collections/${slug}.json: ${problems.join('; ')}`);
  }
}

export const collections = Object.entries(files)
  .map(([path, mod]) => {
    const data = mod.default ?? mod;
    const slug = path.split('/').pop().replace(/\.json$/, '');
    check(slug, data);
    return {
      slug,
      url: `/collections/${slug}/`,
      filters: [],
      glyph: '✦',
      ...data,
    };
  })
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));

export const totalItems = collections.reduce((n, c) => n + c.items.length, 0);

/** Every item marked "Wishlist", across all collections. */
export const wishlist = collections.flatMap((c) =>
  c.items
    .filter((item) => String(item.status ?? '').toLowerCase() === 'wishlist')
    .map((item) => ({ ...item, collection: c.title, collectionUrl: c.url }))
);

export const slugify = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Text shown in a table cell. */
export function display(value, type) {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'date') {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (type === 'percent') return `${Number(value).toFixed(1)}%`;
  return String(value);
}

/** Value used for sorting (dates and numbers sort numerically). */
export function sortValue(value, type) {
  if (value === null || value === undefined || value === '') return '';
  if (type === 'date') return String(new Date(value).getTime() || '');
  if (type === 'percent' || typeof value === 'number') return String(Number(value));
  return String(value).toLowerCase();
}
