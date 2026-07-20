"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";

export default function ArticleAudio({ title, text }: { title: string; text: string }) {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function startFromBeginning() {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${title}. ${text}`);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState("playing");
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }
    startFromBeginning();
  }

  function pause() {
    window.speechSynthesis.pause();
    setState("paused");
  }

  function restart() {
    startFromBeginning();
  }

  return (
    <div className="article-audio" aria-label="Listen to this article">
      <div className="article-audio-label"><Volume2 aria-hidden="true" /><span>Listen to this article</span></div>
      <div className="article-audio-controls">
        <button type="button" onClick={state === "playing" ? pause : speak}>
          {state === "playing" ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {state === "playing" ? "Pause" : state === "paused" ? "Continue" : "Read to me"}
        </button>
        {state !== "idle" && <button type="button" className="audio-restart" onClick={restart} aria-label="Restart article"><RotateCcw aria-hidden="true" /></button>}
      </div>
    </div>
  );
}
