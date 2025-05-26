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
  const activeDoctors = doctors.filter(doctor => doctor.status === 'active');

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
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-700 mb-3">
              No Active Doctors Available
            </CardTitle>
            <p className="text-gray-500 text-base leading-relaxed max-w-md mx-auto">
              Unfortunately, there are no active doctors available for appointments at this time. 
              Please try again later or contact support for assistance.
            </p>
            <div className="mt-6 px-4 py-2 bg-amber-100 rounded-full inline-block">
              <span className="text-amber-700 text-sm font-medium">
                All doctors are currently unavailable
              </span>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Patient Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Choose Your Doctor
          </CardTitle>
          <p className="text-gray-600 mt-3 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Select from our available doctors. All listed doctors are currently accepting appointments and ready to provide excellent care.
          </p>
          <div className="mt-4 px-4 py-2 bg-blue-100 rounded-full inline-block">
            <span className="text-blue-700 text-sm font-medium">
              {activeDoctors.length} {activeDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 md:px-8">
          {/* Doctors Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100">
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
                <div className={`relative overflow-hidden rounded-xl border-2 p-4 sm:p-6 transition-all duration-300 ${
                  selectedDoctor?.id === doctor.id 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl ring-4 ring-blue-200/50' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50/30'
                }`}>
                  
                  {/* Selection Glow Effect */}
                  {selectedDoctor?.id === doctor.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-600/10 rounded-xl" />
                  )}
                  
                  <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Doctor Photo */}
                    <div className="relative flex-shrink-0">
                      <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden transition-all duration-300 ${
                        selectedDoctor?.id === doctor.id 
                          ? 'ring-4 ring-blue-300 shadow-lg' 
                          : 'ring-2 ring-gray-200 group-hover:ring-blue-200 group-hover:shadow-md'
                      }`}>
                        {doctor.photo && doctor.photo !== "/doctor.png" ? (
                          <img 
                            src={doctor.photo} 
                            alt={doctor.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <User size={32} className="text-blue-600" />
                          </div>
                        )}
                      </div>
                      
                      {/* Selection Indicator */}
                      {selectedDoctor?.id === doctor.id && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full p-2 shadow-lg animate-bounce">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      {/* Available Status Indicator */}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-md">
                        <div className="h-2 w-2 bg-white rounded-full" />
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-800 truncate mb-1 sm:mb-0">
                          Dr. {doctor.name}
                        </h3>
                        <Badge 
                          className="bg-green-100 text-green-700 border-green-200 font-medium self-center sm:self-auto"
                        >
                          Available
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-center sm:justify-start text-sm font-medium text-blue-600">
                          <Stethoscope className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{doctor.specialization}</span>
                        </div>
                        
                        {doctor.qualification && (
                          <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                            <Award className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{doctor.qualification}</span>
                          </div>
                        )}
                        
                        {doctor.experience && (
                          <div className="text-sm text-gray-500 font-medium">
                            {doctor.experience} years experience
                          </div>
                        )}
                        
                        {/* Additional Info Badge */}
                        <div className="flex justify-center sm:justify-start">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Accepting New Patients
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons
          <div className="flex flex-col sm:flex-row gap-3 pt-6 sm:pt-8">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Patient Details
            </Button>
            
            <Button 
              onClick={onNext}
              disabled={!isSelectionValid() || isLoading}
              className={`flex-1 h-12 text-base font-medium transition-all duration-200 ${
                isSelectionValid() && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                  : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Loading Available Slots...
                </>
              ) : (
                'Continue to Time Selection'
              )}
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSelector;
