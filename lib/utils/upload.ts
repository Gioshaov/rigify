import { createClient } from '@/lib/supabase/client'

export type UploadResult = {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param path - The storage path (e.g., "business-id/cover.jpg")
 * @returns Upload result with public URL or error
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      }
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File too large. Maximum size is 5MB.',
      }
    }

    const supabase = createClient()

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('business-images')
      .upload(path, file, {
        upsert: true, // Replace if exists (UPDATE policy verifies ownership)
        contentType: file.type,
      })

    if (error) {
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('business-images')
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - The storage path to delete
 */
export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from('business-images').remove([path])
}

/**
 * Generate a unique filename for uploaded images
 * @param businessId - The business ID
 * @param type - Image type (cover or logo)
 * @param extension - File extension
 */
export function generateImagePath(
  businessId: string,
  type: 'cover' | 'logo',
  extension: string
): string {
  const timestamp = Date.now()
  return `${businessId}/${type}-${timestamp}.${extension}`
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || 'jpg'
}
