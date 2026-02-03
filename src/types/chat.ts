export type AIProvider = "ollama" | "openai" | "lovable";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  provider?: AIProvider;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  provider?: AIProvider;
}

export interface ScreenShareState {
  isSharing: boolean;
  stream: MediaStream | null;
  error: string | null;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaLibraryModel {
  name: string;
  description: string;
  tags: string[];
  pulls: number;
  size?: string;
  isInstalled?: boolean;
}

export interface PDFDocument {
  id: string;
  name: string;
  content: string;
  pages: number;
  uploadedAt: Date;
}

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  baseUrl?: string;
  apiKey?: string;
}

export interface AppSettings {
  provider: AIProvider;
  ollamaUrl: string;
  ollamaModel: string;
  openaiApiKey: string;
  openaiModel: string;
}
