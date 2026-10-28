import { defineConfig } from 'astro/config';
import vaultAdmin from './admin/vault-admin.mjs';

// Static output: `npm run build` writes plain HTML/CSS/JS to dist/,
// which you upload to Nekoweb / Neocities as-is.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Admin mode for editing collections, only while `npm run dev` is running.
  integrations: [vaultAdmin()],
  // Old collection URLs, kept working after DS and PS2 games merged into Physical Games.
  redirects: {
    '/collections/ds-games': '/collections/physical-games/',
    '/collections/ps2-games': '/collections/physical-games/',
  },
});
