import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Mail,
  Clock,
  Key,
  Award,
  Fingerprint,
} from 'lucide-react';
import { THEME_CONFIGS } from './themes';
import { playCardFlip, playSuccessChime } from './sound';

export default function SuccessView({ session, theme, onSignOut }) {
  const themeConfig = THEME_CONFIGS[theme];

  useEffect(() => {
    playSuccessChime();

    // Trigger celebratory confetti cannon bursts
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#06b6d4', '#3b82f6', '#ffffff'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#a855f7', '#ec4899', '#f59e0b'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  const handleSignOutClick = () => {
    playCardFlip();
    onSignOut();
  };

  return (
    <div
      id="success-view-container"
      className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden"
      style={{
        boxShadow: `0 25px 70px -15px ${themeConfig.glowColor}, inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`,
      }}
    >
      {/* Top Hairline Highlight */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Access Granted</h2>
            <p className="text-xs text-slate-400">Authenticated Biometric Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-slate-950/70 rounded-2xl p-5 border border-white/10 mb-6 space-y-4">
        {/* Name and Avatar */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor})`,
            }}
          >
            {session.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{session.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{session.email}</span>
            </p>
          </div>
        </div>

        {/* Detail Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
            <Fingerprint className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Session ID</span>
              <span className="font-mono text-white font-semibold">{session.sessionId}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Login Timestamp</span>
              <span className="text-slate-200">{session.loginTime}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
            <Key className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Provider Protocol</span>
              <span className="text-slate-200">{session.provider || 'Encrypted Key'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Authorization Tier</span>
              <span className="text-emerald-400 font-semibold">Tier-1 Administrator</span>
            </div>
          </div>
        </div>

        {/* Sponsor info if present */}
        {session.sponsorId && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-400">Registered Sponsor:</span>
            <span className="text-cyan-400 font-mono font-semibold">
              {session.sponsorId} {session.sponsorName ? `(${session.sponsorName})` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Security notice & Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          id="btn-sign-out"
          onClick={handleSignOutClick}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Lock Terminal</span>
        </button>

        <button
          type="button"
          id="btn-refresh-session"
          onClick={() => {
            const count = 100;
            confetti({ particleCount: count, spread: 70, origin: { y: 0.6 } });
            playSuccessChime();
          }}
          className={`w-full sm:w-auto py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${themeConfig.buttonClass}`}
        >
          <span>Cheer Sentinel 🎉</span>
        </button>
      </div>
    </div>
  );
}
