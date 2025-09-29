import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { validateFile, formatFileSize } from '../lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File;
  isUploading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isUploading = false,
}) => {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validation = validateFile(file);
      
      if (validation) {
        setError(validation);
        return;
      }
      
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleRemoveFile = () => {
    setError('');
    onFileRemove();
  };

  if (selectedFile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Selected File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Dataset
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
          `}
        >
          <input {...getInputProps()} />
          
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-lg">Drop the file here...</p>
          ) : (
            <>
              <p className="text-lg mb-2">
                Drag & drop your dataset here, or click to select
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports CSV, XLSX, and XLS files (max 50MB)
              </p>
              <Button variant="outline" disabled={isUploading}>
                Select File
              </Button>
            </>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
