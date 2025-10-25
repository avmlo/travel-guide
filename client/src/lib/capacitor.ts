/**
 * Capacitor Native Features
 * Initialize and configure native iOS features
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'

/**
 * Initialize native features when app starts
 */
export async function initializeNativeFeatures() {
  if (!isNative) return;

  try {
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#f5f1e8' });
    
    // Hide splash screen after app is ready
    await SplashScreen.hide();

    // Listen for app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      // App state changed
    });

    // Listen for back button (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // Keyboard listeners
    Keyboard.addListener('keyboardWillShow', info => {
      // Keyboard will show
    });

    Keyboard.addListener('keyboardWillHide', () => {
      // Keyboard will hide
    });

    // Native features initialized
  } catch (error) {
    console.error('Error initializing native features:', error);
  }
}

/**
 * Trigger haptic feedback
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!isNative) return;
  
  try {
    const impactStyle = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }[style];

    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('Error triggering haptic:', error);
  }
}

/**
 * Show/hide status bar
 */
export async function setStatusBarVisibility(visible: boolean) {
  if (!isNative) return;
  
  try {
    if (visible) {
      await StatusBar.show();
    } else {
      await StatusBar.hide();
    }
  } catch (error) {
    console.error('Error setting status bar visibility:', error);
  }
}

/**
 * Get app info
 */
export async function getAppInfo() {
  if (!isNative) {
    return {
      name: 'Travel Guide',
      version: '1.0.0',
      build: '1',
    };
  }

  try {
    const info = await App.getInfo();
    return {
      name: info.name,
      version: info.version,
      build: info.build,
    };
  } catch (error) {
    console.error('Error getting app info:', error);
    return null;
  }
}

/**
 * Open URL in system browser
 */
export async function openUrl(url: string) {
  if (!isNative) {
    window.open(url, '_blank');
    return;
  }

  try {
    // Use window.open as fallback for native
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error opening URL:', error);
  }
}

/**
 * Hide keyboard
 */
export async function hideKeyboard() {
  if (!isNative) return;
  
  try {
    await Keyboard.hide();
  } catch (error) {
    console.error('Error hiding keyboard:', error);
  }
}

