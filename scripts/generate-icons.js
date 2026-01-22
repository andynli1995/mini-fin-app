#!/usr/bin/env node

// Script to generate PWA icons from SVG using sharp
// Run: npm run generate-icons

const fs = require('fs')
const path = require('path')

const projectRoot = path.join(__dirname, '..')
const logoIconPath = path.join(projectRoot, 'public', 'logo-icon.svg')
const logoPath = path.join(projectRoot, 'public', 'logo.svg')
const outputDir = path.join(projectRoot, 'public')

// Prefer logo-icon.svg (colored version), fallback to logo.svg
let svgPath = logoIconPath
if (!fs.existsSync(logoIconPath)) {
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: logo-icon.svg or logo.svg not found')
    process.exit(1)
  }
  svgPath = logoPath
  console.log('⚠️  Using logo.svg (consider creating logo-icon.svg with colored strokes)')
}

// Read the SVG
let svgContent = fs.readFileSync(svgPath, 'utf8')

// If using logo.svg, replace currentColor with blue color (#2563eb)
if (svgPath === logoPath) {
  svgContent = svgContent.replace(
    'stroke="currentColor"',
    'stroke="#2563eb"'
  )
}

// Create a temporary colored SVG
const tempSvgPath = path.join(outputDir, 'logo-colored.svg')
fs.writeFileSync(tempSvgPath, svgContent)

console.log('🎨 Generating PWA icons from logo...')
console.log('   Logo source:', logoPath)
console.log('   Output directory:', outputDir)
console.log('')

// Check if sharp is available
let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('❌ Error: sharp package not found.')
  console.error('\n📋 To fix this:')
  console.error('   1. Install sharp: npm install --save-dev sharp')
  console.error('   2. Or use an online tool:')
  console.error('      - https://realfavicongenerator.net/')
  console.error('      - https://www.pwabuilder.com/imageGenerator')
  console.error('      Upload public/logo.svg and download icon-192.png and icon-512.png')
  console.error('      Place them in the public/ directory')
  fs.unlinkSync(tempSvgPath)
  process.exit(1)
}

async function generateIcons() {
  try {
    const sizes = [192, 512]
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}.png`)
      
      await sharp(tempSvgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath)
      
      console.log(`✅ Generated icon-${size}.png`)
    }
    
    // Generate apple-touch-icon (180x180)
    const appleIconPath = path.join(outputDir, 'apple-icon-180.png')
    await sharp(tempSvgPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(appleIconPath)
    
    console.log(`✅ Generated apple-icon-180.png`)
    
    // Generate favicon (196x196)
    const faviconPath = path.join(outputDir, 'favicon-196.png')
    await sharp(tempSvgPath)
      .resize(196, 196, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(faviconPath)
    
    console.log(`✅ Generated favicon-196.png`)
    
    // Clean up temp file
    fs.unlinkSync(tempSvgPath)
    
    console.log('\n✅ All icons generated successfully!')
    console.log('   Icons are ready in the public/ directory')
  } catch (error) {
    console.error('\n❌ Error generating icons:', error.message)
    if (fs.existsSync(tempSvgPath)) {
      fs.unlinkSync(tempSvgPath)
    }
    process.exit(1)
  }
}

generateIcons()
