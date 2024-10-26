let recognizer: SpeechRecognition | null = null;

export function getRecognizer(): SpeechRecognition {
  if (recognizer) {
    return recognizer;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  return (recognizer = recognition);
}
