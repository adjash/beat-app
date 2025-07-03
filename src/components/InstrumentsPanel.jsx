import React, { useState } from "react";

function InstrumentPanel({ onAddInstrument }) {
  const [selectedInstrument, setSelectedInstrument] = useState("Synth");

  // Add all available instrument options
  const instrumentOptions = [
    "Synth",
    "AMSynth",
    "FMSynth",
    "DuoSynth",
    "MonoSynth",
    "MembraneSynth",
    "MetalSynth",
    "PluckSynth",
    "NoiseSynth",
    "PolySynth",
    "PolyFMSynth",
    "PolyAMSynth",
    "Drum",
    "Bass",
    "Piano",
  ];

  const handleAddInstrument = () => {
    onAddInstrument(selectedInstrument);
    setSelectedInstrument("Synth"); // Reset to default
  };

  return (
    <div className="instrument-panel">
      <h2>Instrument Panel</h2>
      <select
        value={selectedInstrument}
        onChange={(e) => setSelectedInstrument(e.target.value)}
      >
        {instrumentOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button onClick={handleAddInstrument}>Add Instrument</button>
    </div>
  );
}

export default InstrumentPanel;
