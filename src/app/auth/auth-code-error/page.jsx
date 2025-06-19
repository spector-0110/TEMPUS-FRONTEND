"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl backdrop-blur-3xl bg-neutral-900/40 rounded-3xl border-neutral-800/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
              <p className="text-sm text-muted-foreground mt-2">
                There was an error processing your authentication request.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">What happened?</p>
              <p>
                The authentication code was invalid or expired. This can happen if:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The link was already used</li>
                <li>The link has expired</li>
                <li>There was a network issue</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Try Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
