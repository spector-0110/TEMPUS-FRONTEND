'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        // Show verification message if needed
        alert('Please check your email to verify your account');
      } else {
        await signInWithEmail(email, password);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-medium text-center">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </CardTitle>
        {error && (
          <div className="mt-3 px-4 py-3 bg-error-50 text-error-700 text-sm rounded-md border border-error-100">
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Email address" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </FormField>

          <FormField 
            label="Password" 
            required
            description={isSignUp ? "Must be at least 6 characters" : ""}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  />
                </div>
                {!isSignUp && (
                  <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-500 ml-2">
                    Forgot?
                  </a>
                )}
              </div>
            </div>
          </FormField>

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            className="mt-2"
          >
            {loading 
              ? 'Processing...' 
              : isSignUp 
                ? 'Create account' 
                : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            variant="link"
            className="font-medium"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : 'New to ' + APP_NAME + '? Create an account'}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="text-center">
        <p className="text-xs text-gray-500 w-full">
          By continuing, you agree to {APP_NAME}'s <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
        </p>
      </CardFooter>
    </Card>
  );
}