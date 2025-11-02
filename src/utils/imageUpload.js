/**
 * Image Upload Utilities
 * Handles image uploads to Supabase Storage
 */

import { supabase } from '../config/supabase';

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User wallet address for unique file naming
 * @returns {Promise<string>} - Public URL of uploaded image or base64 data URL
 */
export const uploadProfileImage = async (file, userId) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, WebP, or GIF');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB');
    }

    // Try Supabase Storage first
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars') // bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Replace if exists
        });

      if (error) {
        // If bucket doesn't exist, throw to fallback
        if (error.message.includes('Bucket not found')) {
          console.warn('⚠️ Supabase Storage bucket "avatars" not found. Using base64 fallback.');
          throw new Error('BUCKET_NOT_FOUND');
        }
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (storageError) {
      // Fallback: Convert to base64 and store in database
      if (storageError.message === 'BUCKET_NOT_FOUND') {
        console.log('📦 Using base64 storage fallback...');
        const base64 = await fileToBase64(file);
        return base64; // Return base64 data URL
      }
      throw storageError;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Full URL of image to delete
 */
export const deleteProfileImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf('avatars');
    if (bucketIndex === -1) return;

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

/**
 * Convert File to base64 for preview
 * @param {File} file - Image file
 * @returns {Promise<string>} - Base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
