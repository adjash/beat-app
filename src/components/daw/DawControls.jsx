import React from "react";

function DawControls({
  rootNote,
  setRootNote,
  octave,
  setOctave,
  tempo,
  setTempo,
  numBeats,
  setNumBeats,
  randomScale,
  onRandomize,
  scaleNames,
  scaleType,
  setScaleType,
  showScale,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
      }}
    >
      <label>
        Key:
        <select
          value={rootNote}
          onChange={(e) => setRootNote(e.target.value)}
          style={{ marginLeft: 4 }}
        >
          {[
            "C",
            "C#",
            "D",
            "D#",
            "E",
            "F",
            "F#",
            "G",
            "G#",
            "A",
            "A#",
            "B",
          ].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label>
        Scale:
        <select
          value={scaleType}
          onChange={(e) => setScaleType(e.target.value)}
          style={{ marginLeft: 4 }}
        >
          {scaleNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Octave:
        <select
          value={octave}
          onChange={(e) => setOctave(Number(e.target.value))}
          style={{ marginLeft: 4 }}
        >
          {[1, 2, 3, 4, 5, 6].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label style={{ marginLeft: 16 }}>
        Tempo:
        <input
          type="range"
          min={60}
          max={200}
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          style={{ margin: "0 8px", verticalAlign: "middle" }}
        />
        <input
          type="number"
          min={60}
          max={200}
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          style={{ width: 48, marginLeft: 4 }}
        />
        <span style={{ marginLeft: 4 }}>BPM</span>
      </label>
      <label style={{ marginLeft: 16 }}>
        Beats:
        <input
          type="range"
          min={4}
          max={32}
          step={1}
          value={numBeats}
          onChange={(e) => setNumBeats(Number(e.target.value))}
          style={{ margin: "0 8px", verticalAlign: "middle" }}
        />
        <input
          type="number"
          min={4}
          max={32}
          value={numBeats}
          onChange={(e) => setNumBeats(Number(e.target.value))}
          style={{ width: 40, marginLeft: 4 }}
        />
      </label>
      {showScale && randomScale && (
        <span style={{ marginLeft: 16, color: "#1976d2", fontWeight: 500 }}>
          Scale: {randomScale}
        </span>
      )}
      {onRandomize && (
        <button
          onClick={onRandomize}
          style={{
            marginLeft: 16,
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "#1976d2",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Random
        </button>
      )}
    </div>
  );
}

export default DawControls;
