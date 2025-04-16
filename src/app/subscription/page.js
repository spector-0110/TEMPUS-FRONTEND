'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import SubscriptionComponent from '@/components/Subscription';

export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!loading && !user) {
      router.push('/');
      return;
    }

    // Check if form data exists in session storage
    const formData = sessionStorage.getItem('formData');
    if (!formData) {
      // No form data, redirect to dashboard to complete form first
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <SubscriptionComponent />
    </main>
  );
}