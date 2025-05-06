'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail, resetPassword, checkUserExists } from '@/lib/auth';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const userExists = await checkUserExists(email);
        if (!userExists) {
          throw new Error('No account exists with this email address');
        }
        await resetPassword(email);
        alert('Please check your email for password reset instructions');
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const userExists = await checkUserExists(email);
        if (userExists) {
          throw new Error('An account already exists with this email address');
        }
        await signUpWithEmail(email, password);
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

  const toggleForgotPassword = (e) => {
    e.preventDefault();
    setIsForgotPassword(!isForgotPassword);
    setError('');
  };

  return (
    <Card className="w-full max-w-lg mx-auto"> {/* Increased max-width */}
      <CardHeader>
        <CardTitle className="text-3xl font-medium text-center"> {/* Increased text size */}
          Tempus
        </CardTitle>
        {error && (
          <div className="mt-4 px-5 py-4 bg-error-50 text-error-700 text-base rounded-md border border-error-100"> {/* Increased padding and text size */}
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6"> {/* Added padding */}
        <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased spacing */}
          <FormField label="Email address" required className="text-base"> 
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="h-12 text-base"
            />
          </FormField>

          {!isForgotPassword && (
            <FormField 
              label="Password" 
              required
              description={isSignUp ? "Must be at least 6 characters" : ""}
              className="text-base" 
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-grow relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={isSignUp ? "Create a password" : "Enter your password"}
                      className="h-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} 
                    </button>
                  </div>
                </div>
                {!isSignUp && (
                    <a 
                      href="#" 
                      onClick={toggleForgotPassword}
                      className="text-sm font-small text-primary-600 hover:text-primary-500 ml-3"
                    >
                      Forgot?
                    </a>
                  )}
              </div>
            </FormField>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 h-12 text-base"
          >
            {loading 
              ? 'Processing...' 
              : isForgotPassword
                ? 'Send reset instructions'
                : isSignUp 
                  ? 'Create account' 
                  : 'Sign in'}
          </Button>
        </form>

        {!isForgotPassword && (
          <div className="mt-10 text-center"> 
            <Button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              variant="link"
              className="font-medium text-base" 
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'New to ' + APP_NAME + '? Create an account'}
            </Button>
          </div>
        )}

        {isForgotPassword && (
          <div className="mt-10 text-center"> 
            <Button
              onClick={toggleForgotPassword}
              variant="link"
              className="font-medium text-base" 
            >
              Back to sign in
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-center p-6"> {/* Added padding */}
        <p className="text-sm text-gray-500 w-full"> {/* Increased text size */}
          By continuing, you agree to {APP_NAME}'s <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
        </p>
      </CardFooter>
    </Card>
  );
}