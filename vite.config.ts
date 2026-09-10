import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import app from './app.config.json' with { type: 'json' }

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as {
  version: string
}

function gitSha(): string {
  if (process.env.GIT_SHA) return process.env.GIT_SHA
  try {
    return execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return 'development'
  }
}

const base = `/${app.slug}/`
const buildInfo = {
  version: process.env.APP_VERSION ?? pkg.version,
  sha: gitSha(),
  builtAt: process.env.BUILD_TIME ?? new Date().toISOString(),
  appId: app.slug,
}

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: app.name,
        short_name: app.shortName,
        description: app.description,
        start_url: base,
        scope: base,
        display: 'standalone',
        theme_color: app.theme.primary,
        background_color: app.theme.background,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cacheId: app.slug,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
    {
      name: 'emit-version-file',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: `${JSON.stringify(buildInfo, null, 2)}\n`,
        })
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(buildInfo.version),
    __GIT_SHA__: JSON.stringify(buildInfo.sha),
    __BUILD_TIME__: JSON.stringify(buildInfo.builtAt),
    __APP_ID__: JSON.stringify(buildInfo.appId),
  },
})
