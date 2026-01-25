import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { text: "Write a first draft", description: "of an email, essay, or document" },
  { text: "Get advice", description: "on a project, decision, or idea" },
  { text: "Learn something new", description: "ask about any topic" },
  { text: "Analyze my screen", description: "share your screen and ask questions" },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
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
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center glow">
          <Bot className="h-10 w-10 text-primary-foreground" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-semibold text-foreground mb-2"
      >
        {getGreeting()}
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-muted-foreground mb-10"
      >
        What can I help you with today?
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group p-4 rounded-xl bg-card hover:bg-accent border border-border hover:border-primary/50 text-left transition-all duration-200"
          >
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
              {suggestion.text}
            </p>
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
