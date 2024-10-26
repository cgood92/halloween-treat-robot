import { useRef, useState } from "react";
import { lastValueFrom, Subscription } from "rxjs";
import { tap } from "rxjs/operators";
import { Message } from "ollama";
import { getRecognizer } from "./recognizer";
import { getUserSpeech$ } from "./getUserSpeech$";
import { getLlmResponse$ } from "./getLlmResponse$";
import { HOST, WEBSOCKET_HOST } from "./constants";
import "./styles.css";

const recognizer = getRecognizer();

const endOfConversation = /good\s*bye/i;

export default function Halloween() {
  const [shouldShowStartButton, setShouldShowStartButton] = useState(true);
  const isRunningDialogue = useRef(false);
  const chatHistoryRef = useRef<Message[]>([]);

  const gettingLlmResponseSubscription = useRef<Subscription>();
  const screenLockRef = useRef<WakeLockSentinel>();

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [userText, setUserText] = useState("");
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [assistantText, setAssistantText] = useState("");

  function exitFullScreen() {
    screenLockRef.current?.release();
    document.exitFullscreen();
  }

  function stop() {
    setShouldShowStartButton(true);
    recognizer.abort();
    gettingLlmResponseSubscription.current?.unsubscribe();
    isRunningDialogue.current = false;
    setUserText("");
    setAssistantText("");
  }

  async function start() {
    if (isRunningDialogue.current) {
      return;
    }

    setShouldShowStartButton(false);

    const firstNumber = getRandomInt(1, 10);
    const secondNumber = getRandomInt(1, 10);
    const correctAnswer = firstNumber + secondNumber;

    isRunningDialogue.current = true;
    chatHistoryRef.current = [];
    runDialogue(firstNumber, secondNumber, correctAnswer);
    screenLockRef.current = await navigator.wakeLock.request("screen");
    document.documentElement.requestFullscreen();
  }

  async function runDialogue(
    firstNumber: number,
    secondNumber: number,
    correctAnswer: number,
  ) {
    const isFirst = chatHistoryRef.current.length === 0;
    const lastThingUserSaid = await (isFirst
      ? "Trick or treat!"
      : lastValueFrom(
          getUserSpeech$(recognizer).pipe(tap((text) => setUserText(text))),
        ));

    chatHistoryRef.current.push({
      role: "user",
      content: lastThingUserSaid,
    });
    setIsUserSpeaking(false);
    recognizer.stop();

    let text = "";
    gettingLlmResponseSubscription.current = getLlmResponse$([
      {
        role: "system",
        content: getSystemMessage(firstNumber, secondNumber, correctAnswer),
      },
      ...chatHistoryRef.current,
    ])
      .pipe(
        tap((newText) => {
          text += newText;
          setAssistantText(text);
        }),
      )
      .subscribe({
        complete: async () => {
          await waitForDoneSpeaking();
          setIsAssistantSpeaking(false);

          chatHistoryRef.current.push({
            role: "assistant",
            content: text,
          });

          const isEndOfConversation = endOfConversation.test(text);
          if (isEndOfConversation) {
            fetch(`${HOST}/open`, {
              method: "POST",
            })
              .catch(console.error)
              .finally(stop);
          } else {
            runDialogue(firstNumber, secondNumber, correctAnswer);
          }
        },
      });
  }

  return (
    <div className="App">
      {shouldShowStartButton ? (
        <button className="big" onClick={start}>
          Trick or Treat
        </button>
      ) : (
        <>
          {isAssistantSpeaking ? (
            <code className="assistant">{assistantText}...</code>
          ) : (
            <h2 className="assistant">{assistantText}</h2>
          )}
          <hr />
          {isUserSpeaking ? (
            <code className="user">{userText}...</code>
          ) : (
            <h2 className="user">{userText}</h2>
          )}
          <footer>
            <button onClick={() => (stop(), exitFullScreen())}>Stop</button>
          </footer>
        </>
      )}
    </div>
  );
}

function getSystemMessage(
  firstNumber: number,
  secondNumber: number,
  correctAnswer: number,
) {
  return `# Who you are
Your name is TreatBot.  You thrive as a robot built for handing out Halloween candy to young kids.  

# Your goal
Ask kids the simple math question outlined below.  Whether or not they get the answer right, give them a piece of candy.

# How to play
1. User says "trick or treat" as they approach your door.
2. You greet them cheerily, and ask them the math question below.
3. The user tries to answer the question.
4. You repeat back what you heard, confirm if it's correct or not, then give them a piece of candy.  Always end the conversation with "Good bye!".

# Constraints
1. Only 1 treat per person.
2. Since we're busy, you don't have time to use lots of words.  Be brief and concise.
3. You don't know what type of candy you have.
4. Do not include any scene suggestions or actions.
5. The user will stay around until you say "Good bye!".  So make sure to say it at the end of the conversation, or we'll be in trouble.

# Ready?
Let's get started.  The math problem is: ${firstNumber} + ${secondNumber}.  The correct answer is: ${correctAnswer}.  Now, let's see how many kids get it right!`;
}

// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function waitForDoneSpeaking() {
  return new Promise(async (resolve) => {
    const socket = new WebSocket(`${WEBSOCKET_HOST}/isSpeaking`);
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (!data.isSpeaking) {
        resolve(undefined);
        socket.close();
      }
    });
  });
}
