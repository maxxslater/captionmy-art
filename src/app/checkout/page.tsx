'use client';

import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (plan: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: 'test-user',
          email: 'test@test.com',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', background: '#FAFAF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '8px' }}>
        <h1 style={{ marginBottom: '30px' }}>Choose Your Plan</h1>
        
        {error && <div style={{ background: '#fee', padding: '15px', marginBottom: '20px', color: 'red' }}>{error}</div>}
        
        <button 
          onClick={() => handleCheckout('pro')}
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', marginBottom: '10px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Pro - $5.99/mo'}
        </button>
        
        <button 
          onClick={() => handleCheckout('premium')}
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', marginBottom: '10px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Premium - $12.99/mo'}
        </button>
        
        <button 
          onClick={() => handleCheckout('platinum')}
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Platinum - $19.99/mo'}
        </button>
      </div>
    </div>
  );
}