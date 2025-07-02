# Tray Icon Setup Guide

## How to Set a Custom Tray Icon

The application supports custom tray icons. Here's how to set one up:

### Option 1: Use an ICO file (Recommended for Windows)
1. Create or obtain a 16x16 or 32x32 pixel icon file
2. Save it as `tray-icon.ico` in the project root directory
3. Restart the application

### Option 2: Use a PNG file
1. Create or obtain a 16x16 or 32x32 pixel PNG image
2. Save it as `tray-icon.png` in the project root directory
3. Restart the application

### Option 3: Use any supported image format
The application will look for tray icons in this order:
1. `tray-icon.ico`
2. `tray-icon.png`
3. `tray-icon.svg` (may not work on all systems)
4. `icon.ico`
5. `icon.png`
6. `icon.svg` (may not work on all systems)
7. System default (if none found)

**Note**: SVG files are included in the search but may not display properly on all systems. PNG or ICO format is recommended for best compatibility.

### Icon Requirements:
- **Size**: 16x16 or 32x32 pixels (16x16 recommended for tray)
- **Format**: ICO, PNG, JPG, or any format supported by Electron
- **Background**: Transparent background recommended
- **Style**: Simple, high contrast design works best in system tray

### Creating Icons:
You can create icons using:
- **Online tools**: favicon.io, iconifier.net
- **Software**: GIMP, Paint.NET, Photoshop
- **Convert existing images**: Use online converters to convert PNG to ICO

### Example Icon Locations:
```
project-root/
├── tray-icon.ico     ← Primary choice
├── tray-icon.png     ← Secondary choice
├── icon.ico          ← Fallback choice
├── main.js
├── package.json
└── ...
```

### Testing:
After adding an icon file:
1. Restart the application (`npm start`)
2. Look for the tray icon in your system tray (bottom-right on Windows)
3. Right-click the tray icon to see the context menu

### Troubleshooting:
- If no icon appears, check the console for error messages
- Ensure the icon file is in the correct location
- Try different file formats (ICO works best on Windows)
- Make sure the icon file isn't corrupted
