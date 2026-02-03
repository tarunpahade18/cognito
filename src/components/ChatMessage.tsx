import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { User, Server, Sparkles, Zap } from "lucide-react";
import { Message, AIProvider } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

const providerConfig: Record<AIProvider, { icon: React.ElementType; color: string }> = {
  ollama: { icon: Server, color: "text-ollama" },
  openai: { icon: Sparkles, color: "text-foreground" },
  lovable: { icon: Zap, color: "text-lovable" },
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const provider = message.provider || "lovable";
  const { icon: ProviderIcon, color } = providerConfig[provider];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-3 py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className={cn(
          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center glass-card",
          color
        )}>
          <ProviderIcon className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "glass-card rounded-bl-md"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 text-foreground">{children}</p>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="px-1.5 py-0.5 rounded-md bg-muted text-primary font-mono text-xs">
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block p-3 rounded-xl bg-muted/50 overflow-x-auto font-mono text-xs text-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="my-2 overflow-hidden rounded-xl">{children}</pre>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-2 space-y-1 text-foreground">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-2 space-y-1 text-foreground">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm text-foreground">{children}</li>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-semibold mb-2 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mb-1 text-foreground">{children}</h3>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content || (message.isStreaming ? "..." : "")}
            </ReactMarkdown>
          </div>
        )}

        {message.isStreaming && (
          <div className="flex gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200" />
          </div>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
          <User className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}
