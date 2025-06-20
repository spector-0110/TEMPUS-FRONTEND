'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function AppointmentAnalytics({ data }) {
  if (!data) return null;

  const { 
    volumeTrends = {}, 
    statusDistribution = {}, 
    doctorPerformance = {}, 
    peakHours = { hourly: {}, daily: {} }, 
    patientFlow = { new: 0, returning: 0, totalPatients: 0 }, 
    durationAnalysis = { averageScheduled: 0, averageActual: 0 } 
  } = data;

  // Prepare data for charts
  const dailyVolumeData = Object.entries(volumeTrends.daily || {}).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    appointments: count
  }));

  const statusData = Object.entries(statusDistribution || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: status === 'completed' ? '#22c55e' : status === 'booked' ? '#3b82f6' : '#ef4444'
  }));

  const peakHoursData = Object.entries(peakHours.hourly || {}).map(([hour, count]) => ({
    hour: `${hour}:00`,
    appointments: count
  }));

  const doctorPerformanceData = Object.values(doctorPerformance || {}).map(doctor => ({
    name: doctor.doctor.name,
    total: doctor.total,
    completed: doctor.completed,
    specialization: doctor.doctor.specialization
  }));

  const metrics = [
    {
      title: 'Total Appointments',
      value: Object.values(statusDistribution || {}).reduce((sum, count) => sum + count, 0),
      icon: Calendar,
      color: 'from-primary to-primary-hover',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Avg Duration',
      value: `${durationAnalysis.averageScheduled || 0} min`,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      change: 'Scheduled',
      changeType: 'neutral'
    },
    {
      title: 'New Patients',
      value: patientFlow.new || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      change: `${patientFlow.totalPatients} total`,
      changeType: 'neutral'
    },
    {
      title: 'Peak Time',
      value: Object.keys(peakHours.hourly || {})[0] ? `${Object.keys(peakHours.hourly)[0]}:00` : 'N/A',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      change: `${Object.values(peakHours.hourly || {})[0] || 0} appts`,
      changeType: 'neutral'
    }
  ];

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Appointment Analytics
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Comprehensive analysis of appointment patterns and trends
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
                <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-5 w-5 bg-gradient-to-br ${metric.color} text-white rounded p-1`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume Trend */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Daily Appointment Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyVolumeData}>
                  <defs>
                    <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="appointments" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#appointmentGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-success" />
                Appointment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
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

        {/* Doctor Performance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Doctor Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={doctorPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#8b5cf6" name="Total Appointments" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patient Flow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-2" />
                Patient Flow Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {patientFlow.new}
                    </div>
                    <div className="text-sm text-primary/80">New Patients</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {patientFlow.returning}
                    </div>
                    <div className="text-sm text-success/80">Returning</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground">Total Patients</span>
                    <span className="text-lg font-semibold text-foreground">
                      {patientFlow.totalPatients}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground">Return Rate</span>
                    <Badge variant="outline">
                      {Math.round((patientFlow.returning / patientFlow.totalPatients) * 100)}%
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
