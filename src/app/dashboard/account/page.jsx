'use client';

import { useState } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import EditHospitalDetailsForm from '@/components/forms/edit-hospital-details-form';
import { Calendar, Building2, MapPin, Phone, Globe, FileText, Hash, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  const { hospitalDetails, loading, error } = useHospital();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-scree">
        <div className="text-center">
          <Spinner className="h-10 w-10" />
          <p className="mt-4 font-medium">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full border-destructive/30 shadow-lg">
          <CardHeader className="bg-destructive/10 border-b border-destructive/20">
            <CardTitle className="flex items-center text-destructive gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Hospital Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-destructive">{error.message}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  
  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className=" rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center border-b pb-5 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Hospital Profile</h1>
              <p className=" mt-1">Manage your hospital's details and information</p>
            </div>
            {!isEditing && (
              <Button 
                onClick={handleEdit} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-8">
              {/* Hospital Information */}
              <Card className="border shadow-sm">
                <CardHeader className=" border-b py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Hospital Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Info 
                      icon={<Building2 className="h-5 w-5 text-primary" />}
                      label="Hospital Name" 
                      value={hospitalDetails?.name} 
                    />
                    <Info 
                      icon={<FileText className="h-5 w-5 text-primary" />}
                      label="GSTIN" 
                      value={hospitalDetails?.gstin || '-'} 
                    />
                    <Info
                      icon={<Calendar className="h-5 w-5 text-primary" />}
                      label="Established Date"
                      value={
                        hospitalDetails?.establishedDate
                          ? new Date(hospitalDetails.establishedDate).toLocaleDateString()
                          : '-'
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="border shadow-sm">
                <CardHeader className="border-b  py-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Info 
                      icon={<MapPin className="h-5 w-5 text-primary" />}
                      label="Street Address" 
                      value={hospitalDetails?.address?.street || '-'} 
                    />
                    <Info 
                      icon={<Building2 className="h-5 w-5 text-primary" />}
                      label="City" 
                      value={hospitalDetails?.address?.city || '-'} 
                    />
                    <Info 
                      icon={<MapPin className="h-5 w-5 text-primary" />}
                      label="District" 
                      value={hospitalDetails?.address?.district || '-'} 
                    />
                    <Info 
                      icon={<MapPin className="h-5 w-5 text-primary" />}
                      label="State" 
                      value={hospitalDetails?.address?.state || '-'} 
                    />
                    <Info 
                      icon={<Hash className="h-5 w-5 text-primary" />}
                      label="PIN Code" 
                      value={hospitalDetails?.address?.pincode || '-'} 
                    />
                    <Info 
                      icon={<Globe className="h-5 w-5 text-primary" />}
                      label="Country" 
                      value={hospitalDetails?.address?.country || 'India'} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border shadow-sm">
                <CardHeader className=" border-b   py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Info 
                      icon={<Phone className="h-5 w-5 text-primary" />}
                      label="Phone Number" 
                      value={hospitalDetails?.contactInfo?.phone || '-'} 
                    />
                    <Info
                      icon={<Globe className="h-5 w-5 text-primary" />}
                      label="Website"
                      value={
                        hospitalDetails?.contactInfo?.website ? (
                          <a
                            href={hospitalDetails.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {hospitalDetails.contactInfo.website}
                          </a>
                        ) : (
                          '-'
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Hospital Details</DialogTitle>
                  <DialogDescription>
                    Update your hospital's information using the form below.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <EditHospitalDetailsForm onSuccess={() => setIsEditing(false)} />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="p-4 rounded-md border  shadow-black transition-all duration-500 ease-in-out 
      hover:shadow-lg hover:border-white/30 dark:hover:border-collapse dark:bg-black/5
      dark:hover:shadow-white">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium">{label}</h3>
      </div>
      <div className="mt-1">
        {typeof value === 'string' || typeof value === 'number' ? (
          <p className="text-base font-medium">{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  );
}