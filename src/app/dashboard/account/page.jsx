'use client';

import { useState } from 'react';
import { useHospital } from '@/context/HospitalProvider';
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
      <div className="min-h-screen p-6 bg-red-100 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold text-red-600">Error Loading Hospital Details</h2>
          <p className="mt-2 text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen px-8 py-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Hospital Account</h1>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            Edit Details
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-12">
          {/* Hospital Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Hospital Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="Hospital Name" value={hospitalDetails?.name} />
              <Info label="GSTIN" value={hospitalDetails?.gstin || '-'} />
              <Info
                label="Established Date"
                value={
                  hospitalDetails?.establishedDate
                    ? new Date(hospitalDetails.establishedDate).toLocaleDateString()
                    : '-'
                }
              />
            </div>
          </section>

          {/* Address Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="Street Address" value={hospitalDetails?.address?.street || '-'} />
              <Info label="City" value={hospitalDetails?.address?.city || '-'} />
              <Info label="District" value={hospitalDetails?.address?.district || '-'} />
              <Info label="State" value={hospitalDetails?.address?.state || '-'} />
              <Info label="PIN Code" value={hospitalDetails?.address?.pincode || '-'} />
              <Info label="Country" value={hospitalDetails?.address?.country || 'India'} />
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="Phone Number" value={hospitalDetails?.contactInfo?.phone || '-'} />
              <Info
                label="Website"
                value={
                  hospitalDetails?.contactInfo?.website ? (
                    <a
                      href={hospitalDetails.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {hospitalDetails.contactInfo.website}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
            </div>
          </section>
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
  );
}

function Info({ label, value }) {
  return (
    <div>
      <h3 className="text-sm font-medium">{label}</h3>
      <p className="mt-1 text-lg">{value}</p>
    </div>
  );
}