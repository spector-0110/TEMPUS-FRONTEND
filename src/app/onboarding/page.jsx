'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import { Spinner } from '@/components/ui/spinner';
import HospitalRegistrationForm from '@/components/forms/hospital-registration-form';
import { checkServerStatusWithCache } from '@/lib/serverStatus';



export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: hospitalLoading } = useHospital();
  
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
    
    if (!authLoading && !hospitalLoading && isProfileComplete) {
      router.push('/dashboard');
    }
  }, [user, authLoading, hospitalLoading, isProfileComplete, router]);

  useEffect(() => {
    let isMounted = true;
    
    const checkServer = async () => {
      try {
        // Use cached version to improve page load performance
        const result = await checkServerStatusWithCache();
        if (!result.isOnline && isMounted) {
          router.push('/error');
        }
      } catch (error) {
        if (isMounted) {
          router.push('/error');
        }
      }
    };
    
    // Only check server if user is authenticated
    if (user && !authLoading) {
      checkServer();
    }
    
    return () => {
      isMounted = false;
    };
  }, [router, user, authLoading]);
  
  // Show loading spinner while authentication or hospital data is loading
  // or if profile is complete (waiting for redirect)
  if (authLoading || hospitalLoading || (!authLoading && !hospitalLoading && isProfileComplete)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <Spinner />
      </div>
    );
  }

  // Only show the hospital registration form if user is authenticated and profile is incomplete
  if (user && !isProfileComplete) {
    return (
      <main className="min-h-screen p-4">
          <HospitalRegistrationForm />
      </main>
    );
  }
  
  // Return loading state as fallback while redirections are processing
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}


