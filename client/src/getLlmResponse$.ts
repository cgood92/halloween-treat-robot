import { Message } from "ollama/dist/browser";
import { Observable } from "rxjs";
import { HOST, WEBSOCKET_HOST } from "./constants";

export function getLlmResponse$(messages: Message[]) {
  return new Observable<string>((observer) => {
    const socket = new WebSocket(`${WEBSOCKET_HOST}/llm`);

    (async function makeChatCall(messages: Message[]) {
      fetch(`${HOST}/llm`, {
        method: "POST",
        body: JSON.stringify({ messages }),
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((error) => {
        console.error(error);
        socket.close();
      });

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

      socket.addEventListener("error", (error) => {
        console.error(error);
        socket.close();
      });
    })(messages);

    return () => socket.close();
  });
}
