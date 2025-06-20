'use client';

import Link from 'next/link';
import { Phone as PhoneIcon, Mail as MailIcon, BookOpen as BookIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Phone Support */}
        <Card className="p-8 h-full flex flex-col justify-between rounded-2xl border border-border transition-shadow duration-300 hover:shadow-xl">
          <div className="space-y-4">
            <PhoneIcon className="h-10 w-10" />
            <h3 className="text-2xl font-semibold">Contact Support</h3>
            <p className="text-muted-foreground">
              Need immediate assistance? Our support team is here to help.
            </p>
          </div>
          <a
            href="tel:+919696415586"
            className="mt-6 text-base font-medium"
          >
            +91 9696415586
          </a>
        </Card>

        {/* Email Support */}
        <Card className="p-8 h-full flex flex-col justify-between rounded-2xl border border-border transition-shadow duration-300 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
          <div className="space-y-4">
            <MailIcon className="h-10 w-10" />
            <h3 className="text-2xl font-semibold">Email Support</h3>
            <p className="text-muted-foreground">
              Send us an email and we'll get back to you within 24 hours.
            </p>
          </div>
          <a
            href="mailto:info@tiqora.com"
            className="mt-6 text-base font-medium break-all"
          >
            info@tiqora.com
          </a>
        </Card>

        {/* Documentation */}
        <Card className="p-8 h-full flex flex-col justify-between rounded-2xl border border-border transition-shadow duration-300 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
          <div className="space-y-4">
            <BookIcon className="h-10 w-10" />
            <h3 className="text-2xl font-semibold">Documentation</h3>
            <p className="text-muted-foreground">
              Browse our comprehensive documentation and guides.
            </p>
          </div>
          
          <Link
            href="/dashboard/help/documentation"
            className="mt-6 text-base font-medium "
          >
            View Documentation →
          </Link>
        </Card>
      </div>
    </div>
  );
}