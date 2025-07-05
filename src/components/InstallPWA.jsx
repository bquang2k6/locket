import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Check if already installed
    if (checkIfInstalled()) {
      setIsLoading(false);
      return;
    }

    // Check if PWA is installable
    const checkInstallability = async () => {
      try {
        // Check if service worker is registered
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          console.log('No service worker registered, trying to register...');
          await navigator.serviceWorker.register('/service-worker.js');
        }

        // Check manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          const response = await fetch(manifestLink.href);
          const manifest = await response.json();
          console.log('Manifest loaded:', manifest);
        }

        // Check if we're on HTTPS or localhost
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('localhost') ||
                        window.location.hostname.includes('127.0.0.1');
        
        // Additional check for development environment
        const isDev = import.meta.env.DEV;
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');
        
        console.log('Security check:', {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          isSecure,
          isDev,
          isLocalhost,
          fullUrl: window.location.href
        });

        // Allow PWA install if on localhost (development) or HTTPS
        if (!isSecure && !isLocalhost) {
          console.log('Not on secure context or localhost, PWA install not available');
          setSupportsPWA(false);
          setIsLoading(false);
          return;
        }

        // Wait a bit for beforeinstallprompt event
        setTimeout(() => {
          if (!promptInstall) {
            console.log('No beforeinstallprompt event received, showing manual install option');
            setSupportsPWA(true); // Show manual install option
          }
          setIsLoading(false);
        }, 2000);

      } catch (error) {
        console.error('Error checking installability:', error);
        setSupportsPWA(true); // Show manual install option as fallback
        setIsLoading(false);
      }
    };

    const handler = (e) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      setPromptInstall(e);
      setSupportsPWA(true);
      setIsLoading(false);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check for appinstalled event
    const appInstalledHandler = () => {
      console.log('App was installed');
      setIsInstalled(true);
      setSupportsPWA(false);
      setPromptInstall(null);
      setIsLoading(false);
    };

    window.addEventListener('appinstalled', appInstalledHandler);

    // Start checking installability
    checkInstallability();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, [promptInstall]);

  const onClick = async () => {
    if (promptInstall) {
      try {
        console.log('Triggering install prompt...');
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        console.log('Install prompt outcome:', outcome);
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsInstalled(true);
        } else {
          console.log('User dismissed the install prompt');
        }
        setPromptInstall(null);
        setSupportsPWA(false);
      } catch (error) {
        console.error('Error during install prompt:', error);
        // Fallback to manual instructions
        showManualInstructions();
      }
    } else {
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    const instructions = `Để cài đặt ứng dụng:

Chrome/Edge Desktop:
- Nhấn F12 → Application → Manifest → Install
- Hoặc nhấn Ctrl+Shift+I → Application → Manifest → Install

Chrome Mobile:
- Menu (3 chấm) → "Cài đặt ứng dụng"
- Hoặc "Thêm vào màn hình chính"

Safari Mobile:
- Share → "Thêm vào Màn hình chính"

Firefox:
- Menu → "Cài đặt ứng dụng"

Edge Mobile:
- Menu → "Cài đặt ứng dụng"`;

    alert(instructions);
  };

  // Debug info
  console.log('InstallPWA Debug:', {
    supportsPWA,
    isInstalled,
    isLoading,
    pathname: location.pathname,
    isHome: location.pathname === '/' || location.pathname === '/home',
    promptInstall: !!promptInstall,
    displayMode: window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false,
    navigatorStandalone: window.navigator.standalone
  });

  // Show on home page (/) or /home, and when not installed and not loading
  const isPublicPage = location.pathname === '/' || 
                      location.pathname === '/home' || 
                      location.pathname === '/about' ||
                      location.pathname === '/contact' ||
                      location.pathname === '/docs' ||
                      location.pathname === '/privacy-policy' ||
                      location.pathname === '/timeline';
                      
  if (isInstalled || !isPublicPage || isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        title="Cài đặt ứng dụng Locket Wan"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
          />
        </svg>
        {promptInstall ? 'Cài đặt ứng dụng' : 'Hướng dẫn cài đặt'}
      </button>
    </div>
  );
};

export default InstallPWA; 