'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Progress = forwardRef(({ className, value = 0, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
      style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
    />
  </div>
));

Progress.displayName = 'Progress';

export { Progress };
