'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Clock, Users, RotateCcw, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

export default function PatientExperience({ data }) {
  if (!data) return null;

  const { waitTime, cancellationPatterns, retention, completionRates } = data;

  // Prepare wait time distribution data
  const waitTimeData = Object.entries(waitTime.distribution || {}).map(([category, count]) => ({
    category: category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    count,
    percentage: waitTime.distribution ? Math.round((count / Object.values(waitTime.distribution).reduce((a, b) => a + b, 0)) * 100) : 0
  }));

  // Visit frequency data
  const visitFrequencyData = Object.entries(retention.visitFrequency || {}).map(([frequency, count]) => ({
    frequency: frequency.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    count,
    color: frequency === 'oneVisit' ? '#ef4444' : frequency === 'twoVisits' ? '#f59e0b' : frequency === 'threeToFive' ? '#22c55e' : '#3b82f6'
  }));

  // Completion rates data
  const completionData = [
    { name: 'Completed', value: completionRates.completed || 0, color: '#22c55e' },
    { name: 'No Show', value: completionRates.noShow || 0, color: '#ef4444' },
    { name: 'Cancelled', value: completionRates.cancelled || 0, color: '#f59e0b' }
  ];

  const metrics = [
    {
      title: 'Avg Wait Time',
      value: `${waitTime.averageWaitTime || 0} min`,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      description: `Max: ${waitTime.maxWaitTime || 0} min`,
      status: waitTime.averageWaitTime <= 15 ? 'good' : waitTime.averageWaitTime <= 30 ? 'warning' : 'poor'
    },
    {
      title: 'Patient Retention',
      value: `${retention.returnRate || 0}%`,
      icon: RotateCcw,
      color: 'from-green-500 to-green-600',
      description: `${retention.totalPatients} total patients`,
      status: retention.returnRate >= 30 ? 'good' : retention.returnRate >= 15 ? 'warning' : 'poor'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(completionRates.completionRate || 0)}%`,
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      description: `${completionRates.completed}/${completionRates.total}`,
      status: completionRates.completionRate >= 80 ? 'good' : completionRates.completionRate >= 60 ? 'warning' : 'poor'
    },
    {
      title: 'Cancellation Rate',
      value: `${Math.round(cancellationPatterns.rate || 0)}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      description: `${cancellationPatterns.total} total`,
      status: cancellationPatterns.rate <= 10 ? 'good' : cancellationPatterns.rate <= 20 ? 'warning' : 'poor'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'poor': return 'destructive';
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
          Patient Experience
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Patient satisfaction and experience metrics
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
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
                  <Badge variant={getStatusBadge(metric.status)} className="text-xs">
                    {metric.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wait Time Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Wait Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waitTimeData.every(item => item.count === 0) ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <div className="text-slate-500 dark:text-slate-400 mb-2">
                    No wait time data available yet
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    Data will be tracked as appointments are processed
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={waitTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Patient Retention */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-green-500" />
                Visit Frequency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visitFrequencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {visitFrequencyData.map((entry, index) => (
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

        {/* Completion Rates */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                Appointment Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
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

        {/* Patient Satisfaction Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Experience Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-950 dark:to-red-950 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {Math.round((retention.returnRate + completionRates.completionRate + (100 - cancellationPatterns.rate)) / 3)}
                  </div>
                  <div className="text-sm text-red-500 dark:text-red-300">Overall Experience Score</div>
                </div>

                {/* Key Indicators */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Patient Retention</span>
                    <div className="flex items-center gap-2">
                      <Progress value={retention.returnRate} className="w-20 h-2" />
                      <span className="text-sm font-semibold">{retention.returnRate}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={completionRates.completionRate} className="w-20 h-2" />
                      <span className="text-sm font-semibold">{Math.round(completionRates.completionRate)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">On-time Performance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={waitTime.distribution?.onTime ? (waitTime.distribution.onTime / Object.values(waitTime.distribution).reduce((a, b) => a + b, 0)) * 100 : 0} className="w-20 h-2" />
                      <span className="text-sm font-semibold">
                        {waitTime.distribution?.onTime ? Math.round((waitTime.distribution.onTime / Object.values(waitTime.distribution).reduce((a, b) => a + b, 0)) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {retention.totalPatients}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Patients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {completionRates.total}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Appointments</div>
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
