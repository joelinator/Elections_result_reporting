import React, { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 10,
  className = "",
  label = "Fichier",
  description = `Formats acceptés: PDF, DOC, DOCX, JPG, JPEG, PNG (max ${maxSize}MB)`,
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Le fichier dépasse la taille maximale de ${maxSize}MB`);
      return false;
    }

    // Vérifier l'extension
    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Format de fichier non autorisé. Formats acceptés: ${accept}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    } else {
      onFileSelect(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          required={required}
        />
        
        <div className="space-y-2">
          <div className="text-gray-600">
            <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
            <p className="text-sm">
              Glissez-déposez votre fichier ici ou{' '}
              <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                cliquez pour sélectionner
              </span>
            </p>
          </div>
          
          <p className="text-xs text-gray-500">
            {description}
          </p>
          
          {error && (
            <p className="text-xs text-red-500 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
