'use client';

import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

interface ImageUploadProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
  completed: boolean;
}

interface UseImageManagerOptions {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
}

export function useImageManager(options: UseImageManagerOptions = {}) {
  const {
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxFiles = 5
  } = options;

  const [uploads, setUploads] = useState<ImageUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Validate file before upload
  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the maximum size of ${(maxFileSize / 1024 / 1024).toFixed(2)}MB`;
    }
    
    return null;
  }, [allowedTypes, maxFileSize]);

  // Upload single image
  const uploadImage = useCallback(async (file: File, type: 'product' | 'category' = 'product') => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      const uploadMethod = type === 'product' 
        ? apiService.uploadProductImage.bind(apiService)
        : apiService.uploadCategoryImage.bind(apiService);
      
      const response = await uploadMethod(file);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }, [validateFile]);

  // Upload multiple images with progress tracking
  const uploadImages = useCallback(async (files: File[], type: 'product' | 'category' = 'product') => {
    if (files.length === 0) return [];
    
    if (files.length > maxFiles) {
      throw new Error(`Cannot upload more than ${maxFiles} files at once`);
    }

    // Validate all files first
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(`${file.name}: ${validationError}`);
      }
    }

    setIsUploading(true);
    setUploads(files.map(file => ({ file, progress: 0, completed: false })));

    try {
      const results = await Promise.allSettled(
        files.map(async (file, index) => {
          try {
            // Update progress to show start
            setUploads(prev => prev.map((upload, i) => 
              i === index ? { ...upload, progress: 25 } : upload
            ));

            const result = await uploadImage(file, type);

            // Update progress to show completion
            setUploads(prev => prev.map((upload, i) => 
              i === index ? { 
                ...upload, 
                progress: 100, 
                url: result.url, 
                completed: true 
              } : upload
            ));

            return result;
          } catch (error) {
            // Update progress to show error
            setUploads(prev => prev.map((upload, i) => 
              i === index ? { 
                ...upload, 
                progress: 0, 
                error: error instanceof Error ? error.message : 'Upload failed',
                completed: false
              } : upload
            ));
            throw error;
          }
        })
      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      const failed = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (failed.length > 0) {
        console.warn(`${failed.length} uploads failed:`, failed);
      }

      return successful;
    } finally {
      setIsUploading(false);
      // Clear upload progress after a delay
      setTimeout(() => setUploads([]), 3000);
    }
  }, [validateFile, uploadImage, maxFiles]);

  // Optimize image for different use cases
  const optimizeImage = useCallback(async (imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}) => {
    try {
      const response = await apiService.optimizeImage(imageUrl, options);
      return response.success ? response.data : { url: imageUrl };
    } catch (error) {
      console.error('Image optimization failed:', error);
      return { url: imageUrl, error: 'Optimization failed' };
    }
  }, []);

  // Delete image
  const deleteImage = useCallback(async (imageId: string, type: 'product' | 'category' = 'product') => {
    try {
      const response = await apiService.deleteImage(imageId, type);
      return response.success;
    } catch (error) {
      console.error('Image deletion failed:', error);
      return false;
    }
  }, []);

  // Get image metadata
  const getImageMetadata = useCallback(async (imageUrl: string) => {
    try {
      const response = await apiService.getImageMetadata(imageUrl);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get image metadata:', error);
      return null;
    }
  }, []);

  // Generate responsive image URLs
  const generateResponsiveUrls = useCallback((baseUrl: string) => {
    const sizes = [
      { suffix: '_thumb', width: 150, height: 150 },
      { suffix: '_small', width: 300, height: 300 },
      { suffix: '_medium', width: 600, height: 600 },
      { suffix: '_large', width: 1200, height: 1200 }
    ];

    return sizes.reduce((acc, size) => {
      acc[size.suffix.replace('_', '')] = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}w=${size.width}&h=${size.height}&fit=crop&auto=format`;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  // Clear uploads state
  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    // State
    uploads,
    isUploading,
    
    // Methods
    uploadImage,
    uploadImages,
    optimizeImage,
    deleteImage,
    getImageMetadata,
    generateResponsiveUrls,
    validateFile,
    clearUploads,
    
    // Utilities
    maxFileSize,
    allowedTypes,
    maxFiles
  };
}
