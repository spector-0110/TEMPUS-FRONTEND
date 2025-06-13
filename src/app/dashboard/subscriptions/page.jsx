'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useHospital } from '@/context/HospitalProvider';
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
import { CreditCard, Calendar, TrendingUp, Clock, AlertTriangle, CheckCircle, Shield, Zap } from 'lucide-react';

const SubscriptionPage = () => {
  const { hospitalDashboardDetails, refreshHospitalDashboard } = useHospital();
  const [activeTab, setActiveTab] = useState('current');
  const subscription = hospitalDashboardDetails?.subscription;
  
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
      case 'PAID':
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
    // This function will be implemented later
    console.log('Get subscription clicked');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your healthcare system subscription and billing
          </p>
        </div>
        
        {/* Quick Action Button */}
        {needsRenewal() && (
          <Button 
            onClick={handleGetSubscription}
            className="flex items-center gap-2"
            size="lg"
          >
            <Zap className="h-4 w-4" />
            {subscription?.currentStatus ? 'Renew Subscription' : 'Get Subscription'}
          </Button>
        )}
      </div>

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
        <TabsList className="grid grid-cols-3 w-[600px]">
          <TabsTrigger value="current">Current Subscription</TabsTrigger>
          <TabsTrigger value="history">Subscription History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Current Subscription</CardTitle>
              <CardDescription>
                Details about your active subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.currentStatus ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">₹{subscription.currentStatus.totalPrice}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Doctor Count</p>
                      <p className="font-medium">{subscription.currentStatus.doctorCount}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-muted-foreground">No active subscription found.</p>
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
              <CardTitle className="text-2xl">Subscription History</CardTitle>
              <CardDescription>
                Your subscription history and changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.history ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Upgrades</p>
                      <p className="text-2xl font-bold">
                        {typeof subscription.history.upgrades === 'object' 
                          ? JSON.stringify(subscription.history.upgrades) 
                          : subscription.history.upgrades || 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Downgrades</p>
                      <p className="text-2xl font-bold">
                        {typeof subscription.history.downgrades === 'object' 
                          ? JSON.stringify(subscription.history.downgrades) 
                          : subscription.history.downgrades || 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Renewals</p>
                      <p className="text-2xl font-bold">
                        {typeof subscription.history.renewals === 'object' 
                          ? JSON.stringify(subscription.history.renewals) 
                          : subscription.history.renewals || 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold">
                        {typeof subscription.history.totalTransactions === 'object' 
                          ? JSON.stringify(subscription.history.totalTransactions) 
                          : subscription.history.totalTransactions || 0}
                      </p>
                    </div>
                  </div>

                  {subscription.history.latestPlan && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Latest Plan Details</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(subscription.history.latestPlan.startDate)} - {formatDate(subscription.history.latestPlan.endDate)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <div>{getPaymentStatusBadge(subscription.history.latestPlan.paymentStatus)}</div>
                          <p className="text-xs text-muted-foreground">Created: {formatDate(subscription.history.latestPlan.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">
                            ₹{typeof subscription.history.latestPlan.totalPrice === 'object' 
                              ? JSON.stringify(subscription.history.latestPlan.totalPrice) 
                              : subscription.history.latestPlan.totalPrice || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Doctor Count</p>
                          <p className="font-medium">
                            {typeof subscription.history.latestPlan.doctorCount === 'object' 
                              ? JSON.stringify(subscription.history.latestPlan.doctorCount) 
                              : subscription.history.latestPlan.doctorCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Billing Cycle</p>
                          <p className="font-medium">
                            {subscription.history.latestPlan.billingCycle === 'MONTHLY' 
                              ? 'Monthly' 
                              : subscription.history.latestPlan.billingCycle === 'YEARLY' 
                                ? 'Yearly' 
                                : subscription.history.latestPlan.billingCycle}
                          </p>
                        </div>
                      </div>

                      {(subscription.history.latestPlan.paymentMethod || subscription.history.latestPlan.paymentDetails) && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subscription.history.latestPlan.paymentMethod && (
                              <div>
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <p className="font-medium">
                                  {typeof subscription.history.latestPlan.paymentMethod === 'object' 
                                    ? JSON.stringify(subscription.history.latestPlan.paymentMethod) 
                                    : subscription.history.latestPlan.paymentMethod}
                                </p>
                              </div>
                            )}
                            {subscription.history.latestPlan.paymentDetails && (
                              <div>
                                <p className="text-sm text-muted-foreground">Payment Details</p>
                                <p className="font-medium">
                                  {typeof subscription.history.latestPlan.paymentDetails === 'object' 
                                    ? JSON.stringify(subscription.history.latestPlan.paymentDetails) 
                                    : subscription.history.latestPlan.paymentDetails}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
              <CardTitle className="text-2xl">Subscription Analytics</CardTitle>
              <CardDescription>
                Analytics and trends for your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.doctorTrends && subscription?.billingPerformance ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Doctor Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Doctor Trends</CardTitle>
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
                        <CardTitle className="text-lg">Billing Performance</CardTitle>
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
              ) : (
                <p className="text-muted-foreground">No analytics data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionPage;