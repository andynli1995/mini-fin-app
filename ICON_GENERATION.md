# Icon Generation Instructions

The app needs properly colored PNG icons for PWA installation. The logo SVG uses `currentColor` which renders as black when converted to PNG.

## Quick Solution (Recommended)

1. **Install sharp** (if not already installed):
   ```bash
   npm install --save-dev sharp
   ```

2. **Generate icons**:
   ```bash
   npm run generate-icons
   ```

This will generate:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-icon-180.png` (180x180 for iOS)
- `favicon-196.png` (196x196)

## Alternative: Online Tool

If you prefer not to install sharp, use an online tool:

1. Go to https://realfavicongenerator.net/
2. Upload `public/logo-icon.svg` (the colored version)
3. Configure:
   - Android Chrome: 192x192 and 512x512
   - iOS: 180x180
   - Favicon: 196x196
4. Download and place the icons in the `public/` directory

## What's Different

- `logo.svg` - Original logo with `currentColor` (for in-app use)
- `logo-icon.svg` - Colored version with `#2563eb` stroke (for icon generation)

The colored version ensures icons display properly when installed as a PWA.
