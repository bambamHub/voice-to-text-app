import { DeepgramConfig, TranscriptResult } from "../types";

export class DeepgramService {
  private socket: WebSocket | null = null;
  private config: DeepgramConfig;
  private onTranscript: ((result: TranscriptResult) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private keepAliveInterval: number | null = null;
  private isReady: boolean = false;

  constructor(config: DeepgramConfig) {
    this.config = {
      model: "nova-2",
      language: "en-US",
      punctuate: true,
      interimResults: true,
      ...config,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const { apiKey, model, language, punctuate, interimResults } = this.config;

        const url = `wss://api.deepgram.com/v1/listen?` +
          `model=${model}&` +
          `language=${language}&` +
          `punctuate=${punctuate}&` +
          `interim_results=${interimResults}&` +
          `encoding=linear16&` +
          `sample_rate=16000&` +
          `channels=1&` +
          `endpointing=300`;

        console.log("🔌 Opening WebSocket...");

        this.socket = new WebSocket(url, ["token", apiKey]);

        this.socket.onopen = () => {
          console.log("✅ WebSocket OPEN!");
          this.isReady = true;
          
          // Keep-alive
          this.keepAliveInterval = window.setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              this.socket.send(JSON.stringify({ type: "KeepAlive" }));
            }
          }, 5000);

          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("📨 Deepgram:", data.type);

            if (data.type === "Results") {
              const alternatives = data.channel?.alternatives;
              if (alternatives && alternatives.length > 0) {
                const transcript = alternatives[0].transcript || "";
                const isFinal = data.is_final || false;
                const confidence = alternatives[0].confidence || 0;

                if (transcript) {
                  console.log(`📝 ${isFinal ? "FINAL" : "interim"}: "${transcript}"`);
                  
                  if (this.onTranscript) {
                    this.onTranscript({ text: transcript, isFinal, confidence });
                  }
                }
              }
            } else if (data.type === "Metadata") {
              console.log("ℹ️ Metadata received");
            }
          } catch (error) {
            console.error("❌ Parse error:", error);
          }
        };

        this.socket.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          this.isReady = false;
          if (this.onError) {
            this.onError("WebSocket error");
          }
          reject(new Error("WebSocket failed"));
        };

        this.socket.onclose = (event) => {
          console.log(`🔌 Closed: ${event.code}`);
          this.isReady = false;
          
          if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
          }
        };
      } catch (error) {
        this.isReady = false;
        reject(error);
      }
    });
  }

  sendAudio(audioData: ArrayBuffer): void {
    // Check ready state
    if (!this.isReady) {
      return; // Silently skip if not ready
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return; // Silently skip
    }

    try {
      this.socket.send(audioData);
      console.log(`🎵 → ${audioData.byteLength} bytes`);
    } catch (error) {
      console.error("❌ Send error:", error);
    }
  }

  finishStream(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "CloseStream" }));
      console.log("🏁 Stream finished");
    }
  }

  disconnect(): void {
    this.isReady = false;
    
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    
    if (this.socket) {
      this.socket.close(1000);
      this.socket = null;
    }
  }

  setOnTranscript(callback: (result: TranscriptResult) => void): void {
    this.onTranscript = callback;
  }

  setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  isConnected(): boolean {
    return this.isReady && this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
