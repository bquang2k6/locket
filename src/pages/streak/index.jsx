import React from 'react';
import './FlameIcon.css';

export default function FlameIcon() {
  return (
    <div className="inline-block relative w-15 h-15">
      {/* Main flame container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Flame layers */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Back flame */}
          <div className="absolute w-20 h-20 bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 rounded-full blur-md opacity-60 animate-pulse"></div>
          
          {/* Middle flame */}
          <div className="absolute w-16 h-18 bg-gradient-to-t from-purple-700 via-purple-600 to-purple-400 rounded-full blur-sm opacity-80 animate-pulse" style={{animationDelay: '0.3s'}}></div>
          
          {/* Front flame */}
          <div className="absolute w-14 h-16 bg-gradient-to-t from-purple-800 via-purple-600 to-purple-400 opacity-90" 
               style={{
                 clipPath: 'polygon(50% 0%, 80% 30%, 100% 60%, 80% 80%, 50% 100%, 20% 80%, 0% 60%, 20% 30%)',
                 animation: 'flicker 1.5s ease-in-out infinite'
               }}>
          </div>
          
          {/* Inner white flame */}
          <div className="absolute w-8 h-12 bg-gradient-to-t from-purple-300 via-white to-purple-200 opacity-70"
               style={{
                 clipPath: 'polygon(50% 10%, 70% 35%, 80% 60%, 65% 80%, 50% 95%, 35% 80%, 20% 60%, 30% 35%)',
                 animation: 'flicker 1s ease-in-out infinite reverse'
               }}>
          </div>
        </div>
        {/* Number 400 */}
        <div className="relative z-10 text-2xl font-black text-white"
             style={{
               textShadow: '0 0 8px rgba(168, 85, 247, 0.8), 0 0 15px rgba(168, 85, 247, 0.6), 1.5px 1.5px 0px #a855f7, -1px -1px 0px #c084fc',
               WebkitTextStroke: '1px #a855f7'
             }}>
          400
        </div>
      </div>
    </div>
  );
}