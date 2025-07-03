const { contextBridge, ipcRenderer } = require('electron')

// Expose version information
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})

// Expose Electron APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Application control
  closeApp: () => ipcRenderer.invoke('close-app'),
  refreshPage: () => ipcRenderer.invoke('refresh-page'),
  returnToMain: () => ipcRenderer.invoke('return-to-main'),
  
  // Settings management
  editSettings: () => ipcRenderer.invoke('edit-settings'),
  getCurrentSettings: () => ipcRenderer.invoke('get-current-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Data retrieval and storage
  getSystemName: () => ipcRenderer.invoke('get-system-name'),
  saveSystemName: (systemName) => ipcRenderer.invoke('save-system-name', systemName),
  getUrl: () => ipcRenderer.invoke('get-url'),
  getRefreshInterval: () => ipcRenderer.invoke('get-refresh-interval'),
  
  // Instance management
  getInstanceInfo: () => ipcRenderer.invoke('get-instance-info')
})
