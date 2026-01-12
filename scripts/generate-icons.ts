import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

const PUBLIC_DIR = join(import.meta.dir, '../public')
const SCRIPTS_DIR = import.meta.dir
const faviconSvg = readFileSync(join(PUBLIC_DIR, 'favicon.svg'))
const ogSvg = readFileSync(join(SCRIPTS_DIR, 'og-template.svg'))

const iconSizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

async function generateIcons() {
  // Generate PWA icons
  for (const { name, size } of iconSizes) {
    await sharp(faviconSvg)
      .resize(size, size)
      .png()
      .toFile(join(PUBLIC_DIR, name))
    console.log(`Generated ${name}`)
  }

  // Generate OG image
  await sharp(ogSvg)
    .png()
    .toFile(join(PUBLIC_DIR, 'og-image.png'))
  console.log('Generated og-image.png')

  console.log('Done!')
}

generateIcons()
