'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Star, Clock, Calendar, Phone, Mail, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export default function DoctorPerformance({ doctors, appointmentData, operationalData }) {
  // Return null if any required data is missing
  if (!doctors || !Array.isArray(doctors) || doctors.length === 0 || 
      !appointmentData || !operationalData) {
    return null;
  }

  const doctorPerformance = appointmentData.doctorPerformance || {};
  const doctorUtilization = operationalData.doctorUtilization || {};

  // Prepare radar chart data for doctor comparison
  const radarData = doctors.map(doctor => {
    const performance = doctorPerformance[doctor.id] || {};
    const utilization = doctorUtilization[doctor.id] || {};
    
    return {
      name: doctor.name,
      appointments: performance.total || 0,
      utilization: Math.round(utilization.utilization || 0),
      experience: doctor.experience || 0,
      age: doctor.age || 0,
      status: doctor.status === 'active' ? 100 : 0
    };
  });

  // Utilization data for bar chart
  const utilizationData = doctors.map(doctor => {
    const utilization = doctorUtilization[doctor.id] || {};
    const performance = doctorPerformance[doctor.id] || {};
    
    return {
      name: doctor.name,
      utilization: Math.round(utilization.utilization || 0),
      appointments: performance.total || 0,
      completionRate: Math.round(utilization.completionRate || 0)
    };
  });

  // Status distribution
  const statusData = [
    { name: 'Active', value: doctors.filter(d => d.status === 'active').length, color: '#22c55e' },
    { name: 'Inactive', value: doctors.filter(d => d.status === 'inactive').length, color: '#ef4444' }
  ];

  // Specialization distribution
  const specializationCount = {};
  doctors.forEach(doctor => {
    const specs = doctor.specialization.split(',').map(s => s.trim());
    specs.forEach(spec => {
      specializationCount[spec] = (specializationCount[spec] || 0) + 1;
    });
  });

  const specializationData = Object.entries(specializationCount).map(([spec, count]) => ({
    name: spec,
    value: count
  }));

  const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Doctor Performance
        </h2>
        <p className="text-muted-foreground">
          Comprehensive analysis of doctor performance and utilization
        </p>
      </motion.div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor, index) => {
          const performance = doctorPerformance[doctor.id] || {};
          const utilization = doctorUtilization[doctor.id] || {};
          
          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-5 group-hover:opacity-10 transition-opacity" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                        <AvatarImage src={doctor.photo} alt={doctor.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Dr. {doctor.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialization}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={doctor.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {doctor.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doctor.experience} yrs exp
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {performance.total || 0}
                      </div>
                      <div className="text-xs text-primary/70">
                        Total Appointments
                      </div>
                    </div>
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">
                        {Math.round(utilization.utilization || 0)}%
                      </div>
                      <div className="text-xs text-success/70">
                        Utilization
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {doctor.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      Age: {doctor.age}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      Qualifications: {doctor.qualification}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Comparison Radar */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Doctor Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Performance Metrics"
                    dataKey="appointments"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Utilization %"
                    dataKey="utilization"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Utilization Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Doctor Utilization
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
                  <Bar dataKey="appointments" fill="#22c55e" name="Appointments" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-success" />
                Doctor Status
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

        {/* Specialization Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card-elevated/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-info" />
                Specialization Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={specializationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {specializationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
