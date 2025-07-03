import "./App.css";
import * as Tone from "tone";
import Daw from "./components/Daw";
import LoopGrid from "./components/LoopGrid";

function App() {
  const playTone = async () => {
    const synth = new Tone.Synth().toDestination();

    await Tone.start();
    synth.triggerAttackRelease("D2", "8n");
  };
  const playSynth = async () => {
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();

    await Tone.start();
    // trigger the attack immediately
    synth.triggerAttack("C4", now);
    // wait one second before triggering the release
    synth.triggerRelease(now + 1);
  };
  const playMultiple = async () => {
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();

    await Tone.start();
    synth.triggerAttackRelease("C4", "8n", now);
    synth.triggerAttackRelease("E4", "8n", now + 0.5);
    synth.triggerAttackRelease("G4", "8n", now + 1);
    return;
  };
  const transport = async () => {
    // create two monophonic synths
    await Tone.start();
    const synthA = new Tone.FMSynth().toDestination();
    const synthB = new Tone.AMSynth().toDestination();
    //play a note every quarter-note
    const loopA = new Tone.Loop((time) => {
      synthA.triggerAttackRelease("C2", "8n", time);
    }, "4n").start(0);
    //play another note every off quarter-note, by starting it "8n"
    const loopB = new Tone.Loop((time) => {
      synthB.triggerAttackRelease("C4", "8n", time);
    }, "4n").start("8n");
    // all loops start when the Transport is started
    Tone.getTransport().start();
    // ramp up to 800 bpm over 10 seconds
    return Tone.getTransport().bpm.rampTo(800, 10);
  };
  const instruments = async () => {
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();
    synth.triggerAttack("D4", now);
    synth.triggerAttack("F4", now + 0.5);
    synth.triggerAttack("A4", now + 1);
    synth.triggerAttack("C5", now + 1.5);
    synth.triggerAttack("E5", now + 2);
    synth.triggerRelease(["D4", "F4", "A4", "C5", "E5"], now + 4);
  };
  return (
    <>
      <button onClick={playTone}>Beep</button>
      <button onClick={playSynth}>Synth</button>
      <button onClick={playMultiple}>Sequential</button>
      <button onClick={transport}>Something</button>
      <button onClick={instruments}>Instruments</button>
      <Daw />
    </>
  );
}

export default App;
