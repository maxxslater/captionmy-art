'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 3 seconds
    setTimeout(() => router.push('/'), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-sm p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-light mb-4">Welcome to Pro!</h1>
        <p className="text-gray-600 mb-8">
          Your subscription is active. Redirecting you to start creating...
        </p>
        <Link href="/" className="text-[#D4AF37] hover:underline">
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}