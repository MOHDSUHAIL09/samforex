// File: src/components/authComponent/Auth.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from './ThreeBackground';
import BotPanel from './BotPanel';
import Card3D from './Card3D';
import { THEME_CONFIGS } from './themes';
import { playCardFlip } from './sound';

export default function Auth() {
  const [theme] = useState('cyber');
  const [botMood, setBotMood] = useState('tracking');
  const [activeView, setActiveView] = useState('login');
  const [tiltEnabled] = useState(true);

  const themeConfig = THEME_CONFIGS[theme];
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setBotMood('celebrating');

    // ✅ Pehla attempt: navigate
    setTimeout(() => {
      navigate('/dashboard', { replace: true });

      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          console.warn('⚠️ Navigate failed, hard redirecting...');
          window.location.href = '/dashboard';
        }
      }, 100);
    }, 100);
  };

  const handleMascotClick = () => {
    setBotMood('celebrating');
    setTimeout(() => setBotMood('tracking'), 2400);
  };

  return (
    <div
      id="app-root-wrapper"
      className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center overflow-x-hidden select-none font-sans py-6 sm:py-10"
      style={{
        backgroundImage: themeConfig.bgGradient,
        transition: 'background-image 0.6s ease-in-out',
      }}
    >
      <ThreeBackground theme={theme} interactive={tiltEnabled} />

      <div
        className="fixed top-0 inset-x-0 h-96 pointer-events-none opacity-30 blur-3xl transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${themeConfig.primaryColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <main
        id="app-main-stage"
        className="relative z-10 flex items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6 flex-1"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center justify-items-center">
          <div className="w-full lg:col-span-6 order-1 flex justify-center">
            <BotPanel
              mood={botMood}
              theme={theme}
              onMascotClick={handleMascotClick}
            />
          </div>

          <div className="w-full lg:col-span-6 order-2 flex justify-center">
            <Card3D
              activeView={activeView}
              setActiveView={(view) => {
                playCardFlip();
                setActiveView(view);
              }}
              theme={theme}
              tiltEnabled={tiltEnabled}
              setBotMood={setBotMood}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      </main>
    </div>
  );
}