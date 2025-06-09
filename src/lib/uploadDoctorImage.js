// uploadDoctorImage.js
import supabase from './supabase';
import { getCurrentUser } from './auth';

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} hospitalName - The hospital name for folder structure
 * @param {string} doctorName - The doctor's name
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export async function uploadDoctorImage(file, hospitalName, doctorName) {
  if (!file) throw new Error('No file provided');

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, JPG, PNG, and WebP images are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const cleanHospitalName = hospitalName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${cleanHospitalName}/doctor-image/${doctorName}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('doctor-pics')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, 
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('doctor-pics')
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Failed to get public URL');
  }

  return publicUrlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage using public URL
 * @param {string} publicUrl - The public URL of the image
 * @returns {Promise<void>}
 */
export async function deleteDoctorImage(publicUrl) {
  if (!publicUrl) return;

  const urlParts = publicUrl.split('/doctor-pics/');
  if (urlParts.length !== 2) throw new Error('Invalid public URL format');

  const filePath = urlParts[1];
  const { error } = await supabase.storage
    .from('doctor-pics')
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}