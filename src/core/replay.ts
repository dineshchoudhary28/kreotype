/**
 * Replay module - records keystrokes with timestamps for test replay playback.
 * Ported from Monkeytype's test/replay.ts, adapted for React (no DOM manipulation).
 */

export type ReplayAction =
  | "correctLetter"
  | "incorrectLetter"
  | "backWord"
  | "submitCorrectWord"
  | "submitErrorWord"
  | "setLetterIndex";

export interface ReplayEvent {
  action: ReplayAction;
  value?: string | number;
  time: number;
}

export interface ReplayData {
  events: ReplayEvent[];
  wordsList: string[];
  startTime: number;
}

export function createReplayRecorder() {
  let events: ReplayEvent[] = [];
  let startTime = 0;
  let recording = false;
  let wordsList: string[] = [];

  function start(words: string[]): void {
    events = [];
    startTime = performance.now();
    recording = true;
    wordsList = [...words];
  }

  function stop(): void {
    recording = false;
  }

  function addEvent(action: ReplayAction, value?: string | number): void {
    if (!recording) return;
    const timeDelta = performance.now() - startTime;
    events.push({ action, value, time: timeDelta });
  }

  function getData(): ReplayData {
    return {
      events: [...events],
      wordsList: [...wordsList],
      startTime,
    };
  }

  function exportJSON(): string {
    return JSON.stringify(getData());
  }

  return {
    start,
    stop,
    addEvent,
    getData,
    exportJSON,
    get isRecording() {
      return recording;
    },
  };
}

export type ReplayRecorder = ReturnType<typeof createReplayRecorder>;

/**
 * Replay player - plays back recorded events with timing.
 * Returns a controller that can play, pause, and seek through replay data.
 */
export function createReplayPlayer(data: ReplayData) {
  let timeouts: ReturnType<typeof setTimeout>[] = [];
  let playing = false;
  let currentWordPos = 0;
  let currentCharPos = 0;

  type EventHandler = (event: ReplayEvent, wordPos: number, charPos: number) => void;
  let onEvent: EventHandler | null = null;
  let onComplete: (() => void) | null = null;

  function play(handler: EventHandler, completeHandler?: () => void): void {
    if (playing) return;
    playing = true;
    onEvent = handler;
    onComplete = completeHandler ?? null;
    currentWordPos = 0;
    currentCharPos = 0;

    if (data.events.length === 0) {
      playing = false;
      onComplete?.();
      return;
    }

    const firstTime = data.events[0]!.time;

    data.events.forEach((event, i) => {
      const timeout = setTimeout(() => {
        processEvent(event);
        onEvent?.(event, currentWordPos, currentCharPos);

        if (i === data.events.length - 1) {
          playing = false;
          onComplete?.();
        }
      }, event.time - firstTime);

      timeouts.push(timeout);
    });
  }

  function pause(): void {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    playing = false;
  }

  function processEvent(event: ReplayEvent): void {
    switch (event.action) {
      case "correctLetter":
      case "incorrectLetter":
        currentCharPos++;
        break;
      case "setLetterIndex":
        if (typeof event.value === "number") {
          currentCharPos = event.value;
        }
        break;
      case "submitCorrectWord":
      case "submitErrorWord":
        currentWordPos++;
        currentCharPos = 0;
        break;
      case "backWord":
        currentWordPos = Math.max(0, currentWordPos - 1);
        currentCharPos = 0;
        break;
    }
  }

  return {
    play,
    pause,
    get isPlaying() {
      return playing;
    },
    get wordPos() {
      return currentWordPos;
    },
    get charPos() {
      return currentCharPos;
    },
  };
}

export type ReplayPlayer = ReturnType<typeof createReplayPlayer>;
