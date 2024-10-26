export function speak(text: string) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const trinoidsVoice = synth
      .getVoices()
      .find((voice) => voice.name === "Trinoids")!;
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = trinoidsVoice;
    utterThis.rate = 1.5;

    synth.speak(utterThis);
    utterThis.onend = () => {
      resolve(null);
    };
  });
}

export function stop() {
  window.speechSynthesis.cancel();
}
