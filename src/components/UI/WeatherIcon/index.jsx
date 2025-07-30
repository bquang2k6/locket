import React from 'react';

const WeatherIcon = ({ weatherCode, className = "w-6 h-6" }) => {
  const getWeatherSVG = (code) => {
    const iconMap = {
      // Clear sky
      '01d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <circle cx="12" cy="12" r="5" fill="#FFD700"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      '01n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 3a6 6 0 0 0 6 6 6 6 0 0 0-6 6 6 6 0 0 0-6-6 6 6 0 0 0 6-6z" fill="#E6E6FA"/>
        </svg>
      ),
      
      // Few clouds
      '02d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <circle cx="12" cy="12" r="5" fill="#FFD700"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 15a3 3 0 0 1 8 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
        </svg>
      ),
      '02n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 3a6 6 0 0 0 6 6 6 6 0 0 0-6 6 6 6 0 0 0-6-6 6 6 0 0 0 6-6z" fill="#E6E6FA"/>
          <path d="M8 15a3 3 0 0 1 8 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
        </svg>
      ),
      
      // Scattered clouds
      '03d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
        </svg>
      ),
      '03n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
        </svg>
      ),
      
      // Broken clouds
      '04d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M4 15a4 4 0 0 1 8 0M12 15a4 4 0 0 1 8 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
        </svg>
      ),
      '04n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M4 15a4 4 0 0 1 8 0M12 15a4 4 0 0 1 8 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
        </svg>
      ),
      
      // Shower rain
      '09d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18v3M12 18v3M16 18v3" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      '09n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18v3M12 18v3M16 18v3" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      
      // Rain
      '10d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <circle cx="12" cy="12" r="5" fill="#FFD700"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18v3M12 18v3M16 18v3" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      '10n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 3a6 6 0 0 0 6 6 6 6 0 0 0-6 6 6 6 0 0 0-6-6 6 6 0 0 0 6-6z" fill="#E6E6FA"/>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18v3M12 18v3M16 18v3" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      
      // Thunderstorm
      '11d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18v3M12 18v3M16 18v3" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 16l2 2-2 2" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      '11n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18v3M12 18v3M16 18v3" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 16l2 2-2 2" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      
      // Snow
      '13d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18l1 1M12 18l1 1M16 18l1 1M9 19l-1 1M13 19l-1 1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      '13n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" fill="#B0C4DE" stroke="#B0C4DE" strokeWidth="2"/>
          <path d="M8 18l1 1M12 18l1 1M16 18l1 1M9 19l-1 1M13 19l-1 1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      
      // Mist
      '50d': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M4 14a4 4 0 0 1 8 0M12 14a4 4 0 0 1 8 0" fill="#D3D3D3" stroke="#D3D3D3" strokeWidth="2"/>
          <path d="M6 16h12M8 18h8" stroke="#D3D3D3" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      '50n': (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M4 14a4 4 0 0 1 8 0M12 14a4 4 0 0 1 8 0" fill="#D3D3D3" stroke="#D3D3D3" strokeWidth="2"/>
          <path d="M6 16h12M8 18h8" stroke="#D3D3D3" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    };
    
    return iconMap[code] || iconMap['01d']; // Default to sunny
  };

  return getWeatherSVG(weatherCode);
};

export default WeatherIcon; 