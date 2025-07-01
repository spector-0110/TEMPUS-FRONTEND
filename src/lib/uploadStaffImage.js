import { createClient } from "@/utils/supabase/client";

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} hospitalName - The hospital name for folder structure
 * @param {string} staff - The staff's name
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export async function uploadStaffImage(file, hospitalName, staffName) {
  if (!file) throw new Error('No file provided');
  const supabase = createClient();

  try{

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, JPG, PNG, and WebP images are allowed');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const cleanHospitalName = hospitalName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${cleanHospitalName}/staff-image/${staffName}/${fileName}`;


    // Add timeout to upload operation
    const uploadPromise = supabase.storage
      .from('staff-pics')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, 
      });
    
    const uploadTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload operation timed out after 30 seconds')), 30000);
    });
    
    const { data, error } = await Promise.race([uploadPromise, uploadTimeoutPromise]);

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } =supabase.storage
      .from('staff-pics')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return publicUrlData.publicUrl;

  }catch (error) {
    console.error('Error in uploadStaffImage:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Delete an image from Supabase Storage using public URL
 * @param {string} publicUrl - The public URL of the image
 * @returns {Promise<void>}
 */
export async function deleteStaffImage(publicUrl) {
  if (!publicUrl) return;
  const supabase = createClient();


  try {
    const urlParts = publicUrl.split('/staff-pics/');
    if (urlParts.length !== 2) {
      console.error('Invalid URL format for deletion:', publicUrl);
      throw new Error('Invalid public URL format');
    }

    const filePath = urlParts[1];
    
    // Add timeout to delete operation
    const deletePromise = supabase.storage
      .from('staff-pics')
      .remove([filePath]);
    
    const deleteTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Delete operation timed out after 10 seconds')), 10000);
    });
    
    const deleteResult = await Promise.race([deletePromise, deleteTimeoutPromise]);
    
    if (deleteResult.error) {
      console.error('Delete error details:', deleteResult.error);
      throw new Error(`Delete failed: ${deleteResult.error.message}`);
    }
    console.log('Image successfully deleted');

  } catch (error) {
    console.error('Error in deleteStaffImage:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Delete process failed: ${error.message}`);
  }
}