// Main Application Entry Point
console.log('[ThinkUtils] Script loaded');

import { initializeElements } from './dom.js';
import { setupTitlebar } from './titlebar.js';
import { setupFeatureNavigation } from './navigation.js';
import { setupFanControl, checkInitialPermissions, startAutoUpdate } from './views/fan.js';
import { setupHomeActions, updateHomeView } from './views/home.js';
import { setupSyncHandlers } from './views/sync.js';
import { setupBatteryHandlers } from './views/battery.js';
import { setupAboutDialog } from './about.js';
import { state } from './state.js';

// Check if we're using modular HTML (template loading)
const isModularHTML = document.getElementById('titlebar-container') !== null;

async function checkAndSetupPermissions() {
  console.log('[Permissions] Checking permission status...');
  try {
    const response = await window.__TAURI__.core.invoke('check_permissions_status');
    if (response.success && response.data) {
      if (!response.data.has_permissions) {
        console.log('[Permissions] Missing permissions, showing setup dialog');
        showPermissionDialog();
        return false;
      } else {
        console.log('[Permissions] ✓ All permissions available');
        return true;
      }
    }
  } catch (error) {
    console.error('[Permissions] Error checking permissions:', error);
  }
  return true;
}

function showPermissionDialog() {
  const dialog = document.getElementById('permission-dialog');
  if (dialog) {
    dialog.style.display = 'flex';
  }
}

function hidePermissionDialog() {
  const dialog = document.getElementById('permission-dialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
}

async function setupPermissions() {
  console.log('[Permissions] Setting up permissions...');
  try {
    const response = await window.__TAURI__.core.invoke('setup_permissions');
    if (response.success) {
      console.log('[Permissions] ✓ Setup successful');
      hidePermissionDialog();
      return true;
    } else {
      console.error('[Permissions] ✗ Setup failed:', response.error);
      alert('Failed to setup permissions: ' + response.error);
      return false;
    }
  } catch (error) {
    console.error('[Permissions] ✗ Setup error:', error);
    alert('Error setting up permissions: ' + error);
    return false;
  }
}

function setupPermissionDialog() {
  const setupBtn = document.getElementById('setup-permissions');
  const skipBtn = document.getElementById('skip-permissions');

  if (setupBtn) {
    setupBtn.addEventListener('click', async () => {
      await setupPermissions();
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      hidePermissionDialog();
    });
  }
}

async function initializeApp() {
  console.log('[ThinkUtils] Initializing...');

  // If using modular HTML, load templates first
  if (isModularHTML) {
    const { loadTemplates, injectTemplates } = await import('./templateLoader.js');
    const templates = await loadTemplates();
    injectTemplates(templates);
  }

  initializeElements();
  setupTitlebar();
  setupFeatureNavigation();
  setupFanControl();
  setupHomeActions();
  setupSyncHandlers();
  setupBatteryHandlers();
  setupAboutDialog();
  setupPermissionDialog();
  checkInitialPermissions();
  startAutoUpdate();

  // Check permissions at startup
  await checkAndSetupPermissions();

  // Update home view periodically
  setInterval(() => {
    if (state.currentView === 'home') {
      updateHomeView();
    }
  }, 2000);

  console.log('[ThinkUtils] Ready');
}

window.addEventListener('DOMContentLoaded', initializeApp);

window.addEventListener('beforeunload', () => {
  if (state.updateInterval) {
    clearInterval(state.updateInterval);
  }
  if (state.monitorInterval) {
    clearInterval(state.monitorInterval);
  }
});
