import React, { useEffect, useRef, useState } from 'react';
import { Header } from '../components/Header';
import ViolinIcon from '../assets/violin_icon_final.png';
import TrumpetIcon from '../assets/trumpet_icon.png';
import FluteIcon from '../assets/flute_icon.png';
import TromboneIcon from '../assets/trombone_icon.png';
import StageBg from '../assets/stage.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePermissions } from '../contexts/PermissionsContext';

interface Message {
  text: string;
  sender: 'user' | 'agent';
}

interface JsonData {
  id: string;
  data: any;
  timestamp: Date;
}

const AGENTS = [
  {
    id: 'router_agent',
    name: 'Cymbal',
    role: 'Router Agent',
    instrument: 'The Violin',
    icon: ViolinIcon,
  },
  {
    id: 'investments_agent',
    name: 'Mila',
    role: 'Investments Agent',
    instrument: 'The Trumpet',
    icon: TrumpetIcon,
  },
  {
    id: 'daily_spendings_agent',
    name: 'Kai',
    role: 'Daily Spendings Agent',
    instrument: 'The Flute',
    icon: FluteIcon,
  },
  {
    id: 'financial_agent',
    name: 'Leo',
    role: 'Big Spendings Agent',
    instrument: 'The Trombone',
    icon: TromboneIcon,
  },
];

export const HomePage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { text: 'Welcome to Cymbal Bank! Select an agent to talk to, or start typing to talk to our router agent.', sender: 'agent' }
  ]);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<JsonData[]>([]);
  const agentRef = useRef<import('../lib/wsAgent').RealtimeAgentClient | null>(null);
  const { getPermissionContext, userName } = usePermissions();

  // Function to test JSON detection
  const testJsonDetection = () => {
    const testText = `Here's your account summary:

\`\`\`json
{
  "account_balance": 12500.75,
  "currency": "USD",
  "transactions": [
    {"id": 1, "amount": -45.99, "description": "Coffee Shop"},
    {"id": 2, "amount": 2500.00, "description": "Salary Deposit"}
  ]
}
\`\`\`

This shows your current financial status.`;
    
    console.log('🧪 Testing JSON detection with:', testText);
    const detected = detectAndExtractJson(testText);
    console.log('🧪 Detection result:', detected);
    
    if (detected.length > 0) {
      const newJsonData: JsonData = {
        id: `test-${Date.now()}`,
        data: detected[0],
        timestamp: new Date()
      };
      setJsonData(prev => [...prev, newJsonData]);
      console.log('🧪 Test JSON added to table');
    }
  };

  // Function to detect and extract JSON from text
  const detectAndExtractJson = (text: string): any[] => {
    console.log('🔍 JSON Detection - Received text:', text);
    const jsonMatches: any[] = [];
    
    // Simple regex to detect JSON objects with curly braces
    // Look for content between { and } that might be JSON
    const jsonPattern = /\{[^}]*\}/g;
    
    const matches = text.match(jsonPattern);
    if (matches) {
      console.log('📋 Found potential JSON matches:', matches);
      matches.forEach(match => {
        try {
          // Clean up the match
          let cleanMatch = match.trim();
          
          // Remove markdown code blocks if present
          if (cleanMatch.startsWith('```json')) {
            cleanMatch = cleanMatch.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanMatch.startsWith('```')) {
            cleanMatch = cleanMatch.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          // Remove any leading/trailing whitespace
          cleanMatch = cleanMatch.replace(/^\s+|\s+$/g, '');
          
          console.log('🧹 Cleaned match:', cleanMatch);
          
          const parsed = JSON.parse(cleanMatch);
          console.log('✅ Successfully parsed JSON:', parsed);
          
          // Only add if it's a meaningful object
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            jsonMatches.push(parsed);
            console.log('📊 Added object to matches');
          }
        } catch (e) {
          // Not valid JSON, skip
          console.debug('❌ Failed to parse JSON:', match, e);
        }
      });
    }
    
    console.log('🎯 Final JSON matches:', jsonMatches);
    return jsonMatches;
  };

  // Function to remove a specific JSON entry
  const removeJsonEntry = (id: string) => {
    setJsonData(prev => prev.filter(entry => entry.id !== id));
  };

  // Function to clear all JSON data
  const clearAllJsonData = () => {
    setJsonData([]);
  };

  // Function to render JSON as a table with better error handling
  const renderJsonTable = (data: any): React.JSX.Element => {
    try {
      if (Array.isArray(data)) {
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-cymbal-border">
                  <th className="text-left py-2 px-3 text-cymbal-text-primary font-semibold">Index</th>
                  <th className="text-left py-2 px-3 text-cymbal-text-primary font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b border-cymbal-border/30 hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-cymbal-text-secondary">{index}</td>
                    <td className="py-2 px-3 text-cymbal-text-primary">
                      {typeof item === 'object' && item !== null ? (
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                      ) : (
                        String(item)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-cymbal-border">
                  <th className="text-left py-2 px-3 text-cymbal-text-primary font-semibold">Key</th>
                  <th className="text-left py-2 px-3 text-cymbal-text-primary font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key} className="border-b border-cymbal-border/30 hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-cymbal-text-secondary font-medium">{key}</td>
                    <td className="py-2 px-3 text-cymbal-text-primary">
                      {typeof data[key] === 'object' && data[key] !== null ? (
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(data[key], null, 2)}</pre>
                      ) : (
                        String(data[key])
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      return <div className="text-cymbal-text-primary">{String(data)}</div>;
    } catch (error) {
      console.error('Error rendering JSON table:', error);
      return (
        <div className="text-red-400 text-sm">
          Error rendering data: {String(error)}
        </div>
      );
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { RealtimeAgentClient } = await import('../lib/wsAgent');
      if (!mounted) return;
      const client = new RealtimeAgentClient({
        onOpen: () => setConnected(true),
        onClose: () => setConnected(false),
        onText: (text) => {
          console.log('📨 Received text from agent:', text);
          
          // Check for JSON in the agent response
          const detectedJson = detectAndExtractJson(text);
          if (detectedJson.length > 0) {
            console.log('🎉 JSON detected! Adding to table:', detectedJson);
            const newJsonData: JsonData = {
              id: `json-${Date.now()}`,
              data: detectedJson[0], // Take the first JSON match
              timestamp: new Date()
            };
            setJsonData(prev => [...prev, newJsonData]);
          } else {
            console.log('❌ No JSON detected in text');
          }
          
          setChatHistory((prev) => {
            // If last is agent, append; else add new agent message
            if (prev.length > 0 && prev[prev.length - 1].sender === 'agent') {
              const copy = prev.slice();
              copy[copy.length - 1] = { ...copy[copy.length - 1], text: copy[copy.length - 1].text + text };
              return copy;
            }
            return [...prev, { text, sender: 'agent' }];
          });
        },
        onTurnComplete: () => {},
        onIsSpeaking: (speaking) => setIsSpeaking(speaking),
        onInterrupted: () => setIsRecording(false),
      }, getPermissionContext);
      agentRef.current = client;
      await client.connect(false);
    };
    init();
    return () => {
      mounted = false;
      agentRef.current?.disconnect();
    };
  }, [getPermissionContext]);

  // Update welcome message when userName is available
  useEffect(() => {
    if (userName && chatHistory.length > 0 && chatHistory[0].sender === 'agent') {
      setChatHistory(prev => {
        const updated = [...prev];
        updated[0] = { 
          ...updated[0], 
          text: `Welcome to Cymbal Bank, ${userName}! Select an agent to talk to, or start typing to talk to our router agent.` 
        };
        return updated;
      });
    }
  }, [userName]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory((prev) => [...prev, { text: message, sender: 'user' }]);
      agentRef.current?.sendText(message, selectedAgentId || undefined);
      setMessage('');
    }
  };

  const handleSelectAgent = (agent: (typeof AGENTS)[0]) => {
    setSelectedAgentId(agent.id);
    const message = `I would like to connect with the ${agent.role}.`;
    setChatHistory((prev) => [...prev, { text: message, sender: 'user' }]);
    agentRef.current?.sendText(message, agent.id);
  };

  const toggleRecording = () => {
    if (isRecording) {
      agentRef.current?.stopAudio();
    } else {
      agentRef.current?.startAudio(selectedAgentId || undefined);
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen flex flex-col text-cymbal-text-primary" style={{ backgroundColor: '#000' }}>
      <Header />

      {/* Stage background and instruments */}
      <div
        className="flex-1 relative flex flex-col min-h-0"
        style={{
          backgroundImage: `url(${StageBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
        }}
      >
        <div className="text-center pt-16 sm:pt-24">
          <h2 className="text-3xl font-bold tracking-tight text-slate-300 sm:text-4xl">Meet your Orchestra</h2>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mt-2">
            The Rhythm of your Wallet
          </h1>
          {userName && (
            <p className="mt-4 text-xl text-cymbal-text-secondary">
              Welcome back, {userName}! 🎵
            </p>
          )}
        </div>
        
        {/* Instruments positioned with proper spacing */}
        <div className="flex-1 flex items-end justify-center pb-16 sm:pb-20 md:pb-24">
          <div className="flex items-end justify-center gap-8 md:gap-10 flex-nowrap">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="relative group flex flex-col items-center cursor-pointer" onClick={() => handleSelectAgent(agent)}>
                <div className={`relative h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full overflow-hidden bg-black/70 border-2 shadow-xl transition-all ${selectedAgentId === agent.id ? 'border-cymbal-accent' : 'border-cymbal-border'}`}>
                  <img src={agent.icon} alt={agent.instrument} className="h-full w-full object-contain p-4" />
                  {/* spotlight */}
                  <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSpeaking ? '!opacity-100' : ''}`}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 70%)' }} />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-slate-900/60 border border-cymbal-border rounded-lg text-center w-48">
                  <p className="font-bold text-lg text-cymbal-text-primary truncate">{agent.instrument}</p>
                  <p className="text-sm text-cymbal-text-secondary">{agent.name}, your {agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom panel: transcripts toggle + input + JSON table */}
      <div className="w-full border-t border-cymbal-border bg-black/80">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left side: Transcripts and input */}
            <div className="lg:col-span-2 space-y-3">
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
                  <div className="max-h-[4.5rem] overflow-y-auto">
                    <ul className="space-y-2 text-sm leading-6">
                      {chatHistory.length === 0 && (
                        <li className="text-sm text-cymbal-text-secondary">No transcripts yet.</li>
                      )}
                      {chatHistory.map((msg, idx) => (
                        <li key={`t-${idx}`} className="text-sm">
                          <span className="mr-2 inline-block rounded px-2 py-0.5 text-xs font-semibold border border-cymbal-border bg-slate-800/70">
                            {msg.sender === 'user' ? 'You' : 'Agent'}
                          </span>
                          <div className="inline-block align-top text-cymbal-text-primary transcript-markdown">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
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

            {/* Right side: JSON Data Table */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/70 border border-cymbal-border rounded-lg p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-cymbal-text-primary">Structured Data</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={testJsonDetection}
                      className="text-xs text-cymbal-accent hover:text-cymbal-accent-hover transition-colors"
                    >
                      Test JSON
                    </button>
                    {jsonData.length > 0 && (
                      <button
                        onClick={clearAllJsonData}
                        className="text-xs text-cymbal-text-secondary hover:text-cymbal-text-primary transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                {jsonData.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-cymbal-text-secondary text-sm">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No structured data detected yet</p>
                      <p className="text-xs mt-1">JSON responses will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {jsonData.map((item) => (
                      <div key={item.id} className="bg-slate-800/50 border border-cymbal-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-cymbal-text-secondary">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => removeJsonEntry(item.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                        {renderJsonTable(item.data)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
