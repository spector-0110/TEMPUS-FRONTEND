'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import FormPage from '@/components/FormPage';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: hospitalLoading } = useHospital();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || hospitalLoading) {
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Dashboard</h1>
            <p className="dark:text-gray-200">Welcome to your Swasthify dashboard.</p>
            
            {/* Dashboard content would go here */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">
                Your hospital management dashboard will appear here after completing registration.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


