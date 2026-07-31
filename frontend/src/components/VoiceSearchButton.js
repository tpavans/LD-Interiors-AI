"use client";
import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function VoiceSearchButton({ onSpeechResult, language = 'te-IN' }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSupported(false);
      }
    }
  }, []);

  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search microphone is not supported on this browser. Please use Chrome or Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language || 'te-IN'; // Default Telugu speech recognition

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onSpeechResult) {
          onSpeechResult(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Voice speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleVoice}
      title={isListening ? "Listening to your voice... Speak now!" : "Click to Voice Search (తెలుగు లేదా English లో మాట్లాడండి)"}
      className={`relative p-2 rounded-full transition-all cursor-pointer select-none flex items-center justify-center ${
        isListening
          ? 'bg-red-500 text-white ring-4 ring-red-300 animate-pulse scale-110'
          : 'bg-sky-100 hover:bg-sky-200 text-[#008DDA]'
      }`}
    >
      {isListening ? (
        <MicOff className="h-4 w-4 animate-bounce" />
      ) : (
        <Mic className="h-4 w-4" />
      )}

      {isListening && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg">
          🎙️ Listening... Speak Now
        </span>
      )}
    </button>
  );
}
