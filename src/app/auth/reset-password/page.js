'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { GalleryVerticalEnd } from "lucide-react";
import supabase from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  // Get the reset token from URL
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      setError('Invalid or expired password reset link');
      return;
    }

    // Verify the recovery token
    const verifyToken = async () => {
      try {
        // Verify the password reset token
        const { data, error } = await supabase.auth.verifyOtp({
          token: code,
          type: 'recovery'
        });

        if (error) {
          setError('Invalid or expired password reset link');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (err) {
        setError('Invalid or expired password reset link');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Tempus
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {error ? (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                {error}
                <p className="mt-2 text-muted-foreground">Redirecting to login page...</p>
              </div>
            ) : (
              <ResetPasswordForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
