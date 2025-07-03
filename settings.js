// Settings page functionality

// Load current settings when page loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current window settings
    const currentSettings = await window.electronAPI.getCurrentSettings();
    
    // Get current URL
    const urlResult = await window.electronAPI.getUrl();
    const url = urlResult.success ? urlResult.url : '';
    
    // Get current refresh interval
    const refreshResult = await window.electronAPI.getRefreshInterval();
    const refreshInterval = refreshResult.success ? refreshResult.refreshInterval : 0;
    
    // Populate form fields with current values
    document.getElementById('url').value = url;
    document.getElementById('refreshInterval').value = refreshInterval;
    document.getElementById('xPosition').value = currentSettings.x;
    document.getElementById('yPosition').value = currentSettings.y;
    document.getElementById('windowWidth').value = currentSettings.width;
    document.getElementById('windowHeight').value = currentSettings.height;
    
  } catch (error) {
    console.error('Error loading current settings:', error);
  }
});

// Handle form submission (Save)
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const settings = {
    x: parseInt(formData.get('x')),
    y: parseInt(formData.get('y')),
    width: parseInt(formData.get('width')),
    height: parseInt(formData.get('height')),
    url: formData.get('url').trim(),
    refreshInterval: parseInt(formData.get('refreshInterval')) || 0
  };
  
  try {
    // Save the window settings, URL, and refresh interval
    await window.electronAPI.saveSettings(settings);
    
    // Close the settings window after saving
    window.close();
    
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings. Please try again.');
  }
});

// Handle cancel button
document.getElementById('cancelBtn').addEventListener('click', async () => {
  try {
    // Close the settings window without saving
    window.close();
  } catch (error) {
    console.error('Error closing settings window:', error);
  }
});
