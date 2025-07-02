// Check if versions is available
if (typeof versions !== 'undefined') {
  const information = document.getElementById('info')
  information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`
} else {
  console.log('versions object not available')
  const information = document.getElementById('info')
  information.innerText = 'Electron app running - right-click to see context menu'
}

// Context menu functionality
const contextMenu = document.getElementById('contextMenu');

// Show context menu on right click
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  
  // Hide any existing menu first
  contextMenu.classList.remove('show');
  
  // Position the menu at the mouse cursor
  contextMenu.style.left = e.pageX + 'px';
  contextMenu.style.top = e.pageY + 'px';
  
  // Show the menu
  contextMenu.classList.add('show');
});

// Hide context menu when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) {
    contextMenu.classList.remove('show');
  }
});

// Hide context menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    contextMenu.classList.remove('show');
  }
});

// Menu item event listeners
document.getElementById('closeApp').addEventListener('click', async () => {
  contextMenu.classList.remove('show');
  await window.electronAPI.closeApp();
});

document.getElementById('refreshPage').addEventListener('click', async () => {
  contextMenu.classList.remove('show');
  await window.electronAPI.refreshPage();
});

document.getElementById('editSettings').addEventListener('click', async () => {
  contextMenu.classList.remove('show');
  await window.electronAPI.editSettings();
});
