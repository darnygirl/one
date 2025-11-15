/**
 * IPFSService - Effect.ts service for IPFS operations
 *
 * Handles uploading and fetching files from IPFS for NFT metadata.
 * Supports multiple IPFS gateways and pinning services.
 */

import { Effect } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export type IPFSServiceError =
  | { _tag: "UploadError"; message: string }
  | { _tag: "FetchError"; message: string; cid?: string }
  | { _tag: "PinError"; message: string; cid?: string }
  | { _tag: "InvalidCIDError"; cid: string }
  | { _tag: "NetworkError"; message: string }
  | { _tag: "GatewayError"; message: string; gateway: string };

// ============================================================================
// IPFS Types
// ============================================================================

export interface IPFSFile {
  path?: string;
  content: Buffer | Blob | string;
  mode?: number;
  mtime?: { secs: number; nsecs?: number };
}

export interface IPFSUploadResult {
  cid: string;
  path: string;
  size: number;
  url: string;
}

export interface IPFSMetadata {
  name: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  [key: string]: any;
}

export interface IPFSPinStatus {
  cid: string;
  status: "pinned" | "pinning" | "unpinned" | "failed";
  created: Date;
  delegates?: string[];
}

export interface IPFSGateway {
  url: string;
  priority: number;
  timeout?: number;
}

// ============================================================================
// Service Interface
// ============================================================================

export interface IIPFSService {
  /**
   * Upload file to IPFS
   */
  uploadFile(
    file: IPFSFile
  ): Effect.Effect<IPFSUploadResult, IPFSServiceError>;

  /**
   * Upload JSON metadata to IPFS
   */
  uploadMetadata(
    metadata: IPFSMetadata
  ): Effect.Effect<IPFSUploadResult, IPFSServiceError>;

  /**
   * Upload directory to IPFS
   */
  uploadDirectory(
    files: IPFSFile[]
  ): Effect.Effect<IPFSUploadResult[], IPFSServiceError>;

  /**
   * Fetch file from IPFS
   */
  fetchFile(
    cid: string
  ): Effect.Effect<Blob, IPFSServiceError>;

  /**
   * Fetch JSON from IPFS
   */
  fetchJSON<T = any>(
    cid: string
  ): Effect.Effect<T, IPFSServiceError>;

  /**
   * Pin CID to IPFS
   */
  pinCID(
    cid: string
  ): Effect.Effect<IPFSPinStatus, IPFSServiceError>;

  /**
   * Unpin CID from IPFS
   */
  unpinCID(
    cid: string
  ): Effect.Effect<void, IPFSServiceError>;

  /**
   * Get pin status
   */
  getPinStatus(
    cid: string
  ): Effect.Effect<IPFSPinStatus, IPFSServiceError>;

  /**
   * Resolve IPFS URL to HTTP gateway URL
   */
  resolveURL(
    ipfsUrl: string
  ): string;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class IPFSService implements IIPFSService {
  private gateways: IPFSGateway[] = [
    { url: "https://ipfs.io/ipfs/", priority: 1, timeout: 5000 },
    { url: "https://cloudflare-ipfs.com/ipfs/", priority: 2, timeout: 5000 },
    { url: "https://gateway.pinata.cloud/ipfs/", priority: 3, timeout: 5000 },
    { url: "https://dweb.link/ipfs/", priority: 4, timeout: 5000 },
  ];

  constructor(
    private apiUrl: string = "https://api.web3.storage",
    private apiKey?: string,
    private pinataApiKey?: string,
    private pinataSecretKey?: string
  ) {}

  uploadFile(
    file: IPFSFile
  ): Effect.Effect<IPFSUploadResult, IPFSServiceError> {
    return Effect.gen(this, function* () {
      if (!this.apiKey) {
        return yield* Effect.fail({
          _tag: "UploadError" as const,
          message: "IPFS API key not configured",
        });
      }

      const formData = new FormData();

      if (file.content instanceof Blob) {
        formData.append("file", file.content, file.path);
      } else if (file.content instanceof Buffer) {
        const blob = new Blob([file.content]);
        formData.append("file", blob, file.path);
      } else {
        const blob = new Blob([file.content], { type: "text/plain" });
        formData.append("file", blob, file.path);
      }

      const result = yield* Effect.tryPromise({
        try: async () => {
          const response = await fetch(`${this.apiUrl}/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const data = await response.json();
          return data;
        },
        catch: (error) => ({
          _tag: "UploadError" as const,
          message: error instanceof Error ? error.message : "Upload failed",
        }),
      });

      const cid = result.cid || result.Hash || result.ipfsHash;
      const size = result.size || result.Size || 0;

      return {
        cid,
        path: file.path || "",
        size,
        url: this.resolveURL(`ipfs://${cid}`),
      };
    });
  }

  uploadMetadata(
    metadata: IPFSMetadata
  ): Effect.Effect<IPFSUploadResult, IPFSServiceError> {
    return Effect.gen(this, function* () {
      const json = JSON.stringify(metadata, null, 2);
      const file: IPFSFile = {
        path: "metadata.json",
        content: json,
      };

      return yield* this.uploadFile(file);
    });
  }

  uploadDirectory(
    files: IPFSFile[]
  ): Effect.Effect<IPFSUploadResult[], IPFSServiceError> {
    return Effect.gen(this, function* () {
      if (!this.apiKey) {
        return yield* Effect.fail({
          _tag: "UploadError" as const,
          message: "IPFS API key not configured",
        });
      }

      const formData = new FormData();

      for (const file of files) {
        let blob: Blob;

        if (file.content instanceof Blob) {
          blob = file.content;
        } else if (file.content instanceof Buffer) {
          blob = new Blob([file.content]);
        } else {
          blob = new Blob([file.content], { type: "text/plain" });
        }

        formData.append("file", blob, file.path || "file");
      }

      const results = yield* Effect.tryPromise({
        try: async () => {
          const response = await fetch(`${this.apiUrl}/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          return await response.json();
        },
        catch: (error) => ({
          _tag: "UploadError" as const,
          message: error instanceof Error ? error.message : "Upload failed",
        }),
      });

      // Parse results (format varies by service)
      const uploads: IPFSUploadResult[] = Array.isArray(results)
        ? results.map((r: any) => ({
            cid: r.cid || r.Hash || r.ipfsHash,
            path: r.path || r.Name || "",
            size: r.size || r.Size || 0,
            url: this.resolveURL(`ipfs://${r.cid || r.Hash}`),
          }))
        : [
            {
              cid: results.cid || results.Hash,
              path: "",
              size: results.size || results.Size || 0,
              url: this.resolveURL(`ipfs://${results.cid || results.Hash}`),
            },
          ];

      return uploads;
    });
  }

  fetchFile(
    cid: string
  ): Effect.Effect<Blob, IPFSServiceError> {
    return Effect.gen(this, function* () {
      // Try multiple gateways in order of priority
      const sortedGateways = [...this.gateways].sort((a, b) => a.priority - b.priority);

      for (const gateway of sortedGateways) {
        const url = `${gateway.url}${cid}`;

        const blob = yield* Effect.tryPromise({
          try: async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), gateway.timeout);

            try {
              const response = await fetch(url, {
                signal: controller.signal,
              });

              if (!response.ok) {
                throw new Error(`Gateway returned ${response.status}`);
              }

              return await response.blob();
            } finally {
              clearTimeout(timeoutId);
            }
          },
          catch: (error) => {
            // Try next gateway
            return null;
          },
        });

        if (blob) return blob;
      }

      // All gateways failed
      return yield* Effect.fail({
        _tag: "FetchError" as const,
        message: "All IPFS gateways failed",
        cid,
      });
    });
  }

  fetchJSON<T = any>(
    cid: string
  ): Effect.Effect<T, IPFSServiceError> {
    return Effect.gen(this, function* () {
      const blob = yield* this.fetchFile(cid);

      const json = yield* Effect.tryPromise({
        try: async () => {
          const text = await blob.text();
          return JSON.parse(text);
        },
        catch: (error) => ({
          _tag: "FetchError" as const,
          message: error instanceof Error ? error.message : "Failed to parse JSON",
          cid,
        }),
      });

      return json as T;
    });
  }

  pinCID(
    cid: string
  ): Effect.Effect<IPFSPinStatus, IPFSServiceError> {
    return Effect.gen(this, function* () {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        return yield* Effect.fail({
          _tag: "PinError" as const,
          message: "Pinata API keys not configured",
          cid,
        });
      }

      const status = yield* Effect.tryPromise({
        try: async () => {
          const response = await fetch("https://api.pinata.cloud/pinning/pinByHash", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              pinata_api_key: this.pinataApiKey!,
              pinata_secret_api_key: this.pinataSecretKey!,
            },
            body: JSON.stringify({
              hashToPin: cid,
            }),
          });

          if (!response.ok) {
            throw new Error(`Pin failed: ${response.statusText}`);
          }

          const data = await response.json();
          return data;
        },
        catch: (error) => ({
          _tag: "PinError" as const,
          message: error instanceof Error ? error.message : "Pin failed",
          cid,
        }),
      });

      return {
        cid,
        status: "pinned",
        created: new Date(),
      };
    });
  }

  unpinCID(
    cid: string
  ): Effect.Effect<void, IPFSServiceError> {
    return Effect.gen(this, function* () {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        return yield* Effect.fail({
          _tag: "PinError" as const,
          message: "Pinata API keys not configured",
          cid,
        });
      }

      yield* Effect.tryPromise({
        try: async () => {
          const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            method: "DELETE",
            headers: {
              pinata_api_key: this.pinataApiKey!,
              pinata_secret_api_key: this.pinataSecretKey!,
            },
          });

          if (!response.ok) {
            throw new Error(`Unpin failed: ${response.statusText}`);
          }
        },
        catch: (error) => ({
          _tag: "PinError" as const,
          message: error instanceof Error ? error.message : "Unpin failed",
          cid,
        }),
      });
    });
  }

  getPinStatus(
    cid: string
  ): Effect.Effect<IPFSPinStatus, IPFSServiceError> {
    return Effect.gen(this, function* () {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        return yield* Effect.fail({
          _tag: "PinError" as const,
          message: "Pinata API keys not configured",
          cid,
        });
      }

      const status = yield* Effect.tryPromise({
        try: async () => {
          const response = await fetch(
            `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
            {
              headers: {
                pinata_api_key: this.pinataApiKey!,
                pinata_secret_api_key: this.pinataSecretKey!,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to get pin status: ${response.statusText}`);
          }

          const data = await response.json();
          return data;
        },
        catch: (error) => ({
          _tag: "FetchError" as const,
          message: error instanceof Error ? error.message : "Failed to get status",
          cid,
        }),
      });

      const pin = status.rows?.[0];

      if (!pin) {
        return {
          cid,
          status: "unpinned",
          created: new Date(),
        };
      }

      return {
        cid,
        status: pin.status === "pinned" ? "pinned" : "pinning",
        created: new Date(pin.date_pinned),
      };
    });
  }

  resolveURL(ipfsUrl: string): string {
    if (!ipfsUrl) return "";

    // Already an HTTP URL
    if (ipfsUrl.startsWith("http://") || ipfsUrl.startsWith("https://")) {
      return ipfsUrl;
    }

    // ipfs:// protocol
    if (ipfsUrl.startsWith("ipfs://")) {
      const cid = ipfsUrl.replace("ipfs://", "");
      return `${this.gateways[0].url}${cid}`;
    }

    // ipfs/ path
    if (ipfsUrl.startsWith("ipfs/")) {
      return `${this.gateways[0].url}${ipfsUrl.slice(5)}`;
    }

    // Assume it's a CID
    return `${this.gateways[0].url}${ipfsUrl}`;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function isValidCID(cid: string): boolean {
  // Basic CID validation (both v0 and v1)
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidv1Regex = /^[a-z2-7]{59}$/;

  return cidv0Regex.test(cid) || cidv1Regex.test(cid);
}

export function extractCIDFromURL(url: string): string | null {
  if (!url) return null;

  // ipfs:// protocol
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "").split("/")[0];
  }

  // Gateway URL
  const match = url.match(/\/ipfs\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function urlToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
