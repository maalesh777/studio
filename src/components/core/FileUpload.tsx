"use client";

import { ChangeEvent, DragEvent, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, XCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (fileName: string, dataUri: string) => void;
  acceptedFileTypes?: string;
  label?: string;
  id?: string;
  className?: string;
  labelClassName?: string; // Added labelClassName prop
}

export default function FileUpload({
  onFileUpload,
  acceptedFileTypes = 'image/png, image/jpeg, image/webp',
  label = 'Upload Image',
  id = 'file-upload',
  className,
  labelClassName, // Destructure labelClassName
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (file) {
      if (!acceptedFileTypes.split(', ').includes(file.type)) {
        alert(`Invalid file type. Please upload ${acceptedFileTypes}.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPreview(dataUri);
        setFileName(file.name);
        onFileUpload(file.name, dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removePreview = () => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the input
    }
    onFileUpload("", ""); // Notify parent that file is removed
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Label htmlFor={id} className={cn("text-sm font-medium text-foreground/80", labelClassName)}>{label}</Label>
      <div
        id={`${id}-dropzone`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out',
          dragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/70',
          preview ? 'border-solid' : ''
        )}
      >
        <Input
          ref={inputRef}
          type="file"
          id={id}
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleChange}
        />
        {preview ? (
          <>
            <Image src={preview} alt="Preview" layout="fill" objectFit="contain" className="rounded-md p-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); removePreview(); }}
              className="absolute top-2 right-2 bg-background/70 hover:bg-destructive/80 hover:text-destructive-foreground rounded-full z-10"
              aria-label="Remove image"
            >
              <XCircle className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-2 left-2 right-2 bg-background/70 text-foreground text-xs px-2 py-1 rounded truncate z-10">
              {fileName}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className={cn('w-10 h-10 mb-3', dragActive ? 'text-primary' : 'text-muted-foreground')} />
            <p className={cn('mb-2 text-sm', dragActive ? 'text-primary' : 'text-muted-foreground')}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground/70">Accepted: {acceptedFileTypes.replace(/image\//g, '').toUpperCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
