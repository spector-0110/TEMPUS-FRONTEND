'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import { Spinner } from '@/components/ui/spinner';
import HospitalRegistrationForm from '@/components/forms/hospital-registration-form';
import { checkServerStatusWithCache } from '@/lib/serverStatus';
import { MobileNavigation } from '@/components/ui/mobile-navigation';



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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <MobileNavigation className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20" />
        <Spinner />
      </div>
    );
  }

  // Only show the hospital registration form if user is authenticated and profile is incomplete
  if (user && !isProfileComplete) {
    return (
      <main className="min-h-screen bg-background transition-colors duration-300">
        
        {/* Main content with better theme-aware styling and responsive padding */}
        <div className="container mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Section - responsive text sizing */}
            <div className="text-center mb-6 sm:mb-8 mt-16 sm:mt-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Welcome to Tiqora
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Let's set up your hospital profile to get started with our healthcare management platform.
              </p>
            </div>
            
            {/* Registration Form - responsive padding */}
            <div className="bg-card border border-border rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
              <HospitalRegistrationForm />
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  // Return loading state as fallback while redirections are processing
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <MobileNavigation className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20" />
      <Spinner />
    </div>
  );
}


