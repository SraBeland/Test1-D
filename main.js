const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron/main')
const path = require('node:path')
const DatabaseManager = require('./database')
const InstanceManager = require('./instance-manager')

let dbManager;
let instanceManager;
let mainWindow;
let loadingWindow;
let settingsWindow;
let tray;
let refreshTimer;

const createLoadingWindow = () => {
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    movable: true,
    center: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  loadingWindow.loadFile('loading.html');
  
  // Show loading window immediately
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
    loadingWindow.focus();
  });

  return loadingWindow;
};

const createSettingsWindow = () => {
  // Don't create multiple settings windows
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: '#ffffff',
    hasShadow: true,
    resizable: true,
    movable: true,
    center: true,
    show: false,
    title: 'MiniWebPlayer Settings',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile('settings.html');
  
  // Show settings window when ready
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    settingsWindow.focus();
  });

  // Clean up reference when window is closed
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
};

const createWindow = async () => {
  try {
    // Initialize both managers in parallel for faster startup
    const [instanceManagerResult, ] = await Promise.all([
      (async () => {
        instanceManager = new InstanceManager();
        await instanceManager.initialize();
        return instanceManager;
      })(),
      // Pre-create window with defaults while database loads
      Promise.resolve()
    ]);
    
    // Initialize database with instance ID
    dbManager = new DatabaseManager(instanceManager.getInstanceId());
    await dbManager.initialize();
    
    // Get only essential data for window creation (skip refresh interval for now)
    const [windowSettings, url] = await Promise.all([
      dbManager.getWindowSettings(),
      dbManager.getUrl()
    ]);
    
    mainWindow = new BrowserWindow({
      x: windowSettings.x,
      y: windowSettings.y,
      width: windowSettings.width,
      height: windowSettings.height,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      frame: false,
      roundedCorners: false,
      transparent: false,
      backgroundColor: '#ffffff',
      hasShadow: true,
      thickFrame: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    })

    // Ensure window stays on top
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    
    // Re-enforce always on top when window is shown
    mainWindow.on('show', () => {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
    });
    
    // Re-enforce always on top when window gains focus
    mainWindow.on('focus', () => {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    });

    // Load URL directly if available, otherwise load index.html
    if (url && url.trim() !== '') {
      let loadUrl = url.trim();
      // Add protocol if missing
      if (!loadUrl.startsWith('http://') && !loadUrl.startsWith('https://')) {
        loadUrl = 'https://' + loadUrl;
      }
      mainWindow.loadURL(loadUrl);
    } else {
      mainWindow.loadFile('index.html');
    }
    
    // Save window position and size when moved or resized
    mainWindow.on('moved', saveWindowSettings);
    mainWindow.on('resized', saveWindowSettings);
    
    // Save window settings before closing
    mainWindow.on('close', saveWindowSettings);
    
    // Save settings when window is about to be closed
    mainWindow.on('closed', saveWindowSettings);
    
    // Save settings when app is about to quit
    mainWindow.on('before-quit', saveWindowSettings);
    
    // Add context menu handler
    mainWindow.webContents.on('context-menu', (event, params) => {
      const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
      const contextMenu = Menu.buildFromTemplate([
        {
          label: isAlwaysOnTop ? '✓ Always on Top' : 'Always on Top',
          click: () => {
            const newState = !mainWindow.isAlwaysOnTop();
            mainWindow.setAlwaysOnTop(newState, newState ? 'screen-saver' : 'normal');
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Close App',
          click: async () => {
            await saveWindowSettings();
            if (dbManager) {
              await dbManager.close();
            }
            app.exit(0);
          }
        },
        {
          label: 'Refresh Page',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Edit Settings',
          click: () => {
            createSettingsWindow();
          }
        }
      ]);
      
      contextMenu.popup({
        window: mainWindow,
        x: params.x,
        y: params.y
      });
    });
    
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
      transparent: false,
      backgroundColor: '#ffffff',
      hasShadow: true,
      thickFrame: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    
    // Ensure fallback window also stays on top
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    
    // Re-enforce always on top for fallback window
    mainWindow.on('show', () => {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
    });
    
    mainWindow.on('focus', () => {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    });
    
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

const createTray = () => {
  try {
    // Use nativeImage to create a simple icon
    const { nativeImage } = require('electron');
    const fs = require('fs');
    
    // List of possible icon files in order of preference
    const iconPaths = [
      path.join(__dirname, 'tray-icon.ico'),
      path.join(__dirname, 'tray-icon.png'),
      path.join(__dirname, 'tray-icon.svg'),
      path.join(__dirname, 'icon.ico'),
      path.join(__dirname, 'icon.png'),
      path.join(__dirname, 'icon.svg')
    ];
    
    let trayIcon;
    let iconFound = false;
    
    // Try to find and load an icon file
    for (const iconPath of iconPaths) {
      try {
        if (fs.existsSync(iconPath)) {
          trayIcon = nativeImage.createFromPath(iconPath);
          if (!trayIcon.isEmpty()) {
            console.log(`Tray icon loaded from: ${iconPath}`);
            iconFound = true;
            break;
          }
        }
      } catch (error) {
        console.log(`Failed to load icon from ${iconPath}:`, error.message);
      }
    }
    
    // If no icon found, create a simple fallback icon
    if (!iconFound) {
      try {
        // Create a simple 16x16 bitmap manually
        const width = 16;
        const height = 16;
        const channels = 4; // RGBA
        const buffer = Buffer.alloc(width * height * channels);
        
        // Fill with LED pattern
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * channels;
            
            // Default to black background
            let r = 0, g = 0, b = 0, a = 255;
            
            // Create LED border pattern
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
              // Orange border
              r = 255; g = 102; b = 0;
            } else if ((x >= 6 && x <= 9) && (y >= 6 && y <= 9)) {
              // Center square
              r = 255; g = 68; b = 0;
            } else if ((x + y) % 4 === 0) {
              // Dim LEDs
              r = 64; g = 16; b = 0;
            }
            
            buffer[index] = r;     // Red
            buffer[index + 1] = g; // Green
            buffer[index + 2] = b; // Blue
            buffer[index + 3] = a; // Alpha
          }
        }
        
        trayIcon = nativeImage.createFromBuffer(buffer, { width, height });
        console.log('Created fallback LED-style tray icon');
      } catch (error) {
        // If bitmap creation fails, use empty icon
        trayIcon = nativeImage.createEmpty();
        console.log('No custom tray icon found, using system default. See TRAY_ICON_GUIDE.md for setup instructions.');
      }
    }
    
    tray = new Tray(trayIcon);
    
    if (!tray.isDestroyed()) {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show Window',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Refresh Page',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Edit Settings',
          click: () => {
            createSettingsWindow();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Close App',
          click: async () => {
            await saveWindowSettings();
            if (dbManager) {
              await dbManager.close();
            }
            app.exit(0);
          }
        }
      ]);
      
      tray.setContextMenu(contextMenu);
      tray.setToolTip('Electron App');
      
      // Double-click to show/hide window
      tray.on('double-click', () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      });
    }
  } catch (error) {
    console.log('Tray creation failed:', error.message);
  }
}

app.whenReady().then(async () => {
  try {
    // Show loading window immediately
    createLoadingWindow();
    
    // Start initialization tasks in parallel
    const initPromises = [
      createWindow(),
      // Create tray in parallel (don't wait for it)
      Promise.resolve().then(() => {
        try {
          createTray();
        } catch (error) {
          console.log('Tray creation failed, continuing without tray:', error.message);
        }
      })
    ];
    
    // Wait for main window creation only
    await initPromises[0];
    
    // Show main window as soon as it's ready
    mainWindow.once('ready-to-show', () => {
      // Close loading window and show main window immediately
      if (loadingWindow && !loadingWindow.isDestroyed()) {
        loadingWindow.close();
      }
      mainWindow.show();
      mainWindow.focus();
      
      // Setup refresh timer after window is displayed
      setTimeout(() => {
        setupRefreshTimer();
      }, 100);
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        // Skip loading window for reactivation - show main window directly
        createWindow().then(() => {
          mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            mainWindow.focus();
          });
        });
      }
    })
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Close loading window if it exists
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.close();
    }
    // Create a simple error dialog
    const { dialog } = require('electron');
    dialog.showErrorBox('Application Error', `Failed to start application: ${error.message}`);
    app.quit();
  }
}).catch(error => {
  console.error('App ready failed:', error);
  app.quit();
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
  createSettingsWindow();
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
      
      // Save URL if provided
      if (settings.url !== undefined) {
        await dbManager.saveUrl(settings.url);
        
        // Load the new URL or return to index.html
        if (settings.url && settings.url.trim() !== '') {
          let url = settings.url.trim();
          // Add protocol if missing
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          mainWindow.loadURL(url);
        } else {
          mainWindow.loadFile('index.html');
        }
      }
      
      // Save refresh interval if provided
      if (settings.refreshInterval !== undefined) {
        await dbManager.saveRefreshInterval(settings.refreshInterval);
        
        // Setup the new refresh timer
        await setupRefreshTimer();
      }
      
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

ipcMain.handle('get-url', async () => {
  if (dbManager) {
    try {
      const url = await dbManager.getUrl();
      return { success: true, url };
    } catch (error) {
      console.error('Error getting URL:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Database manager not available' };
})

ipcMain.handle('get-refresh-interval', async () => {
  if (dbManager) {
    try {
      const refreshInterval = await dbManager.getRefreshInterval();
      return { success: true, refreshInterval };
    } catch (error) {
      console.error('Error getting refresh interval:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Database manager not available' };
})

// Function to start/stop refresh timer
const setupRefreshTimer = async () => {
  // Clear existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  
  if (dbManager && mainWindow) {
    try {
      const refreshInterval = await dbManager.getRefreshInterval();
      
      if (refreshInterval > 0) {
        console.log(`Setting up auto-refresh timer: ${refreshInterval} seconds`);
        refreshTimer = setInterval(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            console.log('Auto-refreshing page...');
            mainWindow.reload();
          }
        }, refreshInterval * 1000);
      } else {
        console.log('Auto-refresh disabled (interval = 0)');
      }
    } catch (error) {
      console.error('Error setting up refresh timer:', error);
    }
  }
}
