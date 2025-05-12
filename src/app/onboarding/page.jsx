'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import { Spinner } from '@/components/ui/Spinner';
import HospitalRegistrationForm from '@/components/forms/hospital-registration-form';
import { checkServerStatus } from '@/lib/api';



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
    const checkServer = async () => {
      try {
        await checkServerStatus();
      } catch (error) {
        router.push('/error');
      }
    };
    checkServer();
  }, [router]);
  
  if (authLoading || hospitalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <Spinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
        <HospitalRegistrationForm />
    </main>
  );
}


