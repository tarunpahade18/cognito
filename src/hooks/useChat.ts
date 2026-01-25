import { useState, useCallback } from "react";
import { Message, Conversation } from "@/types/chat";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const createConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, []);

  const updateConversationTitle = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const sendMessage = useCallback(
    async (content: string, screenContext?: string) => {
      let conversationId = activeConversationId;

      if (!conversationId) {
        conversationId = createConversation();
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      // Add user message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, userMessage],
                updatedAt: new Date(),
                title: c.messages.length === 0 ? content.slice(0, 50) : c.title,
              }
            : c
        )
      );

      setIsLoading(true);

      try {
        const currentConversation = conversations.find((c) => c.id === conversationId);
        const messageHistory = currentConversation?.messages || [];

        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              ...messageHistory.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: screenContext ? `[Screen Context: ${screenContext}]\n\n${content}` : content },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get response: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantContent = "";
        const assistantId = crypto.randomUUID();

        // Add empty assistant message
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: assistantId,
                      role: "assistant" as const,
                      content: "",
                      timestamp: new Date(),
                      isStreaming: true,
                    },
                  ],
                }
              : c
          )
        );

        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === conversationId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantId
                              ? { ...m, content: assistantContent }
                              : m
                          ),
                        }
                      : c
                  )
                );
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Mark streaming complete
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  ),
                  updatedAt: new Date(),
                }
              : c
          )
        );
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, errorMessage] }
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, conversations, createConversation]
  );

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    isLoading,
    createConversation,
    setActiveConversationId,
    updateConversationTitle,
    deleteConversation,
    sendMessage,
  };
}
