import { useState, useCallback } from "react";
import { OllamaModel, OllamaLibraryModel } from "@/types/chat";

// Popular Ollama models from the library
const LIBRARY_MODELS: OllamaLibraryModel[] = [
  { name: "llama3.2", description: "Meta's latest Llama model, optimized for chat", tags: ["chat", "fast"], pulls: 1200000, size: "2.0 GB" },
  { name: "llama3.2:1b", description: "Lightweight Llama 3.2 1B parameter model", tags: ["chat", "lightweight"], pulls: 500000, size: "1.3 GB" },
  { name: "mistral", description: "Mistral AI's 7B model, excellent for general tasks", tags: ["chat", "code"], pulls: 800000, size: "4.1 GB" },
  { name: "mixtral", description: "Mistral's Mixture of Experts model", tags: ["chat", "reasoning"], pulls: 450000, size: "26 GB" },
  { name: "codellama", description: "Code-specialized Llama model for programming", tags: ["code", "chat"], pulls: 600000, size: "3.8 GB" },
  { name: "phi3", description: "Microsoft's efficient small language model", tags: ["chat", "fast"], pulls: 400000, size: "2.2 GB" },
  { name: "gemma2", description: "Google's Gemma 2 model family", tags: ["chat", "reasoning"], pulls: 350000, size: "5.4 GB" },
  { name: "qwen2.5", description: "Alibaba's Qwen 2.5 multilingual model", tags: ["chat", "multilingual"], pulls: 300000, size: "4.4 GB" },
  { name: "deepseek-coder-v2", description: "DeepSeek's advanced coding assistant", tags: ["code", "reasoning"], pulls: 280000, size: "8.9 GB" },
  { name: "llava", description: "Vision-enabled Llama model for images", tags: ["vision", "chat"], pulls: 250000, size: "4.7 GB" },
  { name: "nomic-embed-text", description: "Text embedding model for RAG", tags: ["embedding", "rag"], pulls: 200000, size: "274 MB" },
  { name: "mxbai-embed-large", description: "High-quality embeddings for search", tags: ["embedding", "rag"], pulls: 150000, size: "670 MB" },
];

export function useOllama(baseUrl: string = "http://localhost:11434") {
  const [installedModels, setInstalledModels] = useState<OllamaModel[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setInstalledModels(data.models || []);
        setIsConnected(true);
        setError(null);
        return true;
      }
      setIsConnected(false);
      setError("Ollama server not responding");
      return false;
    } catch {
      setIsConnected(false);
      setError("Cannot connect to Ollama. Make sure it's running at " + baseUrl);
      return false;
    }
  }, [baseUrl]);

  const refreshModels = useCallback(async () => {
    setIsLoading(true);
    await checkConnection();
    setIsLoading(false);
  }, [checkConnection]);

  const pullModel = useCallback(async (modelName: string) => {
    setDownloadProgress((prev) => ({ ...prev, [modelName]: 0 }));
    
    try {
      const response = await fetch(`${baseUrl}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.total && data.completed) {
              const progress = Math.round((data.completed / data.total) * 100);
              setDownloadProgress((prev) => ({ ...prev, [modelName]: progress }));
            }
            if (data.status === "success") {
              setDownloadProgress((prev) => {
                const updated = { ...prev };
                delete updated[modelName];
                return updated;
              });
              await refreshModels();
            }
          } catch {
            // Ignore parsing errors
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pull model");
      setDownloadProgress((prev) => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    }
  }, [baseUrl, refreshModels]);

  const deleteModel = useCallback(async (modelName: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete model: ${response.statusText}`);
      }

      await refreshModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete model");
    }
  }, [baseUrl, refreshModels]);

  const getLibraryModels = useCallback((): OllamaLibraryModel[] => {
    return LIBRARY_MODELS.map((model) => ({
      ...model,
      isInstalled: installedModels.some((m) => m.name.startsWith(model.name)),
    }));
  }, [installedModels]);

  return {
    installedModels,
    isConnected,
    isLoading,
    downloadProgress,
    error,
    checkConnection,
    refreshModels,
    pullModel,
    deleteModel,
    getLibraryModels,
  };
}
