// src/features/chatbot/lib/playback.ts
/** Plays one reply clip. Web uses the browser audio element; the device uses expo-audio. */
import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

export interface ClipPlayer {
  play: () => void;
  stop: () => void;
  release: () => void;
}

interface PlayerCallbacks {
  onFinish: () => void;
  onError: (message: string) => void;
}

export function openClipPlayer(uri: string, callbacks: PlayerCallbacks): ClipPlayer {
  return Platform.OS === "web" ? openWebPlayer(uri, callbacks) : openNativePlayer(uri, callbacks);
}

function openWebPlayer(uri: string, { onFinish, onError }: PlayerCallbacks): ClipPlayer {
  const audio = new Audio(uri);
  audio.onended = () => onFinish();
  audio.onerror = () => onError("The browser could not play this audio.");
  return {
    play: () => {
      audio.play().catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        onError(cause instanceof Error ? cause.message : "Playback failed.");
      });
    },
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
    },
    release: () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    },
  };
}

function openNativePlayer(uri: string, { onFinish, onError }: PlayerCallbacks): ClipPlayer {
  const player = createAudioPlayer(uri);
  const subscription = player.addListener("playbackStatusUpdate", (status) => {
    if (status.error) onError(status.error);
    else if (status.didJustFinish) onFinish();
  });
  return {
    play: () => {
      void setAudioModeAsync({ playsInSilentMode: true }).then(() => player.play());
    },
    stop: () => {
      player.pause();
    },
    release: () => {
      subscription.remove();
      player.remove();
    },
  };
}
