import React, { useEffect, useRef, useState } from 'react';
import { Header } from '../components/Header';
import ViolinIcon from '../assets/violin_icon_final.png';
import TrumpetIcon from '../assets/trumpet_icon.png';
import FluteIcon from '../assets/flute_icon.png';
import TromboneIcon from '../assets/trombone_icon.png';
import StageBg from '../assets/stage.png';

interface Message {
  text: string;
  sender: 'user' | 'agent';
}

export const HomePage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { text: 'Welcome to Cymbal Bank! How can I help you today?', sender: 'agent' }
  ]);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connected, setConnected] = useState(false);
  const agentRef = useRef<import('../lib/wsAgent').RealtimeAgentClient | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { RealtimeAgentClient } = await import('../lib/wsAgent');
      if (!mounted) return;
      const client = new RealtimeAgentClient({
        onOpen: () => setConnected(true),
        onClose: () => setConnected(false),
        onText: (text) => setChatHistory((prev) => {
          // If last is agent, append; else add new agent message
          if (prev.length > 0 && prev[prev.length - 1].sender === 'agent') {
            const copy = prev.slice();
            copy[copy.length - 1] = { ...copy[copy.length - 1], text: copy[copy.length - 1].text + text };
            return copy;
          }
          return [...prev, { text, sender: 'agent' }];
        }),
        onTurnComplete: () => {},
        onIsSpeaking: (speaking) => setIsSpeaking(speaking),
        onInterrupted: () => setIsRecording(false),
        onTranscript: (text) => setMessage(text),
      });
      agentRef.current = client;
      await client.connect(false);
    };
    init();
    return () => {
      mounted = false;
      agentRef.current?.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory((prev) => [...prev, { text: message, sender: 'user' }]);
      agentRef.current?.sendText(message);
      setMessage('');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      agentRef.current?.stopAudio();
    } else {
      agentRef.current?.startAudio();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen flex flex-col text-cymbal-text-primary" style={{ backgroundColor: '#000' }}>
      <Header />

      {/* Stage background and instruments */}
      <div
        className="flex-1 relative"
        style={{
          backgroundImage: `url(${StageBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
        }}
      >
        {/* Instruments positioned near bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-28 sm:bottom-32 md:bottom-40">
          <div className="flex items-end justify-center gap-8 md:gap-10 flex-nowrap">
            {[{src: ViolinIcon, alt: 'Violin profile'}, {src: TrumpetIcon, alt: 'Trumpet profile'}, {src: FluteIcon, alt: 'Flute profile'}, {src: TromboneIcon, alt: 'Trombone profile'}].map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="relative h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full overflow-hidden bg-black/70 border border-cymbal-border shadow-xl">
                  <img src={img.src} alt={img.alt} className="h-full w-full object-contain p-4" />
                  {/* spotlight */}
                  <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSpeaking ? '!opacity-100' : ''}`}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 70%)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom panel: transcripts toggle + input */}
      <div className="w-full border-t border-cymbal-border bg-black/80">
        <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">
          <button
            onClick={() => setIsTranscriptOpen((v) => !v)}
            className="w-full flex items-center justify-between rounded-lg bg-slate-900/70 hover:bg-slate-900 transition-colors px-4 py-3 border border-cymbal-border"
            aria-expanded={isTranscriptOpen}
            aria-controls="transcripts-panel"
          >
            <span className="font-semibold">View transcripts</span>
            <svg
              className={`h-5 w-5 transition-transform ${isTranscriptOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.853a.75.75 0 011.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {isTranscriptOpen && (
            <div
              id="transcripts-panel"
              className="rounded-lg border border-cymbal-border bg-black/70 p-3"
            >
              <div className="max-h-[72px] overflow-y-auto">
                <ul className="space-y-2 text-sm leading-6">
                  {chatHistory.length === 0 && (
                    <li className="text-sm text-cymbal-text-secondary">No transcripts yet.</li>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <li key={`t-${idx}`} className="text-sm">
                      <span className="mr-2 inline-block rounded px-2 py-0.5 text-xs font-semibold border border-cymbal-border bg-slate-800/70">
                        {msg.sender === 'user' ? 'You' : 'Agent'}
                      </span>
                      <span className="align-middle text-cymbal-text-primary">{msg.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              className="flex-1 rounded-lg bg-slate-900 text-cymbal-text-primary placeholder-slate-400 px-4 py-3 outline-none focus:ring-2 focus:ring-cymbal-accent border border-cymbal-border"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={isRecording}
            />
            <button
              onClick={toggleRecording}
              aria-label="Voice input"
              className={`rounded-lg border border-cymbal-border bg-slate-900 hover:bg-slate-800 text-cymbal-text-primary px-3 py-3 transition-colors ${isRecording ? 'animate-pulse' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" />
                <path d="M19 11a1 1 0 1 0-2 0 5 5 0 1 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
              </svg>
            </button>
            {isRecording ? (
              <button
                onClick={toggleRecording}
                className="rounded-lg bg-red-600 text-white font-semibold px-5 py-3 hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                className="rounded-lg bg-cymbal-accent text-cymbal-deep-dark font-semibold px-5 py-3 hover:bg-cymbal-accent-hover transition-colors"
              >
                {connected ? 'Send' : 'Connecting...'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
