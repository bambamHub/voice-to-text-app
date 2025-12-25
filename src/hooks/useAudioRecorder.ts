import { useState, useCallback, useRef, useEffect } from "react";
import { AudioCaptureService } from "../services/audioCapture";
import { RecordingState, AudioRecorderState } from "../types";

export const useAudioRecorder = (
  onAudioData: (data: ArrayBuffer) => void
): AudioRecorderState & {
  initialize: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  cleanup: () => Promise<void>;
} => {
  const [state, setState] = useState<RecordingState>(RecordingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const audioCaptureRef = useRef<AudioCaptureService | null>(null);
  const autoStopCallbackRef = useRef<(() => void) | null>(null);

  const initialize = useCallback(async () => {
    try {
      console.log("🎤 Initializing audio with auto-stop...");
      
      const service = new AudioCaptureService();
      
      await service.initialize({
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      });

      service.setOnAudioData(onAudioData);
      
      // Set silence detection callback
      service.setOnSilenceDetected(() => {
        console.log("🤫 Auto-stop triggered");
        if (autoStopCallbackRef.current) {
          autoStopCallbackRef.current();
        }
      });

      audioCaptureRef.current = service;
      setState(RecordingState.IDLE);
      setError(null);
      
      console.log("✅ Audio recorder ready");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initialize";
      console.error("❌ Init error:", errorMsg);
      setError(errorMsg);
      setState(RecordingState.ERROR);
      throw err;
    }
  }, [onAudioData]);

  const startRecording = useCallback(() => {
    const service = audioCaptureRef.current;
    
    if (!service || !service.isInitialized()) {
      console.error("❌ Service not initialized");
      setError("Audio service not ready");
      return;
    }

    console.log("🎙️ Starting recording");
    service.start();
    setState(RecordingState.RECORDING);
    setError(null);
  }, []);

  const stopRecording = useCallback(() => {
    const service = audioCaptureRef.current;
    
    if (!service) {
      console.warn("⚠️ No service to stop");
      return;
    }

    console.log("🛑 Stopping recording");
    service.stop();
    setState(RecordingState.IDLE);
  }, []);

  const cleanup = useCallback(async () => {
    const service = audioCaptureRef.current;
    
    if (service) {
      await service.cleanup();
      audioCaptureRef.current = null;
    }
    
    setState(RecordingState.IDLE);
    setError(null);
  }, []);

  // Set auto-stop callback
  useEffect(() => {
    autoStopCallbackRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    error,
    initialize,
    startRecording,
    stopRecording,
    cleanup,
  };
};
