import React, { useState } from "react";
import DawControls from "./daw/DawControls";
import InstrumentPalette from "./daw/InstrumentPalette";
import EffectPalette from "./daw/EffectPalette";
import TransportControls from "../components/TransportControls";
import InstrumentTracks from "./daw/InstrumentTracks";
import {
  INSTRUMENT_OPTIONS,
  EFFECT_OPTIONS,
  SCALE_NAMES,
  createLoop,
  EFFECT_PARAM_DEFAULTS,
  randomFrom,
  randomInt,
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
    // Pick a random scale
    const scaleName = randomFrom(SCALE_NAMES);
    setRandomScale(scaleName);
    const scaleNotes = getScaleNotes(rootNote, scaleName);
    // Randomize instruments
    const numInstruments = randomInt(6, 12);
    const newInstruments = [];
    for (let i = 0; i < numInstruments; i++) {
      const name = randomFrom(INSTRUMENT_OPTIONS);
      const loop = Array(numBeats)
        .fill(0)
        .map(() => ({
          active: Math.random() > 0.6,
          note: randomFrom(scaleNotes),
          octave: randomInt(2, 5),
        }));
      // Randomize effects
      const numEffects = randomInt(0, 2);
      const effectTypes = [];
      while (effectTypes.length < numEffects) {
        const fx = randomFrom(EFFECT_OPTIONS);
        if (!effectTypes.includes(fx)) effectTypes.push(fx);
      }
      const effects = effectTypes.map((type) => ({
        type,
        params: { ...EFFECT_PARAM_DEFAULTS[type] },
      }));
      newInstruments.push({ name, loop, effects });
    }
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
