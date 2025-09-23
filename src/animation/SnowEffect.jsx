import React, { useRef, useEffect, useState } from "react";

const SnowEffect = () => {
  const canvasRefs = [useRef(null), useRef(null), useRef(null)];
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const snowInstancesRef = useRef([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [globalSettings, setGlobalSettings] = useState({
    intensity: 100,
    speed: 100,
    windPower: 0,
    interaction: true,
    opacity: 80,
    size: 100,
  });

  class Snow {
    constructor(canvas, settings, globalMod = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.settings = { ...settings };
      this.globalMod = globalMod;
      this.flakes = [];
      this.flakeCount = Math.floor(
        settings.count * (globalMod.intensity || 100) / 100
      );
      this.animationId = null;

      this.init();
    }

    init() {
      this.canvas.width = document.documentElement.clientWidth;
      this.canvas.height = document.documentElement.clientHeight;
      this.flakes = [];

      for (let i = 0; i < this.flakeCount; i++) {
        const x = Math.floor(Math.random() * this.canvas.width);
        const y = Math.floor(Math.random() * this.canvas.height);

        const baseSize = Math.random() * 5 + 2;
        const sizeScale = (this.globalMod.size || 100) / 100;
        const size = baseSize * sizeScale;

        const speed =
          (Math.random() * this.settings.speed + 0.5) *
          (this.globalMod.speed || 100) / 100;

        const opacity =
          (0.5 * Math.random() + this.settings.opacity / 100) *
          (this.globalMod.opacity || 100) / 100;

        this.flakes.push({
          x,
          y,
          size,
          speed,
          velY: speed,
          velX: 0,
          opacity: Math.min(1, opacity),
        });
      }
    }

    resetFlake(flake) {
      flake.x = Math.floor(Math.random() * this.canvas.width);
      flake.y = 0;

      const baseSize = Math.random() * 5 + 2;
      const sizeScale = (this.globalMod.size || 100) / 100;
      flake.size = baseSize * sizeScale;

      flake.speed =
        (Math.random() * this.settings.speed + 0.5) *
        (this.globalMod.speed || 100) / 100;

      flake.velY = flake.speed;
      flake.velX = 0;
      flake.opacity = Math.min(
        1,
        (0.5 * Math.random() + this.settings.opacity / 100) *
          (this.globalMod.opacity || 100) / 100
      );
    }

    snow() {
      const animate = () => {
        this.animationId = requestAnimationFrame(animate);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.flakes.length; i++) {
          const flake = this.flakes[i];

          // 🟢 Áp dụng sức gió
          const wind = (this.globalMod.windPower || 2) * 0.2; // chỉnh hệ số để gió mạnh/nhẹ
          flake.velX = wind;

          // cập nhật vị trí
          flake.x += flake.velX;
          flake.y += flake.velY;

          // nếu ra khỏi màn hình thì reset lại
          if (
            flake.y >= this.canvas.height ||
            flake.x >= this.canvas.width ||
            flake.x < 0
          ) {
            this.resetFlake(flake);
          }

          // vẽ hạt tuyết
          this.ctx.beginPath();
          this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255,255,255,${flake.opacity})`;
          this.ctx.fill();
        }
      };

      animate();
    }

    resize(width, height) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = width;
      this.canvas.height = height + 5;
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }


  // Lắng nghe sự kiện từ SnowControlPanel
  useEffect(() => {
    const handleConfigChange = (event) => {
      const { enabled, settings } = event.detail;
      setIsEnabled(enabled);
      setGlobalSettings(settings);
    };

    // Load initial config từ localStorage nếu có
    const savedConfig = localStorage.getItem('snowEffectConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setIsEnabled(config.enabled);
        setGlobalSettings(config.settings);
      } catch (e) {
        console.warn('Invalid snow config in localStorage');
      }
    }

    // Lắng nghe sự kiện config change
    window.addEventListener('snowConfigChange', handleConfigChange);

    return () => {
      window.removeEventListener('snowConfigChange', handleConfigChange);
    };
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Xóa instances cũ
    snowInstancesRef.current.forEach((instance) => instance.destroy());
    snowInstancesRef.current = [];

    if (!isEnabled) return;

    const snowConfigs = [
      {
        speed: 1,
        interaction: false,
        size: 3,
        count: 100,
        opacity: 0.3,
        startColor: "rgba(255,255,255,1)",
        endColor: "rgba(255,255,255,0.4)",
        windPower: 0,
        image: false,
      },
      {
        speed: 2,
        interaction: true,
        size: 9,
        count: 50,
        opacity: 0.5,
        startColor: "rgba(255,255,255,1)",
        endColor: "rgba(255,255,255,0.5)",
        windPower: 2,
        image: false,
      },
      {
        speed: 3,
        interaction: true,
        size: 7,
        count: 30,
        opacity: 0.8,
        startColor: "rgba(255,255,255,1)",
        endColor: "rgba(255,255,255,0.6)",
        windPower: -5,
        image: false,
      },
    ];

    canvasRefs.forEach((canvasRef, index) => {
      if (canvasRef.current) {
        const snowInstance = new Snow(canvasRef.current, snowConfigs[index], {
          intensity: globalSettings.intensity,
          speed: globalSettings.speed,
          windPower: globalSettings.windPower,
          interaction: globalSettings.interaction,
          opacity: globalSettings.opacity,
          size: globalSettings.size,
        });
        snowInstancesRef.current.push(snowInstance);
        snowInstance.snow();
      }
    });

    return () => {
      snowInstancesRef.current.forEach((instance) => instance.destroy());
      snowInstancesRef.current = [];
    };
  }, [dimensions, isEnabled, globalSettings]);

  // Chỉ render canvas khi hiệu ứng được bật
  if (!isEnabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <canvas
        ref={canvasRefs[0]}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={canvasRefs[1]}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={canvasRefs[2]}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
};

export default SnowEffect;