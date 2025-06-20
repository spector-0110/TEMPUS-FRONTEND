"use client";

import { cn } from "@/utils/utils";
import { authService, validateEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const { success, error } = await authService.resetPassword(email);
      
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn("flex justify-center items-center min-h-screen p-4", className)}
        {...props}
      >
        <Card className="w-full max-w-md shadow-2xl backdrop-blur-3xl bg-neutral-900/40 rounded-3xl border-neutral-800/50">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Didn't receive the email? Check your spam folder or request a new link.
            </p>
          </CardContent>

          <CardFooter className="text-center">
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline transition-colors w-full"
            >
              ← Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("flex justify-center items-center min-h-screen p-4", className)}
      {...props}
    >
      <Card className="w-full max-w-md shadow-2xl backdrop-blur-3xl bg-neutral-900/40 rounded-3xl border-neutral-800/50">
        <CardHeader className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 bg-background/50 backdrop-blur-sm border-neutral-300 dark:border-neutral-700"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 font-semibold transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            >
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              Send reset link
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground w-full">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
