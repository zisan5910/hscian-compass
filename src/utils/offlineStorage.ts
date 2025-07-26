// Offline Storage Utility for HSCian App
// This utility provides offline caching and data management

export interface CachedData {
  data: any;
  timestamp: number;
  expiry?: number; // Optional expiry time in milliseconds
}

export class OfflineStorage {
  private static readonly CACHE_PREFIX = 'hscian_';
  private static readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Store data in localStorage with optional expiry
  static setItem(key: string, data: any, expiry?: number): void {
    try {
      const cachedData: CachedData = {
        data,
        timestamp: Date.now(),
        expiry: expiry || this.DEFAULT_EXPIRY
      };
      
      localStorage.setItem(
        this.CACHE_PREFIX + key, 
        JSON.stringify(cachedData)
      );
    } catch (error) {
      console.warn('Failed to store data offline:', error);
    }
  }

  // Retrieve data from localStorage
  static getItem(key: string): any | null {
    try {
      const stored = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!stored) return null;

      const cachedData: CachedData = JSON.parse(stored);
      
      // Check if data has expired
      if (cachedData.expiry && 
          Date.now() - cachedData.timestamp > cachedData.expiry) {
        this.removeItem(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.warn('Failed to retrieve offline data:', error);
      return null;
    }
  }

  // Remove specific item from localStorage
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove offline data:', error);
    }
  }

  // Clear all app data from localStorage
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear offline data:', error);
    }
  }

  // Check if data exists and is not expired
  static hasValidData(key: string): boolean {
    return this.getItem(key) !== null;
  }

  // Get storage usage information
  static getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      });

      // Estimate available space (localStorage typically has 5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB estimate
      
      return {
        used: used,
        available: Math.max(0, estimated - used)
      };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }

  // Cache subject data for offline access
  static cacheSubjectData(subjectId: string, data: any): void {
    this.setItem(`subject_${subjectId}`, data);
  }

  // Get cached subject data
  static getCachedSubjectData(subjectId: string): any | null {
    return this.getItem(`subject_${subjectId}`);
  }

  // Cache user preferences
  static cacheUserPreferences(preferences: any): void {
    this.setItem('user_preferences', preferences, 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  // Get cached user preferences
  static getCachedUserPreferences(): any | null {
    return this.getItem('user_preferences');
  }

  // Cache app state for quick restoration
  static cacheAppState(state: any): void {
    this.setItem('app_state', state, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  // Get cached app state
  static getCachedAppState(): any | null {
    return this.getItem('app_state');
  }

  // Cache frequently accessed URLs for offline reference
  static cacheResourceUrls(subjectId: string, urls: any): void {
    this.setItem(`urls_${subjectId}`, urls, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  // Get cached resource URLs
  static getCachedResourceUrls(subjectId: string): any | null {
    return this.getItem(`urls_${subjectId}`);
  }
}

// Service Worker registration for enhanced offline capabilities
export class OfflineService {
  static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  // Check if the app is currently offline
  static isOffline(): boolean {
    return !navigator.onLine;
  }

  // Add offline event listeners
  static addOfflineListeners(
    onOffline?: () => void, 
    onOnline?: () => void
  ): void {
    window.addEventListener('offline', () => {
      console.log('App is now offline');
      onOffline?.();
    });

    window.addEventListener('online', () => {
      console.log('App is now online');
      onOnline?.();
    });
  }
}

// Export default instance
export default OfflineStorage;