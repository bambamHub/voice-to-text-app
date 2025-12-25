import { AudioConfig } from "../types";

export class AudioCaptureService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  private onAudioData: ((data: ArrayBuffer) => void) | null = null;
  private onSilenceDetected: (() => void) | null = null;
  private isRecording = false;

  // Silence detection parameters
  private silenceThreshold = 0.01; // Adjust sensitivity (0.01 = 1% volume)
  private silenceDuration = 2000; // 2 seconds of silence to stop
  private lastSoundTime = 0;
  private silenceCheckInterval: number | null = null;

  async initialize(config: AudioConfig): Promise<void> {
    try {
      console.log("🎤 Requesting microphone...");
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      console.log("✅ Microphone granted");

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      console.log(`🎛️ AudioContext: ${this.audioContext.sampleRate}Hz`);

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Add analyser for volume detection
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.3;

      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      this.processor.onaudioprocess = (event) => {
        if (!this.isRecording || !this.onAudioData) return;

        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convert to PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }

        // Calculate audio level
        const maxAmplitude = Math.max(...inputData.map(Math.abs));
        
        if (maxAmplitude > 0.005) {
          console.log(`🔊 Audio: ${(maxAmplitude * 100).toFixed(1)}%`);
        }

        this.onAudioData(pcmData.buffer);
      };

      // Connect audio graph
      this.source.connect(this.analyser);
      this.analyser.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      console.log("✅ Audio pipeline ready with VAD");
    } catch (error) {
      console.error("❌ Audio init failed:", error);
      throw error;
    }
  }

  private checkSilence(): void {
    if (!this.analyser || !this.isRecording) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += Math.abs(normalized);
    }
    const average = sum / dataArray.length;

    if (average > this.silenceThreshold) {
      // Sound detected
      this.lastSoundTime = Date.now();
    } else {
      // Check if silent for too long
      const silentDuration = Date.now() - this.lastSoundTime;
      
      if (silentDuration > this.silenceDuration) {
        console.log("🤫 Silence detected - auto-stopping");
        if (this.onSilenceDetected) {
          this.onSilenceDetected();
        }
      }
    }
  }

  setOnAudioData(callback: (data: ArrayBuffer) => void): void {
    console.log("📌 Audio callback set");
    this.onAudioData = callback;
  }

  setOnSilenceDetected(callback: () => void): void {
    console.log("📌 Silence detection callback set");
    this.onSilenceDetected = callback;
  }

  start(): void {
    if (!this.audioContext || !this.processor) {
      console.error("❌ Not initialized");
      return;
    }

    console.log("▶️ Starting recording with auto-stop");
    this.isRecording = true;
    this.lastSoundTime = Date.now();

    // Start checking for silence every 500ms
    this.silenceCheckInterval = window.setInterval(() => {
      this.checkSilence();
    }, 500);
  }

  stop(): void {
    console.log("⏹️ Stopping recording");
    this.isRecording = false;

    if (this.silenceCheckInterval) {
      clearInterval(this.silenceCheckInterval);
      this.silenceCheckInterval = null;
    }
  }

  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up...");
    
    this.isRecording = false;
    this.onAudioData = null;
    this.onSilenceDetected = null;

    if (this.silenceCheckInterval) {
      clearInterval(this.silenceCheckInterval);
      this.silenceCheckInterval = null;
    }

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped:", track.label);
      });
      this.mediaStream = null;
    }

    console.log("✅ Cleanup complete");
  }

  isInitialized(): boolean {
    return this.audioContext !== null && this.mediaStream !== null;
  }
}
