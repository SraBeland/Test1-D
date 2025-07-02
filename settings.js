// Settings page functionality

// Load current settings when page loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current window settings
    const currentSettings = await window.electronAPI.getCurrentSettings();
    
    // Get current system name
    const systemNameResult = await window.electronAPI.getSystemName();
    const systemName = systemNameResult.success ? systemNameResult.systemName : 'Unnamed';
    
    // Display current values
    document.getElementById('currentValues').innerHTML = 
      `System: ${systemName}<br>X: ${currentSettings.x}, Y: ${currentSettings.y}, Width: ${currentSettings.width}, Height: ${currentSettings.height}`;
    
    // Populate form fields with current values
    document.getElementById('systemName').value = systemName;
    document.getElementById('xPosition').value = currentSettings.x;
    document.getElementById('yPosition').value = currentSettings.y;
    document.getElementById('windowWidth').value = currentSettings.width;
    document.getElementById('windowHeight').value = currentSettings.height;
    
  } catch (error) {
    console.error('Error loading current settings:', error);
    document.getElementById('currentValues').innerHTML = 'Error loading current settings';
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
    height: parseInt(formData.get('height'))
  };
  
  const systemName = formData.get('systemName').trim();
  
  try {
    // Save the system name first
    if (systemName) {
      await window.electronAPI.saveSystemName(systemName);
    }
    
    // Save the window settings
    await window.electronAPI.saveSettings(settings);
    
    // Wait a moment to let user see the window resize/move
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return to main page
    await window.electronAPI.returnToMain();
    
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings. Please try again.');
  }
});

// Handle cancel button
document.getElementById('cancelBtn').addEventListener('click', async () => {
  try {
    // Return to main page without saving
    await window.electronAPI.returnToMain();
  } catch (error) {
    console.error('Error returning to main page:', error);
  }
});
