import React, { useState, useEffect } from "react";
import { Power, Snowflake, Wind, Settings, RotateCcw, Eye, EyeOff } from "lucide-react";


// Mock SnowEffect component since we don't have the actual implementation
const SnowEffect = () => <div />;

const SnowControlPanel = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Load settings from localStorage on component mount
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('snowEffectConfig');
      if (saved) {
        const config = JSON.parse(saved);
        return config.enabled !== undefined ? config.enabled : true;
      }
      return true;
    } catch {
      return true;
    }
  });

  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('snowEffectConfig');
      if (saved) {
        const config = JSON.parse(saved);
        return config.settings || {
          intensity: 100,
          speed: 150,
          windPower: 0,
          interaction: true,
          opacity: 80,
          size: 100,
        };
      }
      return {
        intensity: 100,
        speed: 150,
        windPower: 0,
        interaction: true,
        opacity: 80,
        size: 100,
      };
    } catch {
      return {
        intensity: 100,
        speed: 150,
        windPower: 0,
        interaction: true,
        opacity: 80,
        size: 100,
      };
    }
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const snowConfig = {
      enabled: isEnabled,
      settings: globalSettings
    };
    
    // Dispatch custom event để SnowEffect component có thể lắng nghe
    window.dispatchEvent(new CustomEvent('snowConfigChange', { 
      detail: snowConfig 
    }));
    
    // Lưu vào localStorage để persist settings
    try {
      localStorage.setItem('snowEffectConfig', JSON.stringify(snowConfig));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }, [isEnabled, globalSettings]);

  const handleSettingChange = (setting, value) => {
    setGlobalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const resetSettings = () => {
    setGlobalSettings({
      intensity: 100,
      speed: 150,
      windPower: 0,
      interaction: true,
      opacity: 80,
    });
  };

  const toggleEnabled = () => {
    setIsEnabled(!isEnabled);
  };

  if (isMinimized) {
    return (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
            <button
            onClick={() => setIsMinimized(false)}
            className="bg-base-200/90 hover:bg-base-200 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl border border-base-content/10 transition-all duration-300 hover:scale-105"
            >
            <div className="flex items-center gap-3">
                <Snowflake className={`w-5 h-5 ${isEnabled ? 'text-primary animate-pulse' : 'text-base-content/60'}`} />
                <span className="text-base-content font-medium">Snow Control</span>
            </div>
            </button>
        </div>
        );
    }
  

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 p-4 mt-10 max-h-[90vh] overflow-y-auto">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMinimized(true)} />
        
        {/* Main Panel */}
        <div className="relative 
                        bg-base-100/95 backdrop-blur-xl rounded-3xl border border-base-content/10 shadow-2xl 
                        w-full mx-auto
                        max-w-sm   /* mobile */
                        sm:max-w-md /* tablet */
                        md:max-w-lg /* màn hình vừa */
                        lg:max-w-xl /* màn hình to */
                        ">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-content/10">
            <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
                <Snowflake className={`w-6 h-6 ${isEnabled ? 'text-primary animate-pulse' : 'text-base-content/40'}`} />
            </div>
            <div>
                <h2 className="text-base-content font-bold text-lg">🎨 Snow Control</h2>
                <p className="text-base-content/70 text-sm">Điều khiển hiệu ứng tuyết</p>
            </div>
            </div>
        </div>

        <div className="p-6 space-y-6">
            {/* Main Toggle */}
            <div className="bg-base-200/50 rounded-2xl p-4 border border-base-content/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-success animate-pulse' : 'bg-error'}`} />
                <span className="text-base-content font-medium">Trạng thái hiệu ứng</span>
                </div>
                <button
                onClick={toggleEnabled}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                    isEnabled ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-base-content/30'
                }`}
                >
                <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-base-100 rounded-full transition-transform duration-300 shadow-md flex items-center justify-center ${
                    isEnabled ? 'transform translate-x-7' : ''
                    }`}
                >
                    {isEnabled ? (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    ) : (
                    <div className="w-2 h-2 bg-base-content/30 rounded-full" />
                    )}
                </div>
                </button>
            </div>
            
            <div className={`mt-3 text-sm px-3 py-2 rounded-xl text-center font-medium ${
                isEnabled 
                ? 'bg-success/10 text-success border border-success/20' 
                : 'bg-error/10 text-error border border-error/20'
            }`}>
                {isEnabled ? '🟢 Đang hoạt động' : '🔴 Đã tắt'}
            </div>
            </div>

            {/* Settings Toggle */}
            <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between p-4 bg-base-200/30 hover:bg-base-200/50 rounded-2xl transition-all duration-200 text-base-content border border-base-content/5"
            >
            <span className="flex items-center gap-3 font-medium">
                <Settings className="w-5 h-5 text-primary" />
                Cài đặt chi tiết
            </span>
            <span className={`transition-transform duration-300 ${showSettings ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </span>
            </button>

            {/* Advanced Settings */}
            {showSettings && (
            <div className="space-y-5 bg-base-200/30 rounded-2xl p-5 border border-base-content/10">
                {/* Intensity */}
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                    <Snowflake className="w-4 h-4 text-primary" />
                    Cường độ tuyết
                    </label>
                    <span className="text-xs bg-primary/15 text-primary px-3 py-1 rounded-full font-medium border border-primary/20">
                    {globalSettings.intensity}%
                    </span>
                </div>
                <div className="relative">
                    <input
                    type="range"
                    min="1"
                    max="200"
                    value={globalSettings.intensity}
                    onChange={(e) => handleSettingChange('intensity', parseInt(e.target.value))}
                    className="w-full h-2 bg-base-content/10 rounded-full appearance-none cursor-pointer slider-primary"
                    disabled={!isEnabled}
                    style={{
                        background: `linear-gradient(to right, hsl(var(--p)) 0%, hsl(var(--p)) ${globalSettings.intensity/2}%, hsl(var(--bc)/0.1) ${globalSettings.intensity/2}%, hsl(var(--bc)/0.1) 100%)`
                    }}
                    />
                </div>
                <div className="flex justify-between text-xs text-base-content/70">
                    <span>Ít</span>
                    <span>Nhiều</span>
                </div>
                </div>

                {/* Speed */}
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                    <div className="w-4 h-4 border-2 border-success rounded-full animate-bounce" />
                    Tốc độ rơi
                    </label>
                    <span className="text-xs bg-success/15 text-success px-3 py-1 rounded-full font-medium border border-success/20">
                    {globalSettings.speed}%
                    </span>
                </div>
                <div className="relative">
                    <input
                    type="range"
                    min="30"
                    max="400"
                    value={globalSettings.speed}
                    onChange={(e) => handleSettingChange('speed', parseInt(e.target.value))}
                    className="w-full h-2 bg-base-content/10 rounded-full appearance-none cursor-pointer"
                    disabled={!isEnabled}
                    style={{
                        background: `linear-gradient(to right, hsl(var(--su)) 0%, hsl(var(--su)) ${(globalSettings.speed-10)/290*100}%, hsl(var(--bc)/0.1) ${(globalSettings.speed-10)/290*100}%, hsl(var(--bc)/0.1) 100%)`
                    }}
                    />
                </div>
                <div className="flex justify-between text-xs text-base-content/70">
                    <span>Chậm</span>
                    <span>Nhanh</span>
                </div>
                </div>

                {/* Wind Power */}
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                    <Wind className="w-4 h-4 text-warning" />
                    Sức gió
                    </label>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                    globalSettings.windPower > 0 
                        ? 'bg-warning/15 text-warning border-warning/20' 
                        : globalSettings.windPower < 0 
                        ? 'bg-secondary/15 text-secondary border-secondary/20' 
                        : 'bg-base-content/15 text-base-content border-base-content/20'
                    }`}>
                    {globalSettings.windPower > 0 ? '+' : ''}{globalSettings.windPower}
                    </span>
                </div>
                <div className="relative">
                    <input
                    type="range"
                    min="-20"
                    max="20"
                    value={globalSettings.windPower}
                    onChange={(e) => handleSettingChange('windPower', parseInt(e.target.value))}
                    className="w-full h-2 bg-base-content/10 rounded-full appearance-none cursor-pointer"
                    disabled={!isEnabled}
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-base-content/30 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-base-content/70">
                    <span>← Trái</span>
                    <span>Phải →</span>
                </div>
                </div>

                {/* Opacity */}
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                    <div className="w-4 h-4 bg-accent rounded-full opacity-70" />
                    Độ trong suốt
                    </label>
                    <span className="text-xs bg-accent/15 text-accent px-3 py-1 rounded-full font-medium border border-accent/20">
                    {globalSettings.opacity}%
                    </span>
                </div>
                <div className="relative">
                    <input
                    type="range"
                    min="10"
                    max="100"
                    value={globalSettings.opacity}
                    onChange={(e) => handleSettingChange('opacity', parseInt(e.target.value))}
                    className="w-full h-2 bg-base-content/10 rounded-full appearance-none cursor-pointer"
                    disabled={!isEnabled}
                    style={{
                        background: `linear-gradient(to right, hsl(var(--a)) 0%, hsl(var(--a)) ${(globalSettings.opacity-10)/90*100}%, hsl(var(--bc)/0.1) ${(globalSettings.opacity-10)/90*100}%, hsl(var(--bc)/0.1) 100%)`
                    }}
                    />
                </div>
                <div className="flex justify-between text-xs text-base-content/70">
                    <span>Mờ</span>
                    <span>Rõ</span>
                </div>
                </div>
                {/* size */}
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                    <div className="w-4 h-4 bg-accent rounded-full opacity-70" />
                    Kích thước hạt
                    </label>
                    <span className="text-xs bg-accent/15 text-accent px-3 py-1 rounded-full font-medium border border-accent/20">
                    {globalSettings.size}%
                    </span>
                </div>
                <div className="relative">
                    <input
                    type="range"
                    min="10"
                    max="200"
                    value={globalSettings.size}
                    onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
                    className="w-full h-2 bg-base-content/10 rounded-full appearance-none cursor-pointer"
                    disabled={!isEnabled}
                    style={{
                        background: `linear-gradient(to right, hsl(var(--a)) 0%, hsl(var(--a)) ${(globalSettings.size-10)/90*100}%, hsl(var(--bc)/0.1) ${(globalSettings.size-10)/90*100}%, hsl(var(--bc)/0.1) 100%)`
                    }}
                    />
                </div>
                <div className="flex justify-between text-xs text-base-content/70">
                    <span>Nhỏ</span>
                    <span>To</span>
                </div>
                </div>

                
            </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3 pt-2">
            <button
                onClick={resetSettings}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral/10 hover:bg-neutral/20 rounded-xl transition-all duration-200 text-neutral font-medium hover:scale-[1.02] border border-neutral/20"
                disabled={!isEnabled}
            >
                <RotateCcw className="w-4 h-4" />
                Đặt lại
            </button>
            <button
                onClick={toggleEnabled}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] border ${
                isEnabled 
                    ? 'bg-error/10 hover:bg-error/20 text-error border-error/20' 
                    : 'bg-success/10 hover:bg-success/20 text-success border-success/20'
                }`}
            >
                <Power className="w-4 h-4" />
                {isEnabled ? 'Tắt hiệu ứng' : 'Bật hiệu ứng'}
            </button>
            </div>
        </div>
        </div>
    </div>
  );
};


export default SnowControlPanel;