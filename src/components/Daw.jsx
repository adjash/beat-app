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

function Daw() {
  const [rootNote, setRootNote] = useState("C");
  const [octave, setOctave] = useState(4);
  const [tempo, setTempo] = useState(120); // New: tempo state
  const [currentStep, setCurrentStep] = useState(0); // New: current beat indicator
  // Helper to create a beat object
  const createBeat = (active = false, note = rootNote, octaveVal = octave) => ({
    active,
    note,
    octave: octaveVal,
  });
  // Helper to create a loop of 16 beats
  const createLoop = () =>
    Array(16)
      .fill(0)
      .map(() => createBeat());

  const [isPlaying, setIsPlaying] = useState(false);
  const [instruments, setInstruments] = useState([
    {
      name: "Synth",
      loop: Array(16)
        .fill(0)
        .map(() => ({ active: false, note: "C", octave: 4 })),
    },
  ]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [paletteDrag, setPaletteDrag] = useState(null);
  const synthRefs = useRef({});
  const instrumentsRef = useRef(instruments);

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
      // Create synths if not already
      instrumentsRef.current.forEach((inst) => {
        if (!synthRefs.current[inst.name]) {
          const createSynth =
            INSTRUMENT_SYNTHS[inst.name] || INSTRUMENT_SYNTHS["Synth"];
          synthRefs.current[inst.name] = createSynth();
        }
      });
      let step = 0;
      setCurrentStep(0); // Reset to 0 on play
      toneLoop = new Tone.Loop((time) => {
        instrumentsRef.current.forEach((inst) => {
          const beat = inst.loop[step];
          if (beat && beat.active) {
            const note = `${beat.note}${beat.octave}`;
            synthRefs.current[inst.name].triggerAttackRelease(note, "8n", time);
          }
        });
        setCurrentStep(step); // Update current step for indicator
        step = (step + 1) % 16;
      }, "4n").start(0);
      Tone.Transport.scheduleRepeat(() => {}, "1m");
    }
    return () => {
      if (toneLoop) toneLoop.dispose();
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
        { name: paletteDrag, loop: createLoop() },
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
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: draggedIdx === idx ? 0.5 : 1,
              border: draggedIdx === idx ? "2px dashed #888" : "none",
              cursor: "grab",
              background: "#fff",
              borderRadius: 6,
              minWidth: 90,
              minHeight: 120,
              margin: 2,
            }}
          >
            <LoopGrid
              loop={inst.loop}
              toggleBeat={(beatIdx) => toggleBeat(idx, beatIdx)}
              setBeatNote={(beatIdx, note) => setBeatNote(idx, beatIdx, note)}
              setBeatOctave={(beatIdx, octaveVal) =>
                setBeatOctave(idx, beatIdx, octaveVal)
              }
              label={inst.name}
              currentStep={currentStep} // Pass current step for indicator
            />
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
      </div>
    </div>
  );
}

export default Daw;
