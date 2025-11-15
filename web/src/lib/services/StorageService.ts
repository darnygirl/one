/**
 * StorageService - Effect.ts file storage service
 *
 * Cycle 38: Effect.ts file storage service
 * - Functions: upload, download, delete, getUrl
 * - Convex file storage integration
 * - Effect progress tracking
 */

import { Effect, Data, Stream } from "effect";
import type { ConvexClient } from "convex/browser";

// ============================================================================
// Error Types
// ============================================================================

export class StorageError extends Data.TaggedError("StorageError")<{
  operation: "upload" | "download" | "delete" | "getUrl";
  reason: string;
}> {}

export class FileNotFoundError extends Data.TaggedError("FileNotFoundError")<{
  fileId: string;
}> {}

export class FileTooLargeError extends Data.TaggedError("FileTooLargeError")<{
  size: number;
  maxSize: number;
}> {}

export class InvalidFileTypeError extends Data.TaggedError("InvalidFileTypeError")<{
  fileType: string;
  allowedTypes: string[];
}> {}

export class UploadProgressError extends Data.TaggedError("UploadProgressError")<{
  reason: string;
}> {}

// ============================================================================
// Types
// ============================================================================

export type FileMetadata = {
  name: string;
  type: string;
  size: number;
  contentType?: string;
  groupId?: string;
  ownerId?: string;
  metadata?: Record<string, unknown>;
};

export type UploadedFile = {
  id: string;
  url: string;
  metadata: FileMetadata;
  uploadedAt: number;
};

export type UploadOptions = {
  maxSize?: number; // bytes
  allowedTypes?: string[]; // MIME types
  onProgress?: (progress: UploadProgress) => void;
  groupId?: string;
  ownerId?: string;
  metadata?: Record<string, unknown>;
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type DownloadOptions = {
  onProgress?: (progress: UploadProgress) => void;
};

export type StorageStats = {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
};

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
];

// ============================================================================
// Validation
// ============================================================================

const validateFile = (
  file: File,
  options: UploadOptions
): Effect.Effect<File, FileTooLargeError | InvalidFileTypeError> =>
  Effect.gen(function* () {
    const maxSize = options.maxSize || DEFAULT_MAX_FILE_SIZE;
    const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

    // Check file size
    if (file.size > maxSize) {
      return yield* new FileTooLargeError({
        size: file.size,
        maxSize,
      });
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return yield* new InvalidFileTypeError({
        fileType: file.type,
        allowedTypes,
      });
    }

    return file;
  });

const validateFileId = (
  fileId: string
): Effect.Effect<string, StorageError> =>
  Effect.gen(function* () {
    if (!fileId || fileId.trim().length === 0) {
      return yield* new StorageError({
        operation: "getUrl",
        reason: "File ID is required",
      });
    }

    return fileId;
  });

// ============================================================================
// File Upload
// ============================================================================

/**
 * Upload a file to storage
 */
export const upload = (
  file: File,
  options: UploadOptions = {}
): Effect.Effect<UploadedFile, StorageError | FileTooLargeError | InvalidFileTypeError> =>
  Effect.gen(function* () {
    // Validate file
    const validFile = yield* validateFile(file, options);

    // Create file metadata
    const metadata: FileMetadata = {
      name: validFile.name,
      type: validFile.type,
      size: validFile.size,
      contentType: validFile.type,
      groupId: options.groupId,
      ownerId: options.ownerId,
      metadata: options.metadata,
    };

    // Upload file
    return yield* Effect.tryPromise({
      try: async () => {
        // In a real implementation, this would:
        // 1. Generate storage URL from Convex
        // 2. Upload file to storage (S3, Cloudflare R2, etc.)
        // 3. Save file metadata to database
        // 4. Track upload progress

        // Simulate upload with progress
        if (options.onProgress) {
          const totalSize = validFile.size;
          let loaded = 0;

          const progressInterval = setInterval(() => {
            loaded = Math.min(loaded + totalSize / 10, totalSize);
            options.onProgress?.({
              loaded,
              total: totalSize,
              percentage: (loaded / totalSize) * 100,
            });

            if (loaded >= totalSize) {
              clearInterval(progressInterval);
            }
          }, 100);
        }

        // Mock upload result
        const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const url = `https://storage.one.ie/${fileId}/${validFile.name}`;

        return {
          id: fileId,
          url,
          metadata,
          uploadedAt: Date.now(),
        };
      },
      catch: (error) =>
        new StorageError({
          operation: "upload",
          reason: error instanceof Error ? error.message : "Upload failed",
        }),
    });
  });

/**
 * Upload multiple files in parallel
 */
export const uploadBatch = (
  files: File[],
  options: UploadOptions = {}
): Effect.Effect<UploadedFile[], StorageError | FileTooLargeError | InvalidFileTypeError> =>
  Effect.all(
    files.map((file) => upload(file, options)),
    { concurrency: 3 } // Limit concurrent uploads
  );

/**
 * Upload file with retry on failure
 */
export const uploadWithRetry = (
  file: File,
  options: UploadOptions = {},
  maxRetries: number = 3
): Effect.Effect<UploadedFile, StorageError | FileTooLargeError | InvalidFileTypeError> =>
  upload(file, options).pipe(
    Effect.retry({ times: maxRetries })
  );

// ============================================================================
// File Download
// ============================================================================

/**
 * Download a file from storage
 */
export const download = (
  fileId: string,
  options: DownloadOptions = {}
): Effect.Effect<Blob, StorageError | FileNotFoundError> =>
  Effect.gen(function* () {
    const validFileId = yield* validateFileId(fileId);

    return yield* Effect.tryPromise({
      try: async () => {
        // In a real implementation, this would:
        // 1. Get file URL from Convex
        // 2. Download file from storage
        // 3. Track download progress

        const url = yield* Effect.runPromise(getUrl(validFileId));

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Track progress if callback provided
        if (options.onProgress) {
          const contentLength = parseInt(
            response.headers.get("content-length") || "0",
            10
          );
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let loaded = 0;

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            loaded += value.length;

            options.onProgress({
              loaded,
              total: contentLength,
              percentage: contentLength ? (loaded / contentLength) * 100 : 0,
            });
          }

          return new Blob(chunks);
        }

        return await response.blob();
      },
      catch: (error) => {
        if (error instanceof FileNotFoundError) {
          return error;
        }
        return new StorageError({
          operation: "download",
          reason: error instanceof Error ? error.message : "Download failed",
        });
      },
    });
  });

/**
 * Download file as stream
 */
export const downloadStream = (
  fileId: string
): Effect.Effect<Stream.Stream<Uint8Array, StorageError | FileNotFoundError>, StorageError> =>
  Effect.gen(function* () {
    const url = yield* getUrl(fileId);

    return Stream.fromAsyncIterable(
      (async function* () {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield value;
        }
      })(),
      (error) =>
        new StorageError({
          operation: "download",
          reason: error instanceof Error ? error.message : "Download stream failed",
        })
    );
  });

// ============================================================================
// File Operations
// ============================================================================

/**
 * Get file URL
 */
export const getUrl = (
  fileId: string
): Effect.Effect<string, StorageError | FileNotFoundError> =>
  Effect.gen(function* () {
    const validFileId = yield* validateFileId(fileId);

    return yield* Effect.tryPromise({
      try: async () => {
        // In a real implementation, this would:
        // 1. Query Convex for file metadata
        // 2. Generate signed URL if needed
        // 3. Return URL

        // Mock URL
        return `https://storage.one.ie/${validFileId}`;
      },
      catch: (error) =>
        new StorageError({
          operation: "getUrl",
          reason: error instanceof Error ? error.message : "Failed to get URL",
        }),
    });
  });

/**
 * Get file metadata
 */
export const getMetadata = (
  fileId: string
): Effect.Effect<FileMetadata, StorageError | FileNotFoundError> =>
  Effect.gen(function* () {
    const validFileId = yield* validateFileId(fileId);

    return yield* Effect.tryPromise({
      try: async () => {
        // In a real implementation, query Convex for file metadata

        // Mock metadata
        return {
          name: "example.jpg",
          type: "image/jpeg",
          size: 1024 * 1024,
          contentType: "image/jpeg",
        };
      },
      catch: (error) =>
        new StorageError({
          operation: "getUrl",
          reason: error instanceof Error ? error.message : "Failed to get metadata",
        }),
    });
  });

/**
 * Delete a file
 */
export const deleteFile = (
  fileId: string
): Effect.Effect<void, StorageError | FileNotFoundError> =>
  Effect.gen(function* () {
    const validFileId = yield* validateFileId(fileId);

    return yield* Effect.tryPromise({
      try: async () => {
        // In a real implementation, this would:
        // 1. Delete file from storage
        // 2. Delete file metadata from Convex
        // 3. Log deletion event

        console.log(`Deleted file: ${validFileId}`);
      },
      catch: (error) =>
        new StorageError({
          operation: "delete",
          reason: error instanceof Error ? error.message : "Delete failed",
        }),
    });
  });

/**
 * Delete multiple files
 */
export const deleteBatch = (
  fileIds: string[]
): Effect.Effect<void, StorageError | FileNotFoundError> =>
  Effect.gen(function* () {
    yield* Effect.all(
      fileIds.map((id) => deleteFile(id)),
      { concurrency: 5 }
    );
  });

// ============================================================================
// Storage Statistics
// ============================================================================

/**
 * Get storage statistics
 */
export const getStats = (
  groupId?: string
): Effect.Effect<StorageStats, StorageError> =>
  Effect.tryPromise({
    try: async () => {
      // In a real implementation, query Convex for stats

      return {
        totalFiles: 42,
        totalSize: 100 * 1024 * 1024, // 100MB
        filesByType: {
          "image/jpeg": 20,
          "image/png": 15,
          "application/pdf": 7,
        },
      };
    },
    catch: (error) =>
      new StorageError({
        operation: "getUrl",
        reason: error instanceof Error ? error.message : "Failed to get stats",
      }),
  });

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");

  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
};

/**
 * Check if file is an image
 */
export const isImage = (file: File | FileMetadata): boolean => {
  const type = "type" in file ? file.type : file.contentType || "";
  return type.startsWith("image/");
};

/**
 * Check if file is a PDF
 */
export const isPDF = (file: File | FileMetadata): boolean => {
  const type = "type" in file ? file.type : file.contentType || "";
  return type === "application/pdf";
};

/**
 * Check if file is a document
 */
export const isDocument = (file: File | FileMetadata): boolean => {
  const type = "type" in file ? file.type : file.contentType || "";
  return (
    type === "application/pdf" ||
    type === "text/plain" ||
    type === "application/msword" ||
    type.includes("document")
  );
};

// ============================================================================
// Image Processing Helpers
// ============================================================================

export type ResizeOptions = {
  width?: number;
  height?: number;
  quality?: number; // 0-1
  format?: "jpeg" | "png" | "webp";
};

/**
 * Resize image (browser only)
 */
export const resizeImage = (
  file: File,
  options: ResizeOptions
): Effect.Effect<Blob, StorageError> =>
  Effect.tryPromise({
    try: async () => {
      if (typeof window === "undefined") {
        throw new Error("resizeImage only works in browser");
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Calculate dimensions
      let { width, height } = options;

      if (!width && !height) {
        width = img.width;
        height = img.height;
      } else if (!width) {
        width = (img.width * (height! / img.height));
      } else if (!height) {
        height = (img.height * (width / img.width));
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          `image/${options.format || "jpeg"}`,
          options.quality || 0.9
        );
      });
    },
    catch: (error) =>
      new StorageError({
        operation: "upload",
        reason: error instanceof Error ? error.message : "Image resize failed",
      }),
  });

/**
 * Convert Blob to File
 */
export const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, { type: blob.type });
};
