// @ts-check
import { defineConfig } from 'astro/config';

// Deployed as a GitHub Pages project site at https://marcioaltoe.github.io/skills/.
// `base` is overridable so the same build works locally and on a custom domain:
//   PAGES_BASE=/ npm run build   ->  serve from root
const base = process.env.PAGES_BASE ?? '/skills';

export default defineConfig({
  site: 'https://marcioaltoe.github.io',
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
