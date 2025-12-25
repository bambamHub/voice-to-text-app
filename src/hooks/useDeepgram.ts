import { useState, useEffect, useCallback, useRef } from "react";
import { DeepgramSDKService } from "../services/deepgramSDK";

export const useDeepgram = (apiKey: string) => {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const deepgramServiceRef = useRef<DeepgramSDKService | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isReconnectingRef = useRef(false);

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    console.log("🎬 Transcript received:", text, isFinal);
    
    if (isFinal) {
      setTranscript((prev) => {
        const newText = prev ? `${prev} ${text}` : text;
        console.log("📄 Final transcript:", newText);
        return newText;
      });
      setInterimTranscript("");
    } else {
      setInterimTranscript(text);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!apiKey || apiKey.includes("your_")) {
      const errorMsg = "Invalid API key";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (isReconnectingRef.current) {
      console.log("⏳ Already reconnecting...");
      return;
    }

    try {
      isReconnectingRef.current = true;
      console.log("🚀 Connecting to Deepgram...");
      
      const service = new DeepgramSDKService(apiKey);
      service.setOnTranscript(handleTranscript);
      
      // Handle connection close event
      service.setOnClose(() => {
        console.log("⚠️ Connection closed, will reconnect...");
        setIsConnected(false);
        
        // Auto-reconnect after 2 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log("🔄 Auto-reconnecting...");
          isReconnectingRef.current = false;
          connect();
        }, 2000);
      });
      
      await service.connect();
      
      // Wait a bit for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      deepgramServiceRef.current = service;
      setIsConnected(true);
      setError(null);
      isReconnectingRef.current = false;
      
      console.log("✅ Connected and ready!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed";
      console.error("❌ Connection error:", errorMessage);
      setError(errorMessage);
      setIsConnected(false);
      isReconnectingRef.current = false;
      throw err;
    }
  }, [apiKey, handleTranscript]);

  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    const service = deepgramServiceRef.current;
    if (service && service.getIsConnected()) {
      service.sendAudio(audioData);
    }
  }, []);

  const finishStream = useCallback(() => {
    // DON'T finish the connection - keep it alive!
    console.log("🏁 Recording stopped (keeping connection alive)");
    // deepgramServiceRef.current?.finish(); // Commented out
  }, []);

  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting...");
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    deepgramServiceRef.current?.disconnect();
    deepgramServiceRef.current = null;
    setIsConnected(false);
    isReconnectingRef.current = false;
  }, []);

  const clearTranscript = useCallback(() => {
    console.log("🗑️ Clearing transcript");
    setTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      console.log("🧹 Cleanup");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    transcript,
    interimTranscript,
    isConnected,
    error,
    connect,
    sendAudio,
    finishStream,
    disconnect,
    clearTranscript,
  };
};
