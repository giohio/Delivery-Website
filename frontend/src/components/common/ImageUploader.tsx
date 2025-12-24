import { useState, useRef } from 'react';
import { Upload, X, Check, Loader } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<string>; // Returns file URL
  currentImage?: string;
  label?: string;
  aspectRatio?: string; // e.g., "1/1", "16/9"
  maxSizeMB?: number;
}

export default function ImageUploader({
  onUpload,
  currentImage,
  label = 'Upload Image',
  aspectRatio = '1/1',
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      await onUpload(file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as any;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative"
        style={{ aspectRatio }}
      >
        {preview ? (
          // Image Preview
          <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                disabled={uploading}
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                disabled={uploading}
              >
                Remove
              </button>
            </div>

            {/* Upload status */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            )}

            {success && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>
        ) : (
          // Upload Area
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-teal-600 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader className="w-8 h-8 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <div className="text-center">
                  <span className="text-sm font-medium">Click to upload</span>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF up to {maxSizeMB}MB
                  </p>
                </div>
              </>
            )}
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          <span>Upload successful!</span>
        </div>
      )}
    </div>
  );
}
