import { useRef, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Menu, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ScreenSharePreview } from "@/components/ScreenSharePreview";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { useScreenShare } from "@/hooks/useScreenShare";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    isLoading,
    createConversation,
    setActiveConversationId,
    deleteConversation,
    sendMessage,
  } = useChat();

  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoice();

  const {
    isSharing,
    stream,
    videoRef,
    canvasRef,
    startSharing,
    stopSharing,
    getScreenDescription,
  } = useScreenShare();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Speak assistant responses if voice is enabled
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !lastMessage.isStreaming) {
        speak(lastMessage.content);
      }
    }
  }, [messages, voiceEnabled, speak]);

  const handleSendMessage = async (content: string) => {
    let screenContext: string | undefined;

    if (isSharing) {
      const description = await getScreenDescription();
      if (description) {
        screenContext = "User is sharing their screen. The current screen shows: " + description;
      }
    }

    sendMessage(content, screenContext);
  };

  const handleToggleScreenShare = async () => {
    if (isSharing) {
      stopSharing();
    } else {
      await startSharing();
    }
  };

  const handleToggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleVoiceSubmit = () => {
    if (transcript) {
      handleSendMessage(transcript);
    }
  };

  // Submit voice input when user stops speaking
  useEffect(() => {
    if (!isListening && transcript) {
      handleVoiceSubmit();
    }
  }, [isListening]);

  return (
    <div className="flex h-screen bg-background">
      {/* Hidden video and canvas for screen capture */}
      <video ref={videoRef} className="hidden" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <div className="w-72 border-r border-border shrink-0">
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={createConversation}
              onDeleteConversation={deleteConversation}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="font-semibold text-foreground">
              {activeConversation?.title || "AI Assistant"}
            </h1>
          </div>

          {isSharing && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Screen Sharing Active</span>
            </div>
          )}
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={handleSendMessage} />
            ) : (
              <div className="py-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isSharing={isSharing}
          voiceEnabled={voiceEnabled}
          transcript={transcript}
          onStartListening={startListening}
          onStopListening={stopListening}
          onToggleVoice={handleToggleVoice}
          onToggleScreenShare={handleToggleScreenShare}
        />
      </div>

      {/* Screen Share Preview */}
      <AnimatePresence>
        <ScreenSharePreview
          stream={stream}
          isSharing={isSharing}
          onStop={stopSharing}
        />
      </AnimatePresence>
    </div>
  );
}
