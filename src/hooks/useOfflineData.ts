import { useState, useEffect } from 'react';
import OfflineStorage from '@/utils/offlineStorage';

// Custom hook for managing offline data
export const useOfflineData = <T>(
  key: string,
  fetchFunction?: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to get cached data
        const cachedData = OfflineStorage.getItem(key);
        
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          
          // If online and fetch function provided, try to update data
          if (!isOffline && fetchFunction) {
            try {
              const freshData = await fetchFunction();
              if (JSON.stringify(freshData) !== JSON.stringify(cachedData)) {
                setData(freshData);
                OfflineStorage.setItem(key, freshData);
              }
            } catch (fetchError) {
              console.warn('Failed to fetch fresh data, using cached version:', fetchError);
            }
          }
        } else if (!isOffline && fetchFunction) {
          // No cached data and online - fetch fresh data
          const freshData = await fetchFunction();
          setData(freshData);
          OfflineStorage.setItem(key, freshData);
        } else {
          // No cached data and offline
          setError('No offline data available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, isOffline, ...dependencies]);

  const updateData = (newData: T) => {
    setData(newData);
    OfflineStorage.setItem(key, newData);
  };

  const clearData = () => {
    setData(null);
    OfflineStorage.removeItem(key);
  };

  return {
    data,
    loading,
    error,
    isOffline,
    updateData,
    clearData,
    hasCache: OfflineStorage.hasValidData(key)
  };
};

// Hook specifically for subject data
export const useOfflineSubjectData = (subjectId: string) => {
  return useOfflineData(
    `subject_${subjectId}`,
    undefined, // No fetch function as we're using static data
    [subjectId]
  );
};

// Hook for user preferences
export const useOfflineUserPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    return OfflineStorage.getCachedUserPreferences() || {
      theme: 'light',
      language: 'bn',
      notifications: true,
      offlineMode: true
    };
  });

  const updatePreferences = (newPreferences: any) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    OfflineStorage.cacheUserPreferences(updated);
  };

  return {
    preferences,
    updatePreferences
  };
};

// Hook for app state management
export const useOfflineAppState = () => {
  const [appState, setAppState] = useState(() => {
    return OfflineStorage.getCachedAppState() || {
      lastVisitedSubject: null,
      activeGroup: 'science',
      bookmarks: [],
      recentlyViewed: []
    };
  });

  const updateAppState = (newState: any) => {
    const updated = { ...appState, ...newState };
    setAppState(updated);
    OfflineStorage.cacheAppState(updated);
  };

  return {
    appState,
    updateAppState
  };
};