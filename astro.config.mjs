import { defineConfig } from 'astro/config';

// Static output: `npm run build` writes plain HTML/CSS/JS to dist/,
// which you upload to Nekoweb / Neocities as-is.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
