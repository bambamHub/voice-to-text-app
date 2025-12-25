import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Navbar } from "./components/Navbar";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useDeepgram } from "./hooks/useDeepgram";
import { RecordButton } from "./components/RecordButton";
import { TranscriptDisplay } from "./components/TranscriptDisplay";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { RecordingState } from "./types";
import "./App.css";
import { useEffect, useState as useStateReact } from "react";

function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  // If not authenticated, show login/signup
  if (authLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{ color: "white", fontSize: "1.5rem", fontWeight: 600 }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === "login" ? (
      <Login onSwitchToSignup={() => setAuthView("signup")} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  // Main app (authenticated)
  return <MainApp />;
}

function MainApp() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);
  
  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;

  const {
    transcript,
    interimTranscript,
    isConnected,
    error: deepgramError,
    connect: connectDeepgram,
    sendAudio,
    finishStream,
    disconnect: disconnectDeepgram,
    clearTranscript,
  } = useDeepgram(apiKey);

  const {
    state: recordingState,
    error: audioError,
    initialize: initializeAudio,
    startRecording,
    stopRecording,
    cleanup: cleanupAudio,
  } = useAudioRecorder(sendAudio);

  useEffect(() => {
    let interval: number | undefined;
    
    if (recordingState === RecordingState.RECORDING) {
      setRecordingTime(0);
      interval = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState]);

  useEffect(() => {
    if (!apiKey || apiKey.includes("your_")) {
      setInitError("Please configure Deepgram API key");
      return;
    }

    const init = async () => {
      try {
        await initializeAudio();
        await connectDeepgram();
        setIsInitialized(true);
      } catch (error) {
        setInitError(error instanceof Error ? error.message : "Init failed");
      }
    };

    init();

    return () => {
      disconnectDeepgram();
      cleanupAudio();
    };
  }, [apiKey]);

  const handleStartRecording = () => {
    if (isConnected && isInitialized) {
      startRecording();
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSaveTranscript = () => {
    if (!transcript) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript_${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentError = initError || audioError || deepgramError;
  const isRecording = recordingState === RecordingState.RECORDING;

  return (
    <div className="app">
      <Navbar />

      <div className="connection-status-bar">
        <span className={`status-indicator ${isConnected ? "connected" : "disconnected"}`} />
        <span className="status-text">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        {isRecording && (
          <span className="recording-time">🔴 {formatTime(recordingTime)}</span>
        )}
      </div>

      <main className="app-main">
        {currentError && <ErrorDisplay error={currentError} />}

        <TranscriptDisplay
          transcript={transcript}
          interimTranscript={interimTranscript}
          onClear={clearTranscript}
          onSave={handleSaveTranscript}
        />

        <RecordButton
          recordingState={recordingState}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          disabled={!isInitialized || !isConnected || !!initError}
        />
      </main>

      <footer className="app-footer">
        <p>Click to start/stop • Auto-stops after 2s silence</p>
        <p className="keyboard-hint">
          ✨ Built with Tauri & React • Developed by Bambam Gupta
        </p>
      </footer>
    </div>
  );
}

export default App;
