"use client";

import { Suspense, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { setup2FA, confirm2FA, disable2FA, resend2FACode } from '@/lib/api';

function TwoFactorSection() {
  const { user, completeTwoFactorLogin } = useAuth();
  const enabled = user?.twoFactorEnabled ?? false;

  // Enable flow
  const [enableStep, setEnableStep] = useState<'idle' | 'sent' | 'done'>('idle');
  const [enableOtp, setEnableOtp] = useState(['', '', '', '', '', '']);
  const [enableLoading, setEnableLoading] = useState(false);
  const [enableError, setEnableError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const enableRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Disable flow
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSendCode = async () => {
    setEnableLoading(true);
    setEnableError('');
    try {
      await setup2FA();
      setEnableStep('sent');
      setResendCooldown(60);
      setTimeout(() => enableRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setEnableError(err.response?.data?.message || 'Failed to send code. Please try again.');
    } finally {
      setEnableLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !user) return;
    try {
      await resend2FACode(user.email);
      setResendCooldown(60);
      setEnableOtp(['', '', '', '', '', '']);
      setEnableError('');
      enableRefs.current[0]?.focus();
    } catch {
      setEnableError('Failed to resend code.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...enableOtp];
    next[index] = value.slice(-1);
    setEnableOtp(next);
    if (value && index < 5) enableRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !enableOtp[index] && index > 0) {
      enableRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setEnableOtp(pasted.split(''));
      enableRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = enableOtp.join('');
    if (code.length < 6) { setEnableError('Enter the full 6-digit code'); return; }
    setEnableLoading(true);
    setEnableError('');
    try {
      await confirm2FA(code);
      setEnableStep('done');
      setSuccessMsg('Two-factor authentication enabled successfully.');
      // Refresh user in context by reloading — the /auth/me endpoint now returns twoFactorEnabled: true
      window.location.reload();
    } catch (err: any) {
      setEnableError(err.response?.data?.message || 'Invalid code. Please try again.');
      setEnableOtp(['', '', '', '', '', '']);
      enableRefs.current[0]?.focus();
    } finally {
      setEnableLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) { setDisableError('Password is required'); return; }
    setDisableLoading(true);
    setDisableError('');
    try {
      await disable2FA(disablePassword);
      setShowDisable(false);
      setDisablePassword('');
      setSuccessMsg('Two-factor authentication disabled.');
      window.location.reload();
    } catch (err: any) {
      setDisableError(err.response?.data?.message || 'Failed to disable 2FA. Check your password.');
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
        </div>
        <div className="ml-auto">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            enabled
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-800 dark:text-green-200">{successMsg}</p>
        </div>
      )}

      {!enabled && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            When enabled, you'll be asked to enter a 6-digit code sent to your email each time you sign in.
          </p>

          {enableStep === 'idle' && (
            <>
              {enableError && (
                <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{enableError}</p>
                </div>
              )}
              <button
                onClick={handleSendCode}
                disabled={enableLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {enableLoading ? 'Sending...' : 'Enable two-factor authentication'}
              </button>
            </>
          )}

          {enableStep === 'sent' && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter the 6-digit code sent to <strong>{user?.email}</strong>
              </p>
              {enableError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{enableError}</p>
                </div>
              )}
              <div className="flex gap-2" onPaste={handleOtpPaste}>
                {enableOtp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { enableRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={enableLoading || enableOtp.join('').length < 6}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {enableLoading ? 'Verifying...' : 'Confirm & Enable'}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-500 disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEnableStep('idle'); setEnableError(''); setEnableOtp(['', '', '', '', '', '']); }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {enabled && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Your account is protected with two-factor authentication. You'll receive a code by email each time you sign in.
          </p>

          {!showDisable ? (
            <button
              onClick={() => { setShowDisable(true); setDisableError(''); }}
              className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
            >
              Disable two-factor authentication
            </button>
          ) : (
            <form onSubmit={handleDisable} className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter your password to confirm:
              </p>
              {disableError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{disableError}</p>
                </div>
              )}
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Your password"
                className="block w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={disableLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {disableLoading ? 'Disabling...' : 'Confirm disable'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDisable(false); setDisablePassword(''); setDisableError(''); }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function ProfilePageContent() {
  const { user } = useAuth();

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Your personal information and security settings</p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-dark-card border-4 border-white dark:border-dark-card flex items-center justify-center">
                  <span className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 dark:border-dark-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cities</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</p>
                    <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Since</p>
                    <p className="text-gray-900 dark:text-white">{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section — only for email/password accounts */}
          {!user.googleId && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Security</h2>
              <TwoFactorSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <ProtectedRoute>
        <ProfilePageContent />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
