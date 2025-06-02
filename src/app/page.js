'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/forms/login-form"
import { SignUpForm } from "@/components/forms/signup-form"
import { ForgetPasswordForm } from "@/components/forms/forget-password-form"

export default function Home() {
  const { user, loading } = useAuth();
  const { isProfileComplete, loading: hospitalLoading } = useHospital();
  const router = useRouter();
  const [formState, setFormState] = useState('login');

  useEffect(() => {
    if (user && !loading && !hospitalLoading) {
      if (isProfileComplete) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, loading, hospitalLoading, isProfileComplete, router]);

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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/Login.png"
          alt="Image"
          fill
          priority
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Tempus
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  )
}