class VoiceNavigationServiceManager {
  private lastSpokenText: string | null = null;
  private isMuted: boolean = false;
  private isSupported: boolean = typeof window !== 'undefined' && 'speechSynthesis' in window;

  constructor() {
    // Check speech synthesis support
    if (this.isSupported) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Trigger voice list populate
      };
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public speak(text: string, force: boolean = false): void {
    if (this.isMuted || !this.isSupported || !text) {
      return;
    }

    // Do not repeat the exact same instruction unless forced
    if (!force && this.lastSpokenText === text) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.0;

      // Try to find a Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      this.lastSpokenText = text;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback silently if speech synthesis fails
    }
  }

  public stop(): void {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
    this.lastSpokenText = null;
  }
}

export const VoiceNavigationService = new VoiceNavigationServiceManager();
