let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

const bufferCache = new Map<string, AudioBuffer>();

async function loadSound(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) return bufferCache.get(url)!;

  try {
    const ctx = getAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(url, audioBuffer);
    return audioBuffer;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to load sound:", url, err);
    }
    return null;
  }
}

export function playSound(url: string, volume: number): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  loadSound(url).then((buffer) => {
    if (!buffer) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = Math.max(0, Math.min(1, volume));
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  });
}

// Generate a simple click sound using oscillator (no external files needed)
export function playSynthClick(volume: number, variant: number = 1): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Different variants produce different tones
  const freqs = [800, 600, 1000, 500, 900, 700, 1200];
  osc.frequency.value = freqs[(variant - 1) % freqs.length];
  osc.type = "sine";

  gain.gain.value = Math.max(0, Math.min(1, volume)) * 0.3;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

export function playSynthError(volume: number, variant: number = 1): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const freqs = [200, 250, 180];
  osc.frequency.value = freqs[(variant - 1) % freqs.length];
  osc.type = "square";

  gain.gain.value = Math.max(0, Math.min(1, volume)) * 0.2;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}
