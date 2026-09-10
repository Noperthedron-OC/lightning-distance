import { readFile, writeFile } from 'node:fs/promises'

function argument(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const slug = argument('slug')
const name = argument('name')
const shortName = argument('short-name')

if (!slug || !name || !shortName) {
  console.error(
    'Usage: npm run configure -- --slug my-app --name "My App" --short-name "My App"',
  )
  process.exit(1)
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    'Slug must use lowercase letters, numbers, and single hyphens only.',
  )
  process.exit(1)
}

if (shortName.length > 12) {
  console.error('Short name must be 12 characters or fewer.')
  process.exit(1)
}

const configUrl = new URL('../app.config.json', import.meta.url)
const packageUrl = new URL('../package.json', import.meta.url)
const htmlUrl = new URL('../index.html', import.meta.url)
const config = JSON.parse(await readFile(configUrl, 'utf8'))
const pkg = JSON.parse(await readFile(packageUrl, 'utf8'))
let html = await readFile(htmlUrl, 'utf8')

config.slug = slug
config.name = name
config.shortName = shortName
pkg.name = slug
html = html
  .replace(/<title>.*?<\/title>/, `<title>${name}</title>`)
  .replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${config.description}" />`,
  )

await writeFile(configUrl, `${JSON.stringify(config, null, 2)}\n`)
await writeFile(packageUrl, `${JSON.stringify(pkg, null, 2)}\n`)
await writeFile(htmlUrl, html)

console.log(`Configured ${name} for https://ai-lab.erichweihs.com/${slug}/`)
console.log('Next: update description, theme tokens, and all icon artwork.')
