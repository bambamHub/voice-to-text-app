import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

export class DeepgramSDKService {
  private client: any;
  private connection: any;
  private onTranscript: ((text: string, isFinal: boolean) => void) | null = null;
  private onClose: (() => void) | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(apiKey: string) {
    console.log("🔑 Creating Deepgram client");
    this.client = createClient(apiKey);
  }

  async connect(): Promise<void> {
    if (this.connectionPromise) {
      console.log("⏳ Connection in progress...");
      return this.connectionPromise;
    }

    console.log("🔌 Opening Deepgram connection...");

    this.connectionPromise = new Promise((resolve, reject) => {
      this.connection = this.client.listen.live({
        model: "nova-2",
        language: "en-US",
        punctuate: true,
        interim_results: true,
        smart_format: true,
        encoding: "linear16",
        sample_rate: 16000,
        channels: 1,
        endpointing: 500, // Increased to prevent early closure
      });

      let resolved = false;

      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("✅ Connection OPEN!");
        this.isConnected = true;
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        console.log("🎯 Transcript event");
        
        try {
          const transcript = data.channel?.alternatives?.[0]?.transcript;
          const isFinal = data.is_final || false;
          
          if (transcript) {
            console.log(`📝 "${transcript}" [${isFinal ? "FINAL" : "interim"}]`);
            if (this.onTranscript) {
              this.onTranscript(transcript, isFinal);
            }
          }
        } catch (err) {
          console.error("❌ Error:", err);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
        console.log("ℹ️ Metadata received");
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error("❌ Connection error:", error);
        this.isConnected = false;
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log("🔌 Connection closed");
        this.isConnected = false;
        this.connectionPromise = null;
        
        // Notify parent
        if (this.onClose) {
          this.onClose();
        }
      });

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          console.log("⏰ Timeout - assuming connected");
          this.isConnected = true;
          resolved = true;
          resolve();
        }
      }, 3000);
    });

    return this.connectionPromise;
  }

  sendAudio(data: ArrayBuffer): void {
    if (!this.isConnected) {
      return;
    }

    if (!this.connection) {
      return;
    }

    try {
      this.connection.send(data);
      console.log(`✅ Sent ${data.byteLength} bytes`);
    } catch (err) {
      console.error("❌ Send error:", err);
    }
  }

  setOnTranscript(callback: (text: string, isFinal: boolean) => void): void {
    console.log("📌 Transcript callback set");
    this.onTranscript = callback;
  }

  setOnClose(callback: () => void): void {
    console.log("📌 Close callback set");
    this.onClose = callback;
  }

  finish(): void {
    console.log("🏁 Finishing stream");
    // Don't actually finish - just stop sending
    // if (this.connection) {
    //   this.connection.finish();
    // }
  }

  disconnect(): void {
    console.log("🔌 Disconnecting");
    this.isConnected = false;
    this.connectionPromise = null;
    if (this.connection) {
      this.connection.finish();
      this.connection = null;
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}
