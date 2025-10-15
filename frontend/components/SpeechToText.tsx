import React, { useState, useEffect, useRef } from 'react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  disabled?: boolean;
}

export const SpeechToText: React.FC<SpeechToTextProps> = ({
  onTranscript,
  isRecording,
  onRecordingChange,
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const isStartingRef = useRef(false);

  // Sync local state with parent state
  useEffect(() => {
    setIsListening(isRecording);
  }, [isRecording]);

  // Create a new speech recognition instance each time
  const createRecognition = () => {
    // Check if browser supports Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition settings - no continuous listening
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Event handlers
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      onRecordingChange(true);
      setTranscript('');
      isStartingRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      // Silently handle errors without showing to user
      setIsListening(false);
      onRecordingChange(false);
      isStartingRef.current = false;
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      onRecordingChange(false);
      isStartingRef.current = false;
    };

    return recognition;
  };

  const startListening = () => {
    if (!isListening && !isStartingRef.current) {
      try {
        console.log('Starting speech recognition...');
        isStartingRef.current = true;
        
        const recognition = createRecognition();
        if (recognition) {
          recognition.start();
        } else {
          console.error('Failed to create speech recognition instance');
          isStartingRef.current = false;
        }
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        isStartingRef.current = false;
        // Silently handle errors
      }
    }
  };

  const stopListening = () => {
    if (isListening && !isStartingRef.current) {
      try {
        console.log('Stopping speech recognition...');
        // The recognition will stop automatically when onresult fires
        // or when the user stops speaking, so we just update the state
        setIsListening(false);
        onRecordingChange(false);
      } catch (err) {
        console.error('Failed to stop speech recognition:', err);
      }
    }
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isStartingRef.current}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      className={`rounded-lg border transition-all duration-200 px-2 sm:px-3 py-2 sm:py-3 ${
        isListening 
          ? 'bg-red-600/20 border-red-400/50 text-red-400 shadow-lg shadow-red-400/20' 
          : 'border-cymbal-border bg-slate-900 hover:bg-slate-800 text-cymbal-text-primary'
      } ${disabled || isStartingRef.current ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 sm:h-5 sm:w-5"
      >
        {isListening ? (
          <path d="M6 6h12v12H6z" />
        ) : (
          <>
            <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" />
            <path d="M19 11a1 1 0 1 0-2 0 5 5 0 1 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
          </>
        )}
      </svg>
    </button>
  );
};
