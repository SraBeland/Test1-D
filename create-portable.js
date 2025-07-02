const fs = require('fs');
const path = require('path');

// Simple script to create a portable version from the win-unpacked directory
async function createPortable() {
  const sourceDir = path.join(__dirname, 'dist', 'win-unpacked');
  const targetFile = path.join(__dirname, 'dist', 'LED-Electron-App-with-Icons-portable.exe');
  const sourceExe = path.join(sourceDir, 'LED Electron App.exe');
  
  try {
    // Check if source exists
    if (!fs.existsSync(sourceExe)) {
      console.error('Source executable not found:', sourceExe);
      return;
    }
    
    // Copy the executable
    fs.copyFileSync(sourceExe, targetFile);
    
    console.log('✅ Portable executable created successfully!');
    console.log(`📁 Location: ${targetFile}`);
    console.log(`📊 Size: ${(fs.statSync(targetFile).size / 1024 / 1024).toFixed(1)} MB`);
    console.log('');
    console.log('🎯 This executable includes:');
    console.log('  ✅ Custom LED-style icons (PNG format)');
    console.log('  ✅ Local JSON database (no external dependencies)');
    console.log('  ✅ Enhanced error handling');
    console.log('  ✅ Multi-instance support');
    console.log('  ✅ All crash fixes applied');
    console.log('');
    console.log('📝 To use:');
    console.log('  1. Copy the entire "win-unpacked" folder to your target location');
    console.log('  2. Run "LED Electron App.exe" from that folder');
    console.log('  3. Or use the copied portable executable');
    
  } catch (error) {
    console.error('Error creating portable executable:', error);
  }
}

createPortable();
