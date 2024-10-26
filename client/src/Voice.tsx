import { useEffect, useRef, useState } from "react";
import { from, mergeMap, Observable, of, tap } from "rxjs";
import { speak } from "./speak";
import { HOST, WEBSOCKET_HOST } from "./constants";

export default function Voice() {
  const isActivated = useRef(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    function vocalize() {
      setIsListening(true);
      let text = "";
      let interimText = "";
      let isSpeaking = false;

      getTextToSpeak$()
        .pipe(
          tap((newText) => {
            text += newText;
            interimText += newText;
          }),
          mergeMap(() => {
            const splits = interimText.split(" ");
            if (splits.length > 4) {
              const toSay = splits.slice(0, -1).join(" ");
              interimText = splits.at(-1) || "";

              if (!isSpeaking) {
                notifyIsSpeaking(true);
                isSpeaking = true;
              }

              return from(speak(toSay));
            }
            return of("");
          }),
        )
        .subscribe({
          complete: async () => {
            // Handle any remaining text unsaid
            if (interimText) {
              await speak(interimText);
            }
            notifyIsSpeaking(false);
            vocalize();
          },
        });
    }

    if (!isActivated.current) {
      isActivated.current = true;
      window.document.addEventListener("click", vocalize);
      window.document.addEventListener("click", () =>
        navigator.wakeLock.request("screen"),
      );
    }
  }, []);

  return <>{isListening ? "Listening..." : "Click to activate"}</>;
}

function getTextToSpeak$() {
  return new Observable<string>((observer) => {
    const socket = new WebSocket(`${WEBSOCKET_HOST}/llm`);

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.isStart) {
        // Do nothing
      } else if (data.isFinal) {
        observer.complete();
        socket.close();
      } else {
        observer.next(data.part);
      }
    });

    return () => socket.close();
  });
}

function notifyIsSpeaking(isSpeaking: boolean) {
  fetch(`${HOST}/isSpeaking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isSpeaking }),
  }).catch(console.error);
}
