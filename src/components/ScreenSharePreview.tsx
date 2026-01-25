import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScreenSharePreviewProps {
  stream: MediaStream | null;
  isSharing: boolean;
  onStop: () => void;
}

export function ScreenSharePreview({ stream, isSharing, onStop }: ScreenSharePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!isSharing || !stream) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 right-4 w-64 rounded-xl overflow-hidden shadow-2xl border border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Screen Sharing</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onStop}
          className="h-6 w-6 rounded-full hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Video Preview */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 ring-2 ring-primary/50 ring-inset rounded-b-xl pointer-events-none" />
      </div>

      {/* Status */}
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">AI can see your screen</span>
      </div>
    </motion.div>
  );
}
