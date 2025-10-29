# Urban Manual Favicon Implementation Guide

**Date:** October 26, 2025
**Goal:** Replace the default template favicon with custom Urban Manual icons

---

## Icon Options Created

I've generated 5 different icon designs for you to choose from:

### **Option 1: UM Monogram** 
- Modern interlocking "UM" letters
- Clean geometric design
- High contrast black and white
- Best for: Brand recognition

### **Option 2: Architectural Doorway**
- Minimalist building/doorway silhouette
- Geometric and clean
- Represents urban exploration
- Best for: Editorial feel

### **Option 3: Map Pin**
- Geometric location marker
- Travel/destination focused
- Simple and recognizable
- Best for: Destination discovery

### **Option 4: Compass**
- Navigation/exploration theme
- Circular geometric design
- Classic travel symbol
- Best for: Journey/exploration

### **Option 5: Abstract U Mark**
- Stylized "U" lettermark
- Modern and sophisticated
- Architectural feel
- Best for: Minimalist aesthetic

---

## Quick Implementation (5 Minutes)

### Step 1: Choose Your Favorite Icon

All icons are located in: `/public/icons/`

- `favicon-option-1.png` - UM Monogram
- `favicon-option-2.png` - Architectural Doorway
- `favicon-option-3.png` - Map Pin
- `favicon-option-4.png` - Compass
- `favicon-option-5.png` - Abstract U Mark

### Step 2: Generate Favicon Sizes

```bash
cd /home/ubuntu/urban-manual/urban-manual-next

# Install sharp for image processing
npm install --save-dev sharp

# Create favicon generation script
cat > scripts/generate-favicons.js << 'EOF'
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Choose your icon (change this to your preferred option)
const sourceIcon = 'public/icons/favicon-option-1.png';

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateFavicons() {
  console.log('🎨 Generating favicons...\n');

  for (const { size, name } of sizes) {
    await sharp(sourceIcon)
      .resize(size, size)
      .toFile(path.join('public', name));
    console.log(`✅ Generated ${name} (${size}x${size})`);
  }

  // Generate ICO file (16x16 and 32x32)
  await sharp(sourceIcon)
    .resize(32, 32)
    .toFile('public/favicon.ico');
  console.log('✅ Generated favicon.ico');

  console.log('\n🎉 All favicons generated!');
}

generateFavicons().catch(console.error);
EOF

# Run the script
node scripts/generate-favicons.js
```

### Step 3: Update Metadata in `app/layout.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Urban Manual',
  description: 'Curated design-focused destinations worldwide',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
}
```

### Step 4: Create Web App Manifest

Create `public/site.webmanifest`:

```json
{
  "name": "Urban Manual",
  "short_name": "Urban Manual",
  "description": "Curated design-focused destinations worldwide",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

### Step 5: Test

```bash
# Start dev server
npm run dev

# Check these URLs:
# - http://localhost:3000/favicon.ico
# - http://localhost:3000/favicon-32x32.png
# - http://localhost:3000/apple-touch-icon.png

# Check browser tab - you should see your new icon!
```

---

## Manual Method (If You Don't Want to Run Scripts)

### Option A: Use Online Favicon Generator

1. **Choose your favorite icon** from `/public/icons/`

2. **Go to:** https://realfavicongenerator.net/

3. **Upload** your chosen PNG

4. **Configure:**
   - iOS: Keep default or customize
   - Android: Keep default or customize
   - Windows: Keep default or customize
   - macOS Safari: Keep default or customize

5. **Generate** and download the package

6. **Extract** all files to `/public/` directory

7. **Copy** the HTML code to your `app/layout.tsx`

### Option B: Use Figma/Photoshop

1. Open your chosen icon in Figma/Photoshop

2. Export at these sizes:
   - 16x16px → `favicon-16x16.png`
   - 32x32px → `favicon-32x32.png`
   - 48x48px → `favicon-48x48.png`
   - 180x180px → `apple-touch-icon.png`
   - 192x192px → `android-chrome-192x192.png`
   - 512x512px → `android-chrome-512x512.png`

3. Save all to `/public/` directory

4. Update `app/layout.tsx` with the metadata code above

---

## Advanced: Animated Favicon (Optional)

Want to add a subtle animation? Here's how:

### Create `public/favicon.svg`:

```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .icon { animation: pulse 2s ease-in-out infinite; }
  </style>
  
  <!-- Replace with your chosen icon design -->
  <g class="icon">
    <!-- Your icon SVG code here -->
  </g>
</svg>
```

### Update metadata:

```typescript
export const metadata: Metadata = {
  // ... other metadata
  icons: {
    icon: '/favicon.svg', // SVG takes priority
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}
```

---

## Recommended Icon Choice

Based on Urban Manual's minimalist, editorial aesthetic, I recommend:

### **🏆 Option 1: UM Monogram**

**Why:**
- ✅ Strong brand identity
- ✅ Recognizable at small sizes
- ✅ Modern and professional
- ✅ Works well in browser tabs
- ✅ Memorable

**Alternative:**
- **Option 5: Abstract U Mark** - If you want something more architectural
- **Option 3: Map Pin** - If you want to emphasize destinations/travel

---

## Checklist

- [ ] Choose your favorite icon design
- [ ] Run favicon generation script (or use online tool)
- [ ] Update `app/layout.tsx` with new metadata
- [ ] Create `site.webmanifest`
- [ ] Test in browser (check tab icon)
- [ ] Test on mobile (save to home screen)
- [ ] Clear browser cache if old icon persists
- [ ] Deploy to production
- [ ] Verify on live site

---

## Troubleshooting

### Issue 1: Old icon still showing

**Solution:**
```bash
# Clear browser cache
# Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
# Or hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue 2: Icon looks blurry

**Solution:**
- Make sure source image is high resolution (at least 512x512px)
- Use PNG format, not JPG
- Ensure sharp edges and high contrast

### Issue 3: Icon not showing on iOS

**Solution:**
- Make sure `apple-touch-icon.png` is exactly 180x180px
- Must be PNG format
- Should be in `/public/` root directory

### Issue 4: Manifest not loading

**Solution:**
```typescript
// Make sure manifest is in metadata
export const metadata: Metadata = {
  manifest: '/site.webmanifest', // Add this line
  // ... other metadata
}
```

---

## Files You'll Have

After implementation:

```
public/
├── favicon.ico                    # 32x32 ICO
├── favicon-16x16.png             # 16x16 PNG
├── favicon-32x32.png             # 32x32 PNG
├── favicon-48x48.png             # 48x48 PNG
├── apple-touch-icon.png          # 180x180 PNG (iOS)
├── android-chrome-192x192.png    # 192x192 PNG (Android)
├── android-chrome-512x512.png    # 512x512 PNG (Android)
├── site.webmanifest              # Web app manifest
└── icons/                         # Original source files
    ├── favicon-option-1.png
    ├── favicon-option-2.png
    ├── favicon-option-3.png
    ├── favicon-option-4.png
    └── favicon-option-5.png
```

---

## Next Steps

1. **Choose your icon** - Review all 5 options
2. **Generate favicons** - Run the script or use online tool
3. **Update metadata** - Edit `app/layout.tsx`
4. **Test** - Check browser tab
5. **Deploy** - Push to production

---

## Need Help?

If you want me to:
- Generate favicons for a specific option
- Create an SVG version
- Customize any icon design
- Add animation
- Create additional sizes

Just let me know which option you prefer!

