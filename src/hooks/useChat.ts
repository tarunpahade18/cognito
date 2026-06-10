import { useState, useCallback } from "react";
import { Message, Conversation, AIProvider, AppSettings } from "@/types/chat";

interface UseChatOptions {
  settings: AppSettings;
  pdfContext?: string;
}

export function useChat({ settings, pdfContext }: UseChatOptions) {
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
      provider: settings.provider,
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, [settings.provider]);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const streamOllama = async (
    messages: { role: string; content: string }[],
    onDelta: (text: string) => void
  ) => {
    const response = await fetch(`${settings.ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: settings.ollamaModel,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            onDelta(data.message.content);
          }
        } catch {
          // Ignore parsing errors
        }
      }
    }
  };

  const streamOpenAI = async (
    messages: { role: string; content: string }[],
    onDelta: (text: string) => void
  ) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.openaiModel,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;

        try {
          const data = JSON.parse(jsonStr);
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        } catch {
          // Ignore parsing errors
        }
      }
    }
  };

  const sendMessage = useCallback(
    async (content: string, screenContext?: string) => {
      let conversationId = activeConversationId;

      if (!conversationId) {
        conversationId = createConversation();
      }

      // Build context-enriched message
      let enrichedContent = content;
      if (pdfContext) {
        enrichedContent = `[Document Context]\n${pdfContext}\n\n[User Question]\n${content}`;
      }
      if (screenContext) {
        enrichedContent = `[Screen Context: ${screenContext}]\n\n${enrichedContent}`;
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
        provider: settings.provider,
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
                    provider: settings.provider,
                  },
                ],
              }
            : c
        )
      );

      try {
        const currentConversation = conversations.find((c) => c.id === conversationId);
        const messageHistory = [
          ...(currentConversation?.messages || []).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: enrichedContent },
        ];

        let assistantContent = "";
        const onDelta = (delta: string) => {
          assistantContent += delta;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantId ? { ...m, content: assistantContent } : m
                    ),
                  }
                : c
            )
          );
        };

        switch (settings.provider) {
          case "ollama":
            await streamOllama(messageHistory, onDelta);
            break;
          case "openai":
            await streamOpenAI(messageHistory, onDelta);
            break;
          default:
            await streamOllama(messageHistory, onDelta);
            break;
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
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: `Error: ${errorMessage}`, isStreaming: false }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, conversations, createConversation, settings, pdfContext]
  );

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    isLoading,
    createConversation,
    setActiveConversationId,
    deleteConversation,
    sendMessage,
  };
}
