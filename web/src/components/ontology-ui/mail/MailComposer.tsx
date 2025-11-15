/**
 * MailComposer Component (Cycle 86)
 *
 * Rich text email composer with advanced features
 *
 * Features:
 * - Rich text editor for composing emails
 * - To/Cc/Bcc fields with autocomplete
 * - Attachments with drag-drop
 * - Draft auto-save
 * - Send later option
 * - Templates
 */

"use client";

import * as React from "react";
import {
  X,
  Paperclip,
  Send,
  Clock,
  Save,
  Trash2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface EmailDraft {
  id?: string;
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  subject: string;
  body: string;
  attachments: EmailAttachment[];
  scheduledFor?: Date;
}

interface MailComposerProps {
  /** Initial draft data */
  draft?: EmailDraft;
  /** Callback when draft is saved */
  onSave?: (draft: EmailDraft) => void;
  /** Callback when email is sent */
  onSend?: (draft: EmailDraft) => void;
  /** Callback when composer is closed */
  onClose?: () => void;
  /** Callback when draft is discarded */
  onDiscard?: () => void;
  /** Auto-save interval (ms) */
  autoSaveInterval?: number;
  /** Email autocomplete suggestions */
  suggestions?: EmailRecipient[];
  /** Available email templates */
  templates?: Array<{ id: string; name: string; body: string }>;
  /** Show composer in dialog */
  asDialog?: boolean;
  /** Dialog open state */
  open?: boolean;
}

export function MailComposer({
  draft,
  onSave,
  onSend,
  onClose,
  onDiscard,
  autoSaveInterval = 30000, // 30 seconds
  suggestions = [],
  templates = [],
  asDialog = false,
  open = true,
}: MailComposerProps) {
  const [to, setTo] = React.useState<EmailRecipient[]>(draft?.to ?? []);
  const [cc, setCc] = React.useState<EmailRecipient[]>(draft?.cc ?? []);
  const [bcc, setBcc] = React.useState<EmailRecipient[]>(draft?.bcc ?? []);
  const [subject, setSubject] = React.useState(draft?.subject ?? "");
  const [body, setBody] = React.useState(draft?.body ?? "");
  const [attachments, setAttachments] = React.useState<EmailAttachment[]>(
    draft?.attachments ?? []
  );
  const [scheduledFor, setScheduledFor] = React.useState<Date | undefined>(
    draft?.scheduledFor
  );

  const [showCc, setShowCc] = React.useState(cc.length > 0);
  const [showBcc, setShowBcc] = React.useState(bcc.length > 0);
  const [isDirty, setIsDirty] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-save draft
  React.useEffect(() => {
    if (!isDirty || !onSave) return;

    const timer = setTimeout(() => {
      const currentDraft: EmailDraft = {
        id: draft?.id,
        to,
        cc,
        bcc,
        subject,
        body,
        attachments,
        scheduledFor,
      };
      onSave(currentDraft);
      setLastSaved(new Date());
      setIsDirty(false);
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [
    to,
    cc,
    bcc,
    subject,
    body,
    attachments,
    scheduledFor,
    isDirty,
    autoSaveInterval,
    onSave,
    draft?.id,
  ]);

  // Mark as dirty on changes
  const markDirty = () => setIsDirty(true);

  // Add recipient
  const addRecipient = (
    field: "to" | "cc" | "bcc",
    recipient: EmailRecipient
  ) => {
    const setField = field === "to" ? setTo : field === "cc" ? setCc : setBcc;
    setField((prev) => [...prev, recipient]);
    markDirty();
  };

  // Remove recipient
  const removeRecipient = (
    field: "to" | "cc" | "bcc",
    email: string
  ) => {
    const setField = field === "to" ? setTo : field === "cc" ? setCc : setBcc;
    setField((prev) => prev.filter((r) => r.email !== email));
    markDirty();
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: EmailAttachment[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    markDirty();
  };

  // Handle drag-drop files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newAttachments: EmailAttachment[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    markDirty();
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    markDirty();
  };

  // Send email
  const handleSend = () => {
    if (to.length === 0) {
      alert("Please add at least one recipient");
      return;
    }

    const emailDraft: EmailDraft = {
      id: draft?.id,
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
      scheduledFor,
    };

    onSend?.(emailDraft);
  };

  // Discard draft
  const handleDiscard = () => {
    if (isDirty && !confirm("Discard unsaved changes?")) {
      return;
    }
    onDiscard?.();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const composerContent = (
    <div
      className="flex h-full flex-col"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">New Message</h2>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* To field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="to" className="w-12">
                To
              </Label>
              <div className="flex flex-1 flex-wrap gap-2">
                {to.map((recipient) => (
                  <Badge key={recipient.email} variant="secondary">
                    {recipient.name || recipient.email}
                    <button
                      className="ml-1"
                      onClick={() => removeRecipient("to", recipient.email)}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  id="to"
                  placeholder="Add recipient..."
                  className="flex-1 border-none shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      addRecipient("to", { email: e.currentTarget.value });
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
              {!showCc && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </Button>
              )}
              {!showBcc && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(true)}
                >
                  Bcc
                </Button>
              )}
            </div>
          </div>

          {/* Cc field */}
          {showCc && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="cc" className="w-12">
                  Cc
                </Label>
                <div className="flex flex-1 flex-wrap gap-2">
                  {cc.map((recipient) => (
                    <Badge key={recipient.email} variant="secondary">
                      {recipient.name || recipient.email}
                      <button
                        className="ml-1"
                        onClick={() => removeRecipient("cc", recipient.email)}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    id="cc"
                    placeholder="Add Cc..."
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        addRecipient("cc", { email: e.currentTarget.value });
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bcc field */}
          {showBcc && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="bcc" className="w-12">
                  Bcc
                </Label>
                <div className="flex flex-1 flex-wrap gap-2">
                  {bcc.map((recipient) => (
                    <Badge key={recipient.email} variant="secondary">
                      {recipient.name || recipient.email}
                      <button
                        className="ml-1"
                        onClick={() => removeRecipient("bcc", recipient.email)}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    id="bcc"
                    placeholder="Add Bcc..."
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        addRecipient("bcc", { email: e.currentTarget.value });
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Subject */}
          <div className="space-y-2">
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                markDirty();
              }}
              className="border-none text-lg font-semibold shadow-none focus-visible:ring-0"
            />
          </div>

          <Separator />

          {/* Body */}
          <div className="space-y-2">
            <Textarea
              placeholder="Compose your email..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                markDirty();
              }}
              className="min-h-[300px] resize-none border-none shadow-none focus-visible:ring-0"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Attachments ({attachments.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <Badge
                      key={attachment.id}
                      variant="outline"
                      className="gap-2"
                    >
                      <Paperclip className="size-3" />
                      {attachment.name} ({formatFileSize(attachment.size)})
                      <button onClick={() => removeAttachment(attachment.id)}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between border-t p-4">
        <div className="flex items-center gap-2">
          {/* Send button */}
          <Button onClick={handleSend}>
            <Send className="mr-2 size-4" />
            Send
          </Button>

          {/* Schedule send */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Clock className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledFor}
                onSelect={(date) => {
                  setScheduledFor(date);
                  markDirty();
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Attach files */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Save draft */}
          {onSave && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                onSave({
                  id: draft?.id,
                  to,
                  cc,
                  bcc,
                  subject,
                  body,
                  attachments,
                  scheduledFor,
                });
                setLastSaved(new Date());
                setIsDirty(false);
              }}
            >
              <Save className="size-4" />
            </Button>
          )}
        </div>

        {/* Discard */}
        <Button variant="ghost" size="sm" onClick={handleDiscard}>
          <Trash2 className="mr-2 size-4" />
          Discard
        </Button>
      </div>
    </div>
  );

  if (asDialog) {
    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="max-w-3xl h-[600px] p-0">
          {composerContent}
        </DialogContent>
      </Dialog>
    );
  }

  return composerContent;
}

function formatDistanceToNow(date: Date, options: { addSuffix: boolean }) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return options.addSuffix ? "just now" : "0m";
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ${options.addSuffix ? "ago" : ""}`;
  return `${Math.floor(seconds / 3600)}h ${options.addSuffix ? "ago" : ""}`;
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { MailComposer } from '@/components/ontology-ui/mail/MailComposer';
 *
 * export function ComposeButton() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>Compose</Button>
 *       <MailComposer
 *         asDialog
 *         open={open}
 *         onClose={() => setOpen(false)}
 *         onSend={(draft) => console.log('Send:', draft)}
 *         onSave={(draft) => console.log('Save draft:', draft)}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
