'use client';

import React, { useState, ChangeEvent } from 'react';
import { Input } from './input';
import { Label } from './label';

interface ImageUploadPreviewProps {
  onFileChange: (file: File | null) => void;
  initialPreviewUrl?: string;
}

export function ImageUploadPreview({ onFileChange, initialPreviewUrl }: ImageUploadPreviewProps) {
  const [preview, setPreview] = useState<string | null>(initialPreviewUrl || null); // Initialize with initialPreviewUrl

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileChange(file);
    } else {
      setPreview(null);
      onFileChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Image preview" className="max-w-xs max-h-48 object-contain rounded-md border" />
        </div>
      )}
    </div>
  );
}
