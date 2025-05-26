'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

/**
 * Component for editing doctor details
 * @param {Object} doctor - The doctor object to edit (null for create mode)
 * @param {Function} onSave - Callback function when saving doctor data
 * @param {Function} onCancel - Callback function when cancelling
 * @param {boolean} isLoading - External loading state from parent component
 */
const DoctorDetailsEditor = ({ doctor, onSave, onCancel, isLoading = false }) => {
  const isEditMode = doctor && doctor.id;
  const [doctorData, setDoctorData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: null, 
    age: null, 
    photo: '/doctor.png', // Default photo URL
    aadhar: '',
    ...(isEditMode ? { status: 'active' } : {}) // Only include status in edit mode
  });
  
  // Store original data for comparison in edit mode
  const [originalData, setOriginalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset submitting state when external loading state changes
  useEffect(() => {
    if (!isLoading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [isLoading, isSubmitting]);
  
  useEffect(() => {
    if (doctor) {
      const formattedDoctor = {
        id: doctor.id,
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        experience: typeof doctor.experience === 'number' ? doctor.experience : 
                   doctor.experience ? parseInt(doctor.experience, 10) : null,
        age: typeof doctor.age === 'number' ? doctor.age : 
             doctor.age ? parseInt(doctor.age, 10) : null,
        photo: doctor.photo || '/doctor.png',
        aadhar: doctor.aadhar || '',
        ...(isEditMode ? { status: doctor.status || 'active' } : {})
      };
      
      setDoctorData(formattedDoctor);
      
      // Store original data for comparison in edit mode
      if (isEditMode) {
        setOriginalData(formattedDoctor);
      }
    }
  }, [doctor, isEditMode]);
  
  // Check if data has changed
  const hasDataChanged = () => {
    if (!isEditMode || !originalData) return true;
    
    const fieldsToCompare = ['name', 'email', 'phone', 'specialization', 'qualification', 'experience', 'age', 'photo', 'aadhar', 'status'];
    
    return fieldsToCompare.some(field => {
      const original = originalData[field];
      const current = doctorData[field];
      
      // Handle null/empty comparisons for numeric fields
      if (field === 'experience' || field === 'age') {
        const originalValue = original === null || original === '' ? null : Number(original);
        const currentValue = current === null || current === '' ? null : Number(current);
        return originalValue !== currentValue;
      }
      
      return original !== current;
    });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset submitting state when user makes changes after submission
    if (isSubmitting) {
      setIsSubmitting(false);
    }
    
    // Convert numeric fields to actual numbers
    if (name === 'experience' || name === 'age') {
      const parsedValue = value === '' ? '' : parseInt(value, 10);
      setDoctorData(prev => ({
        ...prev,
        [name]: parsedValue
      }));
    } else {
      setDoctorData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent submission if no changes in edit mode
    if (isEditMode && !hasDataChanged()) {
      console.log('No changes detected, not submitting');
      return;
    }
    
    // Set submitting state to disable button
    setIsSubmitting(true);
    
    // Ensure numeric fields are properly typed before submitting
    // Remove id field from doctorData before creating formattedData
    const { id, ...doctorDataWithoutId } = doctorData;
    const formattedData = {
      ...doctorDataWithoutId,
      doctor_id: id, // Add doctor_id from the existing id
      experience: doctorData.experience === '' || doctorData.experience === null ? 0 : 
           typeof doctorData.experience === 'number' ? doctorData.experience : 
           parseInt(doctorData.experience, 10),
      age: doctorData.age === '' || doctorData.age === null ? 30 : 
         typeof doctorData.age === 'number' ? doctorData.age : 
         parseInt(doctorData.age, 10)
    };

    // If creating a new doctor, exclude the status field
    if (!isEditMode) {
      delete formattedData.status;
      delete formattedData.doctor_id;
    }
  
    console.log('Submitting doctor data:', formattedData);
    
    onSave(formattedData);
  };
  
  // Determine if submit button should be disabled
  const isSubmitDisabled = isSubmitting || isLoading || (isEditMode && !hasDataChanged());
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={doctorData.name}
            onChange={handleChange}
            placeholder="Dr. Full Name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={doctorData.email}
            onChange={handleChange}
            placeholder="doctor@example.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={doctorData.phone}
            onChange={handleChange}
            placeholder="XXXXXXXXXX"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            name="specialization"
            value={doctorData.specialization}
            onChange={handleChange}
            placeholder="Cardiology, Neurology, etc."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification</Label>
          <Input
            id="qualification"
            name="qualification"
            value={doctorData.qualification}
            onChange={handleChange}
            placeholder="MD, MBBS, etc."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experience">Experience (years)</Label>
          <Input
            id="experience"
            name="experience"
            type="number"
            min="0"
            value={doctorData.experience}
            onChange={handleChange}
            placeholder="10"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            min="18"
            value={doctorData.age}
            onChange={handleChange}
            placeholder="45"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="photo">Photo URL</Label>
          <Input
            id="photo"
            name="photo"
            type="url"
            value={doctorData.photo}
            onChange={handleChange}
            placeholder="https://example.com/doctor-photo.jpg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="aadhar">Aadhar Number</Label>
          <Input
            id="aadhar"
            name="aadhar"
            value={doctorData.aadhar}
            onChange={handleChange}
            placeholder="XXXX XXXX XXXX"
          />
        </div>
        
        {isEditMode && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={doctorData.status || 'active'}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-input bg-background"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Show message when no changes detected in edit mode */}
      {isEditMode && !hasDataChanged() && (
        <div className="text-sm text-muted-foreground text-center py-2">
          No changes detected. Make changes to enable save.
        </div>
      )}
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitDisabled}
          className={isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          {(isSubmitting || isLoading)
            ? (isEditMode ? 'Saving...' : 'Adding...') 
            : (isEditMode ? 'Save Changes' : 'Add Doctor')
          }
        </Button>
      </DialogFooter>
    </form>
  );
};

export default DoctorDetailsEditor;
