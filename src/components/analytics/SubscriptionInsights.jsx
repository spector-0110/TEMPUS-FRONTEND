'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, TrendingUp, Users, Crown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function SubscriptionInsights({ data }) {
  if (!data) return null;

  const { currentStatus, history, doctorTrends, billingPerformance } = data;

  // Calculate subscription metrics
  const daysRemaining = currentStatus?.endDate ? 
    Math.max(0, Math.ceil((new Date(currentStatus.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
    
  const totalDays = (currentStatus?.startDate && currentStatus?.endDate) ? 
    Math.ceil((new Date(currentStatus.endDate) - new Date(currentStatus.startDate)) / (1000 * 60 * 60 * 24)) : 30;
    
  const subscriptionProgress = totalDays > 0 ? 
    Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)) : 0;

  // Prepare doctor trends data
  const doctorTrendData = doctorTrends.timeline.map((entry, index) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    doctors: entry.doctorCount,
    index
  }));

  // Billing cycle distribution
  const billingCycleData = Object.entries(billingPerformance.cycleDistribution || {}).map(([cycle, count]) => ({
    name: cycle.charAt(0).toUpperCase() + cycle.slice(1).toLowerCase(),
    value: count,
    color: cycle === 'MONTHLY' ? '#3b82f6' : cycle === 'YEARLY' ? '#22c55e' : '#8b5cf6'
  }));

  // Subscription status metrics
  const metrics = [
    {
      title: 'Current Plan',
      value: currentStatus?.doctorCount !== undefined ? 
        `${currentStatus.doctorCount} Doctor${currentStatus.doctorCount !== 1 ? 's' : ''}` : 'Not available',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: currentStatus?.billingCycle ? 
        `${currentStatus.billingCycle.toLowerCase()} billing` : 'Not specified',
      status: currentStatus?.status || 'UNKNOWN'
    },
    {
      title: 'Plan Value',
      value: currentStatus?.totalPrice ? 
        `₹${parseFloat(currentStatus.totalPrice).toLocaleString()}` : '₹0',
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      description: currentStatus?.billingCycle ? 
        `Per ${currentStatus.billingCycle.toLowerCase()}` : 'Not specified',
      status: currentStatus?.paymentStatus || 'UNKNOWN'
    },
    {
      title: 'Days Remaining',
      value: daysRemaining,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      description: `Until ${new Date(currentStatus.endDate).toLocaleDateString()}`,
      status: daysRemaining > 7 ? 'active' : 'warning'
    },
    {
      title: 'Growth Trend',
      value: doctorTrends.trend,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      description: `${doctorTrends.growth >= 0 ? '+' : ''}${doctorTrends.growth} doctors`,
      status: doctorTrends.growth >= 0 ? 'positive' : 'negative'
    }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'paid': case 'positive': return 'text-green-600 dark:text-green-400';
      case 'pending': case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'expired': case 'failed': case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'expired': case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Subscription Insights
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Subscription management and billing analytics
        </p>
      </motion.div>

      {/* Subscription Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                    {currentStatus.billingCycle} Subscription
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400">
                    {currentStatus.doctorCount} Doctor License{currentStatus.doctorCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  ₹{parseFloat(currentStatus.totalPrice).toLocaleString()}
                </div>
                <Badge variant={getStatusBadge(currentStatus.status)}>
                  {currentStatus.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 dark:text-blue-400">Subscription Progress</span>
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {Math.round(subscriptionProgress)}% complete
                </span>
              </div>
              <Progress value={subscriptionProgress} className="h-2" />
              <div className="flex justify-between text-xs text-blue-500 dark:text-blue-300">
                <span>Started: {new Date(currentStatus.startDate).toLocaleDateString()}</span>
                <span>Ends: {new Date(currentStatus.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-5 w-5 bg-gradient-to-br ${metric.color} text-white rounded p-1`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center justify-between">
                  <div className={`text-xs ${getStatusColor(metric.status)}`}>
                    {metric.description}
                  </div>
                  {metric.status && (
                    <Badge variant={getStatusBadge(metric.status)} className="text-xs">
                      {metric.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Trends */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Doctor License Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={doctorTrendData}>
                  <defs>
                    <linearGradient id="doctorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="doctors" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#doctorGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing Cycle Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Billing Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={billingCycleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {billingCycleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-500" />
                Subscription History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {history.totalTransactions}
                    </div>
                    <div className="text-sm text-blue-500 dark:text-blue-300">Total Transactions</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {history.renewals}
                    </div>
                    <div className="text-sm text-green-500 dark:text-green-300">Renewals</div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Plan Upgrades</span>
                    <Badge variant="outline">{history.upgrades}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Plan Downgrades</span>
                    <Badge variant="outline">{history.downgrades}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Auto Renew</span>
                    <Badge variant={currentStatus.autoRenew ? 'default' : 'secondary'}>
                      {currentStatus.autoRenew ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing Performance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(billingPerformance.renewalRate)}%
                    </div>
                    <div className="text-sm text-orange-500 dark:text-orange-300">Renewal Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {billingPerformance.averageCycleDuration}
                    </div>
                    <div className="text-sm text-purple-500 dark:text-purple-300">Avg Cycle (days)</div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Successful Renewals</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {billingPerformance.successfulRenewals}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Preferred Cycle</span>
                    <Badge variant="outline">
                      {billingPerformance.cyclePreference}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Payment Status</span>
                    <Badge variant={getStatusBadge(currentStatus.paymentStatus)}>
                      {currentStatus.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
