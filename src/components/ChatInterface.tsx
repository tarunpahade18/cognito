import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Menu, 
  PanelLeftClose, 
  Cpu, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { ModelStore } from "@/components/ModelStore";
import { PDFViewer } from "@/components/PDFViewer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ProviderBadge } from "@/components/ProviderBadge";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { usePDF } from "@/hooks/usePDF";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

type RightPanelView = "models" | "documents" | "settings" | null;

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState<RightPanelView>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { settings, updateSettings } = useSettings();
  
  const {
    documents,
    activeDocument,
    isLoading: pdfLoading,
    uploadPDF,
    removeDocument,
    setActiveDocument,
    getContextForRAG,
  } = usePDF();

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
  } = useChat({ 
    settings,
    pdfContext: activeDocument ? getContextForRAG("") : undefined,
  });

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useVoice();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const context = activeDocument ? getContextForRAG(content) : undefined;
    sendMessage(content);
  };

  const handleFileUpload = async (file: File) => {
    if (file.type === "application/pdf") {
      await uploadPDF(file);
      setRightPanel("documents");
    }
  };

  const toggleRightPanel = (view: RightPanelView) => {
    setRightPanel((prev) => (prev === view ? null : view));
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-border shrink-0 overflow-hidden"
          >
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={createConversation}
              onDeleteConversation={deleteConversation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-border glass-subtle">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground rounded-xl"
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
            {activeConversation && (
              <ProviderBadge provider={settings.provider} />
            )}
          </div>

          {/* Right Panel Toggles */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleRightPanel("models")}
              className={cn(
                "rounded-xl transition-colors",
                rightPanel === "models" 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Model Store"
            >
              <Cpu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleRightPanel("documents")}
              className={cn(
                "rounded-xl transition-colors relative",
                rightPanel === "documents" 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Documents"
            >
              <FileText className="h-5 w-5" />
              {documents.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  {documents.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleRightPanel("settings")}
              className={cn(
                "rounded-xl transition-colors",
                rightPanel === "settings" 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 0 ? (
              <WelcomeScreen 
                onSuggestionClick={handleSendMessage} 
                hasDocuments={documents.length > 0}
              />
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
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          isListening={isListening}
          transcript={transcript}
          provider={settings.provider}
          onStartListening={startListening}
          onStopListening={stopListening}
        />
      </div>

      {/* Right Panel */}
      <AnimatePresence mode="wait">
        {rightPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-border shrink-0 overflow-hidden glass-sidebar"
          >
            {rightPanel === "models" && (
              <ModelStore
                ollamaUrl={settings.ollamaUrl}
                selectedModel={settings.ollamaModel}
                onModelSelect={(model) => updateSettings({ ollamaModel: model, provider: "ollama" })}
              />
            )}
            {rightPanel === "documents" && (
              <PDFViewer
                documents={documents}
                activeDocument={activeDocument}
                isLoading={pdfLoading}
                onUpload={uploadPDF}
                onRemove={removeDocument}
                onSelect={setActiveDocument}
              />
            )}
            {rightPanel === "settings" && (
              <SettingsPanel
                settings={settings}
                onUpdate={updateSettings}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
