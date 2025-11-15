/**
 * RichTextEditor - Rich text editor with formatting
 *
 * Features:
 * - Mentions (@user)
 * - Formatting toolbar
 * - Markdown support
 * - Image upload placeholder
 *
 * NOTE: This is a simplified version. For production, consider:
 * - Lexical: npm install lexical @lexical/react
 * - Tiptap: npm install @tiptap/react @tiptap/starter-kit
 * - Slate: npm install slate slate-react
 */

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
} from "lucide-react";
import { cn } from "../utils";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  showToolbar?: boolean;
  minHeight?: string;
  maxHeight?: string;
  enableMentions?: boolean;
  onMention?: (query: string) => Promise<Array<{ id: string; label: string }>>;
  className?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  showToolbar = true,
  minHeight = "200px",
  maxHeight = "500px",
  enableMentions = true,
  onMention,
  className,
}: RichTextEditorProps) {
  const [content, setContent] = useState(value);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (newValue: string) => {
    setContent(newValue);
    onChange?.(newValue);

    // Check for mention trigger
    if (enableMentions && newValue.includes("@")) {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = newValue.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf("@");

        if (lastAtIndex !== -1) {
          const query = textBeforeCursor.substring(lastAtIndex + 1);
          if (!query.includes(" ")) {
            setMentionQuery(query);
            setShowMentions(true);
            onMention?.(query).then((suggestions) => {
              setMentionSuggestions(suggestions);
            });
          } else {
            setShowMentions(false);
          }
        }
      }
    }
  };

  const insertText = useCallback((text: string, wrap = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    let newContent: string;
    let newCursorPos: number;

    if (wrap && selectedText) {
      // Wrap selected text
      newContent = `${before}${text}${selectedText}${text}${after}`;
      newCursorPos = start + text.length;
    } else {
      // Insert at cursor
      newContent = `${before}${text}${after}`;
      newCursorPos = start + text.length;
    }

    setContent(newContent);
    onChange?.(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  const formatBold = () => insertText("**", true);
  const formatItalic = () => insertText("_", true);
  const formatUnderline = () => insertText("<u>", true);
  const formatCode = () => insertText("`", true);
  const formatHeading1 = () => insertText("# ", false);
  const formatHeading2 = () => insertText("## ", false);
  const formatBulletList = () => insertText("- ", false);
  const formatNumberedList = () => insertText("1. ", false);
  const formatQuote = () => insertText("> ", false);
  const formatLink = () => insertText("[text](url)", false);
  const formatImage = () => insertText("![alt](url)", false);

  const insertMention = (mention: { id: string; label: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const before = content.substring(0, lastAtIndex);
    const after = content.substring(cursorPos);

    const newContent = `${before}@${mention.label} ${after}`;
    setContent(newContent);
    onChange?.(newContent);
    setShowMentions(false);
    setMentionQuery("");

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  return (
    <Card className={cn("w-full", className)}>
      {showToolbar && (
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatBold}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatItalic}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatUnderline}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatHeading1}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatHeading2}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatBulletList}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatNumberedList}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatQuote}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatCode}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatLink}
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatImage}
              title="Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full p-3 rounded-md border bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "resize-y font-mono text-sm"
          )}
          style={{
            minHeight,
            maxHeight,
          }}
        />

        {/* Mention suggestions */}
        {showMentions && mentionSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-64 bg-popover border rounded-md shadow-lg">
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
              {mentionSuggestions.map((mention) => (
                <button
                  key={mention.id}
                  type="button"
                  onClick={() => insertMention(mention)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  @{mention.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Markdown guide */}
        <div className="mt-2 text-xs text-muted-foreground">
          <details>
            <summary className="cursor-pointer hover:text-foreground">
              Markdown Guide
            </summary>
            <div className="mt-2 space-y-1 pl-4">
              <div>**bold** or __bold__</div>
              <div>_italic_ or *italic*</div>
              <div># Heading 1</div>
              <div>## Heading 2</div>
              <div>- Bullet list</div>
              <div>1. Numbered list</div>
              <div>&gt; Quote</div>
              <div>`code`</div>
              <div>[link text](url)</div>
              <div>![image alt](image-url)</div>
              {enableMentions && <div>@username for mentions</div>}
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
