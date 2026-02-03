import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Server,
  Key,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSettings, AIProvider } from "@/types/chat";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

const providers: { id: AIProvider; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "ollama",
    name: "Ollama",
    description: "Run AI models locally on your machine",
    icon: <Server className="h-5 w-5" />,
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Use GPT-4, GPT-4o and other OpenAI models",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "lovable",
    name: "Lovable AI",
    description: "Built-in AI powered by Gemini & GPT",
    icon: <Sparkles className="h-5 w-5" />,
  },
];

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Settings
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Provider Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">AI Provider</Label>
            <div className="space-y-2">
              {providers.map((provider) => (
                <motion.button
                  key={provider.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onUpdate({ provider: provider.id })}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all glass-card",
                    settings.provider === provider.id
                      ? "border-primary/50 bg-primary/5"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        settings.provider === provider.id
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {provider.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{provider.name}</span>
                        {settings.provider === provider.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Ollama Settings */}
          {settings.provider === "ollama" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="ollama-url" className="text-sm">
                  Ollama Server URL
                </Label>
                <Input
                  id="ollama-url"
                  value={settings.ollamaUrl}
                  onChange={(e) => onUpdate({ ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="mt-1.5 bg-input/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Make sure Ollama is running with CORS enabled
                </p>
              </div>

              <div>
                <Label htmlFor="ollama-model" className="text-sm">
                  Default Model
                </Label>
                <Input
                  id="ollama-model"
                  value={settings.ollamaModel}
                  onChange={(e) => onUpdate({ ollamaModel: e.target.value })}
                  placeholder="llama3.2"
                  className="mt-1.5 bg-input/50"
                />
              </div>
            </motion.div>
          )}

          {/* OpenAI Settings */}
          {settings.provider === "openai" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="openai-key" className="text-sm">
                  API Key
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="openai-key"
                    type={showApiKey ? "text" : "password"}
                    value={settings.openaiApiKey}
                    onChange={(e) => onUpdate({ openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="pr-10 bg-input/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your API key is stored locally in your browser
                </p>
              </div>

              <div>
                <Label htmlFor="openai-model" className="text-sm">
                  Model
                </Label>
                <Input
                  id="openai-model"
                  value={settings.openaiModel}
                  onChange={(e) => onUpdate({ openaiModel: e.target.value })}
                  placeholder="gpt-4o-mini"
                  className="mt-1.5 bg-input/50"
                />
              </div>
            </motion.div>
          )}

          {/* Lovable AI Info */}
          {settings.provider === "lovable" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-lovable/10 border border-lovable/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-lovable mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Lovable AI</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No API key required! Uses Gemini and GPT models through our
                    secure gateway. Perfect for getting started.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Help */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Need help?</p>
            <div className="space-y-2">
              <a
                href="https://ollama.com/download"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Download Ollama
              </a>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Get OpenAI API Key
              </a>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
