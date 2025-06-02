'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GalleryVerticalEnd } from 'lucide-react';

import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import { LoginForm } from '@/components/forms/login-form';
import { SignUpForm } from '@/components/forms/signup-form';
import { ForgetPasswordForm } from '@/components/forms/forget-password-form';

export default function Home() {
  const { user, loading } = useAuth();
  const { isProfileComplete, loading: hospitalLoading } = useHospital();
  const router = useRouter();
  const [formState, setFormState] = useState('login');

  useEffect(() => {
    if (user && !loading && !hospitalLoading) {
      router.push(isProfileComplete ? '/dashboard' : '/onboarding');
    }
  }, [user, loading, hospitalLoading, isProfileComplete]);

  const renderForm = () => {
    switch (formState) {
      case 'signup':
        return <SignUpForm onLoginClick={() => setFormState('login')} />;
      case 'forget-password':
        return <ForgetPasswordForm onLoginClick={() => setFormState('login')} />;
      default:
        return (
          <LoginForm
            onSignUpClick={() => setFormState('signup')}
            onForgetPasswordClick={() => setFormState('forget-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-svh bg-gradient-to-br from-gray-950 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-10">
      <div className="absolute top-6 left-6 md:left-20 flex items-center space-x-2">
        <Link href="/" 
          className="relative z-20 h-12 w-12 mr-2 rounded *:hover:opacity-40 transition-opacity duration-500 bg-white">
          <img
            style={{ backgroundColor: 'white' }}
            src="/tempusLogo1.png"
            alt="Tempus Logo"
            className="h-12 w-14 mr-4 rounded-full *:hover:opacity-40 transition-opacity duration-500"
            />
        </Link>
      </div>
      <div className="w-full max-w-md mx-auto">
        {renderForm()}
      </div>
    </div>
  );
}