'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  AlertTriangle,
  IndianRupee
} from 'lucide-react';
import { useStaff } from '@/hooks/useStaff';
import { getDisplayName } from '@/lib/api/staffAPI';

export function StaffAnalyticsDashboard() {
  const { 
    staffList, 
    computedStats,
    isLoading 
  } = useStaff();
  
  // Advanced analytics calculations
  const analytics = useMemo(() => {
    if (!staffList.length) return null;
    
    // Age distribution
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0
    };
    
    staffList.forEach(staff => {
      const age = staff.age;
      if (age <= 25) ageGroups['18-25']++;
      else if (age <= 35) ageGroups['26-35']++;
      else if (age <= 45) ageGroups['36-45']++;
      else if (age <= 55) ageGroups['46-55']++;
      else ageGroups['55+']++;
    });
    
    // Salary distribution
    const salaryRanges = {
      '< ₹20K': 0,
      '₹20K-40K': 0,
      '₹40K-60K': 0,
      '₹60K+': 0
    };
    
    staffList.forEach(staff => {
      const salary = staff.salaryAmount;
      if (salary < 20000) salaryRanges['< ₹20K']++;
      else if (salary < 40000) salaryRanges['₹20K-40K']++;
      else if (salary < 60000) salaryRanges['₹40K-60K']++;
      else salaryRanges['₹60K+']++;
    });
    
    // Role performance (mock data - would come from attendance/performance metrics)
    const rolePerformance = computedStats.roleDistribution;
    
    // Tenure analysis (assuming createdAt field)
    const tenureGroups = {
      'New (< 6 months)': 0,
      'Experienced (6m-2y)': 0,
      'Senior (2y-5y)': 0,
      'Veteran (5y+)': 0
    };
    
    const now = new Date();
    staffList.forEach(staff => {
      if (staff.createdAt) {
        const joinDate = new Date(staff.createdAt);
        const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                          (now.getMonth() - joinDate.getMonth());
        
        if (monthsDiff < 6) tenureGroups['New (< 6 months)']++;
        else if (monthsDiff < 24) tenureGroups['Experienced (6m-2y)']++;
        else if (monthsDiff < 60) tenureGroups['Senior (2y-5y)']++;
        else tenureGroups['Veteran (5y+)']++;
      }
    });
    
    // Identify insights
    const insights = [];
    
    // High salary staff
    const highSalaryStaff = staffList.filter(s => s.salaryAmount > 50000).length;
    if (highSalaryStaff > staffList.length * 0.3) {
      insights.push({
        type: 'info',
        message: `${Math.round((highSalaryStaff / staffList.length) * 100)}% of staff earn above ₹50,000`,
        icon: IndianRupee
      });
    }
    
    // Age diversity
    const youngStaff = staffList.filter(s => s.age < 30).length;
    if (youngStaff > staffList.length * 0.5) {
      insights.push({
        type: 'success',
        message: 'Young workforce - good for innovation and energy',
        icon: TrendingUp
      });
    }
    
    // Role concentration
    const dominantRole = Object.entries(rolePerformance).sort((a, b) => b[1] - a[1])[0];
    if (dominantRole && dominantRole[1] > staffList.length * 0.4) {
      insights.push({
        type: 'warning',
        message: `High concentration in ${getDisplayName.role(dominantRole[0])} role`,
        icon: AlertTriangle
      });
    }
    
    return {
      ageGroups,
      salaryRanges,
      rolePerformance,
      tenureGroups,
      insights
    };
  }, [staffList, computedStats]);
  
  if (isLoading || !analytics) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{computedStats.total}</p>
                <p className="text-xs text-muted-foreground">
                  {computedStats.roleCount} different roles
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {computedStats.total > 0 ? Math.round((computedStats.active / computedStats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {computedStats.active} active
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Salary</p>
                <p className="text-2xl font-bold">₹{Math.round(computedStats.averageSalary).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Per month</p>
              </div>
              <IndianRupee className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">₹{Math.round(computedStats.totalMonthlySalary).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total payroll</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Insights */}
      {analytics.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'success' ? 'bg-green-100 text-green-600' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <insight.icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm">{insight.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.ageGroups).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm">{range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(count / computedStats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Salary Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Salary Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.salaryRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm">{range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(count / computedStats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.rolePerformance).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm">{getDisplayName.role(role)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / computedStats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Tenure Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Experience Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.tenureGroups).map(([tenure, count]) => (
                <div key={tenure} className="flex items-center justify-between">
                  <span className="text-sm">{tenure}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(count / computedStats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
