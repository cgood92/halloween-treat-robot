import { useEffect, useRef, useState } from "react";
import "./Head.css";
import { WEBSOCKET_HOST } from "./constants";

// The robot head design and code came from: https://codepen.io/mliq/pen/xWMxNo, with some modifications.

export default function Head() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isFullScreenRef = useRef(false);

  useEffect(() => {
    const socket = new WebSocket(`${WEBSOCKET_HOST}/isSpeaking`);
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      setIsSpeaking(data.isSpeaking);
    });

    return () => socket.close();
  }, []);

  useEffect(() => {
    let wakeLock: WakeLockSentinel;
    document.addEventListener("click", async () => {
      if (isFullScreenRef.current) {
        document.documentElement.requestFullscreen();
        wakeLock = await navigator.wakeLock.request("screen");
      } else {
        document.exitFullscreen();
        wakeLock?.release();
      }
      isFullScreenRef.current = !isFullScreenRef.current;
    });
  }, []);

  return (
    <>
      <div className={`robot${isSpeaking ? " robot_speaking" : ""}`}>
        <div className="head">
          <div className="eyes">
            <div className="eyeball eyeball_left"></div>
            <div className="eyeball eyeball_right"></div>
          </div>
          <div className="mouth">
            <div className="mouth-container">
              <div className="mouth-container-line"></div>
            </div>
          </div>
        </div>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        style={{ display: "none" }}
      >
        <defs>
          <filter id="speaking-0">
            <feTurbulence
              id="turbulence"
              baseFrequency="0.002"
              numOctaves="3"
              result="noise"
              seed="0"
            />
            <feDisplacementMap
              id="displacement"
              in="SourceGraphic"
              in2="noise"
              scale="120"
            />
          </filter>
          <filter id="speaking-1">
            <feTurbulence
              id="turbulence"
              baseFrequency="0.002"
              numOctaves="3"
              result="noise"
              seed="30"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="130" />
          </filter>
          <filter id="speaking-2">
            <feTurbulence
              id="turbulence"
              baseFrequency="0.002"
              numOctaves="3"
              result="noise"
              seed="2"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" />
          </filter>
          <filter id="speaking-3">
            <feTurbulence
              id="turbulence"
              baseFrequency="0.002"
              numOctaves="3"
              result="noise"
              seed="30"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="130" />
          </filter>
          <filter id="speaking-4">
            <feTurbulence
              id="turbulence"
              baseFrequency="0.01"
              numOctaves="3"
              result="noise"
              seed="4"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="110" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
