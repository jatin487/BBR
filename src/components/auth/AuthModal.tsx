import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, ArrowRight, CheckCircle2, ChevronLeft, Shield, Zap } from 'lucide-react';
import { useToast } from '../common/Toast';
import { supabaseHelpers, hasSupabaseConfig } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; phone: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpCode, setOtpCode] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhone('');
      setName('');
      setOtp(['', '', '', '']);
      setOtpCode('');
      setOtpExpiry(null);
      setIsLoading(false);
      setResendTimer(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('bbr-user');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth) as { name?: string; phone?: string };
        if (parsed.name && parsed.phone) {
          setName(parsed.name);
          setPhone(parsed.phone);
        }
      } catch {
        localStorage.removeItem('bbr-user');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const generateOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(newOtp);
    setOtpExpiry(Date.now() + 90 * 1000);
    return newOtp;
  };

  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) { showToast('Please enter a valid 10-digit mobile number', 'error'); return; }

    setIsLoading(true);

    try {
      if (hasSupabaseConfig) {
        const result = await supabaseHelpers.signInWithOtp(`+91${phone}`);
        const generatedOtp = result?.otpCode || generateOtp();
        setOtpCode(generatedOtp);
        setOtpExpiry(Date.now() + 90 * 1000);
        setOtp(['', '', '', '']);
        setStep('otp');
        startResendTimer();
        showToast(`OTP sent to +91 ${phone}. Use code: ${generatedOtp}`, 'info');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        return;
      }

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', phone: `+91${phone}` })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send OTP');
      }

      const generatedOtp = data.otpCode || generateOtp();
      setOtpCode(generatedOtp);
      setOtpExpiry(Date.now() + 90 * 1000);
      setOtp(['', '', '', '']);
      setStep('otp');
      startResendTimer();
      showToast(data.demo ? `OTP generated for +91 ${phone}: ${generatedOtp}` : `OTP sent to +91 ${phone}. Use code: ${generatedOtp}`, 'info');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      const fallbackOtp = generateOtp();
      setOtpCode(fallbackOtp);
      setOtpExpiry(Date.now() + 90 * 1000);
      setOtp(['', '', '', '']);
      setStep('otp');
      startResendTimer();
      showToast(error instanceof Error ? error.message : `OTP generated for +91 ${phone}: ${fallbackOtp}`, 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = ['', '', '', ''];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    otpRefs.current[nextEmpty === -1 ? 3 : nextEmpty]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) { showToast('Please enter the full 4-digit OTP', 'error'); return; }

    if (!otpCode || !otpExpiry || Date.now() > otpExpiry) {
      showToast('OTP expired. Please request a new code.', 'error');
      setOtp(['', '', '', '']);
      setOtpCode('');
      setOtpExpiry(null);
      setStep('phone');
      return;
    }

    setIsLoading(true);

    try {
      if (hasSupabaseConfig) {
        const result = await supabaseHelpers.verifyOtp(`+91${phone}`, code);
        if (!result.demo && result.data?.user) {
          const userData = { name: name || 'Rider', phone };
          await supabaseHelpers.upsertProfile(userData);
          localStorage.setItem('bbr-user', JSON.stringify(userData));
          onLoginSuccess(userData);
          showToast(`Welcome, ${userData.name}! You are signed in`, 'success');
          onClose();
          return;
        }
      }

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', phone: `+91${phone}`, otp: code, name: name || 'Rider' })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP. Please check the code and try again.');
      }

      const userData = { name: data.user?.name || name || 'Rider', phone };
      if (hasSupabaseConfig) {
        await supabaseHelpers.upsertProfile(userData);
      }
      localStorage.setItem('bbr-user', JSON.stringify(userData));
      onLoginSuccess(userData);
      showToast(`Welcome, ${userData.name}! You are signed in`, 'success');
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Invalid OTP. Please check the code and try again.', 'error');
      setOtp(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const otpComplete = otp.every((d) => d !== '');

  /* ─── Site design tokens (matches index.css) ─── */
  const BG_PRIMARY   = '#080A0B';
  const BG_SECONDARY = '#0E1113';
  const SURFACE      = '#15191C';
  const SURFACE_EL   = '#1B2024';
  const BORDER       = '#292F33';
  const ACCENT       = '#FF6A00';   /* orange brand accent */
  const ACCENT_GLOW  = '#FF9900';
  const TEXT_PRI     = '#F4F5F2';
  const TEXT_SEC     = '#9BA1A5';
  const TEXT_MUTED   = '#656C70';

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: BG_SECONDARY,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 14,
    padding: '13px 16px',
    fontSize: 15,
    color: TEXT_PRI,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Manrope, system-ui, sans-serif',
    transition: 'border-color 0.2s, background 0.2s',
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'rgba(4,5,6,0.92)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .auth-sheet {
          animation: slideUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .auth-input:focus {
          border-color: ${ACCENT} !important;
          background: rgba(255,106,0,0.05) !important;
        }
        .auth-btn-primary:not(:disabled):hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .auth-btn-ghost:hover {
          color: ${TEXT_PRI} !important;
        }
        @media (min-width: 640px) {
          .auth-sheet-outer { align-items: center !important; }
          .auth-sheet { border-radius: 24px !important; max-width: 400px; }
        }
      `}</style>

      <div
        className="auth-sheet-outer"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}
      >
        <div
          className="auth-sheet"
          style={{
            position: 'relative',
            width: '100%',
            background: BG_PRIMARY,
            border: `1px solid ${BORDER}`,
            borderTop: `1px solid rgba(255,106,0,0.28)`,
            borderRadius: '24px 24px 0 0',
            boxShadow: `0 -4px 48px rgba(255,106,0,0.12), 0 -1px 0 rgba(255,140,0,0.18)`,
            overflow: 'hidden',
          }}
        >
          {/* Subtle orange top glow line */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '45%', height: '1.5px',
            background: `linear-gradient(90deg, transparent, ${ACCENT}, ${ACCENT_GLOW}, transparent)`,
          }} />

          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER }} />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="auth-btn-ghost"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 34, height: 34, borderRadius: '50%',
              background: SURFACE, border: `1px solid ${BORDER}`,
              color: TEXT_MUTED, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'color 0.2s', zIndex: 10,
            }}
          >
            <X size={16} />
          </button>

          <div style={{ padding: '16px 24px 36px', fontFamily: 'Manrope, system-ui, sans-serif' }}>
            {/* ── Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              {/* Brand badge */}
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: `linear-gradient(135deg,${ACCENT},${ACCENT_GLOW})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: `0 8px 28px rgba(255,106,0,0.35), 0 0 0 1px rgba(255,153,0,0.2)`,
              }}>
                <Phone size={26} color="#fff" strokeWidth={2.5} />
              </div>

              {step === 'phone' ? (
                <>
                  <h2 style={{ fontSize: 21, fontWeight: 800, color: TEXT_PRI, margin: 0, letterSpacing: '-0.3px' }}>
                    Sign in to{' '}
                    <span style={{
                      background: `linear-gradient(90deg,${ACCENT},${ACCENT_GLOW})`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>BBR</span>
                  </h2>
                  <p style={{ fontSize: 12.5, color: TEXT_MUTED, marginTop: 5 }}>
                    Rentals &middot; Rewards &middot; Ride History
                  </p>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 21, fontWeight: 800, color: TEXT_PRI, margin: 0, letterSpacing: '-0.3px' }}>
                    Verify OTP
                  </h2>
                  <p style={{ fontSize: 12.5, color: TEXT_MUTED, marginTop: 5 }}>
                    Code sent to{' '}
                    <span style={{ color: ACCENT_GLOW, fontWeight: 700 }}>+91 {phone}</span>
                  </p>
                </>
              )}
            </div>

            {/* ── STEP 1: Phone ── */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                    Full Name
                  </label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" required className="auth-input" style={inputBase}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                    Mobile Number
                  </label>
                  <div style={{ display: 'flex' }}>
                    <span style={{
                      background: SURFACE, border: `1.5px solid ${BORDER}`, borderRight: 'none',
                      borderRadius: '14px 0 0 14px', padding: '13px 13px',
                      fontSize: 14, fontWeight: 700, color: ACCENT_GLOW,
                      whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', lineHeight: 1,
                    }}>
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel" value={phone} inputMode="numeric"
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit number" maxLength={10} required
                      className="auth-input"
                      style={{ ...inputBase, flex: 1, borderRadius: '0 14px 14px 0', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', fontSize: 16 }}
                    />
                  </div>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                  {[{ icon: <Shield size={11} />, label: 'Secure Login' }, { icon: <Zap size={11} />, label: 'Instant OTP' }].map(({ icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: TEXT_MUTED, fontWeight: 600 }}>
                      <span style={{ color: ACCENT }}>{icon}</span>{label}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="auth-btn-primary"
                  style={{
                    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                    background: phone.length >= 10 && !isLoading
                      ? `linear-gradient(135deg,${ACCENT} 0%,${ACCENT_GLOW} 100%)`
                      : SURFACE_EL,
                    color: phone.length >= 10 && !isLoading ? '#fff' : TEXT_MUTED,
                    fontSize: 14.5, fontWeight: 800,
                    cursor: phone.length >= 10 && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: phone.length >= 10 && !isLoading ? `0 6px 22px rgba(255,106,0,0.3)` : 'none',
                    transition: 'all 0.25s', fontFamily: 'Manrope, system-ui, sans-serif',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Sending OTP&hellip;
                    </>
                  ) : (
                    <>Get OTP via SMS / WhatsApp <ArrowRight size={17} /></>
                  )}
                </button>

                <p style={{ textAlign: 'center', fontSize: 10.5, color: TEXT_MUTED, margin: '-4px 0 0' }}>
                  By continuing, you agree to our{' '}
                  <span style={{ color: ACCENT_GLOW, cursor: 'pointer' }}>Terms of Service</span>
                </p>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div onPaste={handleOtpPaste}>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        style={{
                          width: 62, height: 68, textAlign: 'center',
                          fontSize: 26, fontWeight: 800, fontFamily: 'monospace',
                          borderRadius: 14,
                          border: digit ? `2px solid ${ACCENT}` : `2px solid ${BORDER}`,
                          background: digit ? `rgba(255,106,0,0.1)` : SURFACE,
                          color: digit ? ACCENT_GLOW : TEXT_MUTED,
                          outline: 'none', transition: 'all 0.18s',
                          boxShadow: digit ? `0 0 14px rgba(255,106,0,0.18)` : 'none',
                          cursor: 'text',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = 'rgba(255,106,0,0.08)'; }}
                        onBlur={(e) => {
                          if (!otp[i]) {
                            e.target.style.borderColor = BORDER;
                            e.target.style.background = SURFACE;
                          }
                        }}
                      />
                    ))}
                  </div>
                  {otpExpiry && (
                    <p style={{ textAlign: 'center', fontSize: 12, color: TEXT_MUTED }}>
                      Expires in{' '}
                      <span style={{ color: ACCENT_GLOW, fontWeight: 700, fontFamily: 'monospace' }}>
                        {Math.max(0, Math.ceil((otpExpiry - Date.now()) / 1000))}s
                      </span>
                    </p>
                  )}
                </div>

                {/* Verify CTA */}
                <button
                  type="submit" disabled={!otpComplete || isLoading}
                  className="auth-btn-primary"
                  style={{
                    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                    background: otpComplete && !isLoading
                      ? `linear-gradient(135deg,${ACCENT} 0%,${ACCENT_GLOW} 100%)`
                      : SURFACE_EL,
                    color: otpComplete && !isLoading ? '#fff' : TEXT_MUTED,
                    fontSize: 14.5, fontWeight: 800,
                    cursor: otpComplete && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: otpComplete && !isLoading ? `0 6px 22px rgba(255,106,0,0.3)` : 'none',
                    transition: 'all 0.25s', fontFamily: 'Manrope, system-ui, sans-serif',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Verifying&hellip;
                    </>
                  ) : (
                    <><CheckCircle2 size={17} />Verify &amp; Sign In</>
                  )}
                </button>

                {/* Footer row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(['', '', '', '']); }}
                    className="auth-btn-ghost"
                    style={{ background: 'none', border: 'none', color: TEXT_MUTED, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Manrope, system-ui, sans-serif', transition: 'color 0.2s' }}
                  >
                    <ChevronLeft size={14} />Change number
                  </button>

                  {resendTimer > 0 ? (
                    <span style={{ fontSize: 13, color: TEXT_MUTED }}>
                      Resend in{' '}
                      <span style={{ color: ACCENT_GLOW, fontWeight: 700, fontFamily: 'monospace' }}>
                        0:{String(resendTimer).padStart(2, '0')}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const newOtp = generateOtp();
                        setOtp(['', '', '', '']);
                        startResendTimer();
                        showToast(`New OTP sent to +91 ${phone}. Use code: ${newOtp}`, 'info');
                        setTimeout(() => otpRefs.current[0]?.focus(), 100);
                      }}
                      style={{ background: 'none', border: 'none', color: ACCENT_GLOW, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Manrope, system-ui, sans-serif' }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Safe-area bottom spacer */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </div>
    </div>
  );
};
