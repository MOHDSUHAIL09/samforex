// File: src/components/authComponent/ForgotPasswordForm.jsx

import { useState } from 'react';
import {
  Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2, KeyRound,
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import { THEME_CONFIGS } from './themes';
import {
  playTypingClick, playErrorBuzz, playSuccessChime, playButtonTap,
} from './sound';

export default function ForgotPasswordForm({
  theme,
  setBotMood,
  onBackToLogin,
}) {
  const themeConfig = THEME_CONFIGS[theme];
  const [loginId, setLoginId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = loginId.trim();

    // ✅ Validation
    if (!trimmedId) {
      setErrorMessage('Please enter your Login ID');
      playErrorBuzz();
      setBotMood('error');
      setTimeout(() => setBotMood('idle'), 1000);
      return;
    }

    setIsLoading(true);
    setBotMood('typing');

    try {
      // ✅ JSON.stringify + Content-Type — yahi asli fix hai
      const response = await apiClient.post(
        '/Auth/ForgetPassword',
        JSON.stringify(trimmedId),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      console.log('ForgetPassword response:', data);

      // ✅ Check main result
      if (data.result === 'true' || data.result === true) {
        const responseData = data.response;

        // ✅ Success check
        if (responseData?.isCompletedSuccessfully === true) {
          setIsSent(true);
          playSuccessChime();
          setBotMood('celebrating');
        }
        // ❌ Specific failure message
        else if (responseData?.result === 'Failed to send password. Please try again later.') {
          setErrorMessage('Failed to send password. Please try again later.');
          playErrorBuzz();
          setBotMood('error');
          setTimeout(() => setBotMood('idle'), 1200);
        }
        // ❌ Other failure
        else {
          setErrorMessage(
            responseData?.result || 'Request failed. Please try again.'
          );
          playErrorBuzz();
          setBotMood('error');
          setTimeout(() => setBotMood('idle'), 1200);
        }
      } else {
        setErrorMessage(data.message || 'Request failed. Please try again.');
        playErrorBuzz();
        setBotMood('error');
        setTimeout(() => setBotMood('idle'), 1200);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      console.error('Error Response:', error.response);

      let errorMsg = 'Network Error! Please check your connection.';

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.response?.result) {
        errorMsg = error.response.data.response.result;
      } else if (error.response?.data?.title) {
        errorMsg = error.response.data.title;
      } else if (error.response?.status === 400) {
        errorMsg = 'Invalid Login ID. Please check and try again.';
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
      playErrorBuzz();
      setBotMood('error');
      setTimeout(() => setBotMood('idle'), 1200);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="forgot-password-container" className="flex flex-col h-full justify-between">
      <div>
        {/* Back Button */}
        <button
          type="button"
          id="btn-back-to-login-top"
          onClick={() => {
            playButtonTap();
            onBackToLogin();
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center border"
            style={{
              backgroundColor: `${themeConfig.primaryColor}15`,
              borderColor: `${themeConfig.primaryColor}40`,
              color: themeConfig.primaryColor,
            }}
          >
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Enter your Login ID to receive recovery instructions.
          </p>
        </div>

        {/* Sent Confirmation State */}
        {isSent ? (
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">Recovery Instructions Sent</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We&apos;ve sent password recovery instructions to your registered email/phone linked with{' '}
              <strong className="text-white">{loginId}</strong>.
            </p>

            <button
              type="button"
              id="btn-return-login-after-sent"
              onClick={onBackToLogin}
              className="btn btn-primary w-full py-2.5 px-4 rounded-xl font-semibold text-xs mt-3"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label
                className="block text-xs sm:text-sm font-medium text-slate-300 mb-2"
                htmlFor="forgot-loginId"
              >
                Recover your account
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400"
                  style={{ paddingLeft: '16px', zIndex: 2 }}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="forgot-loginId"
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setErrorMessage('');
                    playTypingClick();
                    setBotMood('typing');
                  }}
                  onFocus={() => setBotMood('typing')}
                  onBlur={() => setBotMood('idle')}
                  placeholder="Enter Your Login ID"
                  autoComplete="off"
                  className={`w-full bg-slate-950/60 text-white placeholder-slate-500 rounded-xl border border-white/10 text-sm focus:outline-none transition-all ${themeConfig.ringClass}`}
                  style={{
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                />
              </div>
            </div>

            {/* ✅ Remember credentials — input ke neeche, button ke upar */}
            <div className="text-center">
              <button
                type="button"
                id="btn-bottom-return-login"
                onClick={onBackToLogin}
                className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Remember your credentials?</span>
                <span className="font-semibold" style={{ color: "#667eea" }}>
                  Log In
                </span>
              </button>
            </div>

            <button
              type="submit"
              id="btn-send-reset-token"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-5 rounded-xl font-semibold text-sm sm:text-base transition-all transform active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Recover Password</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}