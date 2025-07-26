import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay if not dismissed before
      const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
      if (!hasBeenDismissed) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // Auto-show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-4">
          {/* App Logo */}
          <div className="flex justify-center">
            <img 
              src="https://i.postimg.cc/c4Hq0rW8/1000019063-removebg-preview.png" 
              alt="HSCian Logo"
              className="h-16 w-16 rounded-2xl shadow-lg"
            />
          </div>

          {/* App Name */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              HSCian অ্যাপ
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              আপনার মোবাইলে ইনস্টল করুন
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            অফলাইনে সব বিষয়ের নোট, ক্লাস ভিডিও এবং সিলেবাস দেখুন। দ্রুত অ্যাক্সেসের জন্য হোম স্ক্রিনে যোগ করুন।
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              পরে করব
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              ইনস্টল
            </Button>
          </div>

          {/* Benefits */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-4">
              <span>✓ অফলাইন অ্যাক্সেস</span>
              <span>✓ দ্রুত লোডিং</span>
              <span>✓ নো অ্যাডস</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};