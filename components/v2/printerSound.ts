// Synthesised thermal-printer sounds. Browsers only allow audio after a click, so these are
// played for prints and tears the visitor starts themselves.

let context: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  context ??= new AudioContext();
  if (context.state === "suspended") context.resume().catch(() => {});
  return context;
}

function noise(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** A stepper-motor buzz and a thermal-head tick for each paper step (times in ms). */
export function playFeed(steps: number[], totalMs: number) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + 0.03;
  const out = ctx.createGain();
  out.gain.value = 0.5;
  out.connect(ctx.destination);

  const motor = ctx.createOscillator();
  motor.type = "sawtooth";
  motor.frequency.value = 118;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 900;
  const level = ctx.createGain();
  level.gain.value = 0;
  motor.connect(tone).connect(level).connect(out);

  const tick = noise(ctx, 0.03);
  steps.forEach((ms) => {
    const t = start + ms / 1000;
    level.gain.setValueAtTime(0, t);
    level.gain.linearRampToValueAtTime(0.07, t + 0.008);
    level.gain.linearRampToValueAtTime(0, t + 0.05);

    const source = ctx.createBufferSource();
    source.buffer = tick;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3200;
    band.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    source.connect(band).connect(gain).connect(out);
    source.start(t);
  });

  motor.start(start);
  motor.stop(start + totalMs / 1000 + 0.1);
}

/** Paper ripping against the serrated bar. */
export function playTear() {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  const source = ctx.createBufferSource();
  source.buffer = noise(ctx, 0.3);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(700, t);
  filter.frequency.exponentialRampToValueAtTime(4200, t + 0.22);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(t);
}
