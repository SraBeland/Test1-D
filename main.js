const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron/main')
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
  
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
    loadingWindow.focus();
  });

  // Auto-close loading window after 3 seconds maximum
  setTimeout(() => {
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.close();
    }
  }, 3000);

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
    // Initialize instance manager first (required for database)
    instanceManager = new InstanceManager();
    await instanceManager.initialize();
    
    // Initialize database and get all startup data in one operation
    dbManager = new DatabaseManager(instanceManager.getInstanceId());
    await dbManager.initialize();
    
    // Get all startup data in single database operation
    const startupData = await dbManager.getStartupData();
    const { windowSettings, url } = startupData;
    
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

    // Load configured URL directly if available, otherwise load index.html (using data already retrieved)
    if (url && url.trim() !== '') {
      let loadUrl = url.trim();
      // Add protocol if missing
      if (!loadUrl.startsWith('http://') && !loadUrl.startsWith('https://')) {
        loadUrl = 'https://' + loadUrl;
      }
      console.log(`Loading URL directly at startup: ${loadUrl}`);
      mainWindow.loadURL(loadUrl);
    } else {
      console.log('No URL configured, loading index.html');
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

// Optimized window creation using pre-fetched data
const createOptimizedWindow = async (startupData) => {
  try {
    const { windowSettings, url } = startupData;
    
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

    // Load configured URL directly if available, otherwise load index.html
    if (url && url.trim() !== '') {
      let loadUrl = url.trim();
      // Add protocol if missing
      if (!loadUrl.startsWith('http://') && !loadUrl.startsWith('https://')) {
        loadUrl = 'https://' + loadUrl;
      }
      console.log(`Loading URL directly at startup: ${loadUrl}`);
      mainWindow.loadURL(loadUrl);
    } else {
      console.log('No URL configured, loading index.html');
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
    console.error('Error creating optimized window:', error);
    
    // Fallback to default window
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

const createTray = () => {
  try {
    const { nativeImage } = require('electron');
    const fs = require('fs');
    
    let trayIcon;
    
    // Try the most likely icon files first (synchronously for performance)
    const primaryIcons = [
      path.join(__dirname, 'tray-icon.ico'),
      path.join(__dirname, 'icon.ico')
    ];
    
    // Quick check for primary icons
    for (const iconPath of primaryIcons) {
      try {
        if (fs.existsSync(iconPath)) {
          trayIcon = nativeImage.createFromPath(iconPath);
          if (!trayIcon.isEmpty()) {
            console.log(`Tray icon loaded from: ${iconPath}`);
            break;
          }
        }
      } catch (error) {
        continue; // Try next icon
      }
    }
    
    // If no primary icon found, use empty icon (fastest fallback)
    if (!trayIcon || trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
      console.log('Using system default tray icon');
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
    // Create main window immediately with default settings for instant display
    mainWindow = new BrowserWindow({
      x: 100,
      y: 100,
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
      show: true, // Show immediately
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false,
        webSecurity: false, // Allow faster loading
        allowRunningInsecureContent: true // Speed up mixed content
      }
    });

    // Set user agent to prevent bot blocking
    mainWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Ensure window stays on top
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.focus();
    
    // Load index.html immediately for fast display
    mainWindow.loadFile('index.html');
    
    // Quick URL loading - start immediately without waiting for full initialization
    (async () => {
      try {
        console.log('Quick URL check starting...');
        
        // Try to get URL quickly first
        const quickInstanceManager = new InstanceManager();
        await quickInstanceManager.initialize();
        const quickDbManager = new DatabaseManager(quickInstanceManager.getInstanceId());
        await quickDbManager.initialize();
        
        // Get just the URL quickly
        const savedUrl = await quickDbManager.getUrl();
        console.log('Quick URL retrieved:', savedUrl);
        
        // Load URL immediately if it exists
        if (savedUrl && savedUrl.trim() !== '') {
          let loadUrl = savedUrl.trim();
          if (!loadUrl.startsWith('http://') && !loadUrl.startsWith('https://')) {
            loadUrl = 'https://' + loadUrl;
          }
          console.log(`Quick loading URL: ${loadUrl}`);
          
          // Show loading page immediately while URL loads
          const loadingHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Loading...</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  height: 100vh; 
                  margin: 0; 
                  background: #f0f0f0;
                }
                .loader { 
                  text-align: center; 
                }
                .spinner { 
                  border: 4px solid #f3f3f3; 
                  border-top: 4px solid #3498db; 
                  border-radius: 50%; 
                  width: 40px; 
                  height: 40px; 
                  animation: spin 1s linear infinite; 
                  margin: 0 auto 20px; 
                }
                @keyframes spin { 
                  0% { transform: rotate(0deg); } 
                  100% { transform: rotate(360deg); } 
                }
              </style>
            </head>
            <body>
              <div class="loader">
                <div class="spinner"></div>
                <div>Loading ${loadUrl}...</div>
              </div>
            </body>
            </html>
          `;
          
          try {
            // Show loading indicator immediately
            await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`);
            console.log('Loading indicator shown');
            
            // Then load the actual URL with timeout
            setTimeout(async () => {
              try {
                // Set up timeout for URL loading (increased to 30 seconds)
                const loadPromise = mainWindow.loadURL(loadUrl);
                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(() => reject(new Error('URL load timeout')), 30000); // 30 second timeout
                });
                
                await Promise.race([loadPromise, timeoutPromise]);
                console.log('Quick URL loaded successfully');
              } catch (urlError) {
                console.error('Quick URL load failed:', urlError);
                console.log('Falling back to index.html');
                mainWindow.loadFile('index.html');
              }
            }, 100); // Small delay to ensure loading page shows
            
            // Store references for later use
            instanceManager = quickInstanceManager;
            dbManager = quickDbManager;
            
          } catch (urlError) {
            console.error('Quick URL load failed:', urlError);
            console.log('Falling back to index.html');
            mainWindow.loadFile('index.html');
          }
        }
        
        // Continue with full initialization in background
        console.log('Starting full background initialization...');
        
        // Use existing instances if URL was loaded, otherwise create new ones
        if (!instanceManager) {
          instanceManager = quickInstanceManager;
        }
        if (!dbManager) {
          dbManager = quickDbManager;
        }
        
        const startupData = await dbManager.getStartupData();
        console.log('Full startup data retrieved:', startupData);
        
        // Update window with saved settings
        if (startupData.windowSettings) {
          const { x, y, width, height } = startupData.windowSettings;
          console.log(`Updating window bounds: x=${x}, y=${y}, width=${width}, height=${height}`);
          mainWindow.setBounds({ x, y, width, height });
        }
        
        // Setup refresh timer
        if (startupData.refreshInterval) {
          console.log(`Setting up refresh timer: ${startupData.refreshInterval} seconds`);
          setupRefreshTimerWithInterval(startupData.refreshInterval);
        }
        
        console.log('Background initialization completed successfully');
        
      } catch (error) {
        console.error('Background initialization failed:', error);
        console.log('Continuing with default settings');
      }
    })();
    
    // Create tray in background
    setTimeout(() => {
      try {
        createTray();
      } catch (error) {
        console.log('Tray creation failed:', error.message);
      }
    }, 100);
    
    // Setup window event handlers
    mainWindow.on('show', () => {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
    });
    
    mainWindow.on('focus', () => {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    });
    
    // Save window position and size when moved or resized
    mainWindow.on('moved', saveWindowSettings);
    mainWindow.on('resized', saveWindowSettings);
    mainWindow.on('close', saveWindowSettings);
    mainWindow.on('closed', saveWindowSettings);
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
app.on('before-quit', async () => {
  await saveWindowSettings();
  if (dbManager) {
    await dbManager.close();
  }
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

// Optimized function to setup refresh timer with known interval (avoids database read)
const setupRefreshTimerWithInterval = (refreshInterval) => {
  // Clear existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  
  if (mainWindow && refreshInterval > 0) {
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
}

// Function to start/stop refresh timer (for use when interval needs to be fetched)
const setupRefreshTimer = async () => {
  if (dbManager && mainWindow) {
    try {
      const refreshInterval = await dbManager.getRefreshInterval();
      setupRefreshTimerWithInterval(refreshInterval);
    } catch (error) {
      console.error('Error setting up refresh timer:', error);
    }
  }
}
