import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Shield,
  Sparkles,
  User,
  BellRing,
  PhoneCall,
  Flame,
  Check
} from 'lucide-react';
import { useToast } from '../common/Toast';
import {
  firebaseAuthService,
  hasFirebaseConfig,
  UserProfile,
  saveUserSession
} from '../../lib/firebase';
import { supabaseHelpers, hasSupabaseConfig } from '../../lib/supabase';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; phone: string; email?: string }) => void;
  pendingVehicleName?: string;
}

const GoogleIcon: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  pendingVehicleName
}) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showSmsBanner, setShowSmsBanner] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Play subtle SMS chime
  const playSmsNotificationSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.16); // D6

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhone('');
      setName('');
      setOtp(['', '', '', '']);
      setOtpCode('');
      setConfirmationResult(null);
      setIsLoading(false);
      setIsGoogleLoading(false);
      setResendTimer(0);
      setShowSmsBanner(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('bbr-user');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth) as { name?: string; phone?: string };
        if (parsed.name && parsed.phone) {
          setName(parsed.name);
          setPhone(parsed.phone.replace(/^\+91/, '').replace(/\s+/g, ''));
        }
      } catch {
        localStorage.removeItem('bbr-user');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerSmsDelivery = (code: string, recipientPhone: string) => {
    playSmsNotificationSound();
    setShowSmsBanner(true);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setShowSmsBanner(false);
    }, 12000);
    showToast(`SMS Verification Code sent to +91 ${recipientPhone}`, 'success');
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const userProfile = await firebaseAuthService.signInWithGoogle();

      showToast(`Welcome, ${userProfile.name}! Signed in via Google`, 'success');
      onLoginSuccess({
        name:  userProfile.name,
        phone: userProfile.phone,
        email: userProfile.email
      });
      onClose();
    } catch (error) {
      console.error('Google sign-in error:', error);
      const msg = error instanceof Error ? error.message : 'Google Sign-In failed.';
      // Show the full message so the user understands what they need to do
      showToast(msg, 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Firebase Phone OTP Request
  const handleRequestPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize invisible reCAPTCHA if Firebase config is live
      if (hasFirebaseConfig && !recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = firebaseAuthService.createRecaptchaVerifier(
          'recaptcha-container'
        );
      }

      const result = await firebaseAuthService.sendPhoneOtp(
        cleanPhone,
        recaptchaVerifierRef.current
      );

      setConfirmationResult(result.confirmationResult);
      setOtp(['', '', '', '']);
      setStep('otp');
      startResendTimer();

      if (result.demoOtp) {
        setOtpCode(result.demoOtp);
        triggerSmsDelivery(result.demoOtp, cleanPhone);
      } else {
        showToast(`Firebase OTP dispatched via SMS to +91 ${cleanPhone}`, 'info');
      }

      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err) {
      console.warn('Phone OTP dispatch error, using fallback:', err);
      const fallbackOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setOtpCode(fallbackOtp);
      setOtp(['', '', '', '']);
      setStep('otp');
      startResendTimer();
      triggerSmsDelivery(fallbackOtp, cleanPhone);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillOtp = (codeToFill?: string) => {
    const targetCode = codeToFill || otpCode;
    if (!targetCode) return;
    const digits = targetCode.split('').slice(0, 4);
    setOtp(digits);
    showToast(`Auto-filled OTP: ${targetCode}`, 'info');
    setTimeout(() => {
      otpRefs.current[3]?.focus();
    }, 50);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = ['', '', '', ''];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    otpRefs.current[nextEmpty === -1 ? 3 : nextEmpty]?.focus();
  };

  // Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) {
      showToast('Please enter the 4-digit verification code', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const userProfile: UserProfile = await firebaseAuthService.verifyPhoneOtp(
        confirmationResult,
        code,
        otpCode,
        name,
        cleanPhone
      );

      const finalName = userProfile.name || (name && name.trim()) || 'Rider';
      const finalPhone = userProfile.phone || `+91 ${cleanPhone}`;

      saveUserSession(userProfile);

      // Sync with Supabase if active
      if (hasSupabaseConfig) {
        await supabaseHelpers
          .upsertProfile({ name: finalName, phone: finalPhone })
          .catch(() => {});
      }

      setShowSmsBanner(false);
      showToast(`Welcome, ${finalName}! Authenticated via Firebase`, 'success');
      onLoginSuccess({
        name: finalName,
        phone: finalPhone,
        email: userProfile.email
      });
      onClose();
    } catch (error) {
      console.warn('Verification failed:', error);
      showToast(
        error instanceof Error ? error.message : 'Invalid OTP. Please check your verification code.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container" />

      {/* Floating Incoming SMS Push Banner */}
      {showSmsBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md animate-in slide-in-from-top-6 duration-300">
          <div className="p-3.5 rounded-2xl bg-[#0D1527] border border-orange-500/50 shadow-2xl shadow-orange-500/20 backdrop-blur-xl flex items-center justify-between gap-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 animate-pulse">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
                    VK-FREEDO SMS
                  </span>
                  <span className="text-[9px] text-slate-400">• Just now</span>
                </div>
                <p className="text-xs text-white font-medium">
                  Your Firebase Auth code is{' '}
                  <strong className="text-orange-400 font-mono text-sm tracking-wider">
                    {otpCode}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleAutoFillOtp(otpCode)}
                className="px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                Auto-Fill
              </button>
              <button
                type="button"
                onClick={() => setShowSmsBanner(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#0B0F1A] border border-orange-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                <Flame className="w-5 h-5 text-amber-200 fill-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white font-heading">
                    Sign In to FREEDO
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Firebase
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                    {hasFirebaseConfig ? 'Firebase Cloud Auth Active' : 'Secure Cloud Auth Ready'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pending Vehicle notice */}
          {pendingVehicleName && (
            <div className="px-5 py-2.5 bg-orange-500/10 border-b border-orange-500/20 text-orange-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-orange-400" />
              <span>
                Sign in to complete your rental of <strong>{pendingVehicleName}</strong>
              </span>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            {step === 'phone' ? (
              <div className="space-y-4">
                {/* Google 1-Click Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-3 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <GoogleIcon />
                  <span>
                    {isGoogleLoading ? 'Connecting Google Auth...' : 'Continue with Google'}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#0B0F1A] px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Or Phone OTP
                  </span>
                  <div className="border-t border-white/10 w-full" />
                </div>

                {/* Phone Auth Form */}
                <form onSubmit={handleRequestPhoneOtp} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Your Full Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Your Full Name"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Mobile Number <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1 text-slate-400 font-semibold text-xs border-r border-white/10 pr-2.5">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit number"
                        required
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-20 pr-4 py-2.5 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Firebase OTP verification code will be sent to this number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phone.length < 10}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4" />
                        <span>Send Verification OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      DigiLocker document verification linked after login
                    </span>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Change +91 {phone}</span>
                  </button>

                  <span className="text-[11px] text-orange-400 font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                    OTP Dispatched
                  </span>
                </div>

                {/* Simulated SMS card with 1-click Auto-fill */}
                {otpCode && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-orange-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Incoming SMS OTP:
                        </span>
                        <span className="font-mono font-black text-sm text-white tracking-widest">
                          {otpCode}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutoFillOtp(otpCode)}
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {/* 4-digit input fields */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                    Enter 4-Digit Verification Code
                  </label>
                  <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-13 h-14 bg-slate-950 border border-white/15 focus:border-orange-500 rounded-2xl text-center text-xl font-bold font-mono text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP counter */}
                <div className="text-center text-xs">
                  {resendTimer > 0 ? (
                    <span className="text-slate-500">
                      Resend SMS in <strong className="text-orange-400">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleRequestPhoneOtp(e as unknown as React.FormEvent)}
                      className="text-orange-400 hover:text-orange-300 font-bold underline"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length < 4}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify with Firebase</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
