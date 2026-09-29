import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  Activity,
  Layers,
  FileCheck,
  RefreshCw,
  Terminal,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { firebaseAuth, loadUserSession } from '../../lib/firebase';
import { getAppCheckState, fetchCurrentAppCheckToken } from '../../lib/appCheck';
import { getSecurityLogs, SecurityEvent, clearSecurityLogs } from '../../lib/securityLogger';
import { runSecurityTestSuite, SecurityTestCase } from '../../lib/securityTestEnvironment';

export const SecurityStatusPanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(() => loadUserSession());
  const [appCheckInfo, setAppCheckInfo] = useState(() => getAppCheckState());
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>(() => [...getSecurityLogs()]);
  const [testResults, setTestResults] = useState<SecurityTestCase[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [tokenPreview, setTokenPreview] = useState<string | null>(null);

  const refreshDiagnostics = async () => {
    setCurrentUser(loadUserSession());
    setAppCheckInfo(getAppCheckState());
    setSecurityLogs([...getSecurityLogs()]);
    const tkn = await fetchCurrentAppCheckToken();
    setTokenPreview(tkn);
  };

  useEffect(() => {
    refreshDiagnostics();
    const interval = setInterval(() => {
      setSecurityLogs([...getSecurityLogs()]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    try {
      const results = await runSecurityTestSuite((tc) => {
        setTestResults((prev) => [...prev.filter((item) => item.id !== tc.id), tc]);
      });
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
      refreshDiagnostics();
    }
  };

  const fbAuthUser = firebaseAuth?.currentUser;
  const isSecurityTestingMode = import.meta.env.VITE_SECURITY_TESTING_MODE === 'true';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Security Hub Header ── */}
      <div
        className="rounded-3xl p-6 border relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 50%, rgba(255,106,0,0.04) 100%)',
          borderColor: 'rgba(59,130,246,0.25)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Security-Testing Environment
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                App Check Active
              </span>
              {isSecurityTestingMode && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Isolated Testing Mode
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              Firebase Security & App Check Audit Panel
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time security telemetry covering Firebase Authentication state, App Check monitoring mode, progressive rate-limiting thresholds, and Firestore/Storage rule enforcement.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={refreshDiagnostics}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all hover:scale-102 cursor-pointer shadow-lg shadow-blue-600/20"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              }}
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Probing Controls…</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Security Audit Suite</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Auth Status */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Auth Status</span>
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-black text-white flex items-center gap-2">
            {currentUser ? 'Authenticated' : 'Guest / Anonymous'}
          </p>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {currentUser ? (
              <span>UID: {currentUser.uid.slice(0, 14)}…</span>
            ) : (
              <span>No active user session</span>
            )}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Enumeration Defense Active</span>
          </div>
        </div>

        {/* App Check Status */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">App Check Provider</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg font-black text-purple-300 capitalize">
            {appCheckInfo.mode.replace('_', ' ')}
          </p>
          <p className="text-[11px] text-slate-400">
            {tokenPreview ? `Token: ${tokenPreview}` : 'Metrics & monitoring mode'}
          </p>
          <div className="text-[10px] text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>4 Services Guarded</span>
          </div>
        </div>

        {/* Rate Limiter Status */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate Limiter</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-black text-white">
            Progressive Backoff
          </p>
          <p className="text-[11px] text-slate-400">
            3-strike cooldown (5s → 15s → 30s)
          </p>
          <div className="text-[10px] text-amber-400 flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            <span>No Permanent Lockouts</span>
          </div>
        </div>

        {/* Security Rules Status */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Firestore & Storage</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-black text-blue-300">
            Default Deny
          </p>
          <p className="text-[11px] text-slate-400">
            UID-scoped isolation & schema check
          </p>
          <div className="text-[10px] text-blue-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>5MB Upload Cap & MIME Check</span>
          </div>
        </div>
      </div>

      {/* ── Test Suite Results ── */}
      {testResults.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#111622] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-black text-white">Security Probes & Control Verification Results</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {testResults.filter((r) => r.status === 'passed').length} / {testResults.length} Passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testResults.map((tc) => {
              const isPassed = tc.status === 'passed';
              return (
                <div
                  key={tc.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isPassed
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : 'bg-red-950/15 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-white">{tc.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                          {tc.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{tc.description}</p>
                      {tc.details && (
                        <p
                          className={`text-[10px] font-mono mt-1 ${
                            isPassed ? 'text-emerald-300/90' : 'text-red-300/90'
                          }`}
                        >
                          {tc.details}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{tc.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── App Check Protected Services Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-[#111622] border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              App Check Enforcement Roadmap
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            App Check ensures only your genuine web application (not curl, postman, or rogue bots) can reach Firebase backend services.
          </p>

          <div className="space-y-2 pt-1">
            {appCheckInfo.protectedServices.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span>{service}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300 leading-relaxed">
            <span className="font-bold">Next Steps for Production:</span>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-300">
              <li>Register reCAPTCHA v3 site key in Firebase Console → App Check.</li>
              <li>Leave in <span className="text-white font-bold">Metrics Mode</span> for 3–5 days to observe legitimate traffic volume.</li>
              <li>Once verified, click <span className="text-emerald-400 font-bold">Enforce</span> on Cloud Firestore, Storage, and Auth.</li>
            </ol>
          </div>
        </div>

        {/* ── Real-time Security Event Log ── */}
        <div className="p-5 rounded-3xl bg-[#111622] border border-white/[0.08] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Live Security Event Stream
                </h3>
              </div>
              <button
                onClick={() => {
                  clearSecurityLogs();
                  setSecurityLogs([]);
                }}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Clear Log
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Privacy-first security audit trail. Credentials, OTPs, and tokens are strictly filtered and omitted.
            </p>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {securityLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No security events recorded yet. Trigger a login or run the audit suite.
              </div>
            ) : (
              securityLogs.slice(0, 8).map((evt) => {
                const isFail =
                  evt.status === 'failure' || evt.status === 'blocked' || evt.status === 'rate_limited';
                const isWarn = evt.status === 'warn';

                return (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isFail ? 'bg-red-400' : isWarn ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="font-bold text-white truncate">{evt.eventType}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          isFail
                            ? 'bg-red-500/15 text-red-300'
                            : isWarn
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
