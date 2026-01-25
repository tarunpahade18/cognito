import { useState, useCallback, useRef } from "react";
import { ScreenShareState } from "@/types/chat";

export function useScreenShare() {
  const [state, setState] = useState<ScreenShareState>({
    isSharing: false,
    stream: null,
    error: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startSharing = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: false,
      });

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setState({ isSharing: false, stream: null, error: null });
      });

      setState({ isSharing: true, stream, error: null });
      return stream;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start screen sharing";
      setState({ isSharing: false, stream: null, error: message });
      return null;
    }
  }, []);

  const stopSharing = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    setState({ isSharing: false, stream: null, error: null });
  }, [state.stream]);

  const captureFrame = useCallback((): string | null => {
    if (!state.stream || !videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.8);
  }, [state.stream]);

  const getScreenDescription = useCallback(async (): Promise<string | null> => {
    const frame = captureFrame();
    if (!frame) return null;

    // Return base64 image for AI to analyze
    return frame;
  }, [captureFrame]);

  return {
    ...state,
    videoRef,
    canvasRef,
    startSharing,
    stopSharing,
    captureFrame,
    getScreenDescription,
  };
}
