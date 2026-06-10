import { useState, useEffect, useCallback } from "react";
import { AppSettings, AIProvider } from "@/types/chat";

const SETTINGS_KEY = "ai-assistant-settings";

const defaultSettings: AppSettings = {
  provider: "ollama",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3.2",
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = { ...defaultSettings, ...JSON.parse(stored) } as AppSettings;
        return parsed.provider === "openai" || parsed.provider === "ollama"
          ? parsed
          : defaultSettings;
      }
    } catch {
      console.error("Failed to load settings");
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const setProvider = useCallback((provider: AIProvider) => {
    setSettings((prev) => ({ ...prev, provider }));
  }, []);

  return {
    settings,
    updateSettings,
    setProvider,
  };
}
