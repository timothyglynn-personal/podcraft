"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PodcastFeedback } from "@/lib/types";
import { saveFeedback } from "@/lib/feedback";
import { isSpeechSupported, createSpeechRecognition } from "@/lib/speech";

const QUICK_TAGS = [
  { id: "loved-it", label: "Loved it!", icon: "❤️" },
  { id: "too-detailed", label: "Too detailed", icon: "📚" },
  { id: "too-short", label: "Too short", icon: "⏱️" },
  { id: "too-stiff", label: "Too stiff", icon: "🤖" },
  { id: "more-casual", label: "More casual", icon: "😎" },
  { id: "great-sources", label: "Great sources", icon: "📰" },
];

interface FeedbackModalProps {
  podcastId: string;
  onClose: () => void;
}

export default function FeedbackModal({ podcastId, onClose }: FeedbackModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [textFeedback, setTextFeedback] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [speechAvailable] = useState(() => isSpeechSupported());
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleStartRecording = useCallback(() => {
    if (!speechAvailable) return;

    const recognition = createSpeechRecognition(
      (transcript, isFinal) => {
        if (isFinal) {
          setVoiceTranscript((prev) => (prev ? prev + " " : "") + transcript);
          setInterimText("");
        } else {
          setInterimText(transcript);
        }
      },
      (error) => {
        console.error("Speech error:", error);
        setIsRecording(false);
      }
    );

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [speechAvailable]);

  const handleStopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterimText("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSubmit = () => {
    const feedback: PodcastFeedback = {
      podcastId,
      quickTags: selectedTags,
      textFeedback: textFeedback.trim(),
      voiceTranscript: voiceTranscript.trim(),
      createdAt: new Date().toISOString(),
    };

    saveFeedback(feedback);
    setSubmitted(true);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const hasFeedback = selectedTags.length > 0 || textFeedback.trim() || voiceTranscript.trim();

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative glass-card p-8 max-w-sm mx-4 text-center animate-fade-in">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-white mb-1">Thanks for your feedback!</h3>
          <p className="text-gray-400 text-sm">We&apos;ll use this to make your next podcast even better.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-mid border-t sm:border border-brand-500/20 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto mx-0 sm:mx-4 animate-slide-in">
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">How was this podcast?</h2>
              <p className="text-sm text-gray-400">Your feedback helps us improve</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick tags */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">Quick feedback</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? "bg-brand-600/30 border-brand-500 text-brand-300 border"
                      : "bg-surface-card border border-surface-hover text-gray-400 hover:text-white"
                  }`}
                >
                  {tag.icon} {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text feedback */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Tell us more</label>
            <textarea
              value={textFeedback}
              onChange={(e) => setTextFeedback(e.target.value)}
              placeholder="What would make this podcast better?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all text-white placeholder-gray-500 text-sm resize-none"
            />
          </div>

          {/* Voice feedback */}
          {speechAvailable && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Or speak your feedback</label>
              <div className="glass-card p-4">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    isRecording
                      ? "bg-red-500/20 border border-red-500/40 text-red-300"
                      : "bg-surface-card border border-brand-500/20 text-gray-300 hover:text-white"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      Listening... tap to stop
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                      Tap to speak
                    </>
                  )}
                </button>

                {/* Live transcript */}
                {(voiceTranscript || interimText) && (
                  <div className="mt-3 p-3 bg-surface-dark rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">What you said:</div>
                    <p className="text-sm text-white">
                      {voiceTranscript}
                      {interimText && <span className="text-gray-400"> {interimText}</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasFeedback}
              className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
