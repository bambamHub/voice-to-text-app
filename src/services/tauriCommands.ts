import { invoke } from "@tauri-apps/api/core";

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
}

export interface RecordingStats {
  total_recordings: number;
  api_verified: boolean;
}

// Verify Deepgram API key
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    return await invoke<boolean>("verify_api_key", { apiKey });
  } catch (error) {
    console.error("API key verification failed:", error);
    return false; // Return false instead of throwing
  }
}

// Get system information
export async function getSystemInfo(): Promise<SystemInfo | null> {
  try {
    return await invoke<SystemInfo>("get_system_info");
  } catch (error) {
    console.error("Failed to get system info:", error);
    return null; // Return null instead of throwing
  }
}

// Save transcript to file
export async function saveTranscript(
  content: string,
  filename: string
): Promise<string> {
  try {
    return await invoke<string>("save_transcript", { content, filename });
  } catch (error) {
    console.error("Failed to save transcript:", error);
    throw error;
  }
}

// Increment recording counter
export async function incrementRecordingCount(): Promise<number> {
  try {
    return await invoke<number>("increment_recording_count");
  } catch (error) {
    console.error("Failed to increment count:", error);
    return 0; // Return 0 instead of throwing
  }
}

// Get recording statistics
export async function getRecordingStats(): Promise<RecordingStats> {
  try {
    return await invoke<RecordingStats>("get_recording_stats");
  } catch (error) {
    console.error("Failed to get stats:", error);
    return { total_recordings: 0, api_verified: false };
  }
}

// Log message from frontend to backend
export async function logMessage(
  level: "info" | "warn" | "error",
  message: string
): Promise<void> {
  try {
    await invoke("log_message", { level, message });
  } catch (error) {
    // Silent fail for logging
    console.log(`[${level}] ${message}`);
  }
}

// Copy to clipboard using custom Rust command
export async function copyToClipboardCustom(text: string): Promise<void> {
  try {
    await invoke("copy_to_clipboard_custom", { text });
  } catch (error) {
    console.error("Failed to copy:", error);
    throw error;
  }
}
