const fs = require('fs');

// Simple PNG creation without external dependencies
// This creates a basic LED-style pattern using raw PNG data

function createSimpleLEDIcon() {
    // Create a simple 16x16 LED-style icon using SVG, then we'll convert it
    const svgContent = `
<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" fill="#000000"/>
  
  <!-- LED dots in a pattern -->
  <circle cx="2" cy="2" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="6" cy="2" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="10" cy="2" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="14" cy="2" r="1" fill="#ff6600" opacity="1.0"/>
  
  <circle cx="2" cy="6" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="6" cy="6" r="1" fill="#ff4400" opacity="0.6"/>
  <circle cx="10" cy="6" r="1" fill="#ff4400" opacity="0.6"/>
  <circle cx="14" cy="6" r="1" fill="#ff6600" opacity="1.0"/>
  
  <circle cx="2" cy="10" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="6" cy="10" r="1" fill="#ff4400" opacity="0.6"/>
  <circle cx="10" cy="10" r="1" fill="#ff4400" opacity="0.6"/>
  <circle cx="14" cy="10" r="1" fill="#ff6600" opacity="1.0"/>
  
  <circle cx="2" cy="14" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="6" cy="14" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="10" cy="14" r="1" fill="#ff6600" opacity="1.0"/>
  <circle cx="14" cy="14" r="1" fill="#ff6600" opacity="1.0"/>
  
  <!-- Dim background LEDs -->
  <circle cx="4" cy="4" r="0.5" fill="#ff2200" opacity="0.3"/>
  <circle cx="8" cy="4" r="0.5" fill="#ff2200" opacity="0.3"/>
  <circle cx="12" cy="4" r="0.5" fill="#ff2200" opacity="0.3"/>
  
  <circle cx="4" cy="8" r="0.5" fill="#ff2200" opacity="0.3"/>
  <circle cx="8" cy="8" r="0.5" fill="#ff2200" opacity="0.3"/>
  <circle cx="12" cy="8" r="0.5" fill="#ff2200" opacity="0.3"/>
  
  <circle cx="4" cy="12" r="0.5" fill="#ff2200" opacity="0.3"/>
  <circle cx="8" cy="12" r="0.5" fill="#ff2200" opacity="0.3"/>
  <circle cx="12" cy="12" r="0.5" fill="#ff2200" opacity="0.3"/>
</svg>`;

    // Save as SVG first
    fs.writeFileSync('tray-icon.svg', svgContent);
    console.log('Created tray-icon.svg');
    
    // Create a larger version for the main icon
    const svgContent32 = `
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#000000"/>
  
  <!-- LED dots in a more complex pattern for 32x32 -->
  <!-- Top border -->
  <circle cx="4" cy="4" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="8" cy="4" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="12" cy="4" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="16" cy="4" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="20" cy="4" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="24" cy="4" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="28" cy="4" r="1.5" fill="#ff6600" opacity="1.0"/>
  
  <!-- Left and right borders -->
  <circle cx="4" cy="8" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="28" cy="8" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="4" cy="12" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="28" cy="12" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="4" cy="16" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="28" cy="16" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="4" cy="20" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="28" cy="20" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="4" cy="24" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="28" cy="24" r="1.5" fill="#ff6600" opacity="1.0"/>
  
  <!-- Bottom border -->
  <circle cx="4" cy="28" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="8" cy="28" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="12" cy="28" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="16" cy="28" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="20" cy="28" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="24" cy="28" r="1.5" fill="#ff6600" opacity="1.0"/>
  <circle cx="28" cy="28" r="1.5" fill="#ff6600" opacity="1.0"/>
  
  <!-- Middle horizontal line -->
  <circle cx="8" cy="16" r="1.2" fill="#ff4400" opacity="0.8"/>
  <circle cx="12" cy="16" r="1.2" fill="#ff4400" opacity="0.8"/>
  <circle cx="16" cy="16" r="1.2" fill="#ff4400" opacity="0.8"/>
  <circle cx="20" cy="16" r="1.2" fill="#ff4400" opacity="0.8"/>
  <circle cx="24" cy="16" r="1.2" fill="#ff4400" opacity="0.8"/>
  
  <!-- Dim background LEDs -->
  <circle cx="8" cy="8" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="12" cy="8" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="16" cy="8" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="20" cy="8" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="24" cy="8" r="0.8" fill="#ff2200" opacity="0.3"/>
  
  <circle cx="8" cy="12" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="12" cy="12" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="16" cy="12" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="20" cy="12" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="24" cy="12" r="0.8" fill="#ff2200" opacity="0.3"/>
  
  <circle cx="8" cy="20" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="12" cy="20" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="16" cy="20" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="20" cy="20" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="24" cy="20" r="0.8" fill="#ff2200" opacity="0.3"/>
  
  <circle cx="8" cy="24" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="12" cy="24" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="16" cy="24" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="20" cy="24" r="0.8" fill="#ff2200" opacity="0.3"/>
  <circle cx="24" cy="24" r="0.8" fill="#ff2200" opacity="0.3"/>
</svg>`;

    fs.writeFileSync('icon.svg', svgContent32);
    console.log('Created icon.svg');
    
    console.log('\nLED-style SVG icons created!');
    console.log('- tray-icon.svg (16x16) - Primary tray icon');
    console.log('- icon.svg (32x32) - Fallback icon');
    console.log('\nTo convert to PNG/ICO format:');
    console.log('1. Open the SVG files in any image editor (GIMP, Paint.NET, etc.)');
    console.log('2. Export as PNG with the same filename');
    console.log('3. Or use online converters like convertio.co or cloudconvert.com');
    console.log('\nAlternatively, open create-led-icons.html in your browser to generate PNG files directly.');
}

createSimpleLEDIcon();
