// Browser Speech Recognition wrapper
// Works in Chrome and Safari (covers most mobile users)

type SpeechCallback = (transcript: string, isFinal: boolean) => void;

interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  isListening: boolean;
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  );
}

export function createSpeechRecognition(
  onResult: SpeechCallback,
  onError?: (error: string) => void
): SpeechRecognitionInstance {
  const SpeechRecognition =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      start: () => onError?.("Speech recognition not supported in this browser"),
      stop: () => {},
      isListening: false,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = new (SpeechRecognition as any)();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let listening = false;

  recognition.onresult = (event: { results: { transcript: string; isFinal?: boolean }[][] }) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      if (result[0]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((result as any).isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript, true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: { error: string }) => {
    listening = false;
    if (event.error !== "aborted") {
      onError?.(event.error === "not-allowed"
        ? "Microphone access denied. Please allow microphone access."
        : `Speech recognition error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    listening = false;
  };

  return {
    start: () => {
      try {
        recognition.start();
        listening = true;
      } catch {
        onError?.("Could not start speech recognition");
      }
    },
    stop: () => {
      try {
        recognition.stop();
        listening = false;
      } catch {
        // Already stopped
      }
    },
    get isListening() {
      return listening;
    },
  };
}
