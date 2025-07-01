'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStaff } from '@/hooks/useStaff';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Upload, RefreshCw, MoreHorizontal, Users, UserCheck, UserX, IndianRupee } from 'lucide-react';

export function StaffListHeader() {
  const isMobile = useIsMobile();
  const {
    refreshStaffList,
    computedStats,
    isLoading
  } = useStaff();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{isLoading ? '-' : computedStats?.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{isLoading ? '-' : computedStats?.active || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? '-' : computedStats?.total > 0 ? `${Math.round((computedStats.active / computedStats.total) * 100)}%` : '0%'}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{isLoading ? '-' : computedStats?.inactive || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? '-' : computedStats?.total > 0 ? `${Math.round((computedStats.inactive / computedStats.total) * 100)}%` : '0%'}
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Salary</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : `₹${Math.round(computedStats?.averageSalary || 0).toLocaleString()}`}
                </p>
                <p className="text-xs text-muted-foreground">Per month</p>
              </div>
              <IndianRupee className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Staff Management</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStaffList}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {!isMobile && "Refresh"}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export Staff List
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Staff Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
