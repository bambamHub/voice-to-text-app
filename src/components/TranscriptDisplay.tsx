import React from "react";

interface TranscriptDisplayProps {
  transcript: string;
  interimTranscript: string;
  onClear: () => void;
  onSave: () => void;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  interimTranscript,
  onClear,
  onSave,
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopySuccess(true);
      console.log("✅ Copied to clipboard");
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("❌ Failed to copy:", error);
      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = transcript;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="transcript-section">
      <div className="transcript-header">
        <h2>Transcript</h2>
        <div className="transcript-actions">
          <button
            onClick={handleCopy}
            disabled={!transcript}
            className="btn-icon"
            title="Copy to clipboard"
          >
            📋 {copySuccess ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={onSave}
            disabled={!transcript}
            className="btn-icon"
            title="Save as file"
          >
            💾 Save
          </button>
          <button
            onClick={onClear}
            disabled={!transcript}
            className="btn-icon btn-danger"
            title="Clear transcript"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="transcript-display">
        {transcript || interimTranscript ? (
          <>
            <p className="transcript-text">{transcript}</p>
            {interimTranscript && (
              <p className="transcript-interim">{interimTranscript}</p>
            )}
          </>
        ) : (
          <p className="transcript-placeholder">
            Your transcription will appear here...
          </p>
        )}
      </div>

      <div className="transcript-stats">
        <span className="stat">
          Words: {transcript.split(/\s+/).filter(Boolean).length}
        </span>
        <span className="stat">
          Characters: {transcript.length}
        </span>
      </div>
    </div>
  );
};
