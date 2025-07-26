import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [dataSize, setDataSize] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Calculate cached data size
    const calculateDataSize = () => {
      let size = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length;
        }
      }
      setDataSize(Math.round(size / 1024)); // Convert to KB
    };

    calculateDataSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage && isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className={`px-4 py-2 shadow-lg border-l-4 ${
        isOnline 
          ? 'bg-green-50 border-green-500 text-green-800' 
          : 'bg-orange-50 border-orange-500 text-orange-800'
      }`}>
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>অনলাইন মোড</span>
              <CheckCircle className="h-4 w-4" />
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>অফলাইন মোড</span>
              {dataSize > 0 && (
                <>
                  <Download className="h-3 w-3" />
                  <span className="text-xs">({dataSize}KB সংরক্ষিত)</span>
                </>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};