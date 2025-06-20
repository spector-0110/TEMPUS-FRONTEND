
'use client';

import { useHospital } from '@/context/HospitalProvider';
import { Skeleton } from '@/components/ui/skeleton';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  const { hospitalDashboardDetails, loading, error } = useHospital();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-variant">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-8 bg-card/70 rounded-xl p-4 backdrop-blur-md border border-border/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
              <div>
                <Skeleton className="h-10 w-64 bg-muted" />
                <Skeleton className="h-4 w-48 mt-2 bg-muted" />
              </div>
              <Skeleton className="h-10 w-48 bg-muted" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                  </div>
                  <Skeleton className="h-8 w-32 mt-3 bg-muted" />
                  <Skeleton className="h-3 w-16 mt-2 bg-muted" />
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-card border border-border rounded-lg p-4">
                <Skeleton className="h-6 w-48 bg-muted" />
                <Skeleton className="h-4 w-64 mt-2 bg-muted" />
                <Skeleton className="h-80 w-full mt-4 bg-muted" />
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <Skeleton className="h-6 w-48 bg-muted" />
                <Skeleton className="h-4 w-64 mt-2 bg-muted" />
                <Skeleton className="h-64 w-full mt-4 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/20 to-destructive/30 flex items-center justify-center">
        <div className="bg-card/80 backdrop-blur-md border border-destructive rounded-xl p-8 max-w-md text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive h-8 w-8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Analytics</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!hospitalDashboardDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/20 to-primary/30 flex items-center justify-center">
        <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl p-8 max-w-md text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-8 w-8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">No Data Available</h1>
          <p className="text-muted-foreground">Please ensure you have proper data access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnalyticsDashboard data={hospitalDashboardDetails} />
      </div>
    </div>
  );
}
// Sample data structure - replace with your actual data
const sampleData = {
  "hospitalInfo": {
    "id": "591d3e5e-6e07-4156-b468-242d8ec70d4c",
    "supabaseUserId": "bb672605-ce2e-417d-8735-0c66210c7d9a",
    "name": "Vatsa Medical Center",
    "adminEmail": "raniasmit200204@gmail.com",
    "subdomain": "rani",
    "gstin": "09AAACH7409Q1ZA",
    "address": {
      "city": "kanpur",
      "state": "UP",
      "street": "Kanpur",
      "country": "India",
      "pincode": "123456",
      "district": "Noida"
    },
    "contactInfo": {
      "phone": "7850840336",
      "website": null
    },
    "logo": null,
    "themeColor": "#2563EB",
    "createdAt": "2025-06-08T16:36:26.001Z",
    "establishedDate": "2025-06-08"
  },
  "doctors": [
    {
      "id": "abbbe9fd-7788-4cae-90d5-048da2606465",
      "hospitalId": "591d3e5e-6e07-4156-b468-242d8ec70d4c",
      "name": "Dr. Rani Sharma",
      "specialization": "Cardiology, Neurology",
      "qualification": "MD, MBBS, FRCP",
      "experience": 10,
      "age": 39,
      "phone": "7850840336",
      "email": "raniasmit200204@gmail.com",
      "photo": "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg",
      "aadhar": "8243518000860",
      "status": "active",
      "createdAt": "2025-06-08T16:46:58.405Z",
      "schedules": []
    },
    {
      "id": "baefc5c1-3e62-4ab9-9074-d22382bb8b4c",
      "hospitalId": "591d3e5e-6e07-4156-b468-242d8ec70d4c",
      "name": "Dr. Vatsa Mishra",
      "specialization": "General Medicine",
      "qualification": "MBBS, MD",
      "experience": 12,
      "age": 45,
      "phone": "8529239137",
      "email": "vatsaadityamishra19@gmail.com",
      "photo": "https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg",
      "aadhar": "987654321987",
      "status": "active",
      "createdAt": "2025-06-09T18:10:44.205Z",
      "schedules": []
    }
  ],
  "appointment": {
    "volumeTrends": {
      "daily": {
        "2025-06-07": 4,
        "2025-06-08": 8,
        "2025-06-09": 12,
        "2025-06-10": 15,
        "2025-06-11": 18,
        "2025-06-12": 22,
        "2025-06-13": 20
      },
      "weekly": {
        "2025-W24": 99
      },
      "monthly": {
        "2025-06": 99
      }
    },
    "statusDistribution": {
      "completed": 45,
      "booked": 32,
      "cancelled": 8,
      "no-show": 4
    },
    "doctorPerformance": {
      "abbbe9fd-7788-4cae-90d5-048da2606465": {
        "total": 50,
        "completed": 42,
        "cancelled": 5,
        "doctor": {
          "id": "abbbe9fd-7788-4cae-90d5-048da2606465",
          "name": "Dr. Rani Sharma",
          "specialization": "Cardiology, Neurology"
        }
      },
      "baefc5c1-3e62-4ab9-9074-d22382bb8b4c": {
        "total": 39,
        "completed": 35,
        "cancelled": 3,
        "doctor": {
          "id": "baefc5c1-3e62-4ab9-9074-d22382bb8b4c",
          "name": "Dr. Vatsa Mishra",
          "specialization": "General Medicine"
        }
      }
    },
    "peakHours": {
      "hourly": {
        "9": 15,
        "10": 22,
        "11": 18,
        "14": 20,
        "15": 25,
        "16": 12
      },
      "daily": {
        "1": 18,
        "2": 22,
        "3": 20,
        "4": 25,
        "5": 28,
        "6": 15
      }
    },
    "patientFlow": {
      "new": 45,
      "returning": 44,
      "totalPatients": 89
    },
    "durationAnalysis": {
      "averageScheduled": 15,
      "averageActual": 18,
      "variance": 3
    }
  },
  "revenue": {
    "paymentStatus": {
      "paid": {
        "count": 77,
        "amount": 385000
      },
      "unpaid": {
        "count": 12,
        "amount": 60000
      }
    },
    "paymentMethods": {
      "cash": 25000,
      "card": 180000,
      "upi": 180000
    },
    "revenueTrends": {
      "daily": {
        "2025-06-07": 45000,
        "2025-06-08": 52000,
        "2025-06-09": 48000,
        "2025-06-10": 58000,
        "2025-06-11": 62000,
        "2025-06-12": 55000,
        "2025-06-13": 65000
      },
      "weekly": {},
      "monthly": {}
    }
  },
  "operational": {
    "doctorUtilization": {
      "abbbe9fd-7788-4cae-90d5-048da2606465": {
        "doctor": {
          "id": "abbbe9fd-7788-4cae-90d5-048da2606465",
          "name": "Dr. Rani Sharma",
          "specialization": "Cardiology, Neurology"
        },
        "totalSlots": 100,
        "bookedSlots": 85,
        "completedAppointments": 75,
        "utilization": 85,
        "completionRate": 88.2
      },
      "baefc5c1-3e62-4ab9-9074-d22382bb8b4c": {
        "doctor": {
          "id": "baefc5c1-3e62-4ab9-9074-d22382bb8b4c",
          "name": "Dr. Vatsa Mishra",
          "specialization": "General Medicine"
        },
        "totalSlots": 120,
        "bookedSlots": 95,
        "completedAppointments": 88,
        "utilization": 79.2,
        "completionRate": 92.6
      }
    },
    "scheduleEfficiency": {},
    "patientDemographics": {
      "ageDistribution": {
        "Under 18": 12,
        "18-30": 28,
        "31-50": 35,
        "51-70": 25,
        "Over 70": 15
      },
      "total": 115
    },
    "visitNotesCompletion": {
      "total": 89,
      "withNotes": 76,
      "completionRate": 85.4,
      "byDoctor": {}
    }
  },
  "subscription": {},
  "patientExperience": {
    "waitTime": {
      "averageWaitTime": 12,
      "maxWaitTime": 45,
      "distribution": {
        "onTime": 45,
        "upto15Min": 28,
        "upto30Min": 12,
        "moreThan30Min": 4
      }
    },
    "cancellationPatterns": {
      "total": 8,
      "rate": 9,
      "byReason": {
        "personal": 4,
        "medical": 2,
        "scheduling": 2
      },
      "byTiming": {
        "sameDay": 3,
        "dayBefore": 3,
        "weekBefore": 2
      }
    },
    "retention": {
      "totalPatients": 89,
      "returnRate": 49,
      "visitFrequency": {
        "oneVisit": 45,
        "twoVisits": 25,
        "threeToFive": 15,
        "moreThanFive": 4
      }
    },
    "completionRates": {
      "total": 89,
      "completed": 77,
      "noShow": 4,
      "cancelled": 8,
      "completionRate": 86.5,
      "noShowRate": 4.5,
      "cancellationRate": 9
    }
  }
};
