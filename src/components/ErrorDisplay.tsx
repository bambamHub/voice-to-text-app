import React from "react";

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <div className="error-display">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-message">{error}</span>
        {onDismiss && (
          <button className="error-dismiss" onClick={onDismiss}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
