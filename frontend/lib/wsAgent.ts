export type AgentIncomingMessage = {
  turn_complete?: boolean;
  interrupted?: boolean;
  mime_type?: string;
  data?: string;
};

export type AgentEventHandlers = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (e: Event) => void;
  onText?: (text: string) => void;
  onTurnComplete?: () => void;
  onInterrupted?: () => void;
  onIsSpeaking?: (speaking: boolean) => void;
  onTranscript?: (text: string) => void;
};

export class RealtimeAgentClient {
  private websocket: WebSocket | null = null;
  private sessionId: string;
  private isAudioMode: boolean = false;
  private isSpeaking: boolean = false;

  // Audio
  private audioPlayerNode: any | null = null;
  private audioPlayerContext: AudioContext | null = null;
  private audioRecorderNode: any | null = null;
  private audioRecorderContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private audioBuffer: Uint8Array[] = [];
  private bufferTimer: number | null = null;

  private handlers: AgentEventHandlers;

  constructor(handlers: AgentEventHandlers = {}) {
    this.handlers = handlers;
    this.sessionId = Math.random().toString(36).substring(2);
  }

  get connected(): boolean {
    return !!this.websocket && this.websocket.readyState === WebSocket.OPEN;
  }

  async connect(isAudio: boolean = false) {
    this.isAudioMode = isAudio;
    const defaultWs = `ws://${window.location.hostname}:8000`;
    const base = (import.meta as any).env?.VITE_BACKEND_WS_URL || defaultWs;
    const wsUrl = `${base.replace(/\/$/, '')}/ws/${this.sessionId}?is_audio=${String(isAudio)}`;

    // Close existing
    if (this.websocket) {
      try { this.websocket.close(); } catch {}
    }

    this.websocket = new WebSocket(wsUrl);
    this.websocket.onopen = () => {
      this.handlers.onOpen && this.handlers.onOpen();
    };
    this.websocket.onclose = () => {
      this.handlers.onClose && this.handlers.onClose();
    };
    this.websocket.onerror = (e) => {
      this.handlers.onError && this.handlers.onError(e);
    };
    this.websocket.onmessage = (evt) => this.handleIncoming(evt);
  }

  disconnect() {
    if (this.websocket) {
      try { this.websocket.close(); } catch {}
    }
    this.websocket = null;
    this.stopAudioRecording();
    this.teardownAudio();
  }

  sendText(message: string) {
    if (!this.connected) return;
    const payload = { mime_type: 'text/plain', data: message };
    this.websocket!.send(JSON.stringify(payload));
  }

  async startAudio() {
    if (this.isAudioMode && this.connected && this.audioPlayerNode && this.audioRecorderNode) {
      return;
    }
    await this.setupAudio();
    await this.connect(true); // reconnect in audio mode
  }

  stopAudio() {
    this.stopAudioRecording();
    this.teardownAudio();
  }

  // Internal
  private async setupAudio() {
    const { startAudioPlayerWorklet } = await import('../../backend/static/js/audio-player.js');
    const { startAudioRecorderWorklet } = await import('../../backend/static/js/audio-recorder.js');
    const [playerNode, playerCtx] = await startAudioPlayerWorklet() as [AudioWorkletNode, AudioContext];
    this.audioPlayerNode = playerNode;
    this.audioPlayerContext = playerCtx;

    const [recorderNode, recorderCtx, stream] = await startAudioRecorderWorklet((pcm: ArrayBuffer) => this.audioRecorderHandler(pcm)) as [AudioWorkletNode, AudioContext, MediaStream];
    this.audioRecorderNode = recorderNode;
    this.audioRecorderContext = recorderCtx;
    this.micStream = stream;
  }

  private teardownAudio() {
    try {
      if (this.audioPlayerNode) {
        this.audioPlayerNode.disconnect();
      }
      if (this.audioPlayerContext) {
        this.audioPlayerContext.close();
      }
    } catch {}
    try {
      if (this.audioRecorderNode) {
        this.audioRecorderNode.disconnect();
      }
      if (this.audioRecorderContext) {
        this.audioRecorderContext.close();
      }
      if (this.micStream) {
        this.micStream.getTracks().forEach((t) => t.stop());
      }
    } catch {}
    this.audioPlayerNode = null;
    this.audioPlayerContext = null;
    this.audioRecorderNode = null;
    this.audioRecorderContext = null;
    this.micStream = null;
  }

  private audioRecorderHandler(pcmData: ArrayBuffer) {
    this.audioBuffer.push(new Uint8Array(pcmData));
    if (!this.bufferTimer) {
      this.bufferTimer = window.setInterval(() => this.flushAudioBuffer(), 200);
    }
  }

  private flushAudioBuffer() {
    if (this.audioBuffer.length === 0) return;
    let totalLength = 0;
    for (const chunk of this.audioBuffer) totalLength += chunk.length;
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of this.audioBuffer) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    this.sendAudioPcm(combined.buffer);
    this.audioBuffer = [];
  }

  private stopAudioRecording() {
    if (this.bufferTimer) {
      clearInterval(this.bufferTimer);
      this.bufferTimer = null;
    }
    if (this.audioBuffer.length > 0) this.flushAudioBuffer();
  }

  private sendAudioPcm(buffer: ArrayBuffer) {
    if (!this.connected) return;
    const base64 = this.arrayBufferToBase64(buffer);
    const payload = { mime_type: 'audio/pcm', data: base64 };
    this.websocket!.send(JSON.stringify(payload));
  }

  private handleIncoming(evt: MessageEvent) {
    const message: AgentIncomingMessage = JSON.parse(evt.data);
    if (message.turn_complete) {
      this.handlers.onTurnComplete && this.handlers.onTurnComplete();
      return;
    }
    if (message.interrupted) {
      if (this.audioPlayerNode) this.audioPlayerNode.port.postMessage({ command: 'endOfAudio' });
      this.handlers.onInterrupted && this.handlers.onInterrupted();
      this.isSpeaking = false;
      this.handlers.onIsSpeaking && this.handlers.onIsSpeaking(false);
      return;
    }
    if (message.mime_type === 'application/json') {
      const data = JSON.parse(message.data!);
      if (data.transcript) {
        this.handlers.onTranscript && this.handlers.onTranscript(data.transcript);
      }
    }
    if (message.mime_type === 'audio/pcm' && this.audioPlayerNode && message.data) {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.handlers.onIsSpeaking && this.handlers.onIsSpeaking(true);
      }
      const arr = this.base64ToArray(message.data);
      this.audioPlayerNode.port.postMessage(arr);
    }
    if (message.mime_type === 'text/plain' && typeof message.data === 'string') {
      this.handlers.onText && this.handlers.onText(message.data);
    }
  }

  private base64ToArray(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
  }
}


