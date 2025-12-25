export interface DeepgramConfig {
  apiKey: string;
  model?: string;
  language?: string;
  punctuate?: boolean;
  interimResults?: boolean;
}

export interface TranscriptResult {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
}

export enum RecordingState {
  IDLE = "IDLE",
  RECORDING = "RECORDING",
  PROCESSING = "PROCESSING",
  ERROR = "ERROR",
}

export interface AudioRecorderState {
  state: RecordingState;
  error: string | null;
}
