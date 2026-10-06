import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_CONFIGS } from './themes';

export default function ThreeBackground({ theme, interactive = true }) {
  const containerRef = useRef(null);
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const config = THEME_CONFIGS[themeRef.current];

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Clean Cosmic Stardust Particle Cloud
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      speeds[i] = 0.005 + Math.random() * 0.012;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: new THREE.Color(config.particleHex),
      transparent: true,
      opacity: 0.60,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse movement handler
    const handleMouseMove = (e) => {
      if (!interactive) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId;
    const targetParticleColor = new THREE.Color();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Dynamic theme color smooth interpolation
      const currentThemeConfig = THEME_CONFIGS[themeRef.current];
      targetParticleColor.set(currentThemeConfig.particleHex);
      particleMat.color.lerp(targetParticleColor, 0.05);

      // Particle vertical drift & breathing
      const posAttr = particleGeo.attributes.position;
      const posArray = posAttr.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += speeds[i];
        if (posArray[i * 3 + 1] > 15) {
          posArray[i * 3 + 1] = -15;
          posArray[i * 3] = (Math.random() - 0.5) * 40;
        }
      }
      posAttr.needsUpdate = true;

      // Subtle parallax camera rotation with mouse
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      camera.position.x = mouseX * 2.5;
      camera.position.y = mouseY * 1.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      id="three-background-canvas"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
}
