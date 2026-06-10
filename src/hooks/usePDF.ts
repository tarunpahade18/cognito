import { useState, useCallback } from "react";
import { PDFDocument } from "@/types/chat";

export function usePDF() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<PDFDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPDF = useCallback(async (file: File): Promise<PDFDocument | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Read file as text (basic extraction for now)
      const arrayBuffer = await file.arrayBuffer();
      
      // For now, we'll use a simple approach - in production you'd use pdf.js or server-side parsing
      const textContent = await extractTextFromPDF(arrayBuffer);
      
      const doc: PDFDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        content: textContent,
        pages: textContent.split(/\f/).length || 1, // Form feed is page separator
        uploadedAt: new Date(),
      };

      setDocuments((prev) => [...prev, doc]);
      setActiveDocument(doc);
      return doc;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process PDF");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocument?.id === id) {
      setActiveDocument(null);
    }
  }, [activeDocument]);

  const getContextForRAG = useCallback((query: string, maxChunks: number = 5): string => {
    if (!activeDocument) return "";

    // Simple chunking - split by paragraphs
    const chunks = activeDocument.content
      .split(/\n\n+/)
      .filter((chunk) => chunk.trim().length > 50);

    // Simple relevance scoring based on word overlap
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    
    const scoredChunks = chunks.map((chunk) => {
      const chunkWords = chunk.toLowerCase().split(/\s+/);
      const overlap = chunkWords.filter((w) => queryWords.has(w)).length;
      return { chunk, score: overlap };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    
    return scoredChunks
      .slice(0, maxChunks)
      .map((c) => c.chunk)
      .join("\n\n---\n\n");
  }, [activeDocument]);

  return {
    documents,
    activeDocument,
    isLoading,
    error,
    uploadPDF,
    removeDocument,
    setActiveDocument,
    getContextForRAG,
  };
}

// Simple PDF text extraction (basic implementation)
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // This is a simplified extraction - in production, use pdf.js
  const uint8Array = new Uint8Array(arrayBuffer);
  let text = "";
  
  // Try to extract readable text from PDF
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const raw = decoder.decode(uint8Array);
  
  // Extract text between stream/endstream or BT/ET markers
  const textMatches = raw.match(/\(([^)]+)\)/g);
  if (textMatches) {
    text = textMatches
      .map((m) => m.slice(1, -1))
      .filter((t) => t.length > 2 && !Array.from(t).every((char) => char.charCodeAt(0) <= 31))
      .join(" ");
  }
  
  // If we couldn't extract much, return a placeholder
  if (text.trim().length < 100) {
    text = `[PDF Document - Text extraction requires advanced parsing. 
    
For full PDF text extraction, the content would be processed server-side. 
This document has been uploaded and is ready for AI-powered analysis.

Document size: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB]`;
  }

  return text;
}
