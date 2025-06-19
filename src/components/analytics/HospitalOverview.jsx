'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Globe, MapPin, Phone, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HospitalOverview({ data }) {
  const { hospitalInfo, doctors } = data;
  const activeDoctors = doctors?.filter(doctor => doctor.status === 'active').length || 0;
  const totalDoctors = doctors?.length || 0;
  
  // Calculate hospital age
  const establishedDate = hospitalInfo?.establishedDate ? new Date(hospitalInfo.establishedDate) : new Date();
  const currentDate = new Date();
  const yearsDiff = hospitalInfo?.establishedDate ? 
    currentDate.getFullYear() - establishedDate.getFullYear() : 0;
  
  const overviewCards = [
    {
      title: 'Hospital Name',
      value: hospitalInfo?.name || 'N/A',
      icon: Building2,
      color: 'from-primary to-primary-hover',
      description: hospitalInfo?.establishedDate ? `Est. ${establishedDate.getFullYear()}` : 'Not specified'
    },
    {
      title: 'Active Doctors',
      value: `${activeDoctors}/${totalDoctors}`,
      icon: Users,
      color: 'from-green-500 to-green-600',
      description: totalDoctors > 0 ? `${Math.round((activeDoctors / totalDoctors) * 100)}% active` : 'No doctors'
    },
    {
      title: 'Location',
      value: hospitalInfo?.address ? `${hospitalInfo.address.city || 'N/A'}, ${hospitalInfo.address.state || 'N/A'}` : 'N/A',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      description: hospitalInfo?.address?.district || 'Not specified'
    },
    {
      title: 'Hospital Age',
      value: yearsDiff > 0 ? `${yearsDiff} years` : 'New',
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      description: 'Since establishment'
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
          Hospital Overview
        </h2>
        <p className="text-muted-foreground">
          Essential information and key metrics for your hospital
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 bg-gradient-to-br ${card.color} text-card-foreground rounded p-1`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-card-elevated/60 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Hospital Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="text-foreground">{hospitalInfo.contactInfo.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="text-foreground">{hospitalInfo.adminEmail}</span>
                  </div>
                  {hospitalInfo.contactInfo.website && (
                    <div>
                      <span className="text-muted-foreground">Website: </span>
                      <a 
                        href={hospitalInfo.contactInfo.website}
                        className="text-primary hover:text-primary/80 hover:underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {hospitalInfo.contactInfo.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>
                <div className="text-sm text-muted-foreground">
                  <div>{hospitalInfo.address.street}</div>
                  <div>{hospitalInfo.address.city}, {hospitalInfo.address.district}</div>
                  <div>{hospitalInfo.address.state} - {hospitalInfo.address.pincode}</div>
                  <div>{hospitalInfo.address.country}</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Additional Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subdomain: </span>
                    <Badge variant="secondary">{hospitalInfo.subdomain}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GSTIN: </span>
                    <span className="text-foreground font-mono">{hospitalInfo.gstin}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Theme Color: </span>
                    <div className="inline-flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: hospitalInfo.themeColor }}
                      />
                      <span className="text-foreground font-mono">{hospitalInfo.themeColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
