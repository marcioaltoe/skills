// @ts-check
import { defineConfig } from 'astro/config';

// Local dev/preview serve from the root (http://localhost:4321). The GitHub Pages
// deploy sets PAGES_BASE=/skills (project site at https://marcioaltoe.github.io/skills/).
const base = process.env.PAGES_BASE ?? '/';

export default defineConfig({
  site: 'https://marcioaltoe.github.io',
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
