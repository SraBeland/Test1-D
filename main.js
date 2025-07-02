const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const DatabaseManager = require('./database')
const InstanceManager = require('./instance-manager')

let dbManager;
let instanceManager;
let mainWindow;

const createWindow = async () => {
  try {
    // Initialize instance manager first
    instanceManager = new InstanceManager();
    await instanceManager.initialize();
    
    // Initialize database with instance ID
    dbManager = new DatabaseManager(instanceManager.getInstanceId());
    await dbManager.initialize();
    
    // Get window settings from database
    const windowSettings = await dbManager.getWindowSettings();
    
    mainWindow = new BrowserWindow({
      x: windowSettings.x,
      y: windowSettings.y,
      width: windowSettings.width,
      height: windowSettings.height,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      frame: false,
      roundedCorners: false,
      transparent: true,
      hasShadow: false,
      thickFrame: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })

    mainWindow.loadFile('index.html')
    
    // Save window position and size when moved or resized
    mainWindow.on('moved', saveWindowSettings);
    mainWindow.on('resized', saveWindowSettings);
    
    // Save window settings before closing
    mainWindow.on('close', saveWindowSettings);
    
    // Save settings when window is about to be closed
    mainWindow.on('closed', saveWindowSettings);
    
    // Save settings when app is about to quit
    mainWindow.on('before-quit', saveWindowSettings);
    
  } catch (error) {
    console.error('Error creating window:', error);
    
    // Fallback to default window if database fails
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      frame: false,
      roundedCorners: false,
      transparent: true,
      hasShadow: false,
      thickFrame: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    
    mainWindow.loadFile('index.html')
  }
}

const saveWindowSettings = async () => {
  if (mainWindow && dbManager) {
    try {
      const bounds = mainWindow.getBounds();
      await dbManager.saveWindowSettings(bounds.x, bounds.y, bounds.width, bounds.height);
    } catch (error) {
      console.error('Error saving window settings:', error);
    }
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  // Save settings one final time before closing
  await saveWindowSettings();
  
  // Close database connection
  if (dbManager) {
    await dbManager.close();
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Additional safety net - save settings before app quits
app.on('before-quit', async (event) => {
  event.preventDefault();
  await saveWindowSettings();
  if (dbManager) {
    await dbManager.close();
  }
  app.exit();
})

// IPC handlers for context menu actions
ipcMain.handle('close-app', async () => {
  await saveWindowSettings();
  if (dbManager) {
    await dbManager.close();
  }
  app.exit(0);
})

ipcMain.handle('refresh-page', () => {
  if (mainWindow) {
    mainWindow.reload();
  }
})

ipcMain.handle('edit-settings', async () => {
  if (mainWindow) {
    mainWindow.loadFile('settings.html');
  }
})

ipcMain.handle('get-current-settings', async () => {
  if (mainWindow) {
    const bounds = mainWindow.getBounds();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  }
  return { x: 100, y: 100, width: 800, height: 600 };
})

ipcMain.handle('save-settings', async (event, settings) => {
  if (mainWindow && dbManager) {
    try {
      // Apply the new settings to the window
      mainWindow.setBounds({
        x: settings.x,
        y: settings.y,
        width: settings.width,
        height: settings.height
      });
      
      // Save to database
      await dbManager.saveWindowSettings(settings.x, settings.y, settings.width, settings.height);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Window or database not available' };
})

ipcMain.handle('return-to-main', async () => {
  if (mainWindow) {
    mainWindow.loadFile('index.html');
  }
})

ipcMain.handle('get-instance-info', async () => {
  if (instanceManager) {
    try {
      const instanceInfo = await instanceManager.getInstanceInfo();
      return { success: true, instanceInfo };
    } catch (error) {
      console.error('Error getting instance info:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Instance manager not available' };
})

ipcMain.handle('get-system-name', async () => {
  if (dbManager) {
    try {
      const systemName = await dbManager.getSystemName();
      return { success: true, systemName };
    } catch (error) {
      console.error('Error getting system name:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Database manager not available' };
})

ipcMain.handle('save-system-name', async (event, systemName) => {
  if (dbManager) {
    try {
      await dbManager.saveSystemName(systemName);
      return { success: true };
    } catch (error) {
      console.error('Error saving system name:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Database manager not available' };
})
