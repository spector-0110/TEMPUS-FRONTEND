'use client';

import { useState } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/Spinner';
import EditHospitalDetailsForm from '@/components/forms/edit-hospital-details-form';

export default function AccountPage() {
  const { hospitalDetails, loading, error } = useHospital();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-6 bg-red-50">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Hospital Details</h2>
          <p className="mt-2 text-red-500">{error.message}</p>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hospital Account</h1>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            Edit Details
          </Button>
        )}
      </div>

      {!isEditing ? (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Main Information */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4">Hospital Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Hospital Name</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">GSTIN</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.gstin || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Established Date</h3>
                  <p className="mt-1 text-lg">
                    {hospitalDetails?.establishedDate 
                      ? new Date(hospitalDetails.establishedDate).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Street Address</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.address?.street || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">City</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.address?.city || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">District</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.address?.district || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">State</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.address?.state || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">PIN Code</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.address?.pincode || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Country</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.address?.country || 'India'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p className="mt-1 text-lg">{hospitalDetails?.contactInfo?.phone || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Website</h3>
                  <p className="mt-1 text-lg">
                    {hospitalDetails?.contactInfo?.website ? (
                      <a 
                        href={hospitalDetails.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {hospitalDetails.contactInfo.website}
                      </a>
                    ) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
  );
}