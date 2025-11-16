"use client";

import {
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
} from "@/components/ai/elements/message";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/elements/conversation";
import { Message, MessageContent } from "@/components/ai/elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai/elements/model-selector";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai/elements/reasoning";
import { MessageResponse } from "@/components/ai/elements/message";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai/elements/sources";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ToolUIPart } from "ai";
import { CheckIcon } from "lucide-react";
import {
  AudioWaveformIcon,
  CameraIcon,
  ChevronDownIcon,
  FileIcon,
  ImageIcon,
  LightbulbIcon,
  PaperclipIcon,
  ScreenShareIcon,
  SearchIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type MessageType = {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart["state"];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
  isReasoningComplete?: boolean;
  isContentComplete?: boolean;
  isReasoningStreaming?: boolean;
};

const models = [
  {
    id: "grok-3",
    name: "Grok-3",
    chef: "xAI",
    chefSlug: "xai",
    providers: ["xai"],
  },
  {
    id: "grok-2-1212",
    name: "Grok-2-1212",
    chef: "xAI",
    chefSlug: "xai",
    providers: ["xai"],
  },
];

const mockMessages: MessageType[] = [
  {
    key: nanoid(),
    from: "user",
    versions: [
      {
        id: nanoid(),
        content: "Can you explain how to use React hooks effectively?",
      },
    ],
  },
  {
    key: nanoid(),
    from: "assistant",
    sources: [
      {
        href: "https://react.dev/reference/react",
        title: "React Documentation",
      },
      {
        href: "https://react.dev/reference/react-dom",
        title: "React DOM Documentation",
      },
    ],
    tools: [
      {
        name: "mcp",
        description: "Searching React documentation",
        status: "input-available",
        parameters: {
          query: "React hooks best practices",
          source: "react.dev",
        },
        result: `{
  "query": "React hooks best practices",
  "results": [
    {
      "title": "Rules of Hooks",
      "url": "https://react.dev/warnings/invalid-hook-call-warning",
      "snippet": "Hooks must be called at the top level of your React function components or custom hooks. Don't call hooks inside loops, conditions, or nested functions."
    },
    {
      "title": "useState Hook",
      "url": "https://react.dev/reference/react/useState",
      "snippet": "useState is a React Hook that lets you add state to your function components. It returns an array with two values: the current state and a function to update it."
    },
    {
      "title": "useEffect Hook",
      "url": "https://react.dev/reference/react/useEffect",
      "snippet": "useEffect lets you synchronize a component with external systems. It runs after render and can be used to perform side effects like data fetching."
    }
  ]
}`,
        error: undefined,
      },
    ],
    versions: [
      {
        id: nanoid(),
        content: `# React Hooks Best Practices

React hooks are a powerful feature that let you use state and other React features without writing classes. Here are some tips for using them effectively:

## Rules of Hooks

1. **Only call hooks at the top level** of your component or custom hooks
2. **Don't call hooks inside loops, conditions, or nested functions**

## Common Hooks

- **useState**: For local component state
- **useEffect**: For side effects like data fetching
- **useContext**: For consuming context
- **useReducer**: For complex state logic
- **useCallback**: For memoizing functions
- **useMemo**: For memoizing values

## Example of useState and useEffect

\`\`\`jsx
function ProfilePage({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // This runs after render and when userId changes
    fetchUser(userId).then(userData => {
      setUser(userData);
    });
  }, [userId]);
  
  return user ? <Profile user={user} /> : <Loading />;
}
\`\`\`

Would you like me to explain any specific hook in more detail?`,
      },
    ],
  },
  {
    key: nanoid(),
    from: "user",
    versions: [
      {
        id: nanoid(),
        content:
          "Yes, could you explain useCallback and useMemo in more detail? When should I use one over the other?",
      },
      {
        id: nanoid(),
        content:
          "I'm particularly interested in understanding the performance implications of useCallback and useMemo. Could you break down when each is most appropriate?",
      },
      {
        id: nanoid(),
        content:
          "Thanks for the overview! Could you dive deeper into the specific use cases where useCallback and useMemo make the biggest difference in React applications?",
      },
    ],
  },
  {
    key: nanoid(),
    from: "assistant",
    reasoning: {
      content: `The user is asking for a detailed explanation of useCallback and useMemo. I should provide a clear and concise explanation of each hook's purpose and how they differ.
      
The useCallback hook is used to memoize functions to prevent unnecessary re-renders of child components that receive functions as props.

The useMemo hook is used to memoize values to avoid expensive recalculations on every render.

Both hooks help with performance optimization, but they serve different purposes.`,
      duration: 10,
    },
    versions: [
      {
        id: nanoid(),
        content: `## useCallback vs useMemo

Both hooks help with **performance optimization**, but they serve _different purposes_:

### useCallback

\`useCallback\` memoizes __functions__ to prevent unnecessary re-renders of child components that receive functions as props.

\`\`\`jsx
// Without useCallback - a new function is created on every render
const handleClick = () => {
  console.log(count);
};

// With useCallback - the function is only recreated when dependencies change
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
\`\`\`

### useMemo

\`useMemo\` memoizes *values* to avoid expensive recalculations on every render.

\`\`\`jsx
// Without useMemo - expensive calculation runs on every render
const sortedList = expensiveSort(items);

// With useMemo - calculation only runs when items change
const sortedList = useMemo(() => expensiveSort(items), [items]);
\`\`\`

### When to use which?

- Use **useCallback** when:
  - Passing callbacks to optimized child components that rely on reference equality
  - Working with event handlers that you pass to child components

- Use **useMemo** when:
  - You have computationally expensive calculations
  - You want to avoid recreating objects that are used as dependencies for other hooks

### Performance Note

Don't overuse these hooks! They come with their own overhead. Only use them when you have identified a genuine performance issue.

### ~~Legacy Patterns~~

Remember that these ~~outdated approaches~~ should be avoided:
- ~~Class components for simple state~~ - Use \`useState\` instead
- ~~Manual event listener cleanup~~ - Let \`useEffect\` handle it`,
      },
    ],
  },
];

const mockMessageResponses = [
  "That's a great question! Let me help you understand this concept better. The key thing to remember is that proper implementation requires careful consideration of the underlying principles and best practices in the field.",
  "I'd be happy to explain this topic in detail. From my understanding, there are several important factors to consider when approaching this problem. Let me break it down step by step for you.",
  "This is an interesting topic that comes up frequently. The solution typically involves understanding the core concepts and applying them in the right context. Here's what I recommend...",
  "Great choice of topic! This is something that many developers encounter. The approach I'd suggest is to start with the fundamentals and then build up to more complex scenarios.",
  "That's definitely worth exploring. From what I can see, the best way to handle this is to consider both the theoretical aspects and practical implementation details.",
];

const Example = () => {
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  const selectedModelData = models.find((m) => m.id === model);

  const streamReasoning = async (
    messageKey: string,
    versionId: string,
    reasoningContent: string
  ) => {
    const words = reasoningContent.split(" ");
    let currentContent = "";

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? " " : "") + words[i];

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.key === messageKey) {
            return {
              ...msg,
              reasoning: msg.reasoning
                ? { ...msg.reasoning, content: currentContent }
                : undefined,
            };
          }
          return msg;
        })
      );

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 30 + 20)
      );
    }

    // Mark reasoning as complete
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.key === messageKey) {
          return {
            ...msg,
            isReasoningComplete: true,
            isReasoningStreaming: false,
          };
        }
        return msg;
      })
    );
  };

  const streamContent = async (
    messageKey: string,
    versionId: string,
    content: string
  ) => {
    const words = content.split(" ");
    let currentContent = "";

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? " " : "") + words[i];

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.key === messageKey) {
            return {
              ...msg,
              versions: msg.versions.map((v) =>
                v.id === versionId ? { ...v, content: currentContent } : v
              ),
            };
          }
          return msg;
        })
      );

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 50 + 25)
      );
    }

    // Mark content as complete
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.key === messageKey) {
          return { ...msg, isContentComplete: true };
        }
        return msg;
      })
    );
  };

  const streamMessageResponse = useCallback(
    async (
      messageKey: string,
      versionId: string,
      content: string,
      reasoning?: { content: string; duration: number }
    ) => {
      setStatus("streaming");
      setStreamingMessageId(versionId);

      // First stream the reasoning if it exists
      if (reasoning) {
        await streamReasoning(messageKey, versionId, reasoning.content);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Pause between reasoning and content
      }

      // Then stream the content
      await streamContent(messageKey, versionId, content);

      setStatus("ready");
      setStreamingMessageId(null);
    },
    []
  );

  const streamMessage = useCallback(
    async (message: MessageType) => {
      if (message.from === "user") {
        setMessages((prev) => [...prev, message]);
        return;
      }

      // Add empty assistant message with reasoning structure
      const newMessage = {
        ...message,
        versions: message.versions.map((v) => ({ ...v, content: "" })),
        reasoning: message.reasoning
          ? { ...message.reasoning, content: "" }
          : undefined,
        isReasoningComplete: false,
        isContentComplete: false,
        isReasoningStreaming: !!message.reasoning,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Get the first version for streaming
      const firstVersion = message.versions[0];
      if (!firstVersion) return;

      // Stream the response
      await streamMessageResponse(
        newMessage.key,
        firstVersion.id,
        firstVersion.content,
        message.reasoning
      );
    },
    [streamMessageResponse]
  );

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: MessageType = {
        key: `user-${Date.now()}`,
        from: "user",
        versions: [
          {
            id: `user-${Date.now()}`,
            content,
          },
        ],
      };

      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        const assistantMessageKey = `assistant-${Date.now()}`;
        const assistantMessageId = `version-${Date.now()}`;
        const randomMessageResponse =
          mockMessageResponses[Math.floor(Math.random() * mockMessageResponses.length)];

        // Create reasoning for some responses
        const shouldHaveReasoning = Math.random() > 0.5;
        const reasoning = shouldHaveReasoning
          ? {
              content:
                "Let me think about this question carefully. I need to provide a comprehensive and helpful response that addresses the user's needs while being clear and concise.",
              duration: 3,
            }
          : undefined;

        const assistantMessage: MessageType = {
          key: assistantMessageKey,
          from: "assistant",
          versions: [
            {
              id: assistantMessageId,
              content: "",
            },
          ],
          reasoning: reasoning ? { ...reasoning, content: "" } : undefined,
          isReasoningComplete: false,
          isContentComplete: false,
          isReasoningStreaming: !!reasoning,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        streamMessageResponse(
          assistantMessageKey,
          assistantMessageId,
          randomMessageResponse,
          reasoning
        );
      }, 500);
    },
    [streamMessageResponse]
  );

  useEffect(() => {
    // Reset state on mount to ensure fresh component
    setMessages([]);

    const processMessages = async () => {
      for (let i = 0; i < mockMessages.length; i++) {
        await streamMessage(mockMessages[i]);

        if (i < mockMessages.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    // Small delay to ensure state is reset before starting
    const timer = setTimeout(() => {
      processMessages();
    }, 100);

    // Cleanup function to cancel any ongoing operations
    return () => {
      clearTimeout(timer);
      setMessages([]);
    };
  }, [streamMessage]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    setStatus("submitted");
    addUserMessage(message.text || "Sent with attachments");
    setText("");
  };

  const handleFileAction = (action: string) => {
    toast.success("File action", {
      description: action,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setStatus("submitted");
    addUserMessage(suggestion);
  };

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden bg-secondary items-center justify-center">
      <div className="w-full max-w-[1000px] h-full flex flex-col divide-y">
      <Conversation className="pb-[220px]">
        <ConversationContent>
          {messages.map(({ versions, ...message }) => (
            <MessageBranch defaultBranch={0} key={message.key}>
              <MessageBranchContent>
                {versions.map((version) => (
                  <Message
                    from={message.from}
                    key={`${message.key}-${version.id}`}
                  >
                    <div>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning
                          duration={message.reasoning.duration}
                          isStreaming={message.isReasoningStreaming}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      {(message.from === "user" ||
                        message.isReasoningComplete ||
                        !message.reasoning) && (
                        <MessageContent
                          className={cn(
                            "group-[.is-user]:rounded-[24px] group-[.is-user]:rounded-br-sm group-[.is-user]:border group-[.is-user]:bg-background group-[.is-user]:text-foreground",
                            "group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground"
                          )}
                        >
                          <MessageResponse>{version.content}</MessageResponse>
                        </MessageContent>
                      )}
                    </div>
                  </Message>
                ))}
              </MessageBranchContent>
              {versions.length > 1 && (
                <MessageBranchSelector className="px-0" from={message.from}>
                  <MessageBranchPrevious />
                  <MessageBranchPage />
                  <MessageBranchNext />
                </MessageBranchSelector>
              )}
            </MessageBranch>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {/* Input Area - FIXED at bottom with dark background */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-secondary">
        <div className="w-full max-w-[1000px] mx-auto px-4 py-4">
          <div className="relative flex flex-col bg-card rounded-2xl p-3 gap-3 focus-within:outline-none border border-border">
            {/* Text input area on top */}
            <textarea
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none ring-0 focus:outline-none focus:ring-0 text-base resize-none min-h-[80px] px-2"
              placeholder="How can Grok help?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleSubmit({ text: value, files: [] });
                    setText('');
                  }
                }
              }}
            />

            {/* Button row on bottom */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {/* DeepSearch button */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-foreground hover:bg-muted rounded-lg transition-all text-sm border border-border"
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  title="DeepSearch"
                >
                  <SearchIcon size={16} />
                  <span>DeepSearch</span>
                </button>
              </div>

              {/* Submit button */}
              <button
                type="button"
                className="p-2 bg-foreground hover:bg-foreground/90 text-background rounded-full transition-colors disabled:opacity-50"
                disabled={!text.trim() || status === "streaming"}
                onClick={() => {
                  if (text.trim()) {
                    handleSubmit({ text, files: [] });
                    setText('');
                  }
                }}
              >
                {status === "streaming" ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 17L17 10L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 10H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Example;
