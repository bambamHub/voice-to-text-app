import { RecordingState } from "../types";

interface RecordButtonProps {
  recordingState: RecordingState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled: boolean;
}

export const RecordButton = ({
  recordingState,
  onStartRecording,
  onStopRecording,
  disabled,
}: RecordButtonProps) => {
  const isRecording = recordingState === RecordingState.RECORDING;

  const handleClick = () => {
    if (disabled) return;
    
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const getButtonText = () => {
    if (disabled) return 'Connecting...';
    if (isRecording) return 'Recording... (Click to stop)';
    return 'Click to record';
  };

  return (
    <div className="record-button-container">
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={handleClick}
        disabled={disabled}
      >
        🎤
      </button>
      
      <div className="record-button-hint">
        {getButtonText()}
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          <span>Will auto-stop after 2s of silence</span>
        </div>
      )}
    </div>
  );
};
