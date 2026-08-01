/** 浏览器支持时播放一段短促提示音；音频不可用时静默降级。 */
export const playFusionRevealSound = () => {
  if (typeof window === "undefined" || !window.AudioContext) return;

  const audioContext = new window.AudioContext();
  const masterGain = audioContext.createGain();
  const startedAt = audioContext.currentTime;
  const notes = [392, 523.25, 659.25, 783.99];

  masterGain.gain.setValueAtTime(0.0001, startedAt);
  masterGain.gain.exponentialRampToValueAtTime(0.16, startedAt + 0.03);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.9);
  masterGain.connect(audioContext.destination);

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();
    const noteStart = startedAt + index * 0.08;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(0.75, noteStart + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.45);
    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.46);

    if (index === notes.length - 1) {
      oscillator.addEventListener("ended", () => void audioContext.close());
    }
  });
};
