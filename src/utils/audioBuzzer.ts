// Web Audio API emergency sound synthesizer
let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let isBeeping = false;
let intervalId: number | null = null;

export const startEmergencySiren = () => {
  try {
    if (isBeeping) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isBeeping = true;
    let high = true;

    const playTone = () => {
      if (!isBeeping || !audioCtx) return;
      try {
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(high ? 880 : 587.33, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
        high = !high;
      } catch {
        // ignore audio errors
      }
    };

    playTone();
    intervalId = window.setInterval(playTone, 400);
  } catch {
    // fallback
  }
};

export const stopEmergencySiren = () => {
  isBeeping = false;
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  try {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
  } catch {
    // ignore
  }
};

export const isSirenActive = () => isBeeping;
