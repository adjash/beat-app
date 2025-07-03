import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import TransportControls from "./TransportControls";
import LoopGrid from "./LoopGrid";

const INSTRUMENT_OPTIONS = [
  "Synth",
  "AMSynth",
  "FMSynth",
  "DuoSynth",
  "MonoSynth",
  "MembraneSynth",
  "MetalSynth",
  "PluckSynth",
  "PolySynth",
  "PolyFMSynth",
  "PolyAMSynth",
  "Drum",
  "Bass",
  "Piano",
  "Guitar",
];

const INSTRUMENT_SYNTHS = {
  Synth: () => new Tone.Synth().toDestination(),
  AMSynth: () => new Tone.AMSynth().toDestination(),
  FMSynth: () => new Tone.FMSynth().toDestination(),
  DuoSynth: () => new Tone.DuoSynth().toDestination(),
  MonoSynth: () => new Tone.MonoSynth().toDestination(),
  MembraneSynth: () => new Tone.MembraneSynth().toDestination(),
  MetalSynth: () => new Tone.MetalSynth().toDestination(),
  PluckSynth: () => new Tone.PluckSynth().toDestination(),
  PolySynth: () => new Tone.PolySynth(Tone.Synth).toDestination(),
  PolyFMSynth: () => new Tone.PolySynth(Tone.FMSynth).toDestination(),
  PolyAMSynth: () => new Tone.PolySynth(Tone.AMSynth).toDestination(),
  Drum: () => new Tone.MembraneSynth().toDestination(),
  Bass: () => new Tone.MonoSynth().toDestination(),
  Piano: () =>
    new Tone.Sampler({
      urls: { C4: "C4.mp3" },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination(),
  Guitar: () =>
    new Tone.Sampler({
      urls: { C4: "C4.mp3" },
      baseUrl:
        "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/",
    }).toDestination(),
};

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

const EFFECT_OPTIONS = [
  "Reverb",
  "Delay",
  "Distortion",
  "Chorus",
  "Phaser",
  "Tremolo",
];

// Effect parameter defaults
const EFFECT_PARAM_DEFAULTS = {
  Reverb: { decay: 2, wet: 0.4 },
  Delay: { delayTime: 0.25, feedback: 0.4, wet: 0.4 },
  Distortion: { distortion: 0.4 },
  Chorus: { frequency: 4, delayTime: 2.5, depth: 0.5, wet: 0.5 },
  Phaser: { frequency: 15, octaves: 3, baseFrequency: 1000, wet: 0.5 },
  Tremolo: { frequency: 9, depth: 0.75, wet: 0.5 },
};

const EFFECT_CREATORS = {
  Reverb: (params) => new Tone.Reverb(params),
  Delay: (params) => new Tone.FeedbackDelay(params),
  Distortion: (params) => new Tone.Distortion(params.distortion),
  Chorus: (params) =>
    new Tone.Chorus(params.frequency, params.delayTime, params.depth).start(),
  Phaser: (params) => new Tone.Phaser(params),
  Tremolo: (params) => new Tone.Tremolo(params.frequency, params.depth).start(),
};

// Available musical scales and their intervals (in semitones)
const SCALES = {
  Major: [2, 2, 1, 2, 2, 2, 1],
  "Natural Minor": [2, 1, 2, 2, 1, 2, 2],
  "Harmonic Minor": [2, 1, 2, 2, 1, 3, 1],
  "Melodic Minor": [2, 1, 2, 2, 2, 2, 1],
  Dorian: [2, 1, 2, 2, 2, 1, 2],
  Phrygian: [1, 2, 2, 2, 1, 2, 2],
  Lydian: [2, 2, 2, 1, 2, 2, 1],
  Mixolydian: [2, 2, 1, 2, 2, 1, 2],
  Locrian: [1, 2, 2, 1, 2, 2, 2],
  "Major Pentatonic": [2, 2, 3, 2, 3],
  "Minor Pentatonic": [3, 2, 2, 3, 2],
};
const SCALE_NAMES = Object.keys(SCALES);

// Helper to get scale notes for a root and scale name
const getScaleNotes = (root, scaleName) => {
  const intervals = SCALES[scaleName];
  const rootIdx = NOTE_OPTIONS.indexOf(root);
  let scale = [root];
  let idx = rootIdx;
  for (let i = 0; i < intervals.length; i++) {
    idx = (idx + intervals[i]) % 12;
    scale.push(NOTE_OPTIONS[idx]);
  }
  return scale;
};

function Daw() {
  const [rootNote, setRootNote] = useState("C");
  const [octave, setOctave] = useState(4);
  const [tempo, setTempo] = useState(120);
  const [numBeats, setNumBeats] = useState(16); // NEW: number of beats
  const [currentStep, setCurrentStep] = useState(0);
  // Helper to create a beat object
  const createBeat = (active = false, note = rootNote, octaveVal = octave) => ({
    active,
    note,
    octave: octaveVal,
  });
  // Helper to create a loop of numBeats beats
  const createLoop = () =>
    Array(numBeats)
      .fill(0)
      .map(() => createBeat());

  const [isPlaying, setIsPlaying] = useState(false);
  const [instruments, setInstruments] = useState([
    {
      name: "Synth",
      loop: Array(16)
        .fill(0)
        .map(() => ({ active: false, note: "C", octave: 4 })),
      effects: [],
    },
  ]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [paletteDrag, setPaletteDrag] = useState(null);
  const [effectDrag, setEffectDrag] = useState(null); // For dragging effects
  const synthRefs = useRef({});
  const instrumentsRef = useRef(instruments);
  const [randomScale, setRandomScale] = useState(null);

  useEffect(() => {
    instrumentsRef.current = instruments;
  }, [instruments]);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  // Setup Tone.js loop for all instruments
  useEffect(() => {
    let toneLoop;
    if (isPlaying) {
      // Always recreate synths and effect chains on play
      Object.keys(synthRefs.current).forEach((key) => {
        if (synthRefs.current[key]?.dispose) synthRefs.current[key].dispose();
        delete synthRefs.current[key];
      });
      instrumentsRef.current.forEach((inst) => {
        const createSynth =
          INSTRUMENT_SYNTHS[inst.name] || INSTRUMENT_SYNTHS["Synth"];
        let synth = createSynth();
        if (inst.effects && inst.effects.length > 0) {
          let effectNodes = inst.effects.map((fx) =>
            EFFECT_CREATORS[fx.type](fx.params)
          );
          effectNodes.reduce((prev, curr) => prev.connect(curr));
          effectNodes[effectNodes.length - 1].toDestination();
          synth.disconnect();
          synth.connect(effectNodes[0]);
          synthRefs.current[inst.name] = synth;
          synthRefs.current[`${inst.name}_effects`] = effectNodes;
        } else {
          synthRefs.current[inst.name] = synth;
        }
      });
      let step = 0;
      setCurrentStep(0);
      toneLoop = new Tone.Loop((time) => {
        instrumentsRef.current.forEach((inst) => {
          const beat = inst.loop[step];
          if (beat && beat.active) {
            const note = `${beat.note}${beat.octave}`;
            synthRefs.current[inst.name]?.triggerAttackRelease(
              note,
              "8n",
              time
            );
          }
        });
        setCurrentStep(step);
        step = (step + 1) % numBeats; // Use numBeats here
      }, "4n").start(0);
      Tone.Transport.scheduleRepeat(() => {}, "1m");
    }
    return () => {
      if (toneLoop) toneLoop.dispose();
      // Dispose and clear all synth and effect nodes
      Object.keys(synthRefs.current).forEach((key) => {
        if (synthRefs.current[key]?.dispose) synthRefs.current[key].dispose();
        delete synthRefs.current[key];
      });
    };
  }, [isPlaying, instruments]);

  const toggleBeat = (instIdx, beatIdx) => {
    setInstruments((prev) =>
      prev.map((inst, i) =>
        i === instIdx
          ? {
              ...inst,
              loop: inst.loop.map((b, j) =>
                j === beatIdx ? { ...b, active: !b.active } : b
              ),
            }
          : inst
      )
    );
  };
  // New: update note/octave for a beat
  const setBeatNote = (instIdx, beatIdx, note) => {
    setInstruments((prev) =>
      prev.map((inst, i) =>
        i === instIdx
          ? {
              ...inst,
              loop: inst.loop.map((b, j) =>
                j === beatIdx ? { ...b, note } : b
              ),
            }
          : inst
      )
    );
  };
  const setBeatOctave = (instIdx, beatIdx, octaveVal) => {
    setInstruments((prev) =>
      prev.map((inst, i) =>
        i === instIdx
          ? {
              ...inst,
              loop: inst.loop.map((b, j) =>
                j === beatIdx ? { ...b, octave: octaveVal } : b
              ),
            }
          : inst
      )
    );
  };

  // Drag from palette to add instrument
  const handlePaletteDragStart = (name) => setPaletteDrag(name);
  const handlePaletteDragEnd = () => setPaletteDrag(null);
  const handleLoopDrop = (e) => {
    e.preventDefault();
    if (paletteDrag) {
      setInstruments((prev) => [
        ...prev,
        { name: paletteDrag, loop: createLoop(), effects: [] }, // Always add effects: []
      ]);
      setPaletteDrag(null);
    }
  };
  const handleLoopDragOver = (e) => e.preventDefault();

  // Drag to reorder
  const handleDragStart = (idx) => setDraggedIdx(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (idx) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    setInstruments((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(draggedIdx, 1);
      updated.splice(idx, 0, removed);
      return updated;
    });
    setDraggedIdx(null);
  };

  // Drag from effect palette
  const handleEffectDragStart = (name) => setEffectDrag(name);
  const handleEffectDragEnd = () => setEffectDrag(null);
  // Drop effect on instrument
  const handleEffectDrop = (instIdx, e) => {
    e.preventDefault();
    if (effectDrag) {
      setInstruments((prev) =>
        prev.map((inst, i) => {
          const instEffects = inst.effects || [];
          // Only add if not already present (by type)
          if (
            i === instIdx &&
            !instEffects.some((fx) => fx.type === effectDrag)
          ) {
            return {
              ...inst,
              effects: [
                ...instEffects,
                {
                  type: effectDrag,
                  params: { ...EFFECT_PARAM_DEFAULTS[effectDrag] },
                },
              ],
            };
          }
          return inst;
        })
      );
      setEffectDrag(null);
    }
  };
  const handleEffectDragOver = (e) => e.preventDefault();

  const removeInstrument = (idx) => {
    setInstruments((prev) => prev.filter((_, i) => i !== idx));
  };

  const startTransport = async () => {
    await Tone.start();
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopTransport = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  // Update effect parameter
  const updateEffectParam = (instIdx, fxIdx, param, value) => {
    setInstruments((prev) =>
      prev.map((inst, i) =>
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
      )
    );
  };

  // Helper to get a random item
  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // Helper to get a random int in [min, max]
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  // Helper to get major scale notes for a root
  const getMajorScale = (root) => {
    // Major scale intervals: W W H W W W H (in semitones)
    const intervals = [2, 2, 1, 2, 2, 2, 1];
    const rootIdx = NOTE_OPTIONS.indexOf(root);
    let scale = [root];
    let idx = rootIdx;
    for (let i = 0; i < 6; i++) {
      idx = (idx + intervals[i]) % 12;
      scale.push(NOTE_OPTIONS[idx]);
    }
    return scale;
  };

  // Helper to randomize effect params (move above randomize)
  const randomizeParams = (type) => {
    const defaults = EFFECT_PARAM_DEFAULTS[type];
    const params = {};
    Object.entries(defaults).forEach(([k, v]) => {
      if (typeof v === "number") {
        // Use the same min/max as in the UI
        let min = k === "wet" ? 0 : 0.01;
        let max =
          k === "wet"
            ? 1
            : k === "decay"
            ? 10
            : k === "delayTime"
            ? 1
            : k === "feedback"
            ? 0.95
            : k === "distortion"
            ? 1
            : k === "depth"
            ? 1
            : k === "frequency"
            ? 20
            : k === "baseFrequency"
            ? 5000
            : 10;
        params[k] = +(Math.random() * (max - min) + min).toFixed(2);
      } else {
        params[k] = v;
      }
    });
    return params;
  };

  // Randomizer function (melodic, scale-based, random scale)
  const randomize = () => {
    const used = new Set();
    const newInstruments = [];
    const scaleName = randomFrom(SCALE_NAMES);
    setRandomScale(scaleName);
    const scaleNotes = getScaleNotes(rootNote, scaleName);
    while (newInstruments.length < 4) {
      let name = randomFrom(INSTRUMENT_OPTIONS);
      if (used.has(name)) continue;
      used.add(name);
      // Melodic loop: favor repeated/stepwise notes
      let prevIdx = randomInt(0, scaleNotes.length - 1);
      let prevOct = randomInt(2, 5);
      const loop = Array(numBeats)
        .fill(0)
        .map(() => {
          // 70% chance repeat, 20% stepwise, 10% random
          let idx, octave;
          const r = Math.random();
          if (r < 0.7) {
            idx = prevIdx;
            octave = prevOct;
          } else if (r < 0.9) {
            // Stepwise: move up/down 1 in scale
            const dir = Math.random() < 0.5 ? -1 : 1;
            idx = (prevIdx + dir + scaleNotes.length) % scaleNotes.length;
            // Occasionally change octave if at edge
            if (
              (dir === 1 && idx === 0) ||
              (dir === -1 && idx === scaleNotes.length - 1)
            ) {
              octave = Math.max(2, Math.min(5, prevOct + dir));
            } else {
              octave = prevOct;
            }
          } else {
            idx = randomInt(0, scaleNotes.length - 1);
            octave = randomInt(2, 5);
          }
          prevIdx = idx;
          prevOct = octave;
          return {
            active: Math.random() < 0.5,
            note: scaleNotes[idx],
            octave,
          };
        });
      // Randomize effects (1 or 2)
      const numEffects = randomInt(1, 2);
      const effectTypes = [];
      while (effectTypes.length < numEffects) {
        let fx = randomFrom(EFFECT_OPTIONS);
        if (!effectTypes.includes(fx)) effectTypes.push(fx);
      }
      const effects = effectTypes.map((type) => ({
        type,
        params: randomizeParams(type),
      }));
      newInstruments.push({ name, loop, effects });
    }
    setInstruments(newInstruments);
  };

  return (
    <div>
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
            {NOTE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
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
        {/* Tempo control */}
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
        {/* New: Beats control */}
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
      </div>
      {/* Instrument Palette */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {INSTRUMENT_OPTIONS.map((name) => (
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
      {/* Effects Palette */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 500, marginRight: 8 }}>Effects:</span>
        {EFFECT_OPTIONS.map((name) => (
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
      <TransportControls
        isPlaying={isPlaying}
        startTransport={startTransport}
        stopTransport={stopTransport}
      />
      {/* Loop area as drop zone */}
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
          <div
            key={idx}
            // Remove draggable and drag handlers from the container
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
            {/* Show applied effects and controls */}
            {inst.effects && inst.effects.length > 0 && (
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
                {inst.effects.map((fx, fxIdx) => (
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
                        <label style={{ fontSize: 10, minWidth: 60 }}>
                          {param}:
                        </label>
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
                              idx,
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
                              idx,
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
            )}
            <button
              style={{ marginTop: 8 }}
              onClick={() => removeInstrument(idx)}
            >
              Remove
            </button>
          </div>
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
      <div style={{ marginTop: 10 }}>
        <b>Instruments:</b> {instruments.map((i) => i.name).join(", ")}
        {randomScale && (
          <span style={{ marginLeft: 16, color: "#1976d2", fontWeight: 500 }}>
            Scale: {rootNote} {randomScale}
          </span>
        )}
      </div>
      <button
        onClick={randomize}
        style={{
          marginTop: 16,
          padding: "10px 20px",
          fontSize: 16,
          fontWeight: 600,
          color: "#fff",
          backgroundColor: "#1976d2",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>Random</span>
      </button>
    </div>
  );
}

export default Daw;
