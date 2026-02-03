import { AIProvider } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Server, Sparkles, Zap } from "lucide-react";

interface ProviderBadgeProps {
  provider: AIProvider;
  className?: string;
}

export function ProviderBadge({ provider, className }: ProviderBadgeProps) {
  const config = {
    ollama: {
      label: "Ollama",
      icon: Server,
      className: "provider-ollama",
    },
    openai: {
      label: "OpenAI",
      icon: Sparkles,
      className: "provider-openai",
    },
    lovable: {
      label: "Lovable AI",
      icon: Zap,
      className: "provider-lovable",
    },
  };

  const { label, icon: Icon, className: providerClass } = config[provider];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
        providerClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}
