/**
 * Síntese de áudio suave com Web Audio API para feedback tátil infantil.
 * Sem dependências externas de áudio ou arquivos MP3 pesados.
 */

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Som de clique suave estilo marimba
   */
  playKeyClick(frequency = 520): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.8, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignora erro se áudio não for permitido pelo navegador
    }
  }

  /**
   * Som melódico ascendente ao acertar o cálculo
   */
  playSuccessChime(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notas = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Acorde de Dó Maior)
      notas.forEach((freq, index) => {
        const tempoInicio = ctx.currentTime + index * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, tempoInicio);

        gain.gain.setValueAtTime(0.1, tempoInicio);
        gain.gain.exponentialRampToValueAtTime(0.001, tempoInicio + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(tempoInicio);
        osc.stop(tempoInicio + 0.22);
      });
    } catch {
      // Silent failback
    }
  }

  /**
   * Som fofinho e suave para divisão por zero (alerta pedagógico acolhedor)
   */
  playFriendlyOops(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notas = [440, 392]; // A4 -> G4
      notas.forEach((freq, index) => {
        const tempo = ctx.currentTime + index * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, tempo);

        gain.gain.setValueAtTime(0.09, tempo);
        gain.gain.exponentialRampToValueAtTime(0.001, tempo + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(tempo);
        osc.stop(tempo + 0.15);
      });
    } catch {
      // Silent failback
    }
  }
}

export const soundEffects = new SoundEffectsService();
