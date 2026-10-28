# Celestial Vault

A static collection-logging site built with [Astro](https://astro.build). All your data lives in JSON files, and every collection gets its own searchable, sortable table page. The build output is plain HTML/CSS/JS, so it works on Nekoweb, Neocities or any other static host.

The coming-soon page in `splash/` is separate and isn't part of the build.

## Getting started

Requires Node 22.12 or newer (check with `node -v`).

```bash
npm install
npm run dev       # local preview at http://localhost:4321
npm run build     # writes the finished site to dist/
```

## Admin mode (edit without touching JSON)

While `npm run dev` is running, every collection page has an **Admin mode** bar above the table.

1. Log in with the password in your `.env` file (`ADMIN_PASSWORD=…`). Change it to anything you like and restart `npm run dev`. If you ever lose `.env`, copy `.env.example`.
2. Click **Edit**, then use **+ Add item**, change any field, or **Remove** a row. Fields suggest values you've already used, like platforms and statuses.
3. Click **Save changes**. The collection's JSON file is rewritten and the page reloads with your edits.

Admin mode only exists on your own computer. It isn't part of `npm run build`, so nothing about it is uploaded to your host. When you're happy with your edits, build and upload as usual.

## Adding an item

You can also edit the JSON by hand: open the collection's file in `src/data/collections/` and add an object to `items`:

```json
{ "name": "Okami", "platform": "PS2", "region": "PAL", "completeness": "CIB", "condition": "Good", "status": "Owned", "notes": "Clover edition!", "added": "2026-10-17" }
```

Optional on any item:

| Key     | What it does                                      |
| ------- | ------------------------------------------------- |
| `image` | Thumbnail, e.g. `"/images/items/okami.jpg"` (put the file in `public/images/items/`) |
| `link`  | Makes the item name a link                        |
| `added` | Date you logged it (handy for sorting later)      |

Set `"status": "Wishlist"` on any item and it shows up on the Wishlist page automatically.

## Adding a collection

Copy any file in `src/data/collections/` and rename it. The filename becomes the URL, so `plushies.json` becomes `/collections/plushies/`. The new collection then appears on the home page, the Collections page and in its own table.

```json
{
  "title": "Plushies",
  "order": 7,
  "glyph": "❦",
  "cover": "/images/covers/plushies.jpg",
  "description": "Soft friends from claw machines and con stalls.",
  "columns": [
    { "key": "name", "label": "Plushie" },
    { "key": "series", "label": "Series" },
    { "key": "maker", "label": "Maker" },
    { "key": "status", "label": "Status", "type": "badge" },
    { "key": "notes", "label": "Notes" }
  ],
  "filters": ["status", "series"],
  "items": []
}
```

- **columns**: which item keys show in the table, and in what order. The first column is the item name.
- **column `type`**: `badge` (coloured pill), `date` (formats `2026-10-17` as "17 Oct 2026"), `percent` (`4.2` becomes `4.2%`), or leave it out for plain text.
- **filters**: column keys that get a dropdown filter.
- **cover**: tile and header image. Leave it as `null` to use a crop of the banner, which `coverPosition` controls.
- **order**: position on the home page.

If a JSON file is missing something important (no title, an item with no name, a filter that isn't a column), the build stops with a message telling you which file to fix.

### Badge colours

Badge values are turned into CSS classes, e.g. "Pre-ordered" becomes `.badge--pre-ordered`. Add new colours at the bottom of the badge section in `src/styles/global.css`.

## Deploying

Run `npm run build` and upload the contents of `dist/` to your host's root folder.

## Project layout

```
src/
  data/collections/*.json   ← your collections (the only files you need to edit day-to-day)
  pages/                    ← home, collections, [slug] table page, wishlist, about
  components/               ← CollectionTile, CollectionTable
  layouts/Base.astro        ← sidebar shell
  styles/global.css         ← palette + all styles
  lib/collections.js        ← loads + validates the JSON
public/images/              ← banner, covers, item photos
admin/vault-admin.mjs       ← admin mode's save/login (dev server only)
```
