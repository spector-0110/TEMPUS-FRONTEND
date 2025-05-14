'use client';

import { useState } from 'react';
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

const SubscriptionPage = () => {
  const { hospitalDashboardDetails } = useHospital();
  const [activeTab, setActiveTab] = useState('current');
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Handle subscription button click - functionality to be added later
  const handleGetSubscription = () => {
    // This function will be implemented later
    console.log('Get subscription clicked');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="current">Current Subscription</TabsTrigger>
          <TabsTrigger value="history">Subscription History</TabsTrigger>
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
              {hospitalDashboardDetails?.currentSubscription ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="font-medium">
                        {getStatusBadge(hospitalDashboardDetails.currentSubscription.status)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <div className="font-medium">
                        {getPaymentStatusBadge(hospitalDashboardDetails.currentSubscription.paymentStatus)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">₹{hospitalDashboardDetails.currentSubscription.totalPrice}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Doctor Count</p>
                      <p className="font-medium">{hospitalDashboardDetails.currentSubscription.doctorCount}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Billing Cycle</p>
                      <p className="font-medium">
                        {hospitalDashboardDetails.currentSubscription.billingCycle === 'MONTHLY' 
                          ? 'Monthly' 
                          : hospitalDashboardDetails.currentSubscription.billingCycle === 'YEARLY' 
                            ? 'Yearly' 
                            : hospitalDashboardDetails.currentSubscription.billingCycle}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(hospitalDashboardDetails.currentSubscription.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">{formatDate(hospitalDashboardDetails.currentSubscription.expiresAt)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Auto-Renew</p>
                      <p className="font-medium">
                        {hospitalDashboardDetails.currentSubscription.autoRenew ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No active subscription found.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGetSubscription}>Get Subscription</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Subscription History</CardTitle>
              <CardDescription>
                Your previous subscription plans and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hospitalDashboardDetails?.subscriptionHistory && 
              hospitalDashboardDetails.subscriptionHistory.length > 0 ? (
                <div className="space-y-8">
                  {hospitalDashboardDetails.subscriptionHistory.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            {subscription.billingCycle} Subscription
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <div>{getPaymentStatusBadge(subscription.paymentStatus)}</div>
                          <p className="text-xs text-muted-foreground">Created: {formatDate(subscription.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">₹{subscription.totalPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Doctor Count</p>
                          <p className="font-medium">{subscription.doctorCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Billing Cycle</p>
                          <p className="font-medium">
                            {subscription.billingCycle === 'MONTHLY' 
                              ? 'Monthly' 
                              : subscription.billingCycle === 'YEARLY' 
                                ? 'Yearly' 
                                : subscription.billingCycle}
                          </p>
                        </div>
                      </div>

                      {(subscription.paymentMethod || subscription.paymentDetails) && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subscription.paymentMethod && (
                              <div>
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <p className="font-medium">{subscription.paymentMethod}</p>
                              </div>
                            )}
                            {subscription.paymentDetails && (
                              <div>
                                <p className="text-sm text-muted-foreground">Payment Details</p>
                                <p className="font-medium">{subscription.paymentDetails}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No subscription history found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionPage;