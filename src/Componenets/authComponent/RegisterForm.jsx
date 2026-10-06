// File: src/components/authComponent/RegisterForm.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, Eye, EyeOff, UserCheck, CheckCircle2,
  AlertCircle, Loader2, ArrowRight, ShieldCheck, ChevronDown,
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import { THEME_CONFIGS } from './themes';
import {
  playTypingClick, playTelescopeEyeSound, playHidingSound,
  playErrorBuzz, playSuccessChime,
} from './sound';

export default function RegisterForm({
  theme,
  setBotMood,
  onSwitchToLogin,
}) {
  const themeConfig = THEME_CONFIGS[theme];
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [storedOtp, setStoredOtp] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpStatus, setOtpStatus] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const emailInputRef = useRef(null);
  const otpCheckTimeout = useRef(null);
  const timerInterval = useRef(null);

  const [formData, setFormData] = useState({
    introRegNo: "",
    fName: "",       // ✅ Name field ke liye
    lName: "",
    mobile: "",
    email: "",
    password: "",
    address: "N/A",
    referrer: "",
    referrer_Id: "",
    affiliate_Level: 1,
    sponsorName: "",
    walletAddress: "",
    countryId: "",
    countryCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const showError = (msg) => {
    setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    playErrorBuzz();
    setBotMood('error');
    setTimeout(() => setBotMood('idle'), 1200);
  };

  const showSuccess = () => {
    playSuccessChime();
    setBotMood('celebrating');
  };

  useEffect(() => {
    if (resendTimer > 0) {
      timerInterval.current = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, [resendTimer]);

  useEffect(() => {
    if (isOtpMode && otpValue.length === 6 && !otpVerified && !otpLoading) {
      if (otpCheckTimeout.current) clearTimeout(otpCheckTimeout.current);
      otpCheckTimeout.current = setTimeout(() => autoVerifyOTP(), 300);
    }
    return () => {
      if (otpCheckTimeout.current) clearTimeout(otpCheckTimeout.current);
    };
  }, [otpValue, isOtpMode]);

  const autoVerifyOTP = () => {
    if (!otpValue || otpValue.length !== 6) return;
    setOtpLoading(true);
    try {
      if (otpValue === storedOtp) {
        setOtpStatus('success');
        setOtpVerified(true);
        showSuccess();
        setTimeout(() => setOtpLoading(false), 500);
      } else {
        setOtpStatus('error');
        showError("Invalid OTP! Try again.");
        setTimeout(() => {
          setOtpValue("");
          setOtpStatus(null);
          setOtpLoading(false);
          emailInputRef.current?.focus();
        }, 1000);
      }
    } catch {
      showError("Verification failed");
      setOtpStatus('error');
      setTimeout(() => {
        setOtpValue("");
        setOtpStatus(null);
        setOtpLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const response = await apiClient.get("/Auth/GetAllCountries");
        if (response.data?.result === "true" && Array.isArray(response.data.response)) {
          const activeCountries = response.data.response.filter(c => c.cActive === true);
          setCountries(activeCountries);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setCountriesLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredCountries = countries.filter((c) =>
    c.countryName?.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.CCode?.toString().includes(countrySearch)
  );

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      countryId: country.CID,
      countryCode: country.CCode,
    }));
    setOpen(false);
    setCountrySearch("");
    searchInputRef.current?.blur();
  };

  const togglePasswordVisibility = () => {
    const next = !showPassword;
    setShowPassword(next);
    if (next) { playTelescopeEyeSound(); setBotMood('peeking'); }
    else { playHidingSound(); setBotMood('hiding_eyes'); }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      showError("Please enter a valid email address!");
      return;
    }
    setOtpLoading(true);
    try {
      const response = await apiClient.post(
        `/Auth/send-otp-to-gmail?eamil=${encodeURIComponent(formData.email)}`
      );
      if (response.data?.data?.result === "true") {
        const receivedOtp = response.data.otp || response.data.data?.otp;
        if (receivedOtp) setStoredOtp(receivedOtp);

        setOtpSent(true);
        setIsOtpMode(true);
        setOtpValue("");
        setOtpStatus(null);
        setOtpVerified(false);
        setResendTimer(300);
        showSuccess();
        setTimeout(() => emailInputRef.current?.focus(), 300);
      } else {
        showError(response.data?.data?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP Error:", error);
      showError("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) {
      showError(`Wait ${formatTime(resendTimer)} before resending`);
      return;
    }
    handleSendOTP();
  };

  const fetchSponsorDetails = async (sponsorId) => {
    if (!sponsorId || !sponsorId.trim()) return;
    try {
      const response = await apiClient.get(`/Auth/UserDetailsById?loingId=${sponsorId}`);
      if (response.data?.result === "true" && response.data.user) {
        const sponsorName = "✓ Verified";
        setFormData(prev => ({
          ...prev,
          sponsorName: sponsorName,
          referrer: sponsorName,
          introRegNo: response.data.user.regNo,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          sponsorName: "Invalid Sponsor",
          referrer: "",
          introRegNo: "",
        }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setFormData(prev => ({
        ...prev,
        sponsorName: "Invalid Sponsor",
        referrer: "",
        introRegNo: "",
      }));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode && !formData.referrer_Id) {
      setFormData(prev => ({
        ...prev,
        referrer_Id: refCode,
        introRegNo: refCode,
      }));
      fetchSponsorDetails(refCode);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "introRegNo") {
      setFormData(prev => ({ ...prev, referrer_Id: value }));
      fetchSponsorDetails(value);
    } else if (name === "email") {
      if (isOtpMode) {
        const numValue = value.replace(/\D/g, '');
        if (numValue.length <= 6) {
          setOtpValue(numValue);
          if (otpStatus !== null) setOtpStatus(null);
          if (otpVerified) setOtpVerified(false);
        }
      } else {
        setFormData(prev => ({ ...prev, email: value }));
        if (otpSent || otpVerified) {
          setOtpSent(false);
          setOtpVerified(false);
          setIsOtpMode(false);
          setOtpValue("");
          setStoredOtp("");
          setOtpStatus(null);
          setResendTimer(0);
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
          }
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setErrorMessage('');
    playTypingClick();
    setBotMood('typing');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isOtpMode && otpValue.length === 6 && !otpLoading && !otpVerified) {
      e.preventDefault();
      autoVerifyOTP();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpVerified) return showError("Please verify OTP first!");
    if (!formData.fName || !formData.fName.trim()) {
      return showError("Please enter your name!");
    }
    if (!formData.sponsorName || formData.sponsorName === "Invalid Sponsor") {
      return showError("Please enter a valid Sponsor ID!");
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      return showError("Valid 10-digit mobile number required!");
    }
    if (!formData.email || !formData.email.includes('@')) {
      return showError("Valid email address required!");
    }
    if (!formData.password || formData.password.length < 8) {
      return showError("Password must be at least 8 characters!");
    }
    if (!formData.countryId) return showError("Please select a country!");

    setLoading(true);
    setBotMood('typing');

    // ✅ Full name ko split karo
    const nameParts = formData.fName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload = {
      introRegNo: parseInt(formData.introRegNo) || 0,
      fName: firstName,
      lName: lastName,
      mobile: formData.mobile.toString(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      address: formData.address || "N/A",
      referrer: formData.referrer.trim() || formData.sponsorName || "apexmindai",
      referrer_Id: formData.referrer_Id.toString(),
      affiliate_Level: parseInt(formData.affiliate_Level) || 1,
      countryId: formData.countryId,
      countryCode: formData.countryCode,
    };

    try {
      const response = await apiClient.post("/Auth/Register", payload);

      if (response.data?.result === "true" && response.data?.response) {
        const userResponse = response.data.response;
        const regnoValue = userResponse.Regno || userResponse.regno;
        const loginIdValue = userResponse.LoginID || userResponse.loginid;

        const userObject = {
          regno: regnoValue,
          Regno: regnoValue,
          loginid: loginIdValue,
          LoginID: loginIdValue,
          name: formData.fName.trim(),
          fname: firstName,
          lname: lastName,
          mobile: formData.mobile,
          email: userResponse.emailID || formData.email,
          introregno: parseInt(formData.introRegNo) || 0,
          directid: 0,
          walletAddress: formData.walletAddress || "",
          countryId: formData.countryId,
          countryCode: formData.countryCode,
        };

        sessionStorage.setItem("user", JSON.stringify(userObject));

        setRegisteredUser({
          regno: regnoValue,
          loginId: loginIdValue,
          name: formData.fName.trim(),
          email: userResponse.emailID || formData.email,
          mobile: formData.mobile,
          sponsorId: formData.referrer_Id,
          sponsorName: formData.sponsorName,
          password: formData.password,
        });

        setRegisteredSuccess(true);
        showSuccess();

        // ❌ Timer hata diya — koi countdown nahi
      } else {
        let errorMsg = "Registration Failed";
        if (response.data?.message) {
          errorMsg = Array.isArray(response.data.message)
            ? response.data.message.join(", ")
            : response.data.message;
        }
        showError(errorMsg);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        showError(Array.isArray(msg) ? msg.join(", ") : msg);
      } else if (error.response?.data?.title) {
        showError(error.response.data.title);
      } else if (error.response?.data?.errors) {
        showError(Object.values(error.response.data.errors).flat().join(", "));
      } else if (error.code === 'ECONNABORTED') {
        showError('Request timed out.');
      } else if (!error.response) {
        showError('Network error. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== SUCCESS SCREEN — NO TIMER ====================
  if (registeredSuccess && registeredUser) {
    return (
      <div id="register-success-screen" className="flex flex-col items-center justify-center text-center py-6 h-full">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-1">Registration Complete!</h3>
        <p className="text-xs text-slate-300 max-w-xs mb-4">
          Welcome <strong className="text-white">{registeredUser.name}</strong>! Your account is ready.
        </p>

        <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-white/10 mb-6 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Login ID:</span>
            <span className="text-white font-mono">{registeredUser.loginId}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Reg. No:</span>
            <span className="text-white font-mono">{registeredUser.regno}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Email:</span>
            <span className="text-slate-200 truncate ml-2">{registeredUser.email}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Sponsor:</span>
            <span className="text-emerald-400 truncate ml-2">{registeredUser.sponsorName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Active
            </span>
          </div>
        </div>

        {/* ❌ Countdown text hata diya */}

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="btn btn-primary w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          <span>Login Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const sponsorColor =
    formData.sponsorName === "Invalid Sponsor" || formData.sponsorName === "Network Error"
      ? 'text-red-400'
      : formData.sponsorName
      ? 'text-emerald-400'
      : 'text-slate-500';

  return (
    <div id="register-form-container" className="flex flex-col h-full">
      <div>
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
        </div>

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5 sm:space-y-4">

          {/* ✅ Sponsor ID + Sponsor Name */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Sponsor ID *
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400"
                  style={{ paddingLeft: '12px', zIndex: 2 }}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="introRegNo"
                  required
                  value={formData.referrer_Id}
                  onChange={handleChange}
                  onFocus={() => setBotMood('typing')}
                  onBlur={() => setBotMood('idle')}
                  placeholder="Sponsor ID"
                  className={`w-full bg-slate-950/60 text-white placeholder-slate-500 rounded-xl border border-white/10 text-xs sm:text-sm font-mono tracking-wider focus:outline-none transition-all ${themeConfig.ringClass}`}
                  style={{
                    paddingLeft: '36px',
                    paddingRight: '8px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Sponsor Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.sponsorName}
                  readOnly
                  placeholder="Sponsor Name"
                  className={`w-full bg-slate-950/60 rounded-xl border border-white/10 text-xs sm:text-sm focus:outline-none font-semibold ${sponsorColor}`}
                  style={{
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ✅ Full Name Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 mt-2">
              Full Name *
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400"
                style={{ paddingLeft: '14px', zIndex: 2 }}
              >
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="fName"
                required
                value={formData.fName}
                onChange={handleChange}
                onFocus={() => setBotMood('typing')}
                onBlur={() => setBotMood('idle')}
                placeholder="Enter your full name"
                className={`w-full bg-slate-950/60 text-white placeholder-slate-500 rounded-xl border border-white/10 text-xs sm:text-sm focus:outline-none transition-all ${themeConfig.ringClass}`}
                style={{
                  paddingLeft: '42px',
                  paddingRight: '14px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                }}
              />
            </div>
          </div>

          {/* Email + OTP */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 mt-2">
              {isOtpMode ? 'Enter OTP *' : 'Email Address *'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div
                  className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400"
                  style={{ paddingLeft: '14px', zIndex: 2 }}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  ref={emailInputRef}
                  type={isOtpMode ? "text" : "email"}
                  name="email"
                  required
                  value={isOtpMode ? otpValue : formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder={isOtpMode ? "Enter OTP" : "Email Address"}
                  className={`w-full bg-slate-950/60 text-white placeholder-slate-500 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${themeConfig.ringClass} ${
                    isOtpMode && otpStatus === 'success'
                      ? 'border-emerald-400'
                      : isOtpMode && otpStatus === 'error'
                      ? 'border-red-400'
                      : 'border-white/10'
                  }`}
                  style={{
                    paddingLeft: '40px',
                    paddingRight: '14px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    letterSpacing: isOtpMode ? '8px' : 'normal',
                    fontWeight: isOtpMode ? '600' : 'normal',
                  }}
                />
              </div>

              {!isOtpMode && !otpVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading || !formData.email || !formData.email.includes('@')}
                  className="btn btn-primary px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                >
                  {otpLoading ? 'Sending...' : 'Send OTP'}
                </button>
              )}

              {isOtpMode && !otpVerified && (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpLoading || resendTimer > 0}
                  className="btn btn-primary px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                >
                  {resendTimer > 0 ? formatTime(resendTimer) : 'Resend'}
                </button>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 mt-2">
              Country *
            </label>
            <div className="relative" ref={dropdownRef}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Country..."
                value={
                  open
                    ? countrySearch
                    : formData.countryId
                    ? countries.find((c) => c.CID === formData.countryId)?.countryName || ''
                    : ''
                }
                onChange={(e) => {
                  if (!open) setOpen(true);
                  setCountrySearch(e.target.value);
                }}
                onFocus={() => {
                  setOpen(true);
                  setCountrySearch('');
                }}
                autoComplete="off"
                className={`w-full bg-slate-950/60 text-white placeholder-slate-500 rounded-xl border border-white/10 text-xs sm:text-sm focus:outline-none ${themeConfig.ringClass}`}
                style={{
                  paddingLeft: '14px',
                  paddingRight: '40px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                }}
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform pointer-events-none ${open ? 'rotate-180' : ''}`}
              />

              {open && (
                <div className="absolute z-50 mt-1 left-0 right-0 max-h-56 overflow-y-auto bg-slate-900 border border-white/10 rounded-xl shadow-2xl">
                  {countriesLoading ? (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">Loading...</div>
                  ) : filteredCountries.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">No country found</div>
                  ) : (
                    filteredCountries.map((country) => (
                      <div
                        key={country.CID}
                        onClick={() => handleCountrySelect(country)}
                        className="px-4 py-2.5 text-xs sm:text-sm text-slate-200 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
                      >
                        <span>{country.countryName}</span>
                        <span className="text-slate-500 font-mono">+{country.CCode}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 mt-2">
              Mobile Number *
            </label>
            <div className="relative flex rounded-xl border border-white/10 bg-slate-950/60 overflow-hidden focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/50">
              <div className="flex items-center gap-1 px-3 bg-white/5 border-r border-white/10 text-xs sm:text-sm font-semibold text-slate-300 select-none min-w-[64px] justify-center">
                <span className="font-mono">
                  {formData.countryCode ? `+${formData.countryCode}` : '+00'}
                </span>
              </div>
              <div className="relative flex-1">
                <div
                  className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400"
                  style={{ paddingLeft: '14px', zIndex: 2 }}
                >
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, mobile: cleaned }));
                    playTypingClick();
                    setBotMood('typing');
                  }}
                  onFocus={() => setBotMood('typing')}
                  onBlur={() => setBotMood('idle')}
                  placeholder="Mobile No"
                  className="w-full bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none font-mono"
                  style={{
                    paddingLeft: '40px',
                    paddingRight: '14px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 mt-2">
              Create Password *
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400"
                style={{ paddingLeft: '14px', zIndex: 2 }}
              >
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  playTypingClick();
                  setBotMood(showPassword ? 'peeking' : 'hiding_eyes');
                }}
                onFocus={() => setBotMood(showPassword ? 'peeking' : 'hiding_eyes')}
                onBlur={() => setBotMood('idle')}
                placeholder="Minimum 8 characters"
                className={`w-full bg-slate-950/60 text-white placeholder-slate-500 rounded-xl border border-white/10 text-xs sm:text-sm focus:outline-none transition-all ${themeConfig.ringClass}`}
                style={{
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                style={{ paddingRight: '14px', zIndex: 2 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

              <div className=" mt-3">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold   ml-1"
            style={{ color: "#667eea" }}
          >
            Login Here
          </button>
        </p>
      </div>

      {/* Submit */}
          <button
            type="submit"
            disabled={loading || !otpVerified}
            className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}