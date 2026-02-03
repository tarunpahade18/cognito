import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProviderBadge } from "@/components/ProviderBadge";
import { AIProvider } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isLoading: boolean;
  isListening: boolean;
  transcript: string;
  provider: AIProvider;
  onStartListening: () => void;
  onStopListening: () => void;
}

export function ChatInput({
  onSendMessage,
  onFileUpload,
  isLoading,
  isListening,
  transcript,
  provider,
  onStartListening,
  onStopListening,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update input with voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 border-t border-border glass-subtle">
      <div className="max-w-3xl mx-auto">
        {/* Voice transcript indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 px-4 py-2 rounded-xl glass-card border-primary/30"
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-primary rounded-full animate-voice-wave"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-primary">
                  {transcript || "Listening..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="relative glass-card rounded-2xl p-1">
          <div className="flex items-end gap-2 p-2">
            {/* File Upload */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50"
              title="Upload PDF"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
              rows={1}
            />

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Mic Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={isListening ? onStopListening : onStartListening}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all",
                  isListening
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                disabled={isLoading}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              {/* Send Button */}
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all",
                  input.trim()
                    ? "bg-primary hover:bg-primary/90 glow-sm"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Provider Badge */}
          <div className="flex items-center justify-between px-3 pb-2">
            <ProviderBadge provider={provider} />
            <p className="text-[10px] text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
