import { useState, useEffect } from 'react';
import { subjectDatabase } from '@/data/subjectData';
import OfflineStorage from '@/utils/offlineStorage';

export const useOfflineSync = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const initializeOfflineData = async () => {
      if (!navigator.onLine) {
        setIsInitialized(true);
        return;
      }

      try {
        // Check if data is already cached
        const cachedData = OfflineStorage.getItem('app_initialized');
        if (cachedData) {
          setIsInitialized(true);
          setSyncProgress(100);
          return;
        }

        // Cache all subject data
        const subjects = Object.keys(subjectDatabase);
        const totalSubjects = subjects.length;

        for (let i = 0; i < subjects.length; i++) {
          const subjectId = subjects[i];
          const subject = subjectDatabase[subjectId];
          
          // Cache subject data
          OfflineStorage.cacheSubjectData(subjectId, subject);
          
          // Cache resource URLs if available
          if (subject.urls) {
            OfflineStorage.cacheResourceUrls(subjectId, subject.urls);
          }

          // Update progress
          setSyncProgress(Math.round(((i + 1) / totalSubjects) * 100));
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Mark as initialized
        OfflineStorage.setItem('app_initialized', {
          timestamp: Date.now(),
          version: '1.0.0'
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline data:', error);
        setIsInitialized(true);
      }
    };

    initializeOfflineData();

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isInitialized,
    syncProgress,
    isOffline
  };
};