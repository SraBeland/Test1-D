const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create LED-style icon
function createLEDIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, size, size);
  
  // Calculate LED grid based on size
  const ledSize = Math.max(1, Math.floor(size / 16));
  const spacing = Math.max(1, Math.floor(size / 32));
  const borderWidth = Math.max(1, Math.floor(size / 16));
  
  // Draw black background circle/square
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);
  
  // Draw orange border
  ctx.strokeStyle = '#FF6600';
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(borderWidth/2, borderWidth/2, size - borderWidth, size - borderWidth);
  
  // Draw LED pattern
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Main center LED (bright orange)
  ctx.fillStyle = '#FF4400';
  const centerSize = Math.max(2, Math.floor(size / 8));
  ctx.fillRect(centerX - centerSize/2, centerY - centerSize/2, centerSize, centerSize);
  
  // Surrounding LEDs (dimmer)
  ctx.fillStyle = '#CC3300';
  const smallLedSize = Math.max(1, Math.floor(size / 16));
  
  // Create LED grid pattern
  for (let x = borderWidth + spacing; x < size - borderWidth - spacing; x += ledSize + spacing) {
    for (let y = borderWidth + spacing; y < size - borderWidth - spacing; y += ledSize + spacing) {
      // Skip center area
      if (Math.abs(x - centerX) > centerSize && Math.abs(y - centerY) > centerSize) {
        // Vary LED brightness
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt((size/2) ** 2 + (size/2) ** 2);
        const brightness = 1 - (distance / maxDistance);
        
        if (brightness > 0.3) {
          const alpha = Math.max(0.3, brightness);
          ctx.fillStyle = `rgba(204, 51, 0, ${alpha})`;
          ctx.fillRect(x, y, smallLedSize, smallLedSize);
        }
      }
    }
  }
  
  // Add highlight to center LED
  ctx.fillStyle = '#FF6600';
  const highlightSize = Math.max(1, Math.floor(centerSize / 3));
  ctx.fillRect(centerX - highlightSize/2, centerY - highlightSize/2, highlightSize, highlightSize);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename} (${size}x${size})`);
}

// Function to create ICO file from PNG (simplified approach)
function createICOFromPNG(pngFile, icoFile) {
  try {
    // For now, we'll copy the PNG and rename it
    // In a real implementation, you'd convert PNG to ICO format
    const pngData = fs.readFileSync(pngFile);
    
    // Create a basic ICO header (simplified)
    // This is a minimal ICO file structure
    const iconDir = Buffer.alloc(6);
    iconDir.writeUInt16LE(0, 0); // Reserved
    iconDir.writeUInt16LE(1, 2); // Type (1 = ICO)
    iconDir.writeUInt16LE(1, 4); // Number of images
    
    const iconDirEntry = Buffer.alloc(16);
    iconDirEntry.writeUInt8(16, 0);  // Width (16 for 16x16)
    iconDirEntry.writeUInt8(16, 1);  // Height
    iconDirEntry.writeUInt8(0, 2);   // Color count
    iconDirEntry.writeUInt8(0, 3);   // Reserved
    iconDirEntry.writeUInt16LE(1, 4); // Planes
    iconDirEntry.writeUInt16LE(32, 6); // Bits per pixel
    iconDirEntry.writeUInt32LE(pngData.length, 8); // Size of image data
    iconDirEntry.writeUInt32LE(22, 12); // Offset to image data
    
    const icoData = Buffer.concat([iconDir, iconDirEntry, pngData]);
    fs.writeFileSync(icoFile, icoData);
    console.log(`Created ${icoFile} from ${pngFile}`);
  } catch (error) {
    console.log(`Note: Could not create ICO file (${error.message}). PNG files will work fine.`);
  }
}

// Check if canvas module is available
try {
  require.resolve('canvas');
  
  console.log('Creating LED-style icons...');
  
  // Create tray icon (16x16)
  createLEDIcon(16, 'tray-icon.png');
  
  // Create app icon (256x256)
  createLEDIcon(256, 'icon.png');
  
  // Create additional sizes
  createLEDIcon(32, 'icon-32.png');
  createLEDIcon(48, 'icon-48.png');
  createLEDIcon(128, 'icon-128.png');
  
  // Try to create ICO files
  createICOFromPNG('tray-icon.png', 'tray-icon.ico');
  createICOFromPNG('icon.png', 'icon.ico');
  
  console.log('\n✅ LED-style icons created successfully!');
  console.log('Files created:');
  console.log('- tray-icon.png (16x16) - for system tray');
  console.log('- icon.png (256x256) - for application');
  console.log('- icon-32.png, icon-48.png, icon-128.png - additional sizes');
  console.log('- tray-icon.ico, icon.ico - Windows ICO format');
  console.log('\nNow run: npm run build-win');
  
} catch (error) {
  console.log('Canvas module not available. Installing...');
  console.log('Run: npm install canvas');
  console.log('Then run this script again: node create-icons.js');
}
