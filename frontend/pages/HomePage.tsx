import React, { useEffect, useRef, useState } from 'react';
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
  const [transcriptHeight, setTranscriptHeight] = useState(72); // Default height in rem (4.5rem)
  const [isResizing, setIsResizing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<JsonData[]>([]);
  const [lastMessage, setLastMessage] = useState<string>('');
  const agentRef = useRef<import('../lib/wsAgent').RealtimeAgentClient | null>(null);
  const { getPermissionContext, userName } = usePermissions();
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Function to detect and extract JSON from text
  const detectAndExtractJson = (text: string): any[] => {
    console.log('🔍 JSON Detection - Received text:', text);
    const jsonMatches: any[] = [];
    
    // First, try to extract JSON from markdown code blocks
    // This handles cases where the agent sends complete markdown blocks
    const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)```/g;
    let codeBlockMatch;
    
    while ((codeBlockMatch = codeBlockPattern.exec(text)) !== null) {
      const codeContent = codeBlockMatch[1].trim();
      console.log('📋 Found code block content:', codeContent);
      
      try {
        const parsed = JSON.parse(codeContent);
        console.log('✅ Successfully parsed JSON from code block:', parsed);
        console.log('📊 Parsed JSON type:', typeof parsed);
        console.log('📊 Parsed JSON keys:', Object.keys(parsed));
        
        // Only add if it's a meaningful object or array
        if (parsed && typeof parsed === 'object' && 
            (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
          jsonMatches.push(parsed);
          console.log('📊 Added object/array from code block to matches');
        }
      } catch (e) {
        console.debug('❌ Failed to parse JSON from code block:', codeContent, e);
      }
    }
    
    // If no code blocks found, try to detect JSON that might be building up
    // This handles cases where the agent sends markdown in pieces
    if (jsonMatches.length === 0) {
      console.log('🔍 No complete code blocks found, checking for partial JSON...');
      
      // Look for content that starts with ```json and might be incomplete
      if (text.includes('```json') || text.includes('```')) {
        // Try to extract content after ```json or ```
        const partialPattern = /```(?:json)?\s*([\s\S]*)/;
        const partialMatch = text.match(partialPattern);
        
        if (partialMatch) {
          const partialContent = partialMatch[1].trim();
          console.log('📋 Found partial content:', partialContent);
          
          // Try to parse as JSON (might work if the closing ``` hasn't arrived yet)
          try {
            const parsed = JSON.parse(partialContent);
            console.log('✅ Successfully parsed partial JSON:', parsed);
            
            if (parsed && typeof parsed === 'object' && 
                (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
              jsonMatches.push(parsed);
              console.log('📊 Added partial JSON to matches');
            }
          } catch (e) {
            console.debug('❌ Failed to parse partial JSON:', partialContent, e);
          }
        }
      }
    }
    
    // If still no matches, fall back to regex pattern matching
    if (jsonMatches.length === 0) {
      console.log('🔍 No code blocks or partial JSON found, trying regex pattern matching...');
      
      // Enhanced regex to detect both JSON arrays and objects
      // Look for content between [ and ] or { and } that might be JSON
      const jsonPattern = /(\[[^\]]*\]|\{[^}]*\})/g;
      
      const matches = text.match(jsonPattern);
      if (matches) {
        console.log('📋 Found potential JSON matches with regex:', matches);
        matches.forEach(match => {
          try {
            // Clean up the match
            let cleanMatch = match.trim();
            
            // Remove any leading/trailing whitespace
            cleanMatch = cleanMatch.replace(/^\s+|\s+$/g, '');
            
            console.log('🧹 Cleaned match:', cleanMatch);
            
            const parsed = JSON.parse(cleanMatch);
            console.log('✅ Successfully parsed JSON with regex:', parsed);
            
            // Only add if it's a meaningful object or array
            if (parsed && typeof parsed === 'object' && 
                (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
              jsonMatches.push(parsed);
              console.log('📊 Added object/array from regex to matches');
            }
          } catch (e) {
            // Not valid JSON, skip
            console.debug('❌ Failed to parse JSON with regex:', match, e);
          }
        });
      }
    }
    
    console.log('🎯 Final JSON matches:', jsonMatches);
    console.log('🎯 Number of final matches:', jsonMatches.length);
    jsonMatches.forEach((match, index) => {
      console.log(`🎯 Match ${index + 1}:`, match);
      if (match.transactions) {
        console.log(`🎯 Match ${index + 1} has ${match.transactions.length} transactions`);
      }
    });
    return jsonMatches;
  };

  // Function to check if JSON data is a duplicate
  const isDuplicateJson = (newData: any, existingData: JsonData[]): boolean => {
    return existingData.some(existing => {
      try {
        // For nested structures like {transactions: [...]}, compare the actual content
        if (newData.transactions && existing.data.transactions) {
          // If both have transactions arrays, compare the transaction IDs or content
          const newTransactions = newData.transactions;
          const existingTransactions = existing.data.transactions;
          
          if (newTransactions.length === existingTransactions.length) {
            // Compare each transaction by ID if available, otherwise by content
            return newTransactions.every((newTx: any, index: number) => {
              const existingTx = existingTransactions[index];
              if (newTx.transaction_id && existingTx.transaction_id) {
                return newTx.transaction_id === existingTx.transaction_id;
              }
              return JSON.stringify(newTx) === JSON.stringify(existingTx);
            });
          }
        }
        
        // For other structures, compare the actual data content
        return JSON.stringify(existing.data) === JSON.stringify(newData);
      } catch (e) {
        return false;
      }
    });
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
        // If it's an array of objects (like transactions), render as a proper table
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
          const keys = Object.keys(data[0]);
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-cymbal-border">
                    {keys.map((key) => (
                      <th key={key} className="text-left py-2 px-3 text-cymbal-text-primary font-semibold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b border-cymbal-border/30 hover:bg-slate-800/50">
                      {keys.map((key) => (
                        <td key={key} className="py-2 px-3 text-cymbal-text-primary">
                          {typeof item[key] === 'object' && item[key] !== null ? (
                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(item[key], null, 2)}</pre>
                          ) : (
                            String(item[key])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        
        // Fallback for simple arrays
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

  // Function to manually process the last message for JSON
  const processLastMessageForJson = () => {
    if (!lastMessage.trim()) return;
    
    console.log('🔧 Manual JSON processing triggered for last message:', lastMessage);
    const detectedJson = detectAndExtractJson(lastMessage);
    
    if (detectedJson.length > 0) {
      console.log('🎉 JSON detected in manual processing! Adding to table:', detectedJson);
      
      detectedJson.forEach((jsonData, index) => {
        setJsonData(prevData => {
          const isDuplicate = isDuplicateJson(jsonData, prevData);
          if (!isDuplicate) {
            const newJsonData: JsonData = {
              id: `json-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              data: jsonData,
              timestamp: new Date()
            };
            console.log('📊 Manually added JSON data to table');
            return [...prevData, newJsonData];
          } else {
            console.log('🚫 Duplicate JSON detected in manual processing');
            return prevData;
          }
        });
      });
      
      // Clear last message after processing
      setLastMessage('');
      console.log('🔧 Manual processing completed, cleared last message');
    } else {
      console.log('❌ No JSON detected in last message during manual processing');
    }
  };

  // Handle transcript resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !transcriptRef.current) return;
      
      const rect = transcriptRef.current.getBoundingClientRect();
      const newHeight = Math.max(72, Math.min(400, e.clientY - rect.top)); // Min 4.5rem, max 25rem
      setTranscriptHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const init = async () => {
      const { RealtimeAgentClient } = await import('../lib/wsAgent');
      if (!mounted) return;
      const client = new RealtimeAgentClient({
        onOpen: () => setConnected(true),
        onClose: () => setConnected(false),
        onText: (text) => {
          console.log('📨 Received text from agent:', text);
          
          // Store the last message for manual JSON processing
          setLastMessage(prev => prev + text);
          
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
        onTurnComplete: () => {
          console.log('🔄 Turn complete callback fired');
          
          // Process the last message for JSON once the turn is complete
          if (lastMessage.trim()) {
            console.log('🔄 Turn complete, processing last message for JSON:', lastMessage);
            
            // Check for JSON in the last message
            const detectedJson = detectAndExtractJson(lastMessage);
            if (detectedJson.length > 0) {
              console.log('🎉 JSON detected after turn complete! Adding to table:', detectedJson);
              console.log('📊 Number of JSON objects detected:', detectedJson.length);
              
              // Check for duplicates before adding
              detectedJson.forEach((jsonData, index) => {
                console.log(`🔍 Processing JSON object ${index + 1}:`, jsonData);
                
                setJsonData(prevData => {
                  const isDuplicate = isDuplicateJson(jsonData, prevData);
                  console.log(`🔍 JSON object ${index + 1} is duplicate:`, isDuplicate);
                  
                  if (!isDuplicate) {
                    const newJsonData: JsonData = {
                      id: `json-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      data: jsonData,
                      timestamp: new Date()
                    };
                    console.log('📊 Added new JSON data to table:', newJsonData);
                    return [...prevData, newJsonData];
                  } else {
                    console.log('🚫 Duplicate JSON detected, skipping...');
                    return prevData;
                  }
                });
              });
            } else {
              console.log('❌ No JSON detected in last message');
            }
            
            // Clear last message after processing
            setLastMessage('');
            console.log('🔄 Turn complete, cleared last message');
          }
        },
        onIsSpeaking: (speaking) => setIsSpeaking(speaking),
        onInterrupted: () => setIsRecording(false),
      }, getPermissionContext);
      agentRef.current = client;
      await client.connect(false);
    };
    init();
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
      {/* Stage background and instruments */}
      <div
        className="flex-1 relative flex flex-col min-h-0 pt-16"
        style={{
          backgroundImage: `url(${StageBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
        }}
      >
        <div className="text-center pt-8 sm:pt-12 md:pt-16 lg:pt-24 px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-300">Meet your Orchestra</h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mt-2">
            The Rhythm of your Wallet
          </h1>
        </div>
        
        {/* Instruments positioned with proper spacing */}
        <div className="flex-1 flex items-end justify-center pb-8 sm:pb-12 md:pb-16 lg:pb-24 px-4 sm:px-6 mt-8 sm:mt-12">
          <div className="flex items-end justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 flex-wrap sm:flex-nowrap">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="relative group flex flex-col items-center cursor-pointer mb-4 sm:mb-0" onClick={() => handleSelectAgent(agent)}>
                <div className={`relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 xl:h-40 xl:w-40 rounded-full overflow-hidden bg-black/70 border-2 shadow-xl transition-all ${selectedAgentId === agent.id ? 'border-cymbal-accent' : 'border-cymbal-border'}`}>
                  <img src={agent.icon} alt={agent.instrument} className="h-full w-full object-contain p-3 sm:p-4" />
                  {/* spotlight */}
                  <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSpeaking ? '!opacity-100' : ''}`}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 70%)' }} />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-900/60 border border-cymbal-border rounded-lg text-center w-32 sm:w-40 md:w-48">
                  <p className="font-bold text-sm sm:text-base md:text-lg text-cymbal-text-primary truncate">{agent.instrument}</p>
                  <p className="text-xs sm:text-sm text-cymbal-text-secondary">{agent.name}, your {agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom panel: transcripts toggle + input + JSON table */}
      <div className="w-full border-t border-cymbal-border bg-black/80">
        <div className="mx-auto px-3 sm:px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Left side: Transcripts and input */}
            <div className="xl:col-span-2 space-y-3">
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
                  ref={transcriptRef}
                  className="rounded-lg border border-cymbal-border bg-black/70 p-3 relative"
                  style={{ height: `${transcriptHeight}px` }}
                >
                  <div className="h-full overflow-y-auto">
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
                  
                  {/* Resize handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize group"
                    onMouseDown={handleResizeStart}
                    title="Drag to resize transcript height"
                  >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-cymbal-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  className="flex-1 rounded-lg bg-slate-900 text-cymbal-text-primary placeholder-slate-400 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-cymbal-accent border border-cymbal-border"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  disabled={isRecording}
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleRecording}
                    aria-label="Voice input"
                    className={`rounded-lg border border-cymbal-border bg-slate-900 hover:bg-slate-800 text-cymbal-text-primary px-2 sm:px-3 py-2 sm:py-3 transition-colors ${isRecording ? 'animate-pulse' : ''}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    >
                      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" />
                      <path d="M19 11a1 1 0 1 0-2 0 5 5 0 1 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
                    </svg>
                  </button>
                  {isRecording ? (
                    <button
                      onClick={toggleRecording}
                      className="rounded-lg bg-red-600 text-white font-semibold px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base hover:bg-red-700 transition-colors"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      className="rounded-lg bg-cymbal-accent text-cymbal-deep-dark font-semibold px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base hover:bg-cymbal-accent-hover transition-colors"
                    >
                      {connected ? 'Send' : 'Connecting...'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: JSON Data Table */}
            <div className="xl:col-span-1">
              <div className="bg-slate-900/70 border border-cymbal-border rounded-lg p-3 sm:p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-cymbal-text-primary">Structured Data</h3>
                    <div className="text-xs text-cymbal-text-secondary mt-1">
                      {lastMessage.trim() && ` | Text: ${lastMessage.length} chars`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lastMessage.trim() && (
                      <button
                        onClick={processLastMessageForJson}
                        className="text-xs sm:text-sm text-cymbal-accent hover:text-cymbal-accent-hover transition-colors px-2 py-1 rounded border border-cymbal-accent/30 hover:border-cymbal-accent/50"
                        title="Manually process accumulated text for JSON"
                      >
                        Process JSON
                      </button>
                    )}
                    {jsonData.length > 0 && (
                      <button
                        onClick={clearAllJsonData}
                        className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded border border-red-400/30 hover:border-red-400/50 hover:bg-red-400/10"
                        title="Clear all structured data"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                {jsonData.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-cymbal-text-secondary text-xs sm:text-sm">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No structured data detected yet</p>
                      <p className="text-xs mt-1">JSON responses will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                    {jsonData.map((item) => (
                      <div key={item.id} className="bg-slate-800/50 border border-cymbal-border rounded-lg p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-cymbal-text-secondary">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => removeJsonEntry(item.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
                            title="Remove this data entry"
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
