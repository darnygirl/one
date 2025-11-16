/**
 * File Uploader Component
 * Drag-and-drop file upload with preview and processing
 */

import { useState, useCallback, type DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Image, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toolRegistry } from '@/lib/ai-tools/registry';

interface FileUploaderProps {
  tier?: 'free' | 'premium';
  onFileProcessed?: (result: any) => void;
  acceptedTypes?: string[];
}

interface ProcessedFileInfo {
  file: File;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: any;
  error?: string;
  preview?: string;
}

export function FileUploader({ tier = 'free', onFileProcessed, acceptedTypes }: FileUploaderProps) {
  const [files, setFiles] = useState<ProcessedFileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const maxSizeMB = tier === 'free' ? 10 : 50;

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [tier, onFileProcessed]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
      processFiles(selectedFiles);
    },
    [tier, onFileProcessed]
  );

  const processFiles = async (filesToProcess: File[]) => {
    // Add files with pending status
    const newFiles: ProcessedFileInfo[] = filesToProcess.map((file) => ({
      file,
      status: 'pending' as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const fileInfo = newFiles[i];
      const index = files.length + i;

      // Update to processing
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: 'processing' };
        return updated;
      });

      try {
        const result = await toolRegistry.execute('process_file', {
          file: fileInfo.file,
          tier,
          extract_text: true,
          analyze_image: true,
          generate_preview: true,
        });

        // Update with result
        setFiles((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'complete',
            result,
            preview: result.file?.preview?.thumbnail,
          };
          return updated;
        });

        if (onFileProcessed) {
          onFileProcessed(result);
        }
      } catch (error) {
        // Update with error
        setFiles((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed',
          };
          return updated;
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type.startsWith('text/') || file.name.endsWith('.csv')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          hover:border-primary hover:bg-primary/5 cursor-pointer
        `}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Max file size: {maxSizeMB}MB ({tier} tier)
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
          accept={acceptedTypes?.join(',') || '*'}
        />
        <Button asChild variant="outline">
          <label htmlFor="file-input" className="cursor-pointer">
            Select Files
          </label>
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
          {files.map((fileInfo, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {fileInfo.preview ? (
                      <img src={fileInfo.preview} alt="Preview" className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                        {getFileIcon(fileInfo.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileInfo.file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(fileInfo.file.size)}</p>
                    {fileInfo.result && (
                      <div className="flex gap-2 mt-1">
                        {fileInfo.result.file?.metadata?.type && (
                          <Badge variant="outline">{fileInfo.result.file.metadata.type.split('/')[1]}</Badge>
                        )}
                        {fileInfo.result.file?.analysis?.dimensions && (
                          <Badge variant="outline">
                            {fileInfo.result.file.analysis.dimensions.width}x
                            {fileInfo.result.file.analysis.dimensions.height}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {fileInfo.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                    {fileInfo.status === 'processing' && (
                      <Badge variant="secondary" className="animate-pulse">
                        Processing...
                      </Badge>
                    )}
                    {fileInfo.status === 'complete' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {fileInfo.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                  </div>

                  {/* Remove Button */}
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Error Message */}
                {fileInfo.error && (
                  <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded">{fileInfo.error}</div>
                )}

                {/* Extracted Data Preview */}
                {fileInfo.result?.file?.extracted_data && (
                  <div className="mt-2 text-sm">
                    {fileInfo.result.file.extracted_data.text && (
                      <div className="bg-muted p-2 rounded max-h-32 overflow-auto">
                        <p className="text-xs text-muted-foreground mb-1">Extracted Text:</p>
                        <p className="whitespace-pre-wrap">{fileInfo.result.file.extracted_data.text.slice(0, 500)}...</p>
                      </div>
                    )}
                    {fileInfo.result.file.extracted_data.csv_rows && (
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-muted-foreground mb-1">
                          CSV Data: {fileInfo.result.file.extracted_data.csv_rows.length} rows
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tier Info */}
      <div className="text-xs text-muted-foreground text-center">
        {tier === 'free' ? (
          <p>Free tier: 10MB file size limit. Upgrade to premium for 50MB limit.</p>
        ) : (
          <p>Premium tier: 50MB file size limit</p>
        )}
      </div>
    </div>
  );
}
