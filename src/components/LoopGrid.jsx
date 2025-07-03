import React from "react";

const NOTE_OPTIONS = [
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
];
const OCTAVE_OPTIONS = [1, 2, 3, 4, 5, 6];

const LoopGrid = ({
  loop,
  toggleBeat,
  setBeatNote,
  setBeatOctave,
  label,
  currentStep,
}) => {
  return (
    <div className="loop-grid">
      <div style={{ fontWeight: "bold", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {loop.map((beat, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
              background: currentStep === index ? "#ffe082" : undefined,
              borderRadius: currentStep === index ? 4 : undefined,
              boxShadow: currentStep === index ? "0 0 4px #ffb300" : undefined,
              transition: "background 0.1s",
            }}
          >
            <div
              className={`beat ${beat.active ? "active" : ""}`}
              onClick={() => toggleBeat(index)}
              style={{ cursor: "pointer", minWidth: 24, textAlign: "center" }}
            >
              {beat.active ? "●" : "○"}
            </div>
            <span style={{ fontSize: 10, color: "#888", minWidth: 24 }}>
              Beat {index + 1}
            </span>
            {beat.active && (
              <>
                <select
                  value={beat.note}
                  onChange={(e) => setBeatNote(index, e.target.value)}
                  style={{ fontSize: 10, marginLeft: 4 }}
                >
                  {NOTE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <select
                  value={beat.octave}
                  onChange={(e) => setBeatOctave(index, Number(e.target.value))}
                  style={{ fontSize: 10, marginLeft: 4 }}
                >
                  {OCTAVE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoopGrid;
