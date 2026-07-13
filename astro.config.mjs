import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://www.kongda.space',
  output: 'static',
  integrations: [tailwind()],
})
