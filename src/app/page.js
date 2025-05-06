'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/Authform';
import { useAuth } from '@/context/AuthProvider';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

// Moved trustIndicators to the top, before it's used
const trustIndicators = [
  "Secure patient data management with end-to-end encryption",
  "Simplified appointment scheduling and queue management",
  "Real-time updates and notifications for staff and patients",
  "Detailed analytics and reporting for operational efficiency",
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left column - content */}
        <div className="w-full md:w-2/5 bg-primary-50 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <div>
              <h1 className="text-3xl font-medium text-gray-900 tracking-tight">
                Modern healthcare management
              </h1>
              <p className="mt-3 text-base text-gray-500">
                {APP_NAME} streamlines your healthcare operations with powerful queue management, patient tracking, and administrative tools.
              </p>

              <div className="mt-8">
                <div className="space-y-4">
                  {trustIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">{indicator}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12">
                <div className="bg-white py-4 px-4 rounded-md shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-gray-500">
                      Trusted by over <span className="font-medium text-gray-900">100+</span> healthcare providers
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right column - auth form */}
        <div className="w-full md:w-3/5 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <AuthForm />
        </div>

      </div>
    </div>
  );
}