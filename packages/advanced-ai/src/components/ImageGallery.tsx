/**
 * Image Gallery Component
 * Display generated images with metadata and download options
 */

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Copy, Check } from 'lucide-react';

interface GeneratedImage {
  url: string;
  revised_prompt?: string;
  width: number;
  height: number;
  format: string;
  provider: string;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  originalPrompt?: string;
  enhancedPrompt?: string;
  metadata?: any;
}

export function ImageGallery({ images, originalPrompt, enhancedPrompt, metadata }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const downloadImage = async (image: GeneratedImage, index: number) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${index + 1}.${image.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const copyImageUrl = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Prompts */}
      {(originalPrompt || enhancedPrompt) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {originalPrompt && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Original:</p>
                <p className="text-sm">{originalPrompt}</p>
              </div>
            )}
            {enhancedPrompt && enhancedPrompt !== originalPrompt && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Enhanced:</p>
                <p className="text-sm italic">{enhancedPrompt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generation Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {metadata.provider && (
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <Badge variant="outline" className="mt-1">
                    {metadata.provider}
                  </Badge>
                </div>
              )}
              {metadata.style && (
                <div>
                  <p className="text-xs text-muted-foreground">Style</p>
                  <Badge variant="outline" className="mt-1">
                    {metadata.style}
                  </Badge>
                </div>
              )}
              {metadata.size && (
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="font-medium">{metadata.size}</p>
                </div>
              )}
              {metadata.quality && (
                <div>
                  <p className="text-xs text-muted-foreground">Quality</p>
                  <Badge variant={metadata.quality === 'hd' ? 'default' : 'secondary'} className="mt-1">
                    {metadata.quality.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              <img
                src={image.url}
                alt={`Generated image ${index + 1}`}
                className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedImage(image)}
                loading="lazy"
              />
            </div>
            <CardFooter className="flex justify-between items-center p-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">
                  {image.width}x{image.height} • {image.format.toUpperCase()}
                </p>
                {image.provider && (
                  <Badge variant="outline" className="text-xs w-fit">
                    {image.provider}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyImageUrl(image.url, index)}
                  title="Copy URL"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openInNewTab(image.url)}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadImage(image, index)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
            {image.revised_prompt && (
              <CardContent className="pt-0 pb-3">
                <p className="text-xs text-muted-foreground">Revised prompt:</p>
                <p className="text-xs mt-1">{image.revised_prompt}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-screen">
            <img
              src={selectedImage.url}
              alt="Full size preview"
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(selectedImage, images.indexOf(selectedImage));
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No Images */}
      {images.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No images generated yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
