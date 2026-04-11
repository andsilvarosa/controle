import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsMobile(isMobileDevice && !isStandalone);
      setIsInstalled(isStandalone);
    };

    checkMobile();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (deferredPrompt && isMobile && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, isMobile, isInstalled, isDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    setIsDismissed(true);
  };

  const reinstallPrompt = () => {
    if (deferredPrompt && !isInstalled) {
      setShowInstallPrompt(true);
    }
  };

  return {
    isMobile,
    isInstalled,
    showInstallPrompt,
    handleInstall,
    handleDismiss,
    reinstallPrompt
  };
};