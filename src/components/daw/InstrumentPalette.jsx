import React from "react";

function InstrumentPalette({
  instrumentOptions,
  paletteDrag,
  handlePaletteDragStart,
  handlePaletteDragEnd,
}) {
  return (
    <div
      style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
    >
      {instrumentOptions.map((name) => (
        <div
          key={name}
          draggable
          onDragStart={() => handlePaletteDragStart(name)}
          onDragEnd={handlePaletteDragEnd}
          style={{
            padding: "8px 14px",
            border: "1px solid #aaa",
            borderRadius: 6,
            background: paletteDrag === name ? "#e0e0e0" : "#fafafa",
            cursor: "grab",
            fontWeight: 500,
            boxShadow: paletteDrag === name ? "0 0 8px #888" : undefined,
            opacity: paletteDrag === name ? 0.6 : 1,
            userSelect: "none",
          }}
        >
          {name}
        </div>
      ))}
    </div>
  );
}

export default InstrumentPalette;
