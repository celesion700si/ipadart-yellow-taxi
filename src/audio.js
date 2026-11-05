// Replace this function with an audio-file player when recorded narration is ready.
export function speakNarration(text) {
  if (!('speechSynthesis' in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = synth.getVoices().filter(v => /^zh[-_]TW$/i.test(v.lang));
  const voice = voices.find(v => /female|woman|美嘉|Mei.?Jia|Hsiao|曉|小/i.test(v.name)) || voices[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.volume = 1;
  synth.speak(utterance);
  return true;
}
export function stopNarration() { window.speechSynthesis?.cancel(); }
let context, musicGain, timer, muted = false, volume = 0.2, cursor = 0, nextNote = 0;
const melody = [523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
function tone(frequency, when, duration, gain, destination) {
  const oscillator = context.createOscillator(), envelope = context.createGain();
  oscillator.type = 'sine'; oscillator.frequency.value = frequency;
  envelope.gain.setValueAtTime(0, when);
  envelope.gain.linearRampToValueAtTime(gain, when + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(envelope); envelope.connect(destination);
  oscillator.start(when); oscillator.stop(when + duration + 0.03);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
}
export async function startMusic() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;
  if (!context) { context = new AudioContext(); musicGain = context.createGain(); musicGain.connect(context.destination); setMusicVolume(volume); }
  await context.resume();
  if (!timer) {
    nextNote = context.currentTime + 0.06;
    timer = setInterval(() => {
      if (context.state !== 'running') return;
      if (nextNote < context.currentTime) nextNote = context.currentTime + 0.05;
      while (nextNote < context.currentTime + 0.25) {
        tone(melody[cursor % melody.length], nextNote, 0.42, 0.15, musicGain);
        cursor++; nextNote += 0.48;
      }
    }, 100);
  }
  return context.state === 'running';
}
export function setMusicVolume(value) { volume = value; if(musicGain) musicGain.gain.setTargetAtTime(muted ? 0 : volume * 0.25, context.currentTime, 0.04); }
export function setMusicMuted(value) { muted = value; setMusicVolume(volume); }
export function completionSound() {
  if (!context || context.state !== 'running') return;
  [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,context.currentTime+i*0.11,0.45,0.055,context.destination));
}
export function pauseAudio() { context?.suspend(); stopNarration(); }
