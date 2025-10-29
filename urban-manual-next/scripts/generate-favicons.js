const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Source icon
const sourceIcon = path.join(__dirname, '../public/icons/favicon-um-minimal.png');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateFavicons() {
  console.log('🎨 Generating Urban Manual favicons...\n');
  console.log(`📁 Source: ${sourceIcon}\n`);

  // Check if source exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found!');
    console.error(`   Looking for: ${sourceIcon}`);
    process.exit(1);
  }

  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate each size
  for (const { size, name } of sizes) {
    const outputPath = path.join(publicDir, name);
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated ${name} (${size}x${size})`);
  }

  // Generate ICO file (32x32)
  const icoPath = path.join(publicDir, 'favicon.ico');
  await sharp(sourceIcon)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(icoPath);
  
  console.log('✅ Generated favicon.ico (32x32)');

  console.log('\n🎉 All favicons generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update app/layout.tsx with the new metadata');
  console.log('   2. Create public/site.webmanifest');
  console.log('   3. Test in browser');
}

generateFavicons().catch(error => {
  console.error('❌ Error generating favicons:', error);
  process.exit(1);
});

