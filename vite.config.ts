import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'
import packageInfo from './package.json' with { type: 'json' }

export default defineConfig(({ command, isPreview }) => {
  // GitHub Pages serves this repository in a subdirectory; dev stays at /.
  const base = command === 'build' || isPreview ? '/the-patriot-app/' : '/'

  return {
    base,
    define: { __APP_VERSION__: JSON.stringify(packageInfo.version) },
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectRegister: false,
        registerType: 'prompt',
        scope: base,
        injectManifest: {
          globPatterns: ['**/*.{html,js,css,svg,png,webmanifest}'],
        },
        manifest: {
          id: base,
          name: 'The Patriot App',
          short_name: 'The Patriot App',
          description:
            'Study the 128 official questions for the 2025 USCIS civics test.',
          lang: 'en',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#f7f5ef',
          theme_color: '#f7f5ef',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    server: { port: 5173, strictPort: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
    },
  }
})
