#!/usr/bin/env node

// Script to generate PWA icons from SVG
// Run: npm run generate-icons

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = path.join(__dirname, '..')
const logoPath = path.join(projectRoot, 'public', 'logo.svg')
const outputDir = path.join(projectRoot, 'public')

if (!fs.existsSync(logoPath)) {
  console.error('❌ Error: logo.svg not found at', logoPath)
  console.error('   Make sure you run this from the project root directory')
  process.exit(1)
}

console.log('🎨 Generating PWA icons...')
console.log('   Logo source:', logoPath)
console.log('   Output directory:', outputDir)
console.log('')

try {
  // Use pwa-asset-generator if available
  execSync(
    `pwa-asset-generator "${logoPath}" "${outputDir}" --icon-only --favicon`,
    {
      stdio: 'inherit',
      cwd: projectRoot,
    }
  )
  console.log('\n✅ Icons generated successfully!')
  console.log('   Check the public/ directory for icon-192.png and icon-512.png')
} catch (error) {
  console.error('\n❌ Error generating icons.')
  console.error('\n📋 To fix this:')
  console.error('   1. Install pwa-asset-generator globally:')
  console.error('      npm install -g pwa-asset-generator')
  console.error('\n   2. Or use an online tool:')
  console.error('      - https://realfavicongenerator.net/')
  console.error('      - https://www.pwabuilder.com/imageGenerator')
  console.error('      Upload public/logo.svg and download icon-192.png and icon-512.png')
  console.error('      Place them in the public/ directory')
  console.error('\n   Note: The app will work with just the SVG logo for now.')
  process.exit(1)
}
