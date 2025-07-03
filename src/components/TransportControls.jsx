import React from "react";

function TransportControls({ isPlaying, startTransport, stopTransport }) {
  const handlePlay = () => {
    startTransport();
  };

  const handleStop = () => {
    stopTransport();
  };

  const handleRecord = () => {
    // Implement recording functionality here
    console.log("Recording...");
  };

  return (
    <div className="transport-controls">
      <button onClick={isPlaying ? handleStop : handlePlay}>
        {isPlaying ? "Stop" : "Play"}
      </button>
      <button onClick={handleRecord}>Record</button>
    </div>
  );
}

export default TransportControls;
