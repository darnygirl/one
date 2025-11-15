/**
 * ShareDialog Component
 * Share things via social media, email, or copy link
 */

import { type Thing } from "@/lib/ontology/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Mail } from "lucide-react";
import { useState } from "react";

interface ShareDialogProps {
  thing: Thing;
  url?: string;
  children?: React.ReactNode;
}

export function ShareDialog({ thing, url, children }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || `${window.location.origin}/${thing.type}/${thing._id}`;
  const shareText = `Check out "${thing.name}" on ONE Platform`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: thing.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    }
  };

  const shareOptions = [
    {
      name: "Twitter",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-black hover:text-white",
    },
    {
      name: "Facebook",
      icon: "f",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: "in",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-700 hover:text-white",
    },
    {
      name: "Email",
      icon: <Mail className="h-4 w-4" />,
      url: `mailto:?subject=${encodeURIComponent(thing.name)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      color: "hover:bg-gray-600 hover:text-white",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {thing.type}</DialogTitle>
          <DialogDescription>
            Share "{thing.name}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy link */}
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-4 gap-2">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                className={`flex-col h-auto py-3 ${option.color}`}
                asChild
              >
                <a
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-xs">{option.name}</span>
                </a>
              </Button>
            ))}
          </div>

          {/* Native share button (mobile) */}
          {navigator.share && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Share via...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
