'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import FormPage from '@/components/FormPage';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState(true); // Change to false in production

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!loading && !user) {
      router.push('/');
    }

    // Check if user profile is complete
    // This would typically be an API call to your backend
    const checkProfileStatus = async () => {
      // Mock implementation - replace with actual API call
      setIsProfileComplete(false); // For testing form flow
    };

    if (user) {
      checkProfileStatus();
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
      {!isProfileComplete ? (
        <FormPage />
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your Swasthify dashboard.</p>
            
            {/* Dashboard content would go here */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Your hospital management dashboard will appear here after completing registration.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


