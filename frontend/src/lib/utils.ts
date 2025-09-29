import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

export function validateFile(file: File): string | null {
  const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '52428800'); // 50MB
  const allowedExtensions = (import.meta.env.VITE_ALLOWED_EXTENSIONS || 'csv,xlsx,xls').split(',');
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return `File type not supported. Allowed types: ${allowedExtensions.join(', ')}`;
  }
  
  if (file.size > maxSize) {
    return `File size exceeds ${formatFileSize(maxSize)} limit`;
  }
  
  return null;
}
