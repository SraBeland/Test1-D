const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a proper 256x256 icon for NSIS installer
function createLEDIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear background
    ctx.clearRect(0, 0, size, size);
    
    // Create LED circle with gradient
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
    glowGradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
    glowGradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, size, size);
    
    // Main LED body
    const mainGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
    mainGradient.addColorStop(0, '#FFD700');
    mainGradient.addColorStop(0.3, '#FF8C00');
    mainGradient.addColorStop(0.7, '#FF4500');
    mainGradient.addColorStop(1, '#DC143C');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = mainGradient;
    ctx.fill();
    
    // Highlight
    const highlightGradient = ctx.createRadialGradient(centerX - radius * 0.4, centerY - radius * 0.4, 0, centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.6);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = highlightGradient;
    ctx.fill();
    
    return canvas.toBuffer('image/png');
}

// Create 256x256 icon for installer
const iconBuffer = createLEDIcon(256);
fs.writeFileSync('installer-icon.png', iconBuffer);
console.log('Created installer-icon.png (256x256) for NSIS installer');

// Also update the main icon.png to be 256x256
fs.writeFileSync('icon.png', iconBuffer);
console.log('Updated icon.png to 256x256');
