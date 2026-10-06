/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccessibilityPreferences, FontSizePreference, VoiceSpeedPreference } from '../types';

const STORAGE_KEY = 'deo_accessibility_prefs';

const DEFAULT_PREFS: AccessibilityPreferences = {
  seniorMode: false,
  fontSize: 'NORMAL',
  highContrast: false,
  voiceAssistance: true,
  voiceSpeed: 'NORMAL',
  largeButtons: true,
  reducedAnimation: false,
  updatedAt: new Date().toISOString(),
};

class AccessibilityServiceManager {
  private prefs: AccessibilityPreferences;
  private listeners: Set<(prefs: AccessibilityPreferences) => void> = new Set();

  constructor() {
    this.prefs = this.loadPreferences();
    this.applyToDOM();
  }

  private loadPreferences(): AccessibilityPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_PREFS;
      return { ...DEFAULT_PREFS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_PREFS;
    }
  }

  public getPreferences(): AccessibilityPreferences {
    return { ...this.prefs };
  }

  public savePreferences(updates: Partial<AccessibilityPreferences>): AccessibilityPreferences {
    this.prefs = {
      ...this.prefs,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
    } catch {
      // Ignore
    }
    this.applyToDOM();
    this.notifyListeners();
    return this.prefs;
  }

  public setSeniorMode(enabled: boolean): void {
    this.savePreferences({
      seniorMode: enabled,
      fontSize: enabled ? 'LARGE' : 'NORMAL',
      largeButtons: enabled,
    });
  }

  public setFontSize(fontSize: FontSizePreference): void {
    this.savePreferences({ fontSize });
  }

  public setHighContrast(highContrast: boolean): void {
    this.savePreferences({ highContrast });
  }

  public setVoiceAssistance(voiceAssistance: boolean): void {
    this.savePreferences({ voiceAssistance });
  }

  public setVoiceSpeed(voiceSpeed: VoiceSpeedPreference): void {
    this.savePreferences({ voiceSpeed });
  }

  public setLargeButtons(largeButtons: boolean): void {
    this.savePreferences({ largeButtons });
  }

  public setReducedAnimation(reducedAnimation: boolean): void {
    this.savePreferences({ reducedAnimation });
  }

  public subscribe(callback: (prefs: AccessibilityPreferences) => void): () => void {
    this.listeners.add(callback);
    callback(this.prefs);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn(this.prefs));
  }

  private applyToDOM(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Font size classes
    root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xl');
    if (this.prefs.fontSize === 'SMALL') root.classList.add('font-size-small');
    else if (this.prefs.fontSize === 'LARGE') root.classList.add('font-size-large');
    else if (this.prefs.fontSize === 'EXTRA_LARGE') root.classList.add('font-size-xl');
    else root.classList.add('font-size-normal');

    // High contrast
    if (this.prefs.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    // Reduced animation
    if (this.prefs.reducedAnimation) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }
}

export const AccessibilityService = new AccessibilityServiceManager();
