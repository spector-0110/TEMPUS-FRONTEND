'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useHospital } from '@/context/HospitalProvider';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: profileLoading } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Search</h2>
      </div>
      <div className="grid gap-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex gap-2 max-w-lg">
            <Input
              type="text"
              placeholder="Search doctors, appointments, patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
