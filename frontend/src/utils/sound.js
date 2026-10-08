// Web Audio chime — used to alert the user when a new arb appears.
// No external sound files needed; we synthesize a short two-note beep.
let audioCtx = null;

function getCtx() {
  if (audioCtx) return audioCtx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  return audioCtx;
}

export function playArbAlert() {
  const ctx = getCtx();
  if (!ctx) return;

  // Two ascending sine beeps — pleasant but unmistakable
  const now = ctx.currentTime;
  [
    { freq: 880, start: 0,    dur: 0.12 },
    { freq: 1320, start: 0.14, dur: 0.18 },
  ].forEach(({ freq, start, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    // Tiny attack/decay envelope to avoid click artefacts
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.02);
  });
}
