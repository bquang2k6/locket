import { useEffect, useRef } from 'react';
import { butterfliesBackground } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js';

const ButterflyBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      butterfliesBackground({
        el: containerRef.current,
        eventsEl: document.body,
        gpgpuSize: 18,
        // background: 0x88CEFF,
        material: 'phong',
        lights: [
          { type: 'ambient', params: [0xffffff, 0.5] },
          { type: 'directional', params: [0xffffff, 1], props: { position: [10, 0, 0] } }
        ],
        materialParams: { transparent: true, alphaTest: 0.5 },
        texture: 'https://assets.codepen.io/33787/butterflies.png',
        textureCount: 4,
        wingsScale: [2, 2, 2],
        wingsWidthSegments: 16,
        wingsHeightSegments: 16,
        wingsSpeed: 0.75,
        wingsDisplacementScale: 1.25,
        noiseCoordScale: 0.01,
        noiseTimeCoef: 0.0005,
        noiseIntensity: 0.0025,
        attractionRadius1: 100,
        attractionRadius2: 150,
        maxVelocity: 0.1
      });
    }
  }, []);

  return <div ref={containerRef} className="w-full h-screen fixed top-0 left-0" />;
};

export default ButterflyBackground;