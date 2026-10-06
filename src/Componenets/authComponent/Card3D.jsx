// File: src/components/authComponent/Card3D.jsx

import { useRef, useState } from 'react';
import { THEME_CONFIGS } from './themes';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { playCardFlip } from './sound';

export default function Card3D({
  activeView,
  setActiveView,
  theme,
  tiltEnabled,
  setBotMood,
  onLoginSuccess,
}) {
  const themeConfig = THEME_CONFIGS[theme];
  const containerRef = useRef(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!tiltEnabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = 12;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = -((y - centerY) / centerY) * maxTilt;

    setTilt({ x: rotateX, y: rotateY });

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.22 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleViewSwitch = (target) => {
    if (activeView === target) return;
    playCardFlip();
    setActiveView(target);
    setBotMood('idle');
  };

  const isFlipped = activeView === 'register';
  const isFrontActive = !isFlipped;
  const isBackActive = isFlipped;

  return (
    <div
      ref={containerRef}
      id="card3d-perspective-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[530px] lg:max-w-[550px] perspective-1200 mx-auto"
    >
      {/* 3D Flipping Card Body */}
      <div
        id="card3d-flip-inner"
        className="relative w-full transition-transform duration-700 transform-style-3d ease-out"
        style={{
          transform: `rotateY(${isFlipped ? 180 : 0}deg) rotateX(${tilt.x}deg) rotateY(${
            isFlipped ? -tilt.y : tilt.y
          }deg)`,
        }}
      >
        {/* ==================================================== */}
        {/* FRONT FACE: Sign In / Forgot Password                */}
        {/* ✅ Relative — content ke hisaab se height lega       */}
        {/* ==================================================== */}
        <div
          id="card-front-face"
          className="relative w-full backface-hidden bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 md:p-10 shadow-2xl flex flex-col justify-between overflow-hidden"
          style={{
            boxShadow: `0 25px 60px -15px ${themeConfig.glowColor}, inset 0 1px 0 0 rgba(255, 255, 255, 0.18)`,
            pointerEvents: isFrontActive ? 'auto' : 'none',
            zIndex: isFrontActive ? 2 : 1,
            visibility: isFrontActive ? 'visible' : 'hidden',
          }}
        >
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <div
            className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, rgba(255, 255, 255, 0) 65%)`,
            }}
          />

          {activeView === 'forgot' ? (
            <ForgotPasswordForm
              theme={theme}
              setBotMood={setBotMood}
              onBackToLogin={() => handleViewSwitch('login')}
            />
          ) : (
            <LoginForm
              theme={theme}
              setBotMood={setBotMood}
              onLoginSuccess={onLoginSuccess}
              onSwitchToRegister={() => handleViewSwitch('register')}
              onForgotPassword={() => {
                playCardFlip();
                setActiveView('forgot');
              }}
            />
          )}
        </div>

        {/* ==================================================== */}
        {/* BACK FACE: Register Form (Rotated 180deg)            */}
        {/* ✅ Absolute overlay — front ke upar aayega           */}
        {/* ==================================================== */}
        <div
          id="card-back-face"
          className="absolute top-0 left-0 w-full backface-hidden rotate-y-180 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 md:p-10 shadow-2xl flex flex-col justify-between overflow-hidden"
          style={{
            boxShadow: `0 25px 60px -15px ${themeConfig.glowColor}, inset 0 1px 0 0 rgba(255, 255, 255, 0.18)`,
            pointerEvents: isBackActive ? 'auto' : 'none',
            zIndex: isBackActive ? 2 : 1,
            visibility: isBackActive ? 'visible' : 'hidden',
          }}
        >
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <div
            className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, rgba(255, 255, 255, 0) 65%)`,
            }}
          />

          <RegisterForm
            theme={theme}
            setBotMood={setBotMood}
            onSwitchToLogin={() => handleViewSwitch('login')}
          />
        </div>
      </div>
    </div>
  );
}