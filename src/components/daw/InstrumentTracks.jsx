import React from "react";
import InstrumentTrack from "./InstrumentTrack";

function InstrumentTracks({
  instruments,
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
  handleLoopDrop,
  handleLoopDragOver,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginTop: 16,
        minHeight: 180,
        border: "2px dashed #bbb",
        borderRadius: 8,
        alignItems: "flex-start",
      }}
      onDrop={handleLoopDrop}
      onDragOver={handleLoopDragOver}
    >
      {instruments.map((inst, idx) => (
        <InstrumentTrack
          key={idx}
          inst={inst}
          idx={idx}
          draggedIdx={draggedIdx}
          handleDragStart={handleDragStart}
          setDraggedIdx={setDraggedIdx}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleEffectDrop={handleEffectDrop}
          effectDrag={effectDrag}
          updateEffectParam={updateEffectParam}
          removeInstrument={removeInstrument}
          toggleBeat={toggleBeat}
          setBeatNote={setBeatNote}
          setBeatOctave={setBeatOctave}
          currentStep={currentStep}
        />
      ))}
      {instruments.length === 0 && (
        <div
          style={{
            color: "#888",
            margin: 32,
            textAlign: "center",
            width: "100%",
          }}
        >
          Drag an instrument here to add it to the loop
        </div>
      )}
    </div>
  );
}

export default InstrumentTracks;
