import React from "react";

function EffectPalette({
  effectOptions,
  effectDrag,
  handleEffectDragStart,
  handleEffectDragEnd,
}) {
  return (
    <div
      style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
    >
      <span style={{ fontWeight: 500, marginRight: 8 }}>Effects:</span>
      {effectOptions.map((name) => (
        <div
          key={name}
          draggable
          onDragStart={() => handleEffectDragStart(name)}
          onDragEnd={handleEffectDragEnd}
          style={{
            padding: "8px 14px",
            border: "1px solid #aaa",
            borderRadius: 6,
            background: effectDrag === name ? "#e0e0e0" : "#f0faff",
            cursor: "grab",
            fontWeight: 500,
            boxShadow: effectDrag === name ? "0 0 8px #888" : undefined,
            opacity: effectDrag === name ? 0.6 : 1,
            userSelect: "none",
          }}
        >
          {name}
        </div>
      ))}
    </div>
  );
}

export default EffectPalette;
