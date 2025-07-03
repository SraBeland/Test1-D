// Settings page functionality

// Helper function to show error messages
const showError = (message) => {
  console.error(message);
  alert(`Error: ${message}`);
};

// Helper function to populate form fields
const populateFormFields = (settings, url, refreshInterval) => {
  const elements = {
    url: document.getElementById('url'),
    refreshInterval: document.getElementById('refreshInterval'),
    xPosition: document.getElementById('xPosition'),
    yPosition: document.getElementById('yPosition'),
    windowWidth: document.getElementById('windowWidth'),
    windowHeight: document.getElementById('windowHeight')
  };

  // Check if all elements exist
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.warn(`Element with id '${key}' not found`);
      return false;
    }
  }

  // Populate values
  elements.url.value = url;
  elements.refreshInterval.value = refreshInterval;
  elements.xPosition.value = settings.x;
  elements.yPosition.value = settings.y;
  elements.windowWidth.value = settings.width;
  elements.windowHeight.value = settings.height;

  return true;
};

// Load current settings when page loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get all settings in parallel
    const [currentSettings, urlResult, refreshResult] = await Promise.all([
      window.electronAPI.getCurrentSettings(),
      window.electronAPI.getUrl(),
      window.electronAPI.getRefreshInterval()
    ]);
    
    const url = urlResult.success ? urlResult.url : '';
    const refreshInterval = refreshResult.success ? refreshResult.refreshInterval : 0;
    
    // Populate form fields
    const success = populateFormFields(currentSettings, url, refreshInterval);
    if (!success) {
      throw new Error('Failed to populate form fields - some elements are missing');
    }
    
  } catch (error) {
    showError(`Failed to load current settings: ${error.message}`);
  }
});

// Helper function to validate form data
const validateSettings = (settings) => {
  const errors = [];
  
  if (isNaN(settings.x) || settings.x < -20000 || settings.x > 20000) {
    errors.push('X position must be a valid number between -20000 and 20000');
  }
  
  if (isNaN(settings.y) || settings.y < -20000 || settings.y > 20000) {
    errors.push('Y position must be a valid number between -20000 and 20000');
  }
  
  if (isNaN(settings.width) || settings.width < 16 || settings.width > 20000) {
    errors.push('Width must be a valid number between 16 and 20000');
  }
  
  if (isNaN(settings.height) || settings.height < 16 || settings.height > 20000) {
    errors.push('Height must be a valid number between 16 and 20000');
  }
  
  if (isNaN(settings.refreshInterval) || settings.refreshInterval < 0 || settings.refreshInterval > 3600) {
    errors.push('Refresh interval must be a valid number between 0 and 3600 seconds');
  }
  
  return errors;
};

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
  
  // Validate settings
  const validationErrors = validateSettings(settings);
  if (validationErrors.length > 0) {
    showError(`Invalid settings:\n${validationErrors.join('\n')}`);
    return;
  }
  
  try {
    const result = await window.electronAPI.saveSettings(settings);
    
    if (result && result.success === false) {
      throw new Error(result.error || 'Unknown error occurred');
    }
    
    // Close the settings window after saving
    window.close();
    
  } catch (error) {
    showError(`Failed to save settings: ${error.message}`);
  }
});

// Handle cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
  window.close();
});
