// dawStateHelpers.js - helpers for DAW instrument/effect state updates

export function toggleBeat(instruments, instIdx, beatIdx) {
  return instruments.map((inst, i) =>
    i === instIdx
      ? {
          ...inst,
          loop: inst.loop.map((b, j) =>
            j === beatIdx ? { ...b, active: !b.active } : b
          ),
        }
      : inst
  );
}

export function setBeatNote(instruments, instIdx, beatIdx, note) {
  return instruments.map((inst, i) =>
    i === instIdx
      ? {
          ...inst,
          loop: inst.loop.map((b, j) => (j === beatIdx ? { ...b, note } : b)),
        }
      : inst
  );
}

export function setBeatOctave(instruments, instIdx, beatIdx, octaveVal) {
  return instruments.map((inst, i) =>
    i === instIdx
      ? {
          ...inst,
          loop: inst.loop.map((b, j) =>
            j === beatIdx ? { ...b, octave: octaveVal } : b
          ),
        }
      : inst
  );
}

export function removeInstrument(instruments, idx) {
  return instruments.filter((_, i) => i !== idx);
}

export function reorderInstruments(instruments, fromIdx, toIdx) {
  if (fromIdx === null || fromIdx === toIdx) return instruments;
  const updated = [...instruments];
  const [removed] = updated.splice(fromIdx, 1);
  updated.splice(toIdx, 0, removed);
  return updated;
}

export function updateEffectParam(instruments, instIdx, fxIdx, param, value) {
  return instruments.map((inst, i) =>
    i === instIdx
      ? {
          ...inst,
          effects: inst.effects.map((fx, j) =>
            j === fxIdx
              ? { ...fx, params: { ...fx.params, [param]: value } }
              : fx
          ),
        }
      : inst
  );
}

export function addEffectToInstrument(
  instruments,
  instIdx,
  effectType,
  effectDefaults
) {
  return instruments.map((inst, i) => {
    const instEffects = inst.effects || [];
    if (i === instIdx && !instEffects.some((fx) => fx.type === effectType)) {
      return {
        ...inst,
        effects: [
          ...instEffects,
          {
            type: effectType,
            params: { ...effectDefaults },
          },
        ],
      };
    }
    return inst;
  });
}
