import React from "react";
import LoopGrid from "../LoopGrid";
import EffectsEditor from "./EffectsEditor";

function InstrumentTrack({
  inst,
  idx,
  draggedIdx,
  handleDragStart,
  setDraggedIdx,
  handleDragOver,
  handleDrop,
  handleEffectDrop,
  effectDrag,
  updateEffectParam,
  removeInstrument,
  toggleBeat,
  setBeatNote,
  setBeatOctave,
  currentStep,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: draggedIdx === idx ? 0.5 : 1,
        border: draggedIdx === idx ? "2px dashed #888" : "none",
        background: "#fff",
        borderRadius: 6,
        minWidth: 90,
        minHeight: 120,
        margin: 2,
        position: "relative",
      }}
      onDragOver={handleDragOver}
      onDrop={(e) => {
        if (effectDrag) handleEffectDrop(idx, e);
        else handleDrop(idx);
      }}
    >
      {/* Drag handle for reordering */}
      <div
        draggable
        onDragStart={() => handleDragStart(idx)}
        onDragEnd={() => setDraggedIdx(null)}
        style={{
          width: "100%",
          cursor: "grab",
          background: draggedIdx === idx ? "#e0e0e0" : "#f5f5f5",
          borderRadius: "6px 6px 0 0",
          padding: "4px 0",
          textAlign: "center",
          fontWeight: 600,
          letterSpacing: 1,
          userSelect: "none",
          borderBottom: "1px solid #ddd",
        }}
        title="Drag to reorder instrument"
      >
        ≡ {inst.name}
      </div>
      <LoopGrid
        loop={inst.loop}
        toggleBeat={(beatIdx) => toggleBeat(idx, beatIdx)}
        setBeatNote={(beatIdx, note) => setBeatNote(idx, beatIdx, note)}
        setBeatOctave={(beatIdx, octaveVal) =>
          setBeatOctave(idx, beatIdx, octaveVal)
        }
        label={null}
        currentStep={currentStep}
      />
      <EffectsEditor
        effects={inst.effects}
        updateEffectParam={updateEffectParam}
        instIdx={idx}
      />
      <button style={{ marginTop: 8 }} onClick={() => removeInstrument(idx)}>
        Remove
      </button>
    </div>
  );
}

export default InstrumentTrack;
