// Sound effects made in the browser with the Web Audio API, so no audio files are needed.
// Sound is OFF by default. The on/off choice is saved as a preference in this browser only.
const KEY = "gl-sound-on";
let audioContext = null;

export function soundOn() {
  return localStorage.getItem(KEY) === "true";
}

export function setSoundOn(on) {
  localStorage.setItem(KEY, String(on));
}

export function playTone(frequency = 660, duration = 0.12, type = "sine") {
  if (!soundOn()) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Audio is not available on this device, so stay silent
  }
}

export const sfx = {
  click: () => playTone(440, 0.05),
  good: () => {
    playTone(660, 0.12);
    setTimeout(() => playTone(880, 0.16), 90);
  },
  bad: () => playTone(180, 0.25, "sawtooth"),
  win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 120)),
};
