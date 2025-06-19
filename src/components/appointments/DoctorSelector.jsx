'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { User, Stethoscope, Award, ChevronLeft, Check } from 'lucide-react';

/**
 * Doctor Selector Component
 * Step 2 of the appointment booking flow
 */
const DoctorSelector = ({ 
  doctors = [], 
  selectedDoctor, 
  onDoctorSelect, 
  onNext, 
  onBack,
  isLoading = false 
}) => {
  // Filter to only show active doctors
  const activeDoctors = doctors;

  const handleDoctorSelect = (doctor) => {
    onDoctorSelect(doctor);
  };

  const isSelectionValid = () => {
    return selectedDoctor && selectedDoctor.id;
  };

  if (activeDoctors.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg">
              <Stethoscope className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mb-3">
              No Active Doctors Available
            </CardTitle>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
              Unfortunately, there are no active doctors available for appointments at this time. 
              Please try again later or contact support for assistance.
            </p>
            <div className="mt-6 px-4 py-2 bg-amber-100 rounded-full inline-block">
              <span className="text-warning text-sm font-medium">
                All doctors are currently unavailable
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 md:px-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-surface/30">
        <CardHeader className="text-center pb-3 pt-4 sm:pb-6 sm:pt-8">
          <div className="mx-auto mb-2 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
            <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            Choose Your Doctor
          </CardTitle>
          <p className="text-muted-foreground mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed px-2">
            Select from our available doctors. All listed doctors are currently accepting appointments and ready to provide excellent care.
          </p>
          <div className="mt-2 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-full inline-block">
            <span className="text-primary text-xs sm:text-sm font-medium">
              {activeDoctors.length} {activeDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="px-2 sm:px-6 md:px-8 max-h-[70vh] overflow-y-auto">          {/* Doctors Grid - Highly Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-2 sm:gap-4 lg:gap-6 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-muted/10">
            {activeDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`group cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] ${
                  selectedDoctor?.id === doctor.id 
                    ? 'scale-[1.02]' 
                    : 'hover:shadow-xl'
                }`}
                onClick={() => handleDoctorSelect(doctor)}
              >
                <div className={`relative overflow-hidden rounded-lg sm:rounded-xl border-2 p-2 sm:p-4 lg:p-6 transition-all duration-300 ${
                  selectedDoctor?.id === doctor.id 
                    ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl ring-2 sm:ring-4 ring-primary/50' 
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-lg group-hover:bg-gradient-to-br group-hover:from-card group-hover:to-primary/5'
                }`}>
                  
                  {/* Selection Glow Effect */}
                  {selectedDoctor?.id === doctor.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-hover/10 rounded-lg sm:rounded-xl" />
                  )}
                  
                  <div className="relative flex flex-col items-center space-y-2 sm:space-y-3">
                    {/* Doctor Photo */}
                    <div className="relative flex-shrink-0">
                      <div className={`h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full overflow-hidden transition-all duration-300 ${
                        selectedDoctor?.id === doctor.id 
                          ? 'ring-3 sm:ring-4 ring-blue-300 shadow-lg' 
                          : 'ring-2 ring-gray-200 group-hover:ring-blue-200 group-hover:shadow-md'
                      }`}>
                        {doctor.photo && doctor.photo !== "/doctor.png" ? (
                          <img 
                            src={doctor.photo} 
                            alt={doctor.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-muted to-muted-hover flex items-center justify-center">
                            <User size={20} className="sm:hidden text-primary" />
                            <User size={24} className="hidden sm:block lg:hidden text-primary" />
                            <User size={32} className="hidden lg:block text-primary" />
                          </div>
                        )}
                      </div>
                      
                      {/* Selection Indicator */}
                      {selectedDoctor?.id === doctor.id && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-success to-success-hover rounded-full p-1 sm:p-2 shadow-lg animate-bounce">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success-foreground" />
                        </div>
                      )}
                      
                      {/* Available Status Indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-success rounded-full p-1 sm:p-1.5 shadow-md">
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-success-foreground rounded-full" />
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="flex-1 min-w-0 text-center">
                      <div className="mb-1 sm:mb-2">
                        <h3 className="font-bold text-sm sm:text-lg lg:text-xl text-foreground truncate">
                          Dr. {doctor.name}
                        </h3>
                        <Badge 
                          className="bg-success/10 text-success border-success/20 font-medium mt-1 text-xs sm:text-sm"
                        >
                          Available
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center justify-center text-xs sm:text-sm font-medium text-primary">
                          <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="truncate">{doctor.specialization}</span>
                        </div>
                        
                        {doctor.qualification && (
                          <div className="flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-warning flex-shrink-0" />
                            <span className="truncate">{doctor.qualification}</span>
                          </div>
                        )}
                        
                        {doctor.experience && (
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                            {doctor.experience} years experience
                          </div>
                        )}
                        
                        {/* Additional Info Badge */}
                        <div className="flex justify-center">
                          <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            New Patients
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSelector;
