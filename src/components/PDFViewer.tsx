import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PDFDocument } from "@/types/chat";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  documents: PDFDocument[];
  activeDocument: PDFDocument | null;
  isLoading: boolean;
  onUpload: (file: File) => Promise<PDFDocument | null>;
  onRemove: (id: string) => void;
  onSelect: (doc: PDFDocument) => void;
}

export function PDFViewer({
  documents,
  activeDocument,
  isLoading,
  onUpload,
  onRemove,
  onSelect,
}: PDFViewerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    
    for (const file of files) {
      await onUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await onUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents
          </h2>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 h-8"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>

        {documents.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-9 bg-input/50 border-border h-9"
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 transition-colors text-center mb-4",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <FileUp
              className={cn(
                "h-10 w-10 mx-auto mb-3 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p className="text-sm text-muted-foreground">
              {isDragging ? "Drop PDF here" : "Drag & drop PDF files here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click Upload above
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Document List */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "group p-3 rounded-xl glass-card hover-lift cursor-pointer",
                    activeDocument?.id === doc.id && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => onSelect(doc)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate text-sm">{doc.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.pages} page{doc.pages !== 1 ? "s" : ""} •{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(doc.id);
                      }}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {documents.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No documents yet</p>
              <p className="text-xs mt-1">Upload PDFs to chat with them</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Active Document Preview */}
      {activeDocument && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium truncate max-w-[150px]">
                {activeDocument.name}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Active for RAG
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
