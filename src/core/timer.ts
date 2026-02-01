export interface TestTimer {
  start: () => void;
  stop: () => void;
  getElapsedMs: () => number;
}

const DRIFT_WARN_THRESHOLD = 125;

export function createTestTimer(
  onTick: (elapsedSeconds: number) => void,
  onFinish?: () => void,
  maxSeconds?: number
): TestTimer {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let perfStart = 0;
  let dateStart = 0;
  let elapsed = 0;
  let expectedTime = 0;
  let running = false;

  function tick() {
    if (!running) return;
    elapsed++;
    const now = performance.now();
    const drift = now - expectedTime;
    expectedTime += 1000;

    if (drift > DRIFT_WARN_THRESHOLD && process.env.NODE_ENV === "development") {
      console.warn(`Timer drift detected: ${Math.round(drift)}ms`);
    }

    onTick(elapsed);

    if (maxSeconds && elapsed >= maxSeconds) {
      stop();
      onFinish?.();
      return;
    }

    timeoutId = setTimeout(tick, Math.max(0, 1000 - drift));
  }

  function start() {
    if (running) return;
    running = true;
    perfStart = performance.now();
    dateStart = Date.now();
    expectedTime = perfStart + 1000;
    elapsed = 0;
    timeoutId = setTimeout(tick, 1000);
  }

  function stop() {
    running = false;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function getElapsedMs(): number {
    if (perfStart === 0) return 0;
    const perfElapsed = performance.now() - perfStart;
    const dateElapsed = Date.now() - dateStart;
    // Cross-validate: use performance.now() as primary, Date.now() as sanity check
    if (Math.abs(perfElapsed - dateElapsed) > 100 && process.env.NODE_ENV === "development") {
      console.warn(`Timer consistency issue: perf=${Math.round(perfElapsed)}ms date=${Math.round(dateElapsed)}ms`);
    }
    return perfElapsed;
  }

  return { start, stop, getElapsedMs };
}
