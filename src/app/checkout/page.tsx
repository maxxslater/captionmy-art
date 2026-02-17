'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('pro');

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) setPlan(planParam);
  }, [searchParams]);

  const plans = {
    pro: { name: 'Pro', price: 5.99, priceId: 'price_pro_monthly' },
    premium: { name: 'Premium', price: 12.99, priceId: 'price_premium_monthly' },
    platinum: { name: 'Platinum', price: 19.99, priceId: 'price_platinum_monthly' },
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: session.user.id,
          email: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans[plan as keyof typeof plans];

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-sm p-8">
        <h1 className="text-3xl font-light mb-2">Upgrade to {selectedPlan.name}</h1>
        <p className="text-gray-600 mb-8">Complete your purchase to unlock premium features</p>

        <div className="mb-8 p-6 bg-gray-50 border-2 border-gray-200 rounded-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">{selectedPlan.name} Plan</span>
            <span className="text-2xl font-light">${selectedPlan.price}</span>
          </div>
          <p className="text-sm text-gray-600">Billed monthly • Cancel anytime</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-sm">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 bg-[#1A1A1A] text-white font-medium rounded-sm hover:bg-black disabled:opacity-50 transition mb-4"
        >
          {loading ? 'Loading...' : 'Continue to Payment'}
        </button>

        <Link href="/pricing" className="block text-center text-sm text-gray-600 hover:text-gray-900">
          Change Plan
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><p>Loading...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}