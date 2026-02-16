'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const theme = {
    bg: darkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAF8]',
    cardBg: darkMode ? 'bg-[#1A1A1A]' : 'bg-white',
    headerBg: darkMode ? 'bg-[#1A1A1A]/80' : 'bg-white/80',
    text: darkMode ? 'text-[#E5E5E5]' : 'text-[#1A1A1A]',
    textSecondary: darkMode ? 'text-[#A0A0A0]' : 'text-[#6B6B6B]',
    textTertiary: darkMode ? 'text-[#707070]' : 'text-[#9B9B9B]',
    border: darkMode ? 'border-[#2A2A2A]' : 'border-gray-200',
    inputBorder: darkMode ? 'border-[#2A2A2A]' : 'border-gray-300',
    inputBg: darkMode ? 'bg-[#1A1A1A]' : 'bg-white',
    buttonBg: darkMode ? 'bg-[#E5E5E5]' : 'bg-[#1A1A1A]',
    buttonText: darkMode ? 'text-[#0A0A0A]' : 'text-white',
    accent: darkMode ? '#E5C278' : '#D4AF37',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Redirect to dashboard/home
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      setResetSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Playfair Display', serif;
        }

        .art-texture {
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 4px);
        }
      `}</style>

      <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
        {/* Texture */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none art-texture"></div>

        {/* Header */}
        <header className={`relative ${theme.border} border-b ${theme.headerBg} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-baseline justify-between">
              <Link href="/" className="flex items-baseline gap-3 hover:opacity-80 transition">
                <h1 className={`text-4xl md:text-5xl font-light tracking-tight ${theme.text}`}>
                  Caption<span className="font-semibold">My.Art</span>
                </h1>
                <div className="h-2 w-2 rounded-full mt-4" style={{ backgroundColor: theme.accent }}></div>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/pricing" className={`text-sm ${theme.textSecondary} hover:${theme.text} transition`}>
                  Pricing
                </Link>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-3 ${theme.cardBg} ${theme.inputBorder} border-2 rounded-sm`}
                >
                  <span className="text-xl">{darkMode ? '☀' : '☾'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative max-w-md mx-auto px-6 py-16">
          
          <div className={`${theme.cardBg} border-2 ${theme.inputBorder} rounded-sm p-8 md:p-10`}>
            {!showReset ? (
              <>
                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-light ${theme.text} mb-2`}>Welcome Back</h2>
                  <p className={`text-sm ${theme.textSecondary} font-light`}>
                    Sign in to continue creating
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-sm">
                    <p className="text-sm text-red-900">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-2 font-medium`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} placeholder-gray-400 focus:border-[${theme.accent}] focus:outline-none transition`}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} font-medium`}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowReset(true)}
                        className={`text-xs ${theme.textSecondary} hover:${theme.text} transition`}
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} placeholder-gray-400 focus:border-[${theme.accent}] focus:outline-none transition`}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 ${theme.buttonBg} ${theme.buttonText} text-sm uppercase tracking-widest font-medium rounded-sm hover:opacity-90 disabled:opacity-50 transition`}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className={`text-center mt-8 pt-6 border-t ${theme.border}`}>
                  <p className={`text-sm ${theme.textSecondary}`}>
                    Don't have an account?{' '}
                    <Link href="/signup" className={`font-medium ${theme.text} hover:opacity-80`}>
                      Sign Up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Password Reset */}
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-light ${theme.text} mb-2`}>Reset Password</h2>
                  <p className={`text-sm ${theme.textSecondary} font-light`}>
                    {resetSent 
                      ? 'Check your email for reset instructions'
                      : 'Enter your email to receive reset instructions'
                    }
                  </p>
                </div>

                {!resetSent ? (
                  <>
                    {/* Error Message */}
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-sm">
                        <p className="text-sm text-red-900">{error}</p>
                      </div>
                    )}

                    {/* Email */}
                    <div className="mb-6">
                      <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-2 font-medium`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} placeholder-gray-400 focus:border-[${theme.accent}] focus:outline-none transition`}
                        required
                      />
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className={`w-full py-3 ${theme.buttonBg} ${theme.buttonText} text-sm uppercase tracking-widest font-medium rounded-sm hover:opacity-90 disabled:opacity-50 transition`}
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                      <button
                        onClick={() => {
                          setShowReset(false);
                          setError('');
                        }}
                        className={`w-full py-3 border-2 ${theme.inputBorder} ${theme.text} text-sm uppercase tracking-widest font-medium rounded-sm hover:opacity-80 transition`}
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-sm">
                      <p className="text-sm text-green-900 mb-2">✓ Email Sent</p>
                      <p className="text-xs text-green-700">
                        Check your inbox for password reset instructions
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowReset(false);
                        setResetSent(false);
                        setError('');
                      }}
                      className={`${theme.text} text-sm hover:opacity-80 transition`}
                    >
                      Back to Sign In
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className={`border-t ${theme.border} mt-24 py-8`}>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className={`text-xs ${theme.textTertiary} tracking-wider uppercase font-light`}>
              Crafted for Artists
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}