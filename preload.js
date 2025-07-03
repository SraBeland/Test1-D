const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => ipcRenderer.invoke('close-app'),
  refreshPage: () => ipcRenderer.invoke('refresh-page'),
  editSettings: () => ipcRenderer.invoke('edit-settings'),
  getCurrentSettings: () => ipcRenderer.invoke('get-current-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  returnToMain: () => ipcRenderer.invoke('return-to-main'),
  getSystemName: () => ipcRenderer.invoke('get-system-name'),
  saveSystemName: (systemName) => ipcRenderer.invoke('save-system-name', systemName),
  getUrl: () => ipcRenderer.invoke('get-url'),
  getRefreshInterval: () => ipcRenderer.invoke('get-refresh-interval')
})
