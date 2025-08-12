import React, { useState, useEffect } from "react";

const LoadingRing = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
);

const MockupiPhone = ({ imageSrc, altText, position = "left", frameStyle = "holographic" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
  };

  const phoneStyles = position === "left" 
    ? "transform-gpu perspective-1000 rotate-y-[-15deg] translate-x-4 hover:rotate-y-[-5deg] hover:scale-105 transition-all duration-700 ease-out"
    : "transform-gpu perspective-1000 rotate-y-[15deg] translate-x-[-16px] hover:rotate-y-[5deg] hover:scale-105 transition-all duration-700 ease-out z-10";

  const getFrameStyle = () => {
    switch(frameStyle) {
      case "holographic":
        return "bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-1 animate-pulse";
      case "neon":
        return "bg-black border-2 border-cyan-400 shadow-[0_0_30px_#00ffff,0_0_60px_#00ffff,0_0_90px_#00ffff]";
      case "rainbow":
        return "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 p-1 animate-spin-slow";
      case "crystal":
        return "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30";
      case "galaxy":
        return "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900";
      case "plasma":
        return "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 animate-pulse";
      case "matrix":
        return "bg-black border-2 border-green-400 shadow-[0_0_30px_#00ff00,0_0_60px_#00ff00]";
      case "aurora":
        return "bg-gradient-to-br from-green-400 via-blue-500 to-purple-600";
      case "electric":
        return "bg-gradient-to-br from-yellow-400 via-blue-500 to-purple-600";
      case "cosmic":
        return "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-900";
      case "liquid":
        return "bg-gradient-to-br from-gray-400 via-gray-600 to-gray-800";
      default:
        return "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black";
    }
  };

  return (
    <div 
      className={`relative w-[200px] h-[410px] ${phoneStyles} cursor-pointer`}
      onMouseMove={handleMouseMove}
      style={{
        transform: `rotateX(${mousePos.y}deg) rotateY(${position === "left" ? -15 + mousePos.x : 15 + mousePos.x}deg)`
      }}
    >
      {/* Plasma fire effect */}
      {frameStyle === "plasma" && (
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-[60px] blur-xl opacity-70 animate-pulse"></div>
      )}

      {/* Matrix digital rain */}
      {frameStyle === "matrix" && (
        <div className="absolute -inset-2 overflow-hidden rounded-[50px]">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 bg-green-400 animate-pulse opacity-60"
              style={{
                left: `${i * 7}%`,
                height: "100%",
                animationDelay: `${i * 0.2}s`,
                animationDuration: "2s"
              }}
            />
          ))}
        </div>
      )}

      {/* Aurora wave effect */}
      {frameStyle === "aurora" && (
        <>
          <div className="absolute -inset-3 bg-gradient-to-r from-green-400/30 via-blue-500/30 to-purple-600/30 rounded-[55px] blur-lg animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-green-300/20 via-blue-400/20 to-purple-500/20 rounded-[48px] animate-pulse" style={{animationDelay: "0.5s"}}></div>
        </>
      )}

      {/* Electric storm effect */}
      {frameStyle === "electric" && (
        <>
          <div className="absolute -inset-2 border border-yellow-400 rounded-[50px] animate-pulse"></div>
          <div className="absolute -inset-1 border border-blue-400 rounded-[48px] animate-pulse" style={{animationDelay: "0.3s"}}></div>
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: "0.5s"}}></div>
        </>
      )}

      {/* Cosmic nebula effect */}
      {frameStyle === "cosmic" && (
        <div className="absolute -inset-4 bg-gradient-radial from-pink-500/40 via-purple-500/30 to-indigo-900/40 rounded-[60px] blur-2xl animate-pulse"></div>
      )}

      {/* Liquid metal ripples */}
      {frameStyle === "liquid" && (
        <>
          <div className="absolute -inset-2 bg-gradient-radial from-gray-300/30 to-gray-600/30 rounded-[50px] blur-lg animate-ping" style={{animationDuration: "3s"}}></div>
          <div className="absolute -inset-1 bg-gradient-radial from-gray-400/20 to-gray-700/20 rounded-[48px] blur-md animate-ping" style={{animationDelay: "1s", animationDuration: "3s"}}></div>
        </>
      )}

      {/* Holographic outer glow */}
      {frameStyle === "holographic" && (
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[60px] blur-xl opacity-60 animate-pulse"></div>
      )}

      {/* Neon glow effect */}
      {frameStyle === "neon" && (
        <>
          <div className="absolute -inset-2 border-2 border-cyan-300 rounded-[50px] blur-sm animate-pulse"></div>
          <div className="absolute -inset-1 border border-cyan-200 rounded-[48px] blur-xs animate-pulse"></div>
        </>
      )}

      {/* Crystal refraction effects */}
      {frameStyle === "crystal" && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-[46px] rotate-12"></div>
          <div className="absolute -inset-1 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-[46px] -rotate-12"></div>
        </>
      )}

      {/* Main Frame */}
      <div className={`relative w-full h-full rounded-[45px] ${getFrameStyle()} shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10`}>
        
        {/* Inner frame for holographic/rainbow */}
        {(frameStyle === "holographic" || frameStyle === "rainbow") && (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-[44px]">
            <div className="absolute inset-[1px] border border-zinc-600/20 rounded-[43px] pointer-events-none"></div>
          </div>
        )}
        
        {/* Galaxy stars effect */}
        {frameStyle === "galaxy" && (
          <div className="absolute inset-0 overflow-hidden rounded-[45px]">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
          </div>
        )}

        {/* Dynamic Island - animated */}
        <div className={`absolute top-3 left-1/2 transform -translate-x-1/2 w-[80px] h-[24px] rounded-full z-30 border transition-all duration-300 ${
          frameStyle === "neon" ? "bg-cyan-400/20 border-cyan-400 shadow-[0_0_10px_#00ffff]" :
          frameStyle === "holographic" ? "bg-gradient-to-r from-purple-600 to-pink-600 border-white/30" :
          frameStyle === "galaxy" ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-white/20" :
          frameStyle === "plasma" ? "bg-gradient-to-r from-orange-600 to-red-600 border-white/30" :
          frameStyle === "matrix" ? "bg-green-400/20 border-green-400 shadow-[0_0_10px_#00ff00]" :
          frameStyle === "aurora" ? "bg-gradient-to-r from-green-400 to-blue-500 border-white/30" :
          frameStyle === "electric" ? "bg-gradient-to-r from-yellow-400 to-blue-500 border-white/30" :
          frameStyle === "cosmic" ? "bg-gradient-to-r from-pink-500 to-indigo-600 border-white/20" :
          frameStyle === "liquid" ? "bg-gradient-to-r from-gray-400 to-gray-600 border-white/20" :
          "bg-black border-zinc-800"
        }`}>
          {/* Breathing light effect */}
          <div className={`absolute inset-1 rounded-full animate-pulse ${
            frameStyle === "neon" ? "bg-cyan-400/30" :
            frameStyle === "holographic" ? "bg-gradient-to-r from-purple-400 to-pink-400" :
            frameStyle === "plasma" ? "bg-gradient-to-r from-orange-400 to-red-400" :
            frameStyle === "matrix" ? "bg-green-400/30" :
            frameStyle === "aurora" ? "bg-gradient-to-r from-green-300 to-blue-400" :
            frameStyle === "electric" ? "bg-gradient-to-r from-yellow-300 to-blue-400" :
            frameStyle === "cosmic" ? "bg-gradient-to-r from-pink-400 to-indigo-500" :
            frameStyle === "liquid" ? "bg-gradient-to-r from-gray-300 to-gray-500" :
            "bg-zinc-700"
          }`}></div>
        </div>

        {/* Screen bezel with frame-specific styling */}
        <div className={`absolute inset-[8px] rounded-[37px] p-1 ${
          frameStyle === "crystal" ? "bg-white/5 backdrop-blur-sm" :
          frameStyle === "galaxy" ? "bg-gradient-to-br from-indigo-800/50 to-purple-800/50" :
          "bg-gradient-to-br from-zinc-800 to-zinc-900"
        }`}>
          
          {/* Screen Content */}
          <div className="relative w-full h-full rounded-[33px] overflow-hidden bg-black">
            
            {/* Frame-specific screen effects */}
            <div className={`absolute inset-0 pointer-events-none ${
              frameStyle === "holographic" ? "bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20" :
              frameStyle === "neon" ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20" :
              frameStyle === "crystal" ? "bg-gradient-to-br from-white/5 to-blue-400/10" :
              frameStyle === "galaxy" ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20" :
              frameStyle === "plasma" ? "bg-gradient-to-br from-orange-500/30 to-red-500/20" :
              frameStyle === "matrix" ? "bg-gradient-to-br from-green-500/20 to-green-300/10" :
              frameStyle === "aurora" ? "bg-gradient-to-br from-green-400/20 via-blue-500/15 to-purple-600/20" :
              frameStyle === "electric" ? "bg-gradient-to-br from-yellow-400/20 via-blue-500/15 to-purple-600/20" :
              frameStyle === "cosmic" ? "bg-gradient-to-br from-pink-500/25 via-purple-500/15 to-indigo-900/20" :
              frameStyle === "liquid" ? "bg-gradient-to-br from-gray-400/15 to-gray-600/10" :
              "bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"
            }`}></div>
            
            {/* Image with special effects */}
            <div className="relative w-full h-full">
              <img
                src={imageSrc}
                alt={altText}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                } ${frameStyle === "holographic" ? "mix-blend-screen" : ""}`}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
              />
              
              {/* Holographic overlay */}
              {frameStyle === "holographic" && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 mix-blend-overlay"></div>
              )}
            </div>

            {/* Loading state */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
                <LoadingRing />
              </div>
            )}

            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Animated light beam */}
            <div className={`absolute left-0 top-0 w-full h-1 opacity-50 animate-pulse ${
              frameStyle === "neon" ? "bg-gradient-to-r from-transparent via-cyan-400 to-transparent" :
              frameStyle === "holographic" ? "bg-gradient-to-r from-transparent via-pink-400 to-transparent" :
              "bg-gradient-to-r from-transparent via-white to-transparent"
            }`} style={{
              animation: `slideDown 3s infinite linear`,
              animationDelay: position === "left" ? "0s" : "1.5s"
            }}></div>
          </div>
        </div>

        {/* Enhanced Side Buttons */}
        <div className={`absolute left-[-8px] top-20 w-[4px] h-8 rounded-l-lg shadow-lg ${
          frameStyle === "neon" ? "bg-cyan-400 shadow-[0_0_10px_#00ffff]" :
          frameStyle === "holographic" ? "bg-gradient-to-b from-purple-500 to-pink-500" :
          "bg-gradient-to-b from-zinc-700 to-zinc-900"
        }`}></div>
        <div className={`absolute left-[-8px] top-36 w-[4px] h-12 rounded-l-lg shadow-lg ${
          frameStyle === "neon" ? "bg-cyan-400 shadow-[0_0_10px_#00ffff]" :
          frameStyle === "holographic" ? "bg-gradient-to-b from-purple-500 to-pink-500" :
          "bg-gradient-to-b from-zinc-700 to-zinc-900"
        }`}></div>
        <div className={`absolute left-[-8px] top-52 w-[4px] h-12 rounded-l-lg shadow-lg ${
          frameStyle === "neon" ? "bg-cyan-400 shadow-[0_0_10px_#00ffff]" :
          frameStyle === "holographic" ? "bg-gradient-to-b from-purple-500 to-pink-500" :
          "bg-gradient-to-b from-zinc-700 to-zinc-900"
        }`}></div>

        {/* Power Button */}
        <div className={`absolute right-[-8px] top-36 w-[4px] h-16 rounded-r-lg shadow-lg ${
          frameStyle === "neon" ? "bg-cyan-400 shadow-[0_0_10px_#00ffff]" :
          frameStyle === "holographic" ? "bg-gradient-to-b from-purple-500 to-pink-500" :
          "bg-gradient-to-b from-zinc-700 to-zinc-900"
        }`}></div>
      </div>

      {/* Floating orbs around phone */}
      {frameStyle === "holographic" && (
        <>
          <div className="absolute -top-4 -left-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60" style={{animationDelay: "0s"}}></div>
          <div className="absolute -top-2 -right-6 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-60" style={{animationDelay: "0.5s"}}></div>
          <div className="absolute -bottom-4 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-60" style={{animationDelay: "1s"}}></div>
        </>
      )}
    </div>
  );
};

const DualPhoneMockup = () => {
  const [currentFrame, setCurrentFrame] = useState({ left: "aurora", right: "cosmic" });

  const frameOptions = [
    { name: "holographic", label: "🌈 Holographic" },
    // { name: "neon", label: "⚡ Neon Glow" },
    // { name: "rainbow", label: "🌈 Rainbow" },
    // { name: "crystal", label: "💎 Crystal" },
    { name: "galaxy", label: "🌌 Galaxy" },
    { name: "plasma", label: "🔥 Plasma" },
    // { name: "matrix", label: "💚 Matrix" },
    { name: "aurora", label: "🌊 Aurora" },
    { name: "electric", label: "⚡ Electric" },
    { name: "cosmic", label: "🌟 Cosmic" },
    { name: "liquid", label: "🌀 Liquid Metal" },
    // { name: "classic", label: "📱 Classic" }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 -mt-20 -mb-20">
      
      

      {/* Phone Container */}
      <div 
        className="relative flex items-center justify-center gap-8"
        style={{ 
          perspective: '2000px',  //độ xoay
          transformStyle: 'preserve-3d'
        }}
      >
        
        {/* Dynamic Background Effects */}
        <div className={`absolute inset-0 blur-3xl scale-150 pointer-events-none transition-all duration-1000 ${
          currentFrame.left === "holographic" || currentFrame.right === "holographic" 
            ? "bg-gradient-radial from-purple-500/30 via-pink-500/20 to-blue-500/30" :
          currentFrame.left === "neon" || currentFrame.right === "neon"
            ? "bg-gradient-radial from-cyan-500/30 via-blue-500/20 to-transparent" :
          currentFrame.left === "galaxy" || currentFrame.right === "galaxy"
            ? "bg-gradient-radial from-indigo-500/30 via-purple-500/20 to-transparent" :
            "bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent"
        }`}></div>
        
        {/* Phone trái */}
        <MockupiPhone 
          imageSrc="./images/locket_wan_preview.jpg"
          altText="Left Phone Preview"
          position="left"
          frameStyle={currentFrame.left}
        />
        
        {/* Phone phải */}
        <MockupiPhone 
          imageSrc="./images/locket_wan_preview2.jpg"
          altText="Right Phone Preview" 
          position="right"
          frameStyle={currentFrame.right}
        />

        {/* Interactive Lightning Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse"></div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DualPhoneMockup;