/**
 * Streaming Helper Utilities
 * Improved streaming with cancellation and error handling
 */

export interface StreamOptions {
  onChunk?: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export class StreamReader {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private aborted = false;

  constructor(private stream: ReadableStream<Uint8Array>) {}

  async read(options: StreamOptions = {}): Promise<string> {
    this.reader = this.stream.getReader();
    let fullContent = '';

    try {
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          this.abort();
        });
      }

      while (true) {
        if (this.aborted) {
          throw new Error('Stream aborted');
        }

        const { done, value } = await this.reader.read();
        if (done) {
          options.onComplete?.();
          break;
        }

        const chunk = this.decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                options.onChunk?.(content);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      return fullContent;
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Stream error'));
      throw error;
    } finally {
      this.cleanup();
    }
  }

  abort(): void {
    this.aborted = true;
    this.cleanup();
  }

  private cleanup(): void {
    if (this.reader) {
      this.reader.cancel();
      this.reader.releaseLock();
      this.reader = null;
    }
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
