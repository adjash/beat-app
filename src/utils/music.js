// music.js - Music and Tone.js helpers for the DAW app
import * as Tone from "tone";

// Instrument and effect options
export const INSTRUMENT_OPTIONS = [
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

export const EFFECT_OPTIONS = [
  "Reverb",
  "Delay",
  "Distortion",
  "Chorus",
  "Phaser",
  "Tremolo",
];

export const NOTE_OPTIONS = [
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

// Instrument and effect creators
export const INSTRUMENT_SYNTHS = {
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

export const EFFECT_PARAM_DEFAULTS = {
  Reverb: { decay: 2, wet: 0.4 },
  Delay: { delayTime: 0.25, feedback: 0.4, wet: 0.4 },
  Distortion: { distortion: 0.4 },
  Chorus: { frequency: 4, delayTime: 2.5, depth: 0.5, wet: 0.5 },
  Phaser: { frequency: 15, octaves: 3, baseFrequency: 1000, wet: 0.5 },
  Tremolo: { frequency: 9, depth: 0.75, wet: 0.5 },
};

export const EFFECT_CREATORS = {
  Reverb: (params) => new Tone.Reverb(params),
  Delay: (params) => new Tone.FeedbackDelay(params),
  Distortion: (params) => new Tone.Distortion(params.distortion),
  Chorus: (params) =>
    new Tone.Chorus(params.frequency, params.delayTime, params.depth).start(),
  Phaser: (params) => new Tone.Phaser(params),
  Tremolo: (params) => new Tone.Tremolo(params.frequency, params.depth).start(),
};

// Scales and helpers
export const SCALES = {
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
export const SCALE_NAMES = Object.keys(SCALES);

export function getScaleNotes(root, scaleName) {
  const intervals = SCALES[scaleName];
  const rootIdx = NOTE_OPTIONS.indexOf(root);
  let scale = [root];
  let idx = rootIdx;
  for (let i = 0; i < intervals.length; i++) {
    idx = (idx + intervals[i]) % 12;
    scale.push(NOTE_OPTIONS[idx]);
  }
  return scale;
}

// Beat/loop helpers
export function createBeat(active = false, note = "C", octaveVal = 4) {
  return { active, note, octave: octaveVal };
}
export function createLoop(numBeats, note = "C", octave = 4) {
  return Array(numBeats)
    .fill(0)
    .map(() => createBeat(false, note, octave));
}

// Random helpers
export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Effect param randomizer
export function randomizeParams(type) {
  const defaults = EFFECT_PARAM_DEFAULTS[type];
  const params = {};
  Object.entries(defaults).forEach(([k, v]) => {
    if (typeof v === "number") {
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
}
