# Troubleshooting Guide for LED Electron App

This guide helps resolve common issues when running the LED Electron App on different systems.

## Issue: Application Starts and Then Closes Immediately

### Possible Causes and Solutions:

#### 1. **Missing Visual C++ Redistributables**
**Symptoms**: App starts briefly then closes without error message
**Solution**: Install Microsoft Visual C++ Redistributable
- Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe
- Install and restart the computer

#### 2. **Antivirus Software Blocking**
**Symptoms**: App closes immediately, may show in antivirus logs
**Solution**: 
- Add the executable to antivirus whitelist/exceptions
- Temporarily disable real-time protection to test
- Some antivirus software blocks unsigned executables

#### 3. **Insufficient Permissions**
**Symptoms**: App closes when trying to create database files
**Solution**:
- Run as Administrator (right-click → "Run as administrator")
- Or move the executable to a user-writable location (Desktop, Documents)

#### 4. **Corrupted Download**
**Symptoms**: App won't start at all or crashes immediately
**Solution**:
- Re-download the executable
- Verify file size matches expected size (~87MB)

#### 5. **Windows Defender SmartScreen**
**Symptoms**: Warning about "unrecognized app" or blocked execution
**Solution**:
- Click "More info" → "Run anyway"
- Or right-click executable → Properties → Unblock

## Issue: Database/Settings Not Saving

### Solutions:

#### 1. **File Permissions**
- Ensure the executable has write permissions to its directory
- For portable version: place in Documents or Desktop folder
- For installed version: should work automatically

#### 2. **Read-Only Location**
- Don't run from CD/DVD or read-only network drives
- Copy to local hard drive first

## Issue: Tray Icon Not Appearing

### Solutions:

#### 1. **System Tray Settings**
- Check Windows system tray settings
- Ensure "Show all icons" is enabled
- Look for the app in the hidden icons area

#### 2. **Icon Generation**
- The app creates its own LED-style icon programmatically
- If custom icons fail, it falls back to a generated icon
- Check console output for icon-related errors

## Issue: Window Not Appearing

### Solutions:

#### 1. **Off-Screen Window**
- Window may be positioned off-screen from previous session
- Delete database.json file to reset window position
- Or use Ctrl+Alt+Tab to find the window

#### 2. **Multiple Monitors**
- Window may appear on disconnected monitor
- Reset window settings by deleting database files

## Issue: URL Loading Problems

### Solutions:

#### 1. **Internet Connection**
- Verify internet connectivity
- Try loading the URL in a regular browser first

#### 2. **URL Format**
- Ensure URL includes protocol (http:// or https://)
- App automatically adds https:// if missing

#### 3. **Firewall/Proxy**
- Check if corporate firewall blocks the app
- Configure proxy settings if needed

## Debug Information

### Console Output
The app logs detailed information to the console. To view:

1. **For Portable Version:**
   - Run from Command Prompt: `"LED Electron App-1.0.0-portable.exe"`
   - Console output will show in the command window

2. **For Installed Version:**
   - Open Command Prompt as Administrator
   - Navigate to installation directory
   - Run: `"LED Electron App.exe"`

### Log Files Location

The app creates files in these locations:

**Portable Version:**
- Same directory as the executable
- Files: `database.json`, `instance-id.json`

**Installed Version:**
- `%USERPROFILE%\.electron-led-app\`
- Files: `database.json`, `instance-id.json`

### Reset Application Data

To completely reset the app:

1. Close the application
2. Delete these files:
   - `database.json`
   - `instance-id.json`
3. Restart the application

## System Requirements

- **OS**: Windows 10 or later (64-bit)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 200MB free space
- **Network**: Internet connection for URL loading

## Getting Help

If issues persist:

1. **Check Console Output**: Run from command prompt to see error messages
2. **Verify System Requirements**: Ensure your system meets minimum requirements
3. **Try Safe Mode**: Run with minimal system services
4. **Reinstall**: Uninstall and reinstall the application

## Common Error Messages

### "Failed to initialize application"
- **Cause**: Database or instance manager initialization failed
- **Solution**: Check file permissions, run as administrator

### "Window or database not available"
- **Cause**: Core components failed to load
- **Solution**: Restart application, check system resources

### "Error creating database directory"
- **Cause**: Insufficient permissions to create files
- **Solution**: Move to writable location or run as administrator

## Performance Tips

1. **Close Unnecessary Programs**: Free up system memory
2. **Update Windows**: Ensure latest updates are installed
3. **Check Disk Space**: Ensure adequate free space
4. **Disable Heavy Antivirus Scanning**: Temporarily for testing

## Advanced Troubleshooting

### Registry Issues (Installed Version)
If the installed version has issues:
1. Uninstall completely
2. Clean registry entries (use CCleaner or similar)
3. Reinstall fresh

### Portable Version Issues
If portable version has issues:
1. Copy to new location
2. Delete old database files
3. Run from new location

### Network Debugging
For URL loading issues:
1. Test with simple websites (google.com)
2. Check corporate proxy settings
3. Try different network connection
