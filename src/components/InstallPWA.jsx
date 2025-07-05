import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
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
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check for appinstalled event
    const appInstalledHandler = () => {
      console.log('App was installed');
      setIsInstalled(true);
      setSupportsPWA(false);
      setPromptInstall(null);
    };

    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const onClick = async () => {
    if (promptInstall) {
      try {
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
      }
    } else {
      // Fallback: show instructions
      const instructions = `Để cài đặt ứng dụng:

Chrome/Edge Desktop:
- Nhấn F12 → Application → Manifest → Install

Chrome Mobile:
- Menu (3 chấm) → "Cài đặt ứng dụng"

Safari Mobile:
- Share → "Thêm vào Màn hình chính"

Firefox:
- Menu → "Cài đặt ứng dụng"`;

      alert(instructions);
    }
  };

  // Debug info
  console.log('InstallPWA Debug:', {
    supportsPWA,
    isInstalled,
    pathname: location.pathname,
    isHome: location.pathname === '/',
    promptInstall: !!promptInstall,
    displayMode: window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false,
    navigatorStandalone: window.navigator.standalone
  });

  // Don't show if already installed or not on home page
  if (isInstalled || location.pathname !== '/') {
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
        {supportsPWA ? 'Cài đặt ứng dụng' : 'Hướng dẫn cài đặt'}
      </button>
    </div>
  );
};

export default InstallPWA; 