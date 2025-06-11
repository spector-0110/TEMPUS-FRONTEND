'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { uploadDoctorImage, deleteDoctorImage,  } from '@/lib/uploadDoctorImage';

const DoctorDetailsEditor = ({ doctor, onSave, onCancel, isLoading = false }) => {


  const isEditMode = doctor && doctor.id;
  const [hospitalDetails, setHospitalDetails] = useState(null);
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Reset submitting state when external loading state changes
  useEffect(() => {
    if (!isLoading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [isLoading, isSubmitting]);

   useEffect(() => {
    const storedDetails = localStorage.getItem('hospitalDetails');
    if (storedDetails) {
      try {
        const parsed = JSON.parse(storedDetails);
        setHospitalDetails(parsed);
      } catch (error) {
        console.error('Error parsing hospital details:', error);
      }
    } else {
      console.warn('No hospital details found in localStorage');
    }
  }, []);
  
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
  
  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Check if data has changed
  const hasDataChanged = () => {
    if (!isEditMode || !originalData) return true;
    
    // If a new file is selected, consider it as a change
    if (selectedFile) return true;
    
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
    
    // For experience validation based on age
    if (name === 'experience') {
      const currentAge = doctorData.age;
      // Assuming someone starts working at age 18 at the earliest
      const maxPossibleExperience = currentAge ? currentAge - 18 : null;
      
      if (maxPossibleExperience !== null && parsedValue > maxPossibleExperience) {
        // Alert the user about invalid experience value
        alert(`Experience cannot exceed ${maxPossibleExperience} years based on the doctor's age of ${currentAge}`);
        // Return early without updating state
        return;
      }
    }
    
    // For age validation based on experience
    if (name === 'age') {
      const currentExperience = doctorData.experience;
      const minimumAge = currentExperience ? currentExperience + 18 : 18;
      
      if (parsedValue < minimumAge && currentExperience) {
        // Alert the user about invalid age value
        alert(`Age must be at least ${minimumAge} years based on ${currentExperience} years of experience`);
        // Return early without updating state
        return;
      }
    }
    
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
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, JPG, PNG, and WebP images are allowed');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
      if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // reset the input value to allow re-uploading the same file
    e.target.value = '';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if no changes in edit mode and no file selected
    if (isEditMode && !hasDataChanged() && !selectedFile) {
      console.log('No changes detected, not submitting');
      return;
    }
    
    // Set submitting state to disable button
    setIsSubmitting(true);
    setIsUploading(selectedFile ? true : false);
    
    try {
      let photoUrl = doctorData.photo;
      
      // Upload image if a new file is selected
      if (selectedFile) {
        try {
          // Delete previous image if in edit mode and the doctor has a custom photo
          if (isEditMode && doctorData.photo && !doctorData.photo.includes('/doctor.png')) {
            try {
              await deleteDoctorImage(doctorData.photo);
            } catch (deleteError) {
              console.error('Failed to delete previous image:', deleteError);
            }
          }
          
          photoUrl = await uploadDoctorImage(
            selectedFile,
            hospitalDetails.subdomain,
            doctorData.name || 'unnamed-doctor'
          );
        } catch (error) {
          console.error('Image upload failed:', error);
          
          alert(`Image upload failed: ${error.message}. Check console for details.`);
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
      }

      setIsUploading(false);
      
      // Ensure numeric fields are properly typed before submitting
      // Remove id field from doctorData before creating formattedData
      const { id, ...doctorDataWithoutId } = doctorData;
      const formattedData = {
        ...doctorDataWithoutId,
        photo: photoUrl, // Use the uploaded URL or existing photo
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

      
      // Call the parent's onSave function
      await onSave(formattedData);
      
      // Clear selected file after successful submission
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
    } catch (error) {
      console.error('Submit failed:', error);
      alert(`Submit failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };
  
  // Determine if submit button should be disabled
  const isSubmitDisabled = isSubmitting || isLoading || (isEditMode && !hasDataChanged() && !selectedFile);
  
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
            maxLength={10}
            type="number"
            pattern="[0-9]{10}"
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
            max={doctorData.age ? doctorData.age - 18 : ""}
            value={doctorData.experience}
            onChange={handleChange}
            placeholder="10"
            required
          />
          {doctorData.age && (
            <p className="text-xs text-gray-500">
              Maximum: {doctorData.age - 18} years (based on current age)
            </p>
          )}
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
          <Label htmlFor="aadhar">Aadhar Number</Label>
          <Input
            id="aadhar"
            name="aadhar"
            value={doctorData.aadhar}
            onChange={handleChange}
            placeholder="XXXX XXXX XXXX"
            pattern="[0-9]{12}"
            title="Aadhar number must be exactly 12 digits"
            maxLength={12}
          />
        </div>
        
       <div className="space-y-2">
          <Label htmlFor="photo">Photo</Label>
          <div className="space-y-2">
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
            />
            {isUploading && (
              <div className="text-sm text-blue-600">
                Processing image...
              </div>
            )}
            {/* Image Preview */}
            <div className="mt-2">
              <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={previewUrl || doctorData.photo || '/doctor.png'}
                  alt="Doctor preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/doctor.png';
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Max file size: 5MB. Supported formats: JPEG, PNG, WebP
              </p>
            </div>
          </div>
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
      {isEditMode && !hasDataChanged() && !selectedFile && (
        <div className="text-sm text-muted-foreground text-center py-2">
          No changes detected. Make changes to enable save.
        </div>
      )}
      
      {/* Show message when image is uploading
      {isUploading && (
        <div className="text-sm text-blue-600 text-center py-2">
          Please wait while the image is being uploaded...
        </div>
      )}
       */}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitDisabled}
          className={isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          {(isSubmitting || isLoading || isUploading)
            ? (isEditMode ? 'Saving...' : 'Adding...') 
            : (isEditMode ? 'Save Changes' : 'Add Doctor')
          }
        </Button>
      </DialogFooter>
    </form>
  );
};

export default DoctorDetailsEditor;
