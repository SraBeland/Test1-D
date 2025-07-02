# Icon File Placement Guide

This guide explains where to place icon files for the LED Electron App and how they're handled in the built application.

## Icon File Locations

### During Development (Source Files)
Place your icon files in the **root project directory** (same level as main.js):

```
Project Root/
├── main.js
├── package.json
├── tray-icon.png          ← Place here
├── tray-icon.ico          ← Place here
├── icon.png               ← Place here
├── icon.ico               ← Place here
├── app-icon.png           ← Place here
└── other files...
```

### Supported Icon Formats
The app looks for icons in this priority order:

1. **ICO files** (Windows native format - recommended)
   - `tray-icon.ico`
   - `icon.ico`

2. **PNG files** (cross-platform)
   - `tray-icon.png`
   - `icon.png`

3. **SVG files** (vector format)
   - `tray-icon.svg`
   - `icon.svg`

## Icon File Specifications

### Tray Icon Requirements
- **Size**: 16x16 pixels (Windows system tray standard)
- **Format**: ICO or PNG recommended
- **Colors**: High contrast for visibility
- **Background**: Transparent recommended

### Application Icon Requirements
- **Size**: 256x256 pixels (for high DPI displays)
- **Format**: ICO with multiple sizes embedded, or PNG
- **Sizes**: Include 16x16, 32x32, 48x48, 128x128, 256x256

## How Icons Are Packaged

### In Built Application
When you run `npm run build-win`, the icons are:

1. **Included in the executable**: Icons are bundled into the app resources
2. **Accessible at runtime**: The app can load them from the resources folder
3. **Fallback system**: If custom icons aren't found, the app generates LED-style icons

### File Structure in Built App
```
dist/win-unpacked/
├── LED Electron App.exe
├── resources/
│   ├── app.asar              ← Your icons are inside here
│   ├── tray-icon.png         ← If placed in root during build
│   └── icon.png              ← If placed in root during build
└── other files...
```

## Current Icon Setup

### What's Currently Configured
The app is configured to:

1. **Look for custom icons** in the project root
2. **Generate fallback icons** if none are found
3. **Use LED-style programmatic icons** as last resort

### Adding Your Own Icons

#### Step 1: Create Icon Files
Create your icon files with these names:
- `tray-icon.ico` or `tray-icon.png` (16x16 pixels)
- `icon.ico` or `icon.png` (256x256 pixels)

#### Step 2: Place in Project Root
Copy your icon files to the same directory as `main.js`

#### Step 3: Update package.json (Optional)
To use icons in the installer, update package.json:

```json
{
  "build": {
    "win": {
      "icon": "icon.ico"
    },
    "nsis": {
      "installerIcon": "icon.ico",
      "uninstallerIcon": "icon.ico"
    }
  }
}
```

#### Step 4: Rebuild
Run `npm run build-win` to rebuild with your custom icons

## Icon Creation Tools

### Recommended Tools
1. **GIMP** (Free) - Can export to ICO format
2. **Paint.NET** (Free) - With ICO plugin
3. **IcoFX** (Paid) - Professional icon editor
4. **Online converters** - PNG to ICO conversion

### Creating LED-Style Icons
If you want to create custom LED-style icons:

1. **Base size**: 16x16 pixels for tray icon
2. **Colors**: Orange/red LEDs (#FF6600, #FF4400)
3. **Pattern**: Border with center elements
4. **Background**: Transparent or black
5. **Format**: Save as ICO for best compatibility

## Troubleshooting Icons

### Icons Not Appearing
1. **Check file names**: Must match exactly (case-sensitive)
2. **Check file format**: ICO recommended for Windows
3. **Check file size**: Keep under 1MB
4. **Rebuild app**: Icons are embedded during build process

### Using Custom Icons in Portable Version
The portable version includes all icons in the executable. Your custom icons will be available wherever the portable app runs.

### Using Custom Icons in Installed Version
The installed version places icons in the installation directory and they're available system-wide.

## Example Icon Workflow

### 1. Create Your Icon
```bash
# Create a 16x16 tray icon
# Create a 256x256 app icon
```

### 2. Place Files
```
Your Project/
├── tray-icon.ico          ← Your custom tray icon
├── icon.ico               ← Your custom app icon
├── main.js
└── package.json
```

### 3. Build Application
```bash
npm run build-win
```

### 4. Test Icons
- Check system tray for your custom tray icon
- Check taskbar/window for your custom app icon

## Default Behavior (No Custom Icons)

If no custom icons are provided, the app will:

1. **Generate LED-style tray icon** programmatically
2. **Use default Electron icon** for the application
3. **Continue working normally** with fallback icons

This ensures the app always has icons, even without custom files.
