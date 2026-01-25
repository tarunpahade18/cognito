import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Monitor, MonitorOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isSharing: boolean;
  voiceEnabled: boolean;
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleVoice: () => void;
  onToggleScreenShare: () => void;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  isListening,
  isSpeaking,
  isSharing,
  voiceEnabled,
  transcript,
  onStartListening,
  onStopListening,
  onToggleVoice,
  onToggleScreenShare,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        {/* Voice transcript indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20"
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

        <div className="flex items-end gap-2">
          {/* Screen Share Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleScreenShare}
            className={cn(
              "shrink-0 rounded-full transition-colors",
              isSharing
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isSharing ? "Stop sharing screen" : "Share screen"}
          >
            {isSharing ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </Button>

          {/* Voice Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVoice}
            className={cn(
              "shrink-0 rounded-full transition-colors",
              voiceEnabled
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
          >
            {voiceEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>

          {/* Input Area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="min-h-[48px] max-h-[200px] resize-none pr-24 rounded-2xl bg-input border-border focus-visible:ring-primary"
              disabled={isLoading}
              rows={1}
            />

            {/* Action buttons inside textarea */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {/* Mic Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={isListening ? onStopListening : onStartListening}
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  isListening
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse-glow"
                    : "text-muted-foreground hover:text-foreground"
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
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
