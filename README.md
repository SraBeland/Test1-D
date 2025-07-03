# MiniWebPlayer - Electron App to display a web page on a PC

MiniWebPlayer is an Electron based application that uses a local JSON file to store and retrieve window position and size settings. 

## Features

- Always-on-top window behavior
- Automatic window position and size persistence
- Local JSON file-based settings storage
- **Unique instance identification with GUID**
- **Multi-instance support** - multiple copies can run on different computers
- **System tray integration** - right-click context menu and tray icon
- **URL loading capability** - load external websites instead of default page
- **Configurable window constraints** - position and size limits for safe window placement
- No external database server required

## Window Configuration Limits

The application enforces the following constraints to ensure windows remain usable and visible:

- **Window Position (X, Y)**: 0 to 30,000 pixels
- **Window Size (Width, Height)**: 16 to 26,000 pixels

These limits prevent windows from being positioned off-screen or sized too small to be functional, while allowing flexibility for large multi-monitor setups.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm start
```

## How It Works

### Instance Management
- On first run, the app generates a unique GUID (UUID v4) and saves it to `instance-id.json`
- Each subsequent run loads the same GUID, ensuring consistent instance identification
- Multiple installations on different computers will have different GUIDs

### Database Operations
- On first run, the app creates a `database.json` file to store all settings
- The window position and size are loaded from the JSON file filtered by the instance GUID
- Any changes to window position or size are automatically saved to the JSON file with the instance GUID
- Each instance maintains its own separate window settings in the shared JSON file

## Database Structure

The app creates a JSON file with the following structure:

```json
{
  "instances": {
    "instance-guid-1": {
      "systemName": "System Name",
      "windowSettings": {
        "x": 100,
        "y": 100,
        "width": 800,
        "height": 600,
        "updatedAt": "2025-01-02T21:19:55.453Z"
      }
    },
    "instance-guid-2": {
      "systemName": "Another System",
      "windowSettings": {
        "x": 200,
        "y": 150,
        "width": 1024,
        "height": 768,
        "updatedAt": "2025-01-02T21:20:10.123Z"
      }
    }
  }
}
```

## Multi-Instance Support

MiniWebPlayer supports multiple instances running simultaneously:

- **Same Computer**: You can run multiple copies of MiniWebPlayer, each with its own window settings
- **Different Computers**: Each installation gets a unique GUID, so settings don't conflict
- **Local Storage**: All instances store data in the local `database.json` file
- **Portable**: The entire application and its data can be moved between systems

## Files Created

- `instance-id.json` - Contains the unique GUID for this installation (do not delete this file)
- `database.json` - Contains all window settings and system names for all instances

## Troubleshooting

- If the JSON file becomes corrupted, MiniWebPlayer will recreate it with default settings
- Check the console for any file system errors
- MiniWebPlayer gracefully handles missing or corrupted database files by falling back to defaults
