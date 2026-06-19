'use client'

import { useState, useRef } from 'react'
import { uploadImage, generateImagePath, getFileExtension } from '@/lib/utils/upload'

type ImageUploadProps = {
  businessId: string
  type: 'cover' | 'logo'
  currentUrl?: string | null
  onUploadComplete: (url: string) => void
  variant?: 'business' | 'admin'
}

export function ImageUpload({
  businessId,
  type,
  currentUrl,
  onUploadComplete,
  variant = 'business'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAdmin = variant === 'admin'
  const aspectClass = type === 'cover' ? 'aspect-video' : 'aspect-square w-32'

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    setError(null)

    const extension = getFileExtension(file.name)
    const path = generateImagePath(businessId, type, extension)

    const result = await uploadImage(file, path)

    setUploading(false)

    if (result.success && result.url) {
      onUploadComplete(result.url)
    } else {
      setError(result.error || 'Upload failed')
      setPreview(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {(preview || currentUrl) && (
        <div className={`${aspectClass} ${isAdmin ? 'bg-white/5 border border-white/10' : 'bg-surface-container border border-outline-variant'} rounded-lg overflow-hidden`}>
          <img
            src={preview || currentUrl || ''}
            alt={`${type} preview`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          data-testid={`business-settings-${type}-upload-input`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${
            isAdmin
              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10 disabled:opacity-50'
              : 'bg-surface hover:bg-surface-container text-on-surface border border-outline-variant disabled:opacity-50'
          }`}
          data-testid={`business-settings-${type}-upload-btn`}
        >
          {uploading ? 'Uploading...' : currentUrl ? 'Change Image' : 'Choose Image'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className={`text-xs ${isAdmin ? 'text-red-300' : 'text-error'}`}>
          {error}
        </p>
      )}

      {/* Size Recommendation */}
      <p className={`text-xs ${isAdmin ? 'text-gray-500' : 'text-on-surface-variant'}`}>
        {type === 'cover'
          ? 'Recommended: 1200x600px or larger'
          : 'Recommended: Square, 400x400px or larger'}
      </p>
    </div>
  )
}
