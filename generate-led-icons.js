const fs = require('fs');
const { createCanvas } = require('canvas');

function createLEDIcon(size, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    
    // Calculate LED dot size and spacing based on canvas size
    const dotSize = Math.max(1, Math.floor(size / 8));
    const spacing = Math.max(2, Math.floor(size / 6));
    
    // Create LED matrix pattern
    const rows = Math.floor(size / spacing);
    const cols = Math.floor(size / spacing);
    
    // Center the pattern
    const offsetX = (size - (cols - 1) * spacing) / 2;
    const offsetY = (size - (rows - 1) * spacing) / 2;
    
    // Draw LED dots in a pattern that looks like a display
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = offsetX + col * spacing;
            const y = offsetY + row * spacing;
            
            // Create a pattern - make some LEDs brighter to form a shape
            let brightness = 0.2; // Dim background LEDs
            
            // Create a simple "LED" or "display" pattern
            if (size >= 32) {
                // For larger icons, create a more complex pattern
                if ((row === 1 || row === rows - 2) && col > 0 && col < cols - 1) {
                    brightness = 1.0; // Top and bottom borders
                } else if ((col === 1 || col === cols - 2) && row > 0 && row < rows - 1) {
                    brightness = 1.0; // Left and right borders
                } else if (row === Math.floor(rows / 2) && col > 1 && col < cols - 2) {
                    brightness = 0.8; // Middle line
                }
            } else {
                // For smaller icons, simpler pattern
                if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
                    brightness = 1.0; // Border
                } else if (row === Math.floor(rows / 2) || col === Math.floor(cols / 2)) {
                    brightness = 0.6; // Cross pattern
                }
            }
            
            // Draw LED dot with glow effect
            const red = Math.floor(255 * brightness);
            const green = Math.floor(100 * brightness);
            const blue = Math.floor(50 * brightness);
            
            // Main LED dot
            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add glow effect for bright LEDs
            if (brightness > 0.5) {
                ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.3)`;
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
    
    // Save the canvas as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename} (${size}x${size})`);
}

// Generate LED icons
try {
    createLEDIcon(16, 'tray-icon.png');
    createLEDIcon(32, 'icon.png');
    console.log('\nLED icons created successfully!');
    console.log('- tray-icon.png (16x16) - Primary tray icon');
    console.log('- icon.png (32x32) - Fallback icon');
    console.log('\nRestart your application to see the new LED icons.');
} catch (error) {
    console.error('Error creating icons:', error.message);
    console.log('\nNote: This script requires the "canvas" package.');
    console.log('If you see an error, you can manually create icons using the create-led-icons.html file.');
}
