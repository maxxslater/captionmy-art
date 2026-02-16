'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const searchParams = useSearchParams();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) setSelectedPlan(plan);
  }, [searchParams]);

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

  const plans = {
    free: { name: 'Free', badge: '◯', color: '#9B9B9B' },
    pro: { name: 'Pro', badge: '◐', color: '#6B9BD1' },
    premium: { name: 'Premium', badge: '◈', color: '#D4AF37' },
    platinum: { name: 'Platinum', badge: '◆', color: '#E5C278' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Redirect based on plan
      if (selectedPlan === 'free') {
        window.location.href = '/';
      } else {
        window.location.href = `/checkout?plan=${selectedPlan}`;
      }
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
                <Link href="/signin" className={`text-sm ${theme.textSecondary} hover:${theme.text} transition`}>
                  Sign In
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
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-light ${theme.text} mb-2`}>Create Account</h2>
              <p className={`text-sm ${theme.textSecondary} font-light`}>
                Join CaptionMy.Art and elevate your content
              </p>
            </div>

            {/* Selected Plan Display */}
            <div className={`mb-6 p-4 border-2 ${theme.inputBorder} rounded-sm flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl" style={{ color: plans[selectedPlan as keyof typeof plans].color }}>
                  {plans[selectedPlan as keyof typeof plans].badge}
                </span>
                <div>
                  <p className={`text-sm font-medium ${theme.text}`}>
                    {plans[selectedPlan as keyof typeof plans].name} Plan
                  </p>
                  <p className={`text-xs ${theme.textTertiary}`}>Selected</p>
                </div>
              </div>
              <Link 
                href="/pricing" 
                className={`text-xs ${theme.textSecondary} hover:${theme.text} underline`}
              >
                Change
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-sm">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-2 font-medium`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} placeholder-gray-400 focus:border-[${theme.accent}] focus:outline-none transition`}
                  required
                />
              </div>

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
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-2 font-medium`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} placeholder-gray-400 focus:border-[${theme.accent}] focus:outline-none transition`}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-2 font-medium`}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Terms */}
            <p className={`text-xs ${theme.textTertiary} text-center mt-6 font-light`}>
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:opacity-80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:opacity-80">
                Privacy Policy
              </Link>
            </p>

            {/* Sign In Link */}
            <div className="text-center mt-8 pt-6 border-t ${theme.border}">
              <p className={`text-sm ${theme.textSecondary}`}>
                Already have an account?{' '}
                <Link href="/signin" className={`font-medium ${theme.text} hover:opacity-80`}>
                  Sign In
                </Link>
              </p>
            </div>
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