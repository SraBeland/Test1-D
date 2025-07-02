# Build Instructions for LED Electron App

This guide explains how to create a single-file installer for the LED Electron App.

## Prerequisites

- Node.js installed
- All dependencies installed (`npm install`)

## Build Commands

### Build Portable Executable (Single File)
```bash
npm run build-win
```

This creates:
- **Portable EXE**: `dist/LED Electron App-1.0.0-portable.exe` (single file, no installation required)
- **NSIS Installer**: `dist/LED Electron App Setup 1.0.0.exe` (traditional installer)

### Build All Platforms
```bash
npm run build
```

### Build for Distribution
```bash
npm run dist
```

## Output Files

After building, you'll find the installers in the `dist/` folder:

### Portable Version (Recommended for single-file distribution)
- **File**: `LED Electron App-1.0.0-portable.exe`
- **Size**: ~150-200MB (includes all dependencies)
- **Usage**: Double-click to run, no installation required
- **Data**: Creates database files in the same directory as the executable

### NSIS Installer Version
- **File**: `LED Electron App Setup 1.0.0.exe`
- **Size**: ~150-200MB
- **Usage**: Run to install the application to Program Files
- **Features**: 
  - Desktop shortcut creation
  - Start menu entry
  - Uninstaller
  - Installation directory selection

## Features Included in Both Versions

✅ **LED-style tray icon** (programmatically generated)
✅ **Local JSON database** (no external dependencies)
✅ **Window position/size persistence**
✅ **Multi-instance support** with unique GUIDs
✅ **System tray integration** with context menu
✅ **Settings panel** for configuration
✅ **URL loading capability**
✅ **Always-on-top window behavior**

## Distribution

### For Single-File Distribution:
1. Build the portable version: `npm run build-win`
2. Share the file: `dist/LED Electron App-1.0.0-portable.exe`
3. Users can run it directly without installation

### For Traditional Installation:
1. Build the installer: `npm run build-win`
2. Share the file: `dist/LED Electron App Setup 1.0.0.exe`
3. Users run the installer to install the application

## File Structure in Built Application

The built application includes:
- All JavaScript files (main.js, database.js, etc.)
- HTML files (index.html, settings.html)
- LED icon files (tray-icon.svg, icon.svg)
- Documentation (README.md, TRAY_ICON_GUIDE.md)
- Node.js runtime and Electron framework

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check that all referenced files exist
- Verify Node.js version compatibility

### Large File Size
- The executable includes the entire Electron runtime (~100MB+)
- This is normal for Electron applications
- Consider using electron-builder's compression options for smaller files

### Icon Issues
- SVG icons are included in the build
- The application will generate a fallback LED icon if custom icons aren't found
- For best results, convert SVG icons to ICO/PNG format

## Customization

To customize the installer:
1. Edit the `build` section in `package.json`
2. Modify installer icons, names, and descriptions
3. Add or remove files in the `files` array
4. Adjust NSIS installer options
