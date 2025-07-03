// useToneTransport.js - custom hook for Tone.js transport/loop management
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { INSTRUMENT_SYNTHS, EFFECT_CREATORS } from "./music";

export function useToneTransport({
  isPlaying,
  instruments,
  numBeats,
  tempo,
  setCurrentStep,
}) {
  const synthRefs = useRef({});
  const instrumentsRef = useRef(instruments);
  const loopRef = useRef(null); // <-- Track the Tone.Loop instance

  useEffect(() => {
    instrumentsRef.current = instruments;
  }, [instruments]);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  useEffect(() => {
    // Always dispose previous loop before creating a new one
    if (loopRef.current) {
      loopRef.current.dispose();
      loopRef.current = null;
    }
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Object.keys(synthRefs.current).forEach((key) => {
      if (synthRefs.current[key]?.dispose) synthRefs.current[key].dispose();
      delete synthRefs.current[key];
    });
    let toneLoop;
    if (isPlaying) {
      instrumentsRef.current.forEach((inst) => {
        const createSynth =
          INSTRUMENT_SYNTHS[inst.name] || INSTRUMENT_SYNTHS["Synth"];
        let synth = createSynth();
        if (
          (inst.name === "Piano" || inst.name === "Guitar") &&
          synth.toDestination
        ) {
          synth.on &&
            synth.on("load", () => {
              // You may trigger UI updates here if needed
            });
        }
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
            const synth = synthRefs.current[inst.name];
            if (
              (inst.name === "Piano" || inst.name === "Guitar") &&
              synth &&
              !synth.loaded
            ) {
              return;
            }
            synth?.triggerAttackRelease?.(note, "8n", time);
          }
        });
        setCurrentStep(step);
        step = (step + 1) % numBeats;
      }, "4n").start(0);
      loopRef.current = toneLoop; // <-- Save reference
      Tone.Transport.scheduleRepeat(() => {}, "1m");
      Tone.Transport.start();
    }
    return () => {
      if (loopRef.current) {
        loopRef.current.dispose();
        loopRef.current = null;
      }
      Tone.Transport.cancel();
      Object.keys(synthRefs.current).forEach((key) => {
        if (synthRefs.current[key]?.dispose) synthRefs.current[key].dispose();
        delete synthRefs.current[key];
      });
    };
  }, [isPlaying, instruments, numBeats, setCurrentStep]);

  return synthRefs;
}
