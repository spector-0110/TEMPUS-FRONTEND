'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import DashBoardComponent from './DashBoardComponent';
import { Spinner } from '@/components/ui/Spinner';
import HospitalRegistrationForm from '@/components/forms/hospital-registration-form';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: hospitalLoading } = useHospital();
  
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || hospitalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <Spinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
      
      {!isProfileComplete ? (
        <HospitalRegistrationForm />
      ) : (
        <DashBoardComponent />
      )
      }
    </main>
  );
}


