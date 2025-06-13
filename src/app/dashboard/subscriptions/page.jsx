'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useHospital } from '@/context/HospitalProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Calendar, TrendingUp, Clock, AlertTriangle, CheckCircle, Shield, Zap, DollarSign, Activity, Timer } from 'lucide-react';
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal';

const SubscriptionPage = () => {
  const { hospitalDashboardDetails, debouncedRefresh } = useHospital();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('current');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const subscription = hospitalDashboardDetails?.subscription;
  const subscriptionUsage = hospitalDashboardDetails?.subscription.subscriptionUsage;
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format trend icon and color
  const getTrendInfo = (trend) => {
    switch(trend?.toUpperCase()) {
      case 'GROWING':
        return { icon: '↑', color: 'text-green-500' };
      case 'DECLINING':
        return { icon: '↓', color: 'text-red-500' };
      case 'STABLE':
      default:
        return { icon: '→', color: 'text-yellow-500' };
    }
  };

  // Get subscription status badge color
  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-500">Expired</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Get payment status badge color
  const getPaymentStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'SUCCESS':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Handle subscription button click
  const handleGetSubscription = () => {
    setShowSubscriptionModal(true);
  };

  // Handle successful subscription
  const handleSubscriptionSuccess = (newSubscription) => {
    toast.success('Subscription activated successfully!', {
      description: `Your subscription has been successfully activated.`
    });
    
    // Refresh hospital dashboard to get updated subscription data
    if (debouncedRefresh) {
      debouncedRefresh();
    }
    
    // Switch to current tab to show updated subscription
    setActiveTab('current');
    
    // Close modal
    setShowSubscriptionModal(false);
  };

  // Get current doctor count for modal
  const getCurrentDoctorCount = () => {
    return subscription?.currentStatus?.doctorCount || 1;
  };

  // Check if subscription is expired or needs renewal
  const needsRenewal = () => {
    if (!subscription?.currentStatus) return true;
    
    const status = subscription.currentStatus.status?.toUpperCase();
    return status === 'EXPIRED' || status === 'PENDING';
  };

  return (
    <div className={`container mx-auto p-3 sm:p-6 max-w-6xl ${isMobile ? 'px-2' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'} mb-6`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
            Subscription Management
          </h1>
          <p className={`text-muted-foreground mt-1 ${isMobile ? 'text-sm' : ''}`}>
            Manage your healthcare system subscription and billing
          </p>
        </div>
        
        {/* Quick Action Button */}
        {needsRenewal() && (
          <Button 
            onClick={handleGetSubscription}
            className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
            size={isMobile ? "default" : "lg"}
          >
            <Zap className="h-4 w-4" />
            {subscription?.currentStatus ? 'Renew Subscription' : 'Get Subscription'}
          </Button>
        )}
      </div>

      {/* Quick Usage Summary */}
      {subscriptionUsage && (
        <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-4'}`}>
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-600">Days Used</p>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-800`}>
                    {subscriptionUsage.usageMetrics?.daysUsed || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600">Days Left</p>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-green-800`}>
                    {subscriptionUsage.remainingDays}
                  </p>
                </div>
                <div className={`text-center ${isMobile ? 'col-span-2' : ''}`}>
                  <p className="text-sm font-medium text-purple-600">Remaining Value</p>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-purple-800`}>
                    ₹{subscriptionUsage.remainingAmount?.toFixed(2)}
                  </p>
                </div>
                {!isMobile && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-orange-600">Usage</p>
                    <p className="text-xl font-bold text-orange-800">
                      {subscriptionUsage.usageMetrics?.percentageUsed}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Alert */}
      {needsRenewal() && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium text-orange-800">
            {subscription?.currentStatus?.status === 'EXPIRED' 
              ? '⚠️ Your subscription has expired. Please renew to continue using all features.'
              : '⚠️ Your subscription needs attention. Please complete your payment to activate all features.'
            }
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid grid-cols-3 ${isMobile ? 'w-full h-12' : 'w-[600px]'}`}>
          <TabsTrigger value="current" className={isMobile ? 'text-xs' : ''}>
            {isMobile ? 'Current' : 'Current Subscription'}
          </TabsTrigger>
          <TabsTrigger value="history" className={isMobile ? 'text-xs' : ''}>
            {isMobile ? 'History' : 'Subscription History'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className={isMobile ? 'text-xs' : ''}>
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Current Subscription
              </CardTitle>
              <CardDescription className={isMobile ? 'text-sm' : ''}>
                Details about your active subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.currentStatus ? (
                <div className="space-y-6">
                  {/* Usage Overview - if subscriptionUsage exists */}
                  {subscriptionUsage && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-4 text-blue-800`}>
                        Subscription Usage
                      </h3>
                      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
                        <div className="text-center">
                          <p className="text-sm text-blue-600">Days Used</p>
                          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-800`}>
                            {subscriptionUsage.usageMetrics?.daysUsed || 0}
                          </p>
                          <p className="text-xs text-blue-600">
                            of {subscriptionUsage.totalDays} days
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-green-600">Remaining Days</p>
                          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-800`}>
                            {subscriptionUsage.remainingDays}
                          </p>
                          <p className="text-xs text-green-600">
                            {subscriptionUsage.usageMetrics?.percentageRemaining}% remaining
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-purple-600">Amount Used</p>
                          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-purple-800`}>
                            ₹{(parseFloat(subscriptionUsage.subscriptionDetails?.totalPrice || 0) - subscriptionUsage.remainingAmount).toFixed(2)}
                          </p>
                          <p className="text-xs text-purple-600">
                            {subscriptionUsage.usageMetrics?.percentageUsed}% used
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-orange-600">Daily Rate</p>
                          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-orange-800`}>
                            ₹{subscriptionUsage.dailyRate?.toFixed(2)}
                          </p>
                          <p className="text-xs text-orange-600">per day</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Usage Progress</span>
                          <span>{subscriptionUsage.usageMetrics?.percentageUsed}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${subscriptionUsage.usageMetrics?.percentageUsed || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Existing subscription details */}
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="font-medium">
                        {getStatusBadge(subscription.currentStatus.status)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <div className="font-medium">
                        {getPaymentStatusBadge(subscription.currentStatus.paymentStatus)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">₹{subscription.currentStatus.totalPrice}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Doctor Count</p>
                      <p className="font-medium">{subscription.currentStatus.doctorCount}</p>
                    </div>
                  </div>
                  
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Billing Cycle</p>
                      <p className="font-medium">
                        {subscription.currentStatus.billingCycle === 'MONTHLY' 
                          ? 'Monthly' 
                          : subscription.currentStatus.billingCycle === 'YEARLY' 
                            ? 'Yearly' 
                            : subscription.currentStatus.billingCycle}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(subscription.currentStatus.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(subscription.currentStatus.endDate)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Auto-Renew</p>
                      <p className="font-medium">
                        {subscription.currentStatus.autoRenew ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active subscription found.</p>
                  {subscriptionUsage && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        ⚠️ Usage data detected but no active subscription found.
                      </p>
                      <p className="text-xs text-yellow-600">
                        Please contact support if you believe this is an error.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGetSubscription} className="w-full">
                {subscription?.currentStatus ? 'Manage Subscription' : 'Get Subscription'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Subscription History
              </CardTitle>
              <CardDescription className={isMobile ? 'text-sm' : ''}>
                Your subscription history and changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.history.history && Array.isArray(subscription.history.history) && subscription.history.history.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Records</p>
                      <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                        {subscription.history.history.length}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Successful Payments</p>
                      <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                        {subscription.history.history.filter(record => record.paymentStatus === 'SUCCESS').length}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Failed Payments</p>
                      <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-red-600`}>
                        {subscription.history.history.filter(record => record.paymentStatus === 'FAILED').length}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Pending Payments</p>
                      <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-600`}>
                        {subscription.history.history.filter(record => record.paymentStatus === 'PENDING').length}
                      </p>
                    </div>
                  </div>

                  {/* History Records */}
                  <div className="space-y-4">
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>
                      Subscription Records (Most Recent First)
                    </h3>
                    <div className="space-y-4">
                      {subscription.history.history
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((record, index) => (
                        <div key={record.id} className="border rounded-lg p-4 space-y-4">
                          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
                            <div className={isMobile ? 'text-center' : ''}>
                              <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                                Record #{subscription.history.history.length - index}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(record.startDate)} - {formatDate(record.endDate)}
                              </p>
                            </div>
                            <div className={`flex ${isMobile ? 'flex-row justify-center' : 'flex-col'} gap-2 items-${isMobile ? 'center' : 'end'}`}>
                              <div>{getPaymentStatusBadge(record.paymentStatus)}</div>
                              <p className="text-xs text-muted-foreground">Created: {formatDate(record.createdAt)}</p>
                            </div>
                          </div>
                          
                          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
                            <div>
                              <p className="text-sm text-muted-foreground">Price</p>
                              <p className="font-medium">₹{record.totalPrice}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Doctor Count</p>
                              <p className="font-medium">{record.doctorCount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Billing Cycle</p>
                              <p className="font-medium">
                                {record.billingCycle === 'MONTHLY' 
                                  ? 'Monthly' 
                                  : record.billingCycle === 'YEARLY' 
                                    ? 'Yearly' 
                                    : record.billingCycle}
                              </p>
                            </div>
                          </div>

                          {(record.paymentMethod || (record.paymentDetails && Object.keys(record.paymentDetails).length > 0)) && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                                {record.paymentMethod && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <p className="font-medium">{record.paymentMethod}</p>
                                  </div>
                                )}
                                {record.paymentDetails && Object.keys(record.paymentDetails).length > 0 && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Payment ID</p>
                                    <p className="font-medium text-xs font-mono">
                                      {record.paymentDetails.id || 'N/A'}
                                    </p>
                                    {record.paymentDetails.method && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Method: {record.paymentDetails.method}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No subscription history found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Subscription Analytics
              </CardTitle>
              <CardDescription className={isMobile ? 'text-sm' : ''}>
                Analytics and trends for your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(subscription?.doctorTrends && subscription?.billingPerformance) || subscriptionUsage ? (
                <div className="space-y-8">
                  {/* Usage Analytics - if subscriptionUsage exists */}
                  {subscriptionUsage && (
                    <div className="space-y-6">
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
                        Current Usage Analytics
                      </h3>
                      
                      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
                        {/* Time Utilization */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} flex items-center gap-2`}>
                              <Timer className="h-4 w-4" />
                              Time Utilization
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Total Duration</p>
                                <p className="font-medium">{subscriptionUsage.totalDays} days</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Days Used</p>
                                <p className="font-medium text-blue-600">
                                  {subscriptionUsage.usageMetrics?.daysUsed || 0} days
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Days Remaining</p>
                                <p className="font-medium text-green-600">{subscriptionUsage.remainingDays} days</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${subscriptionUsage.usageMetrics?.percentageUsed || 0}%` }}
                                ></div>
                              </div>
                              <p className="text-center text-sm text-muted-foreground">
                                {subscriptionUsage.usageMetrics?.percentageUsed}% utilized
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Financial Utilization */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} flex items-center gap-2`}>
                              <DollarSign className="h-4 w-4" />
                              Financial Utilization
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="font-medium">₹{subscriptionUsage.subscriptionDetails?.totalPrice}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Amount Used</p>
                                <p className="font-medium text-purple-600">
                                  ₹{(parseFloat(subscriptionUsage.subscriptionDetails?.totalPrice || 0) - subscriptionUsage.remainingAmount).toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Remaining</p>
                                <p className="font-medium text-green-600">₹{subscriptionUsage.remainingAmount?.toFixed(2)}</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${subscriptionUsage.usageMetrics?.percentageUsed || 0}%` }}
                                ></div>
                              </div>
                              <p className="text-center text-sm text-muted-foreground">
                                {subscriptionUsage.usageMetrics?.percentageRemaining}% remaining value
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Daily Metrics */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} flex items-center gap-2`}>
                              <Activity className="h-4 w-4" />
                              Daily Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Daily Rate</p>
                                <p className="font-medium">₹{subscriptionUsage.dailyRate?.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Avg. Cost/Doctor</p>
                                <p className="font-medium text-orange-600">
                                  ₹{(subscriptionUsage.dailyRate / (subscriptionUsage.subscriptionDetails?.doctorCount || 1))?.toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Total Doctors</p>
                                <p className="font-medium">{subscriptionUsage.subscriptionDetails?.doctorCount}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                                <p className="font-medium text-blue-600">
                                  {subscriptionUsage.subscriptionDetails?.billingCycle === 'MONTHLY' ? 'Monthly' : 
                                   subscriptionUsage.subscriptionDetails?.billingCycle === 'YEARLY' ? 'Yearly' : 
                                   subscriptionUsage.subscriptionDetails?.billingCycle}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Existing analytics content */}
                  {subscription?.doctorTrends && subscription?.billingPerformance && (
                    <div>
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-6`}>
                        Historical Analytics
                      </h3>
                      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
                        {/* Doctor Trends */}
                        <Card>
                          <CardHeader>
                            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                              Doctor Trends
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Current Count</p>
                                <p className="font-medium">{subscription.doctorTrends.currentCount}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Trend</p>
                                <p className={`font-medium ${getTrendInfo(subscription.doctorTrends.trend).color}`}>
                                  {getTrendInfo(subscription.doctorTrends.trend).icon} {subscription.doctorTrends.trend}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Growth</p>
                                <p className="font-medium">{subscription.doctorTrends.growth}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Billing Performance */}
                        <Card>
                          <CardHeader>
                            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                              Billing Performance
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Preferred Cycle</p>
                                <p className="font-medium">{subscription.billingPerformance.cyclePreference}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Renewal Rate</p>
                                <p className="font-medium">{subscription.billingPerformance.renewalRate}%</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Average Cycle (days)</p>
                                <p className="font-medium">{subscription.billingPerformance.averageCycleDuration}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No analytics data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={handleSubscriptionSuccess}
        currentDoctorCount={getCurrentDoctorCount()}
        hospitalName={hospitalDashboardDetails?.hospitalInfo?.name || ''}
        hospitalEmail={hospitalDashboardDetails?.hospitalInfo?.adminEmail || ''}
      />
    </div>
  );
};

export default SubscriptionPage;