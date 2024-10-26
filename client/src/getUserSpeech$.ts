import { fromEvent, takeWhile, map } from "rxjs";

export function getUserSpeech$(recognizer: SpeechRecognition) {
  recognizer.start();
  return fromEvent<SpeechRecognitionEvent>(recognizer, "result").pipe(
    takeWhile(isNotFinal, true),
    map(aggregateSpeechText),
  );
}

function isNotFinal(event: SpeechRecognitionEvent) {
  for (let i = 0; i < event.results.length; i++) {
    const result = event.results[i];
    if (result.isFinal) {
      for (let j = 0; j < result.length; j++) {
        const { confidence } = result[j];
        if (confidence > 0.1) {
          return false;
        }
      }
    }
  }
  return true;
}

function aggregateSpeechText(event: SpeechRecognitionEvent) {
  let text = "";
  for (let i = 0; i < event.results.length; i++) {
    const result = event.results[i];
    text += result[result.length - 1].transcript;
  }
  return text;
}
