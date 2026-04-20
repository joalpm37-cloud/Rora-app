export class AudioPlayer {
  private context: AudioContext;
  private nextTime: number = 0;
  private sources: AudioBufferSourceNode[] = [];

  constructor() {
    this.context = new AudioContext({ sampleRate: 24000 }); // Live API returns 24kHz
  }

  playBase64PCM(base64: string) {
    if(this.context.state === 'suspended') {
      this.context.resume();
    }

    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const pcm16 = new Int16Array(bytes.buffer);
    const audioBuffer = this.context.createBuffer(1, pcm16.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) {
      channelData[i] = pcm16[i] / 32768.0;
    }

    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);

    const currentTime = this.context.currentTime;
    const startTime = Math.max(currentTime, this.nextTime);
    
    source.start(startTime);
    this.sources.push(source);
    this.nextTime = startTime + audioBuffer.duration;

    // clean up array
    source.onended = () => {
        this.sources = this.sources.filter(s => s !== source);
    };
  }

  interrupt() {
    for (const source of this.sources) {
        try { source.stop(); } catch(e) {}
    }
    this.sources = [];
    this.nextTime = this.context.currentTime;
  }

  stop() {
      this.interrupt();
      if (this.context.state !== 'closed') {
        this.context.close();
      }
      this.context = null as any;
  }
}
