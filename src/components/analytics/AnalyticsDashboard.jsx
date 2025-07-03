'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  Activity,
  Clock,
  Zap,
  Award,
  PieChart,
  BarChart as BarChartIcon,
  AreaChart as AreaChartIcon,
  RefreshCw
} from 'lucide-react';
import { LineChartCustom } from './LineChartCustom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppointmentAnalytics from './AppointmentAnalytics';
import DoctorPerformance from './DoctorPerformance';
import RevenueAnalytics from './RevenueAnalytics';
// Reusable animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Gradient definitions for charts
const gradients = {
  appointments: ['#3b82f6', '#1d4ed8'],
  revenue: ['#10b981', '#059669'],
  patients: ['#8b5cf6', '#6d28d9'],
  doctors: ['#f59e0b', '#d97706'],
  critical: ['#ef4444', '#b91c1c'],
  neutral: ['#6b7280', '#4b5563']
};

export default function AnalyticsDashboard({ data }) {
  const [activeTimeRange, setActiveTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Extract data or use defaults
  const {
    hospitalInfo = {},
    appointment = {},
    doctors = [],
    revenue = {},
    operational = {},
    patientExperience = {},
    subscription = {}
  } = data || {};

  // Simple refresh animation function
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  // Filter data based on selected time range
  const getFilteredData = (data, timeRange) => {
    if (!data || !appointment.volumeTrends?.daily) return [];
    
    const today = new Date();
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - days[timeRange]);
    
    return Object.entries(appointment.volumeTrends.daily)
      .filter(([date]) => new Date(date) >= cutoffDate)
      .map(([date, value]) => ({
        label: new Date(date).toLocaleDateString('en-In', { month: 'short', day: 'numeric' }),
        value
      }));
  };

  const appointmentTrends = getFilteredData(appointment.volumeTrends?.daily, activeTimeRange);

  // KPI Summary Cards (Overview)
  const kpiMetrics = [
    {
      title: 'Total Appointments',
      value: appointmentTrends.reduce((sum, item) => sum + item.value, 0),
      icon: Calendar,
      color: 'from-primary to-primary-hover',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Doctors',
      value: doctors.filter(d => d.status === 'active').length || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Patient Satisfaction',
      value: patientExperience && patientExperience.overallSatisfaction !== undefined ? 
        `${patientExperience.overallSatisfaction.toFixed(2)}%` : 
        `${patientExperience?.retention?.returnRate.toFixed(2) || 0}%`,
      icon: Award,
      color: 'from-yellow-400 to-yellow-500',
      change: '+2.4%',
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: revenue?.paymentStatus?.paid ? 
        `₹${(revenue.paymentStatus.paid.amount || 0).toLocaleString()}` : '$0',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: '+8.1%',
      trend: 'up'
    },
  ];

  // Format appointment volume data for area chart
  const appointmentVolumeData = appointment.volumeTrends?.daily 
    ? getFilteredData(appointment.volumeTrends.daily, activeTimeRange).map(({ label, value }) => ({
        date: label,
        appointments: value
      }))
    : [];

  // Format appointments by status for pie chart
  const appointmentStatusData = appointment.statusDistribution
    ? Object.entries(appointment.statusDistribution).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: status === 'completed' ? '#22c55e' : 
               status === 'booked' ? '#3b82f6' : 
               status === 'cancelled' ? '#ef4444' : 
               status === 'rescheduled' ? '#f59e0b' : '#6b7280'
      }))
    : [];

  // Doctor performance radar data
  const doctorRadarData = doctors.slice(0, 5).map(doctor => {
    const performance = appointment.doctorPerformance?.[doctor.id] || {};
    const utilization = operational.doctorUtilization?.[doctor.id] || {};
    
    return {
      name: doctor.name,
      appointments: performance.total || 0,
      utilization: Math.round(utilization.utilization || 0),
      satisfaction: Math.round(doctor.rating || 0) * 20,
      completionRate: Math.round(utilization.completionRate || 0)
    };
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 bg-surface/70 rounded-xl p-2 backdrop-blur-md"
    >
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            Hospital Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights for {hospitalInfo.name || 'Your Hospital'}
            <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {activeTimeRange.replace('d', ' Days')}
            </span>
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <motion.div variants={itemVariants}>
            <Tabs value={activeTimeRange} onValueChange={setActiveTimeRange} className="hidden md:block">
              <TabsList className="bg-muted/50 border border-border">
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="icon"
              className="bg-muted border-border"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh data</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mx-auto mb-6 bg-muted/50 border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpiMetrics.map((metric, index) => (
                <motion.div 
                  key={metric.title}
                  variants={itemVariants}
                  custom={index}
                >
                  <Card className="bg-card border-border overflow-hidden relative">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${metric.color}`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <metric.icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className="flex items-center mt-1">
                        <Badge 
                          className={`flex gap-1 items-center font-medium rounded-sm px-1.5 py-0.5 text-xs ${
                            metric.trend === 'up' 
                              ? 'bg-success/20 text-success border-success/30' 
                              : 'bg-destructive/20 text-destructive border-destructive/30'
                          }`}
                        >
                          {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {metric.change}
                        </Badge>
                        <span className="text-xs ml-2 text-muted-foreground">vs. previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Appointments Area Chart */}
                <div className="lg:col-span-2">
                    <LineChartCustom
                    data={appointmentTrends}
                    title={`Appointment Volume Trends (${activeTimeRange.replace('d', ' Days')})`}
                    color="#3B82F6"
                    showArea={true}
                    />
                </div>

              {/* Appointment Status Pie Chart */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card border-border h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Appointment Status</CardTitle>
                    <CardDescription>Distribution by current status</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appointmentStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {appointmentStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`${value} appointments`, name]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--popover-foreground))'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                      {appointmentStatusData.map((status) => (
                        <div key={status.name} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-xs text-muted-foreground">{status.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Doctor Performance Radar */}
            <motion.div variants={itemVariants} className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Doctor Performance Overview</CardTitle>
                  <CardDescription>Comparative analysis of top doctors</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="80%" data={doctorRadarData}>
                      <PolarGrid stroke="#475569" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                      <PolarRadiusAxis tick={{ fill: '#94a3b8' }} axisLine={false} />
                      <Radar
                        name="Appointments"
                        dataKey="appointments"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                      />
                      <Radar
                        name="Utilization (%)"
                        dataKey="utilization"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                      />
                      <Radar
                        name="Satisfaction"
                        dataKey="satisfaction"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.4}
                      />
                      <Radar
                        name="Completion Rate"
                        dataKey="completionRate"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.4}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#475569',
                          color: '#f8fafc'
                        }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Other tabs would be implemented similarly but with different chart types and data */}
          <TabsContent value="appointments" className="mt-0">
            {/* Appointment specific visualizations */}
            <AppointmentAnalytics data={appointment} timeRange={activeTimeRange} />
          </TabsContent>

          <TabsContent value="doctors" className="mt-0">
            {/* Doctor specific visualizations */}
            <DoctorPerformance doctors={doctors} appointmentData={appointment} operationalData={operational} timeRange={activeTimeRange} />
          </TabsContent>

          <TabsContent value="revenue" className="mt-0">
            {/* Revenue specific visualizations */}
            <RevenueAnalytics data={revenue} timeRange={activeTimeRange} />
              <BarChartIcon className="h-16 w-16 mx-auto text-success opacity-50 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground">Revenue Analytics</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Click on the 'Overview' tab to see the current revenue metrics.
              </p>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
