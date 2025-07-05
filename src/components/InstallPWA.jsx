import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = async () => {
    if (promptInstall) {
      promptInstall.prompt();
      const { outcome } = await promptInstall.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setPromptInstall(null);
    } else {
      // Fallback: show instructions
      alert('Để cài đặt ứng dụng:\n\nChrome/Edge: Menu (3 chấm) → "Cài đặt ứng dụng"\nSafari: Share → "Thêm vào Màn hình chính"\nChrome Mobile: Menu → "Cài đặt ứng dụng"');
    }
  };

  // Debug info
  console.log('InstallPWA Debug:', {
    supportsPWA,
    pathname: location.pathname,
    isHome: location.pathname === '/',
    promptInstall: !!promptInstall
  });

  // Only show on home page
  if (location.pathname !== '/') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
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
        Cài đặt ứng dụng
      </button>
    </div>
  );
};

export default InstallPWA; 