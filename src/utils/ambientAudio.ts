// Web Audio API Synthesizer for Nostalgic Background Soundscapes

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private intervalId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.05; // Default ambient volume (subtle)
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      // volume 0 to 1 -> map to 0 to 0.15 max for background
      this.gainNode.gain.setTargetAtTime(volume * 0.15, this.ctx.currentTime, 0.1);
    }
  }

  public start(memoryId: string) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    if (memoryId === 'rain') {
      this.createRainSound();
    } else if (memoryId === 'radio' || memoryId === 'tea') {
      this.createRadioStatic();
    } else if (memoryId === 'bus') {
      this.createTrainRhythm();
    } else {
      this.createVinylHiss();
    }
  }

  public stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore if already stopped
      }
      this.noiseNode = null;
    }
  }

  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createRainSound() {
    if (!this.ctx || !this.gainNode) return;
    const buffer = this.createPinkNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.noiseNode = noise;
  }

  private createRadioStatic() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.5;

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.noiseNode = noise;
  }

  private createTrainRhythm() {
    if (!this.ctx || !this.gainNode) return;
    const buffer = this.createPinkNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.noiseNode = noise;
  }

  private createVinylHiss() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.noiseNode = noise;
  }
}

export const ambientEngine = new AmbientAudioEngine();
