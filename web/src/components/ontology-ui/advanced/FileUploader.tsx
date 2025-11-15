/**
 * FileUploader - File upload with drag-drop
 *
 * Features:
 * - Drag and drop
 * - Progress bars
 * - Preview for images
 * - Multiple files
 * - File type validation
 */

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, File, Image as ImageIcon, FileText, Video } from "lucide-react";
import { cn } from "../utils";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export interface FileUploaderProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<string>; // Returns URL
  accept?: string;
  maxSize?: number; // In bytes
  maxFiles?: number;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
}

export function FileUploader({
  value = [],
  onChange,
  onUpload,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  multiple = true,
  showPreview = true,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFiles = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatBytes(maxSize)}`;
    }

    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileType = file.type;
      const fileExt = `.${file.name.split(".").pop()}`;

      const isAccepted = acceptedTypes.some(
        (type) =>
          type === fileType ||
          type === fileExt ||
          (type.endsWith("/*") && fileType.startsWith(type.replace("/*", "")))
      );

      if (!isAccepted) {
        return `File type not accepted. Accepted: ${accept}`;
      }
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: UploadedFile[] = [];
      const currentCount = files.length;

      Array.from(fileList).forEach((file, index) => {
        if (currentCount + newFiles.length >= maxFiles) {
          return;
        }

        const error = validateFile(file);
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${index}`,
          file,
          progress: 0,
          status: error ? "error" : "pending",
          error,
        };

        // Generate preview for images
        if (showPreview && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            uploadedFile.preview = reader.result as string;
            updateFiles([...files, ...newFiles]);
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(uploadedFile);
      });

      const updatedFiles = [...files, ...newFiles];
      updateFiles(updatedFiles);

      // Start upload if handler provided
      if (onUpload) {
        newFiles.forEach((uploadedFile) => {
          if (uploadedFile.status === "pending") {
            uploadFile(uploadedFile);
          }
        });
      }
    },
    [files, maxFiles, showPreview, onUpload]
  );

  // Upload file
  const uploadFile = async (uploadedFile: UploadedFile) => {
    if (!onUpload) return;

    const index = files.findIndex((f) => f.id === uploadedFile.id);
    if (index === -1) return;

    // Update status to uploading
    const updatedFiles = [...files];
    updatedFiles[index] = { ...uploadedFile, status: "uploading", progress: 0 };
    updateFiles(updatedFiles);

    try {
      // Simulate progress (real implementation would track actual upload progress)
      const progressInterval = setInterval(() => {
        const currentFile = files.find((f) => f.id === uploadedFile.id);
        if (currentFile && currentFile.progress < 90) {
          const updated = [...files];
          const idx = updated.findIndex((f) => f.id === uploadedFile.id);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], progress: updated[idx].progress + 10 };
            updateFiles(updated);
          }
        }
      }, 200);

      const url = await onUpload(uploadedFile.file);

      clearInterval(progressInterval);

      // Update status to complete
      const finalFiles = [...files];
      const finalIndex = finalFiles.findIndex((f) => f.id === uploadedFile.id);
      if (finalIndex !== -1) {
        finalFiles[finalIndex] = {
          ...finalFiles[finalIndex],
          status: "complete",
          progress: 100,
          preview: url,
        };
        updateFiles(finalFiles);
      }
    } catch (error) {
      // Update status to error
      const errorFiles = [...files];
      const errorIndex = errorFiles.findIndex((f) => f.id === uploadedFile.id);
      if (errorIndex !== -1) {
        errorFiles[errorIndex] = {
          ...errorFiles[errorIndex],
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        };
        updateFiles(errorFiles);
      }
    }
  };

  // Remove file
  const removeFile = (id: string) => {
    updateFiles(files.filter((f) => f.id !== id));
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-8 w-8" />;
    if (file.type.startsWith("video/")) return <Video className="h-8 w-8" />;
    if (file.type.startsWith("text/")) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Upload Files
          </CardTitle>
          {files.length > 0 && (
            <Badge variant="secondary">
              {files.length} / {maxFiles} files
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="text-sm font-medium mb-1">
            Click to upload or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">
            {accept === "*/*" ? "Any file type" : accept}
            {maxSize && ` • Max ${formatBytes(maxSize)}`}
            {multiple && ` • Up to ${maxFiles} files`}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {/* Preview or icon */}
                <div className="flex-shrink-0">
                  {uploadedFile.preview &&
                  uploadedFile.file.type.startsWith("image/") ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                      {getFileIcon(uploadedFile.file)}
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatBytes(uploadedFile.file.size)}
                  </div>

                  {/* Progress bar */}
                  {uploadedFile.status === "uploading" && (
                    <Progress value={uploadedFile.progress} className="mt-2" />
                  )}

                  {/* Error message */}
                  {uploadedFile.status === "error" && (
                    <div className="text-xs text-destructive mt-1">
                      {uploadedFile.error}
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <Badge
                  variant={
                    uploadedFile.status === "complete"
                      ? "default"
                      : uploadedFile.status === "error"
                      ? "destructive"
                      : "secondary"
                  }
                  className="flex-shrink-0"
                >
                  {uploadedFile.status}
                </Badge>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadedFile.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
