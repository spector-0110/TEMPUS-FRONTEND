'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Clock, Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

export default function OperationalMetrics({ data }) {
  if (!data) return null;

  const { doctorUtilization, scheduleEfficiency, patientDemographics, visitNotesCompletion } = data;

  // Prepare utilization data
  const utilizationData = Object.values(doctorUtilization || {}).map(doctor => ({
    name: doctor.doctor.name,
    utilization: Math.round(doctor.utilization || 0),
    bookedSlots: doctor.bookedSlots || 0,
    totalSlots: doctor.totalSlots || 0,
    completionRate: Math.round(doctor.completionRate || 0)
  }));

  // Age distribution data
  const ageDistributionData = Object.entries(patientDemographics.ageDistribution || {}).map(([age, count]) => ({
    age,
    count,
    percentage: patientDemographics.total > 0 ? Math.round((count / patientDemographics.total) * 100) : 0
  }));

  // Calculate overall metrics
  const avgUtilization = utilizationData.length > 0 
    ? Math.round(utilizationData.reduce((sum, d) => sum + (d.utilization || 0), 0) / utilizationData.length)
    : 0;

  const totalSlots = utilizationData.length > 0 
    ? utilizationData.reduce((sum, d) => sum + (d.totalSlots || 0), 0) 
    : 0;
    
  const totalBooked = utilizationData.length > 0 
    ? utilizationData.reduce((sum, d) => sum + (d.bookedSlots || 0), 0) 
    : 0;
    
  const overallUtilization = totalSlots > 0 ? Math.round((totalBooked / totalSlots) * 100) : 0;

  // Schedule efficiency recommendations count
  const totalRecommendations = Object.values(scheduleEfficiency || {})
    .reduce((sum, doctor) => sum + (doctor.recommendations?.length || 0), 0);

  const metrics = [
    {
      title: 'Overall Utilization',
      value: `${overallUtilization}%`,
      icon: TrendingUp,
      color: 'from-primary to-primary-hover',
      description: `${totalBooked}/${totalSlots} slots`,
      status: overallUtilization > 70 ? 'good' : overallUtilization > 40 ? 'warning' : 'poor'
    },
    {
      title: 'Schedule Efficiency',
      value: `${totalRecommendations}`,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      description: 'Recommendations',
      status: totalRecommendations < 5 ? 'good' : totalRecommendations < 10 ? 'warning' : 'poor'
    },
    {
      title: 'Patient Demographics',
      value: patientDemographics.total || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      description: 'Total patients',
      status: 'neutral'
    },
    {
      title: 'Notes Completion',
      value: `${Math.round(visitNotesCompletion.completionRate || 0)}%`,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      description: `${visitNotesCompletion.withNotes}/${visitNotesCompletion.total}`,
      status: visitNotesCompletion.completionRate > 80 ? 'good' : 'warning'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground dark:text-muted-foreground';
    }
  };

  const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Operational Metrics
        </h2>
        <p className="text-muted-foreground">
          Efficiency analysis and operational performance indicators
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
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-5 w-5 bg-gradient-to-br ${metric.color} text-card-foreground rounded p-1`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {metric.value}
                </div>
                <div className={`text-xs ${getStatusColor(metric.status)}`}>
                  {metric.description}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Utilization */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Doctor Utilization Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationData}>
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
                  <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completionRate" fill="#22c55e" name="Completion Rate %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Age Demographics */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-success" />
                Patient Age Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientDemographics.total === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground mb-2">
                    No patient demographic data available yet
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Data will appear as patients visit
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ageDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {ageDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Efficiency Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-chart-2" />
                Schedule Efficiency Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(scheduleEfficiency || {}).map(([doctorId, efficiency]) => (
                  <div key={doctorId} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">
                        Dr. {efficiency.doctor.name}
                      </h4>
                      <Badge variant="outline">
                        {efficiency.recommendations?.length || 0} recommendations
                      </Badge>
                    </div>
                    
                    {efficiency.recommendations && efficiency.recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {efficiency.recommendations.slice(0, 3).map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <div className="font-medium text-warning">
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rec.day]} at {rec.startTime}
                              </div>
                              <div className="text-warning/80 text-xs mt-1">
                                {rec.suggestion}
                              </div>
                            </div>
                          </div>
                        ))}
                        {efficiency.recommendations.length > 3 && (
                          <div className="text-center">
                            <Badge variant="secondary">
                              +{efficiency.recommendations.length - 3} more recommendations
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                        <div className="text-sm">Schedule is optimized</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Utilization Details */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-card-elevated/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              Detailed Utilization Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {utilizationData.map((doctor, index) => (
                <div key={doctor.name} className="space-y-3 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      Dr. {doctor.name}
                    </h4>
                    <Badge variant={doctor.utilization > 50 ? 'default' : 'secondary'}>
                      {doctor.utilization}% utilized
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className="font-medium">{doctor.utilization}%</span>
                    </div>
                    <Progress value={doctor.utilization} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Booked Slots</div>
                      <div className="font-semibold text-foreground">{doctor.bookedSlots}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Slots</div>
                      <div className="font-semibold text-foreground">{doctor.totalSlots}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
