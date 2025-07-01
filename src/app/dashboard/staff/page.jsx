'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, BarChart3 } from 'lucide-react';
import { useStaff } from '@/hooks/useStaff';
import { StaffForm } from '@/components/staff/StaffForm';
import { StaffListHeader } from '@/components/staff/StaffListHeader';
import { StaffList } from '@/components/staff/StaffList';
import { StaffAnalyticsDashboard } from '@/components/staff/StaffAnalyticsDashboard';

export default function StaffDashboard() {
  const {
    setDashboardReady,
    isReady
  } = useStaff();
  
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');
  
  // Set dashboard ready when component mounts
  useEffect(() => {
    setDashboardReady(true);
    return () => setDashboardReady(false);
  }, [setDashboardReady]);
  
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading staff management...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your hospital staff members, attendance, and payments
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
        
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Staff Directory
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="staff" className="space-y-6">
            {/* Stats, Search and Filters */}
            <StaffListHeader />
            
            {/* Staff List */}
            <StaffList />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Dashboard */}
            <StaffAnalyticsDashboard />
          </TabsContent>
        </Tabs>
        
        {/* Add Staff Form */}
        <StaffForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          mode="create"
        />
      </div>
    </div>
  );
}
