import { motion } from "framer-motion";
import { Plus, MessageSquare, Trash2, Server, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation, AIProvider } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

const providerIcons: Record<AIProvider, React.ReactNode> = {
  ollama: <Server className="h-3 w-3" />,
  openai: <Sparkles className="h-3 w-3" />,
};

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  const groupedConversations = groupByDate(conversations);

  return (
    <div className="flex flex-col h-full glass-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          onClick={onNewConversation}
          className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-0 rounded-xl"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-2 space-y-4">
          {Object.entries(groupedConversations).map(([group, items]) => (
            <div key={group}>
              <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group}
              </h3>
              <div className="space-y-1">
                {items.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group relative"
                  >
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                        activeConversationId === conversation.id
                          ? "glass-card border-primary/30 text-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <div className={cn(
                        "shrink-0 p-1.5 rounded-lg",
                        activeConversationId === conversation.id
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/50 text-muted-foreground"
                      )}>
                        {conversation.provider ? providerIcons[conversation.provider] : <MessageSquare className="h-3 w-3" />}
                      </div>
                      <span className="truncate text-sm">
                        {conversation.title || "New conversation"}
                      </span>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="px-3 py-8 text-center text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function groupByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, Conversation[]> = {};

  conversations.forEach((conversation) => {
    const date = new Date(conversation.updatedAt);
    let group: string;

    if (isSameDay(date, today)) {
      group = "Today";
    } else if (isSameDay(date, yesterday)) {
      group = "Yesterday";
    } else {
      group = "Older";
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(conversation);
  });

  return groups;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
