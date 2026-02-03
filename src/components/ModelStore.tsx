import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Download, 
  Trash2, 
  RefreshCw, 
  Check, 
  HardDrive,
  Cpu,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useOllama } from "@/hooks/useOllama";
import { cn } from "@/lib/utils";

interface ModelStoreProps {
  ollamaUrl: string;
  onModelSelect?: (model: string) => void;
  selectedModel?: string;
}

export function ModelStore({ ollamaUrl, onModelSelect, selectedModel }: ModelStoreProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"library" | "installed">("library");
  
  const {
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
  } = useOllama(ollamaUrl);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const libraryModels = getLibraryModels();
  
  const filteredLibrary = libraryModels.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase()) ||
    m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredInstalled = installedModels.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Model Store
          </h2>
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
              isConnected 
                ? "bg-ollama/20 text-ollama" 
                : "bg-destructive/20 text-destructive"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isConnected ? "bg-ollama" : "bg-destructive"
              )} />
              {isConnected ? "Connected" : "Offline"}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={refreshModels}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="pl-9 bg-input/50 border-border"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 mt-3 p-1 bg-muted/30 rounded-lg">
          <button
            onClick={() => setView("library")}
            className={cn(
              "flex-1 py-1.5 text-sm rounded-md transition-colors",
              view === "library"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Library
          </button>
          <button
            onClick={() => setView("installed")}
            className={cn(
              "flex-1 py-1.5 text-sm rounded-md transition-colors",
              view === "installed"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Installed ({installedModels.length})
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {view === "library" ? (
              filteredLibrary.map((model) => (
                <motion.div
                  key={model.name}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-3 rounded-xl glass-card hover-lift",
                    model.isInstalled && "border-ollama/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{model.name}</h3>
                        {model.isInstalled && (
                          <Check className="h-4 w-4 text-ollama shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {model.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {model.size && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {model.size}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      {downloadProgress[model.name] !== undefined ? (
                        <div className="w-16">
                          <Progress value={downloadProgress[model.name]} className="h-1.5" />
                          <span className="text-[10px] text-muted-foreground">
                            {downloadProgress[model.name]}%
                          </span>
                        </div>
                      ) : model.isInstalled ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onModelSelect?.(model.name)}
                          className={cn(
                            "h-7 text-xs",
                            selectedModel === model.name && "bg-primary text-primary-foreground"
                          )}
                        >
                          {selectedModel === model.name ? "Active" : "Use"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pullModel(model.name)}
                          disabled={!isConnected}
                          className="h-7 text-xs gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Pull
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              installedModels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Cpu className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No models installed</p>
                  <p className="text-xs mt-1">Browse the library to download models</p>
                </div>
              ) : (
                filteredInstalled.map((model) => (
                  <motion.div
                    key={model.name}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "p-3 rounded-xl glass-card hover-lift",
                      selectedModel === model.name && "border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{model.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {formatSize(model.size)}
                          </span>
                          {model.details?.parameter_size && (
                            <span>{model.details.parameter_size}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onModelSelect?.(model.name)}
                          className={cn(
                            "h-7 text-xs",
                            selectedModel === model.name && "bg-primary text-primary-foreground"
                          )}
                        >
                          {selectedModel === model.name ? "Active" : "Use"}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteModel(model.name)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
