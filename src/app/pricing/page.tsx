'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const theme = {
    bg: darkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAF8]',
    cardBg: darkMode ? 'bg-[#1A1A1A]' : 'bg-white',
    headerBg: darkMode ? 'bg-[#1A1A1A]/80' : 'bg-white/80',
    text: darkMode ? 'text-[#E5E5E5]' : 'text-[#1A1A1A]',
    textSecondary: darkMode ? 'text-[#A0A0A0]' : 'text-[#6B6B6B]',
    textTertiary: darkMode ? 'text-[#707070]' : 'text-[#9B9B9B]',
    border: darkMode ? 'border-[#2A2A2A]' : 'border-gray-200',
    accent: darkMode ? '#E5C278' : '#D4AF37',
    inputBorder: darkMode ? 'border-[#2A2A2A]' : 'border-gray-300',
  };

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      badge: '◯',
      badgeColor: '#9B9B9B',
      price: 0,
      priceYearly: 0,
      description: 'Perfect for trying out CaptionMy.Art',
      features: [
        '3 captions per week',
        'Single platform selection',
        'Basic caption generation',
        'Email support',
      ],
      limitations: [
        'No multi-platform support',
        'No community access',
        'No gallery storage',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: '◐',
      badgeColor: '#6B9BD1',
      price: 5.99,
      priceYearly: 59.99,
      description: 'For artists serious about their social presence',
      features: [
        '5 captions per week',
        'Multiple platform selection',
        'All caption options',
        'Community space access',
        'Priority email support',
      ],
      limitations: [
        'Limited gallery storage',
        'No trending audio access',
      ],
      cta: 'Go Pro',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      badge: '◈',
      badgeColor: '#D4AF37',
      price: 12.99,
      priceYearly: 129.99,
      description: 'For professional artists building their brand',
      features: [
        '10 captions per month',
        'All platforms available',
        'Gallery storage (5 images)',
        'Community space access',
        'Trending audio feature',
        'Advanced SEO optimization',
        'Priority support',
      ],
      limitations: [
        'Limited gallery space',
        'No video uploads',
      ],
      cta: 'Get Premium',
      popular: false,
    },
    {
      id: 'platinum',
      name: 'Platinum',
      badge: '◆',
      badgeColor: '#E5C278',
      price: 19.99,
      priceYearly: 199.99,
      description: 'For content creators who need it all',
      features: [
        '✨ Unlimited captions',
        'All platforms available',
        'Unlimited gallery storage',
        'Community space access',
        'Trending audio feature',
        'Video content uploads',
        'Advanced analytics',
        'White-glove support',
        'Early access to new features',
      ],
      limitations: [],
      cta: 'Go Platinum',
      popular: false,
    },
  ];

  const [loading, setLoading] = useState<string | null>(null);

const handleCheckout = async (priceId: string, planName: string) => {
  setLoading(planName);
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error('Checkout error:', error);
  } finally {
    setLoading(null);
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

        .brush-stroke {
          position: relative;
        }
        
        .brush-stroke::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            transparent 0%,
            ${theme.accent} 20%,
            ${theme.accent} 80%,
            transparent 100%
          );
        }

        .pricing-card {
          transition: all 0.3s ease;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
        }

        .pricing-card.popular {
          box-shadow: 0 8px 30px ${darkMode ? 'rgba(229, 194, 120, 0.2)' : 'rgba(212, 175, 55, 0.2)'};
        }
      `}</style>

      <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
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
                  className={`p-3 ${theme.cardBg} ${theme.inputBorder} border-2 rounded-sm hover:border-gray-400 flex items-center gap-2`}
                >
                  <span className="text-xl">{darkMode ? '☀' : '☾'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 py-16">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className={`text-5xl md:text-6xl font-light ${theme.text} mb-4`}>
              Choose Your Plan
            </h2>
            <p className={`text-xl ${theme.textSecondary} font-light max-w-2xl mx-auto`}>
              Select the membership tier that fits your creative workflow
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? theme.text : theme.textTertiary}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition ${
                  billingCycle === 'yearly' ? theme.cardBg : 'bg-gray-300'
                } border-2 ${theme.inputBorder}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                  style={{ backgroundColor: theme.accent }}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? theme.text : theme.textTertiary}`}>
                Yearly
                <span className="ml-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: theme.accent, color: darkMode ? '#0A0A0A' : 'white' }}>
                  Save 17%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`pricing-card relative ${theme.cardBg} border-2 ${
                  tier.popular ? 'border-[' + theme.accent + ']' : theme.inputBorder
                } rounded-sm p-8 ${tier.popular ? 'popular' : ''}`}
              >
                {tier.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs uppercase tracking-wider font-medium text-black rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl" style={{ color: tier.badgeColor }}>
                    {tier.badge}
                  </span>
                  <div>
                    <h3 className={`text-2xl font-light ${theme.text}`}>{tier.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-light ${theme.text}`}>
                      ${billingCycle === 'monthly' ? tier.price : (tier.priceYearly / 12).toFixed(2)}
                    </span>
                    {tier.price > 0 && (
                      <span className={`text-sm ${theme.textTertiary}`}>/month</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && tier.price > 0 && (
                    <p className={`text-xs ${theme.textTertiary} mt-1`}>
                      Billed ${tier.priceYearly} yearly
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className={`text-sm ${theme.textSecondary} mb-6 font-light leading-relaxed`}>
                  {tier.description}
                </p>

                {/* CTA Button */}
                <button
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Loading...';

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: tier.id,
          userId: 'guest-' + Date.now(),
          email: 'guest@checkout.com',
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert('Error: ' + err);
    }
  }}
  className={`w-full text-center px-6 py-3 mb-8 text-sm uppercase tracking-wider font-medium transition ${
    tier.popular ? 'text-white' : `${theme.text} border-2 ${theme.inputBorder}`
  }`}
  style={tier.popular ? { backgroundColor: theme.accent, color: darkMode ? '#0A0A0A' : 'white' } : {}}
>
  {tier.cta}
</button>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-sm mt-0.5" style={{ color: theme.accent }}>✓</span>
                      <span className={`text-sm ${theme.textSecondary} font-light`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {tier.limitations.length > 0 && (
                  <div className={`pt-6 border-t ${theme.border}`}>
                    <p className={`text-xs uppercase tracking-wider ${theme.textTertiary} mb-3 font-medium`}>
                      Not Included
                    </p>
                    <div className="space-y-2">
                      {tier.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className={`text-sm mt-0.5 ${theme.textTertiary}`}>—</span>
                          <span className={`text-sm ${theme.textTertiary} font-light`}>{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className={`${theme.cardBg} border-2 ${theme.inputBorder} rounded-sm p-8`}>
            <h3 className={`text-3xl font-light ${theme.text} mb-8 text-center brush-stroke inline-block mx-auto`}>
              Feature Comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme.border}`}>
                    <th className={`text-left py-4 px-4 text-sm uppercase tracking-wider ${theme.textSecondary} font-medium`}>
                      Feature
                    </th>
                    <th className={`text-center py-4 px-4 text-sm uppercase tracking-wider ${theme.textSecondary} font-medium`}>
                      Free
                    </th>
                    <th className={`text-center py-4 px-4 text-sm uppercase tracking-wider ${theme.textSecondary} font-medium`}>
                      Pro
                    </th>
                    <th className={`text-center py-4 px-4 text-sm uppercase tracking-wider ${theme.textSecondary} font-medium`}>
                      Premium
                    </th>
                    <th className={`text-center py-4 px-4 text-sm uppercase tracking-wider ${theme.textSecondary} font-medium`}>
                      Platinum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme.border}`}>
                    <td className={`py-4 px-4 text-sm ${theme.text}`}>Caption Limits</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>3/week</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>5/week</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>10/month</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>Unlimited</td>
                  </tr>
                  <tr className={`border-b ${theme.border}`}>
                    <td className={`py-4 px-4 text-sm ${theme.text}`}>Platform Selection</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>1 platform</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>Multiple</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>All</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>All</td>
                  </tr>
                  <tr className={`border-b ${theme.border}`}>
                    <td className={`py-4 px-4 text-sm ${theme.text}`}>Gallery Storage</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>5 images</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>Unlimited</td>
                  </tr>
                  <tr className={`border-b ${theme.border}`}>
                    <td className={`py-4 px-4 text-sm ${theme.text}`}>Community Access</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4`}><span style={{ color: theme.accent }}>✓</span></td>
                    <td className={`text-center py-4 px-4`}><span style={{ color: theme.accent }}>✓</span></td>
                    <td className={`text-center py-4 px-4`}><span style={{ color: theme.accent }}>✓</span></td>
                  </tr>
                  <tr className={`border-b ${theme.border}`}>
                    <td className={`py-4 px-4 text-sm ${theme.text}`}>Trending Audio</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4`}><span style={{ color: theme.accent }}>✓</span></td>
                    <td className={`text-center py-4 px-4`}><span style={{ color: theme.accent }}>✓</span></td>
                  </tr>
                  <tr className={`border-b ${theme.border}`}>
                    <td className={`py-4 px-4 text-sm ${theme.text}`}>Video Uploads</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4 text-sm ${theme.textSecondary}`}>—</td>
                    <td className={`text-center py-4 px-4`}><span style={{ color: theme.accent }}>✓</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h3 className={`text-3xl font-light ${theme.text} mb-8 text-center`}>
              Frequently Asked Questions
            </h3>
            <div className="max-w-3xl mx-auto space-y-6">
              <details className={`${theme.cardBg} border-2 ${theme.inputBorder} rounded-sm p-6`}>
                <summary className={`text-lg font-medium ${theme.text} cursor-pointer`}>
                  Can I upgrade or downgrade my plan?
                </summary>
                <p className={`mt-4 text-sm ${theme.textSecondary} font-light leading-relaxed`}>
                  Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your current billing period.
                </p>
              </details>

              <details className={`${theme.cardBg} border-2 ${theme.inputBorder} rounded-sm p-6`}>
                <summary className={`text-lg font-medium ${theme.text} cursor-pointer`}>
                  What happens if I exceed my caption limit?
                </summary>
                <p className={`mt-4 text-sm ${theme.textSecondary} font-light leading-relaxed`}>
                  You'll be notified when you're approaching your limit. Free users can upgrade anytime. Paid users can purchase additional caption packs or upgrade to a higher tier.
                </p>
              </details>

              <details className={`${theme.cardBg} border-2 ${theme.inputBorder} rounded-sm p-6`}>
                <summary className={`text-lg font-medium ${theme.text} cursor-pointer`}>
                  Is there a refund policy?
                </summary>
                <p className={`mt-4 text-sm ${theme.textSecondary} font-light leading-relaxed`}>
                  We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.
                </p>
              </details>
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