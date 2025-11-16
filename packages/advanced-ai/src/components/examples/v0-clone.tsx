"use client";

import { Conversation, ConversationContent } from "@/components/ai/elements/conversation";
import { Loader } from "@/components/ai/elements/loader";
import { Message, MessageContent } from "@/components/ai/elements/message";
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai/elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai/elements/suggestion";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from "@/components/ai/elements/web-preview";
import { nanoid } from "nanoid";
import { useState } from "react";

type Chat = {
  id: string;
  demo: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      id: string;
      type: "user" | "assistant";
      content: string;
    }>
  >([]);

  const handleSendMessage = async (promptMessage: PromptInputMessage) => {
    const hasText = Boolean(promptMessage.text);
    const hasAttachments = Boolean(promptMessage.files?.length);

    if (!(hasText || hasAttachments) || isLoading) {
      return;
    }

    const userMessage = promptMessage.text?.trim() || "Sent with attachments";
    setMessage("");
    setIsLoading(true);

    setChatHistory((prev) => [
      ...prev,
      { id: nanoid(), type: "user", content: userMessage },
    ]);

    try {
      // TODO: Replace with /api/v0 when implementing code generation
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...chatHistory.map(msg => ({ role: msg.type === 'user' ? 'user' : 'assistant', content: msg.content })),
            { role: 'user', content: userMessage }
          ],
          model: "google/gemini-2.5-flash-lite",
          premium: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      // Stream response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = nanoid();

      // Add empty assistant message
      setChatHistory((prev) => [
        ...prev,
        {
          id: assistantId,
          type: "assistant",
          content: "",
        },
      ]);

      // Read streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                assistantContent += parsed.choices[0].delta.content;
                setChatHistory((prev) =>
                  prev.map(msg =>
                    msg.id === assistantId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Some chunks might not be valid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          id: nanoid(),
          type: "assistant",
          content:
            "Sorry, there was an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full overflow-hidden bg-background">
      {/* Chat Panel */}
      <div className="flex w-1/2 flex-col border-r">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b p-3">
          <h1 className="font-semibold text-lg">v0</h1>
        </div>

        {/* Chat Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-[220px]">
          {chatHistory.length === 0 ? (
            <div className="mt-8 text-center font-semibold">
              <p className="mt-4 text-3xl">What can we build together?</p>
              <Suggestions className="mt-8 justify-center">
                <Suggestion
                  onClick={() =>
                    setMessage("Create a responsive navbar with Tailwind CSS")
                  }
                  suggestion="Create a responsive navbar with Tailwind CSS"
                />
                <Suggestion
                  onClick={() => setMessage("Build a todo app with React")}
                  suggestion="Build a todo app with React"
                />
                <Suggestion
                  onClick={() =>
                    setMessage("Make a landing page for a coffee shop")
                  }
                  suggestion="Make a landing page for a coffee shop"
                />
              </Suggestions>
            </div>
          ) : (
            <>
              <Conversation>
                <ConversationContent>
                  {chatHistory.map((msg) => (
                    <Message from={msg.type} key={msg.id}>
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2">
                      <Loader />
                      Creating your app...
                    </div>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </div>

        {/* Input Area - FIXED at bottom of chat panel */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-background border-t">
          <div className="w-full px-4 py-4">
            <div className="relative flex flex-col bg-card rounded-2xl p-3 gap-3 focus-within:outline-none border border-border">
              {/* Text input area on top */}
              <textarea
                className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none ring-0 focus:outline-none focus:ring-0 text-base resize-none min-h-[80px] px-2"
                placeholder="What can we build?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      handleSendMessage({ text: value, files: [] });
                    }
                  }
                }}
              />

              {/* Button row on bottom */}
              <div className="flex items-center justify-end gap-2">
                {/* Submit button */}
                <button
                  type="button"
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50"
                  disabled={!message.trim() || isLoading}
                  onClick={() => {
                    if (message.trim()) {
                      handleSendMessage({ text: message, files: [] });
                    }
                  }}
                >
                  {isLoading ? (
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

      {/* Preview Panel */}
      <div className="flex w-1/2 flex-col">
        <WebPreview>
          <WebPreviewNavigation>
            <WebPreviewUrl
              placeholder="Preview will appear here..."
              value={currentChat?.demo}
            />
          </WebPreviewNavigation>
          <WebPreviewBody src={currentChat?.demo} />
        </WebPreview>
      </div>
    </div>
  );
}
