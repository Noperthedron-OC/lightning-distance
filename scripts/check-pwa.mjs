import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url)
const config = JSON.parse(
  await readFile(new URL('app.config.json', root), 'utf8'),
)
const errors = []

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.slug)) {
  errors.push(
    'app.config.json slug must use lowercase letters, numbers, and single hyphens',
  )
}

if (config.shortName.length > 12) {
  errors.push('shortName should be 12 characters or fewer')
}

const required = [
  'public/favicon.svg',
  'public/apple-touch-icon.png',
  'public/icons/icon-source.svg',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/icons/icon-maskable-512.png',
  'public/.htaccess',
  'public/_headers',
]

for (const path of required) {
  try {
    await access(join(root.pathname, path))
  } catch {
    errors.push(`Missing required PWA artifact: ${path}`)
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}

console.log(`PWA configuration is complete for /${config.slug}/`)
