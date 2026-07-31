"use client";
import { useState } from 'react';
import { Mic, MicOff, Sparkles, Volume2, X } from 'lucide-react';

export default function VoiceSearchButton({ onSpeechResult, language = 'te-IN' }) {
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowVoiceModal(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language || 'te-IN'; // Telugu speech recognition

      recognition.onstart = () => {
        setIsListening(true);
        setShowVoiceModal(true);
        setTranscriptText('Listening... మాట్లాడండి');
      };

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscriptText(text);
        if (event.results[0].isFinal) {
          if (onSpeechResult && text) {
            onSpeechResult(text);
          }
          setTimeout(() => {
            setIsListening(false);
            setShowVoiceModal(false);
          }, 800);
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setTranscriptText('Could not hear voice. Please try again.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setShowVoiceModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={startListening}
        title="Click to Voice Search (తెలుగు లేదా English లో మాట్లాడండి)"
        className={`relative p-2 rounded-full transition-all cursor-pointer select-none flex items-center justify-center border shadow-sm ${
          isListening
            ? 'bg-red-500 text-white ring-4 ring-red-300 animate-pulse scale-110 border-red-400'
            : 'bg-[#008DDA] hover:bg-[#0077B6] text-white border-sky-400/40'
        }`}
      >
        {isListening ? (
          <MicOff className="h-4 w-4 animate-bounce" />
        ) : (
          <Mic className="h-4 w-4" />
        )}

        {/* Badge */}
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white animate-ping" />
      </button>

      {/* Voice Assistant Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 border border-slate-200">
            <button
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pt-2">
              <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center text-white ${
                isListening ? 'bg-red-500 animate-pulse ring-8 ring-red-100' : 'bg-[#008DDA]'
              }`}>
                <Mic className="h-8 w-8" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#008DDA] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                Voice Assistant / వాయిస్ సెర్చ్
              </span>
              <h3 className="text-base font-serif font-bold text-slate-900 mt-2">
                {isListening ? 'మాట్లాడండి (Speak Now)...' : 'Voice Search'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 font-medium min-h-[30px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {transcriptText || 'e.g. "బర్మా టేకు గుమ్మాలు", "Wood Beds"'}
              </p>
            </div>

            {!isListening && (
              <div className="space-y-2 pt-2">
                <button
                  onClick={startListening}
                  className="w-full py-3 bg-[#008DDA] hover:bg-[#0077B6] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  <span>Tap to Speak Again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
