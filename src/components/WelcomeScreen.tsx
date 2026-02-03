import { motion } from "framer-motion";
import { Sparkles, FileText, Cpu, MessageSquare } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
  hasDocuments: boolean;
}

const suggestions = [
  { 
    text: "Explain this document", 
    description: "Summarize and extract key points",
    icon: FileText,
    requiresDoc: true,
  },
  { 
    text: "Help me code", 
    description: "Get assistance with programming",
    icon: Sparkles,
    requiresDoc: false,
  },
  { 
    text: "Analyze data", 
    description: "Extract insights from your content",
    icon: Cpu,
    requiresDoc: false,
  },
  { 
    text: "Answer questions", 
    description: "Ask anything about any topic",
    icon: MessageSquare,
    requiresDoc: false,
  },
];

export function WelcomeScreen({ onSuggestionClick, hasDocuments }: WelcomeScreenProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="mb-8"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-blue-500 to-purple-600 flex items-center justify-center glow animate-float">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-blue-500 to-purple-600 blur-2xl opacity-30" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-semibold text-foreground mb-2 text-glow"
      >
        {getGreeting()}
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-muted-foreground mb-10"
      >
        {hasDocuments 
          ? "Ask me about your documents or anything else"
          : "Upload a PDF or start a conversation"
        }
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl"
      >
        {suggestions.map((suggestion, index) => {
          const isDisabled = suggestion.requiresDoc && !hasDocuments;
          const Icon = suggestion.icon;
          
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => !isDisabled && onSuggestionClick(suggestion.text)}
              disabled={isDisabled}
              className={`group p-4 rounded-2xl glass-card text-left transition-all duration-200 hover-lift ${
                isDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {suggestion.text}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
