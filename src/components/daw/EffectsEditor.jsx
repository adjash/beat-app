import React from "react";

function EffectsEditor({ effects, updateEffectParam, instIdx }) {
  if (!effects || effects.length === 0) return null;
  return (
    <div
      style={{
        fontSize: 11,
        marginTop: 4,
        color: "#1976d2",
        width: "100%",
        position: "relative",
        zIndex: 10,
      }}
      draggable={false}
      onDragStart={(e) => e.stopPropagation()}
    >
      Effects:
      {effects.map((fx, fxIdx) => (
        <div
          key={fxIdx}
          style={{
            margin: "6px 0",
            background: "#e3f2fd",
            borderRadius: 4,
            padding: 6,
          }}
        >
          <b>{fx.type}</b>
          {Object.entries(fx.params).map(([param, val]) => (
            <div
              key={param}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <label style={{ fontSize: 10, minWidth: 60 }}>{param}:</label>
              <input
                type="range"
                min={param === "wet" ? 0 : 0.01}
                max={
                  param === "wet"
                    ? 1
                    : param === "decay"
                    ? 10
                    : param === "delayTime"
                    ? 1
                    : param === "feedback"
                    ? 0.95
                    : param === "distortion"
                    ? 1
                    : param === "depth"
                    ? 1
                    : param === "frequency"
                    ? 20
                    : param === "baseFrequency"
                    ? 5000
                    : 10
                }
                step={0.01}
                value={val}
                onChange={(e) =>
                  updateEffectParam(
                    instIdx,
                    fxIdx,
                    param,
                    parseFloat(e.target.value)
                  )
                }
                style={{ flex: 1 }}
                draggable={false}
                onDragStart={(e) => e.stopPropagation()}
              />
              <input
                type="number"
                min={param === "wet" ? 0 : 0.01}
                max={
                  param === "wet"
                    ? 1
                    : param === "decay"
                    ? 10
                    : param === "delayTime"
                    ? 1
                    : param === "feedback"
                    ? 0.95
                    : param === "distortion"
                    ? 1
                    : param === "depth"
                    ? 1
                    : param === "frequency"
                    ? 20
                    : param === "baseFrequency"
                    ? 5000
                    : 10
                }
                step={0.01}
                value={val}
                onChange={(e) =>
                  updateEffectParam(
                    instIdx,
                    fxIdx,
                    param,
                    parseFloat(e.target.value)
                  )
                }
                style={{ width: 48 }}
                draggable={false}
                onDragStart={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default EffectsEditor;
