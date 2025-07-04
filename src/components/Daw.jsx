import React, { useState } from "react";
import DawControls from "./daw/DawControls";
import InstrumentPalette from "./daw/InstrumentPalette";
import EffectPalette from "./daw/EffectPalette";
import TransportControls from "../components/TransportControls";
import InstrumentTracks from "./daw/InstrumentTracks";
import {
  INSTRUMENT_OPTIONS,
  EFFECT_OPTIONS,
  EFFECT_PARAM_DEFAULTS,
  randomFrom,
  createLoop,
  NOTE_OPTIONS,
  COMMON_PROGRESSIONS,
  degreeToChord,
  SCALE_NAMES,
  getScaleNotes,
} from "../utils/music";
import {
  toggleBeat,
  setBeatNote,
  setBeatOctave,
  removeInstrument,
  updateEffectParam,
  addEffectToInstrument,
} from "../utils/dawStateHelpers";
import {
  handleDragStart,
  handleDragOver,
  handleDrop,
  handlePaletteDragStart,
  handlePaletteDragEnd,
  handleEffectDragStart,
  handleEffectDragEnd,
} from "../utils/dragAndDropHelpers";
import { useToneTransport } from "../utils/useToneTransport";

function Daw() {
  const [rootNote, setRootNote] = useState("C");
  const [octave, setOctave] = useState(4);
  const [tempo, setTempo] = useState(120);
  const [numBeats, setNumBeats] = useState(16);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [instruments, setInstruments] = useState([
    {
      name: "Synth",
      loop: createLoop(16, "C", 4),
      effects: [],
    },
  ]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [paletteDrag, setPaletteDrag] = useState(null);
  const [effectDrag, setEffectDrag] = useState(null);
  const [randomScale, setRandomScale] = useState(null);
  const [scaleType, setScaleType] = useState("Major");

  // Tone.js transport/loop management
  useToneTransport({
    isPlaying,
    instruments,
    numBeats,
    tempo,
    setCurrentStep,
  });

  // --- Instrument Drag & Drop ---
  const onDragStart = (idx) => handleDragStart(setDraggedIdx, idx);
  const onDragOver = handleDragOver;
  const onDrop = (idx) => {
    setInstruments((prev) => handleDrop(prev, draggedIdx, idx));
    setDraggedIdx(null);
  };

  // --- Instrument Palette Drag ---
  const onPaletteDragStart = (name) =>
    handlePaletteDragStart(setPaletteDrag, name);
  const onPaletteDragEnd = () => handlePaletteDragEnd(setPaletteDrag);
  const onLoopDrop = (e) => {
    e.preventDefault();
    if (paletteDrag) {
      setInstruments((prev) => [
        ...prev,
        {
          name: paletteDrag,
          loop: createLoop(numBeats, rootNote, octave),
          effects: [],
        },
      ]);
      setPaletteDrag(null);
    }
  };
  const onLoopDragOver = (e) => e.preventDefault();

  // --- Effect Palette Drag ---
  const onEffectDragStart = (name) =>
    handleEffectDragStart(setEffectDrag, name);
  const onEffectDragEnd = () => handleEffectDragEnd(setEffectDrag);
  const onEffectDrop = (instIdx, e) => {
    e.preventDefault();
    if (effectDrag) {
      setInstruments((prev) =>
        addEffectToInstrument(
          prev,
          instIdx,
          effectDrag,
          EFFECT_PARAM_DEFAULTS[effectDrag]
        )
      );
      setEffectDrag(null);
    }
  };

  // --- Beat/Note/Octave ---
  const onToggleBeat = (instIdx, beatIdx) =>
    setInstruments((prev) => toggleBeat(prev, instIdx, beatIdx));
  const onSetBeatNote = (instIdx, beatIdx, note) =>
    setInstruments((prev) => setBeatNote(prev, instIdx, beatIdx, note));
  const onSetBeatOctave = (instIdx, beatIdx, octaveVal) =>
    setInstruments((prev) => setBeatOctave(prev, instIdx, beatIdx, octaveVal));

  // --- Remove Instrument ---
  const onRemoveInstrument = (idx) =>
    setInstruments((prev) => removeInstrument(prev, idx));

  // --- Update Effect Param ---
  const onUpdateEffectParam = (instIdx, fxIdx, param, value) =>
    setInstruments((prev) =>
      updateEffectParam(prev, instIdx, fxIdx, param, value)
    );

  // --- Randomize ---
  const randomize = () => {
    // 1. Pick a random key and progression
    const key = randomFrom(NOTE_OPTIONS);
    let progressions = COMMON_PROGRESSIONS.filter((p) => p.scale === scaleType);
    if (progressions.length === 0) {
      // Fallback to Major if none found for selected scale
      progressions = COMMON_PROGRESSIONS.filter((p) => p.scale === "Major");
    }
    if (progressions.length === 0) {
      // Fallback to all progressions if still empty
      progressions = COMMON_PROGRESSIONS;
    }
    const progressionObj = randomFrom(progressions);
    const progression = progressionObj.degrees;
    const progressionName = progressionObj.name;
    const scale = scaleType;
    setRootNote(key);
    setRandomScale(`${key} ${scale} (${progressionName})`);

    // 2. Get scale notes for the key/scale
    const scaleNotes = getScaleNotes(key, scale);
    // 3. Build chord objects for the progression
    const chords = progression.map((deg) => degreeToChord(scaleNotes, deg));

    // 4. Drum pattern (simple pop/rock)
    const drumPattern = Array(numBeats)
      .fill(0)
      .map((_, i) => ({
        active: i % 4 === 0 || i % 4 === 2,
        note: key,
        octave: 3,
      }));

    // 5. Bass pattern (root of each chord)
    const beatsPerChord = Math.floor(numBeats / progression.length) || 4;
    const bassPattern = Array(numBeats)
      .fill(0)
      .map((_, i) => {
        const chordIdx = Math.min(
          Math.floor(i / beatsPerChord),
          chords.length - 1
        );
        return {
          active: i % 2 === 0,
          note: chords[chordIdx][0],
          octave: 2,
        };
      });

    // 6. Chord instrument (arpeggiates chord tones)
    const chordPattern = Array(numBeats)
      .fill(0)
      .map((_, i) => {
        const chordIdx = Math.min(
          Math.floor(i / beatsPerChord),
          chords.length - 1
        );
        const chord = chords[chordIdx];
        return {
          active: true,
          note: chord[i % chord.length],
          octave: 4,
        };
      });

    // 7. Melody (simple motif using chord tones)
    const melodyPattern = Array(numBeats)
      .fill(0)
      .map((_, i) => {
        const chordIdx = Math.min(
          Math.floor(i / beatsPerChord),
          chords.length - 1
        );
        const chord = chords[chordIdx];
        const motif = [0, 2, 1, 2];
        return {
          active: i % 2 === 0,
          note: chord[motif[i % motif.length] % chord.length],
          octave: 5,
        };
      });

    // 8. Build instruments array with random effects
    function randomEffects() {
      const num = Math.floor(Math.random() * 3); // 0, 1, or 2 effects
      const chosen = [];
      while (chosen.length < num) {
        const fx = randomFrom(EFFECT_OPTIONS);
        if (!chosen.includes(fx)) chosen.push(fx);
      }
      return chosen.map((type) => ({
        type,
        params: { ...EFFECT_PARAM_DEFAULTS[type] },
      }));
    }

    const newInstruments = [
      { name: "Drum", loop: drumPattern, effects: [] },
      { name: "Bass", loop: bassPattern, effects: randomEffects() },
      { name: "Guitar", loop: chordPattern, effects: randomEffects() },
      { name: "Synth", loop: melodyPattern, effects: randomEffects() },
    ];
    setInstruments(newInstruments);
  };

  // --- Transport ---
  const startTransport = () => setIsPlaying(true);
  const stopTransport = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div>
      <DawControls
        rootNote={rootNote}
        setRootNote={setRootNote}
        octave={octave}
        setOctave={setOctave}
        tempo={tempo}
        setTempo={setTempo}
        numBeats={numBeats}
        setNumBeats={setNumBeats}
        randomScale={randomScale ? `${rootNote} ${randomScale}` : null}
        onRandomize={randomize}
        scaleNames={SCALE_NAMES}
        scaleType={scaleType}
        setScaleType={setScaleType}
        showScale={!!randomScale}
      />
      <InstrumentPalette
        instrumentOptions={INSTRUMENT_OPTIONS}
        paletteDrag={paletteDrag}
        handlePaletteDragStart={onPaletteDragStart}
        handlePaletteDragEnd={onPaletteDragEnd}
      />
      <EffectPalette
        effectOptions={EFFECT_OPTIONS}
        effectDrag={effectDrag}
        handleEffectDragStart={onEffectDragStart}
        handleEffectDragEnd={onEffectDragEnd}
      />
      <TransportControls
        isPlaying={isPlaying}
        startTransport={startTransport}
        stopTransport={stopTransport}
      />
      <InstrumentTracks
        instruments={instruments}
        draggedIdx={draggedIdx}
        handleDragStart={onDragStart}
        setDraggedIdx={setDraggedIdx}
        handleDragOver={onDragOver}
        handleDrop={onDrop}
        handleEffectDrop={onEffectDrop}
        effectDrag={effectDrag}
        updateEffectParam={onUpdateEffectParam}
        removeInstrument={onRemoveInstrument}
        toggleBeat={onToggleBeat}
        setBeatNote={onSetBeatNote}
        setBeatOctave={onSetBeatOctave}
        currentStep={currentStep}
        handleLoopDrop={onLoopDrop}
        handleLoopDragOver={onLoopDragOver}
      />
      <div style={{ marginTop: 10 }}>
        <b>Instruments:</b> {instruments.map((i) => i.name).join(", ")}
      </div>
    </div>
  );
}

export default Daw;
